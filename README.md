# Subscan Data Fetcher

This project fetches data from the Subscan API and processes it into JSON files. It supports fetching data for accounts, transfers, and extrinsics.

## Project Structure

- `config.js`: Configuration file defining the network and entities to fetch.
- `fetch_data.js`: Script to fetch data from the Subscan API.
- `merge_files.js`: Script to merge multiple JSON files into a single JSON file.
- `output/`: Directory where the fetched JSON files are stored.

## Configuration

The `config.js` file contains the configuration for the network and entities to fetch:

```js
export const network = 'dock';

export const entities = [
  {
    name: "accounts",
    endpoint: "/v2/scan/accounts",
    fetch: true, // this entity will be skipped if set to false
    responseList: "list",
    splitFiles: false
  },
  {
    name: "transfers",
    endpoint: "/v2/scan/transfers",
    fetch: true,
    responseList: "transfers",
    startPage: 0,
    splitFiles: false
  },
  {
    name: "extrinsics",
    endpoint: "/scan/extrinsics",
    fetch: false,
    responseList: "extrinsics",
    startPage: 44509, // use to skip ahead in the pages when starting
    splitFiles: true  // the JSON output will be split into multiple files 
  },
];
```

## Fetching Data

To fetch data, run the `fetch_data.js` script:

```bash
export SUBSCAN_API_KEY=<insert your Subscan API key here>
node fetch_data.js
```

This will create a new directory in the output folder with the fetched JSON files.

## Merging JSON Files
To merge multiple JSON files into a single JSON file, run the `merge_files.js` script:

```bash
node merge_files.js
```

This will merge all `accounts-*.json` files in the specified directory into a single `all_accounts.json` file.
