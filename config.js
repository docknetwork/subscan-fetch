export const network = 'dock-poa';

export const entities = [
  {
    name: "accounts",
    endpoint: "/v2/scan/accounts",
    fetch: false,
    responseList: "list"
  },
  {
    name: "transfers",
    endpoint: "/scan/transfers",
    fetch: false,
    responseList: "transfers"
  },
  {
    name: "extrinsics",
    endpoint: "/scan/extrinsics",
    fetch: true,
    responseList: "extrinsics"
  },
];
