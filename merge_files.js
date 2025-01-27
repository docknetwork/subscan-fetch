import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';

// Define the path to the JSON files
const filePattern = '/home/mike/dock/subscan-fetch/output/dock-1737571781140/accounts-*.json';
const outputFile = '/home/mike/dock/subscan-fetch/output/dock-1737571781140/all_accounts.json';

// Initialize an empty array to hold all account data
let allAccounts = [];

// Read all files matching the pattern
readdirSync(dirname(filePattern)).forEach(file => {
  if (file.match(basename(filePattern).replace('*', '.*'))) {
    const data = JSON.parse(readFileSync(join(dirname(filePattern), file), 'utf8'));
    allAccounts = allAccounts.concat(data);
  }
});

// Write the concatenated data to a new JSON file
writeFileSync(outputFile, JSON.stringify(allAccounts, null, 2));

console.log(`All accounts have been concatenated into ${outputFile}`);
