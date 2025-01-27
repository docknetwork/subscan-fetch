export const network = 'dock';

export const entities = [
  {
    name: "accounts",
    endpoint: "/v2/scan/accounts",
    fetch: true,
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
    startPage: 0,
    splitFiles: true
  },
];
