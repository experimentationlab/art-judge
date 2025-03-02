export const TaskIssuerAbi = [
    {
      "type": "event",
      "name": "TaskIssued",
      "inputs": [
        {
          "name": "machineHash",
          "type": "bytes32",
          "indexed": false,
          "internalType": "bytes32"
        },
        {
          "name": "input",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        },
        {
          "name": "callback",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        }
      ],
      "anonymous": false
    }
  ] as const;