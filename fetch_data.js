import fs from 'node:fs/promises';
import {network, entities} from './config.js';

function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBaseUrl(network){
  return `https://${network}.api.subscan.io/api`;
}

async function getDataList(network, entity, folder, outputFile=null, page=0, row=100){
  const options= { page, row };
  const url = `${getBaseUrl(network)}${entity.endpoint}`;
  const retrievedRecords = page*row + row;

  console.log(`... ${entity.name} from URL ${url}`);

  try{
    if (!outputFile) {
      outputFile = await fs.open(`${folder}/${entity.name}-${page}.json`, 'a');
    }
  
    const response = await fetch(url,
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "820cefe1e5b4481eaac53300b298fd08"
      },
      method: "POST",
      body: JSON.stringify(options)
    });

    const json = await response.json();
    console.log(`${entity.name} parsing response ${response.status} page:${page}, count:${json.data?.count}`);

    if (page == 0){
      await outputFile.write(`{"${entity.name}": [`);
    }

    if (json.data[entity.responseList]){
      const promises = json.data[entity.responseList].map(async act =>  {
        await outputFile.write(`${JSON.stringify(act, null, 2)},`);
      });
      await Promise.all(promises);
    }

    // subscan have a bug with the transfers route where it always reports a count of 0 even though there are transfers
    // so if the count is 0 but there are objects keep trying until the object list is null
    if (retrievedRecords < json.data.count || (json.data.count == 0 && json.data[entity.responseList]?.length == row)){
      if (retrievedRecords % 100000 == 0){
        // close current file and start a new one
        await outputFile.write(']}');
        await outputFile.close();
        outputFile = null;
      }

      await sleep(750); // Subscan rate limits
      await getDataList(network, entity, folder, outputFile, page+1, row);
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

const networkFolder = await fs.mkdir(`../${network}-${Date.now().toString()}`,{recursive: true});

const promises = entities.map(async entity => {
  if (entity.fetch){
    console.log(`Downloading ${entity.name}...`);
    await getDataList(network, entity, networkFolder);
  } else {
    console.log(`Skipping ${entity.name}.`);
  }
});

 await Promise.all(promises);
