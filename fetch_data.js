import fs from 'node:fs/promises';
import {network, entities} from './config.js';

function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBaseUrl(network){
  return `https://${network}.api.subscan.io/api`;
}

async function getDataList(network, entity, folder, outputFile=null, page=0, row=100, after_id=[]){
  const options= { 
    page, 
    row,
    after_id,
    include_total: true,
    order: "asc",
    sort: "block_timestamp"
  };

  if (entity.name == "accounts"){
    delete(options.order);
    delete(options.sort);
    delete(options.after_id);
    options.min_balance = "-1"; // forces the account list to include 0 balance accounts
  } else if (after_id?.length > 0 && page > 99){
    options.page = null;
  }


  const url = `${getBaseUrl(network)}${entity.endpoint}`;
  const retrievedRecords = page*row + row;

  console.log(`${new Date().toISOString()}-... ${entity.name} from URL ${url} page:${page} after_id:${after_id} row:${row} retrievedRecords:${retrievedRecords}`);

  try{
    if (!outputFile) {
      outputFile = await fs.open(`${folder}/${entity.name}-${page}.json`, 'a');
    }
  
    let retry = 0;
    let json = '';
    const foundIds = [];

    while(retry < 3){
      const response = await fetch(url,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.SUBSCAN_API_KEY
        },
        method: "POST",
        body: JSON.stringify(options)
      });


      try {
        if (response.status != 200){
          console.log(response);
          return;
        }

        json = await response.json();

        if (page == 0){
          await outputFile.write(`{"${entity.name}": [`);
        }

        if (retrievedRecords > 10000){
          console.log('hit 10k records.');
        }
        if (json.data instanceof Object && entity.responseList in json.data){
          console.log(`${new Date().toISOString()}-${entity.name} parsing response ${response.status} page:${page}, after_id=${after_id} count:${json.data?.count}`);
          const promises = json.data[entity.responseList].map(async act =>  {
            if (act.address == '3FmwwHQxFo8715RubRR2geuSCAhCT9Wx3KhBSoJqD3HofiZm'){
              console.log('found 3FmwwHQxFo8715RubRR2geuSCAhCT9Wx3KhBSoJqD3HofiZm');
            }
            await outputFile.write(`${JSON.stringify(act, null, 2)},`);
            foundIds.push(act.transfer_id);
          });
          await Promise.all(promises);
        } else {
          console.log(`${new Date().toISOString()}-${entity.name} no data returned ${response.status} page:${page}, afterId:${after_id}, count:${json.data?.count} retry:${retry}`);
          retry = retry +1;

          if (retry == 3){
            console.log(response);
            console.log(json);
          }
          continue;
        }

        retry = 3;
      } catch(httpError){
        console.error(httpError);
        retry = retry+1;
      }
    }
    // subscan have a bug with the transfers route where it always reports a count of 0 even though there are transfers
    // so if the count is 0 but there are objects keep trying until the object list is null
    if (retrievedRecords < json.data.count || (json.data.count == 0 && json.data[entity.responseList]?.length == row)){
      if (entity.splitFiles && page % 50 == 0){
        // close current file and start a new one
        await outputFile.write(']}');
        await outputFile.close();
        outputFile = null;
      }
      await sleep(750); // Subscan rate limits
      const afterId = Math.max(...foundIds);
      await getDataList(network, entity, folder, outputFile, page+1, row,[afterId]);
    } else {
      await outputFile.write(']}');
    }
  } catch (error){
    console.error(error.message);
  }
  finally {
    if (outputFile){
      await outputFile.close();
    }
  }
}

const networkFolder = await fs.mkdir(`output/${network}-${Date.now().toString()}`,{recursive: true});

const promises = entities.map(async entity => {
  if (entity.fetch){
    console.log(`Downloading ${entity.name}...`);
    await getDataList(network, entity, networkFolder, null, entity.startPage ?? 0);
  } else {
    console.log(`Skipping ${entity.name}.`);
  }
});

 await Promise.all(promises);
