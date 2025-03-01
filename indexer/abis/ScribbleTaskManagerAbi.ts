export const ScribbleTaskManagerAbi = [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_taskIssuerAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_machineHash",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "computationSent",
      "inputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "coprocessorCallbackOutputsOnly",
      "inputs": [
        {
          "name": "_machineHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_payloadHash",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "outputs",
          "type": "bytes[]",
          "internalType": "bytes[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "decodeNoticeData",
      "inputs": [
        {
          "name": "notice",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        {
          "name": "result",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "theme",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "classes",
          "type": "string[]",
          "internalType": "string[]"
        },
        {
          "name": "probabilities",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getLeaderboard",
      "inputs": [],
      "outputs": [
        {
          "name": "addresses",
          "type": "address[]",
          "internalType": "address[]"
        },
        {
          "name": "scores",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        {
          "name": "passed",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getNoticeResult",
      "inputs": [
        {
          "name": "payloadHash",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "passed",
          "type": "bool",
          "internalType": "bool"
        },
        {
          "name": "theme",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "confidence",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "predictions",
          "type": "tuple[3]",
          "internalType": "struct ScribbleTaskManager.Prediction[3]",
          "components": [
            {
              "name": "class",
              "type": "string",
              "internalType": "string"
            },
            {
              "name": "probability",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserData",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "globalScore",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "challengesPassed",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "themeHistory",
          "type": "string[]",
          "internalType": "string[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "machineHash",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "runExecution",
      "inputs": [
        {
          "name": "input",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "taskIssuer",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract ITaskIssuer"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "Debug_DecodingSuccess",
      "inputs": [
        {
          "name": "result",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "theme",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "classesLength",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "probabilitiesLength",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Debug_NoticeReceived",
      "inputs": [
        {
          "name": "payloadHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "notice",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        },
        {
          "name": "message",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Debug_UserUpdate",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "passed",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        },
        {
          "name": "newScore",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "totalPassed",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NoticeReceived",
      "inputs": [
        {
          "name": "payloadHash",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "notice",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "ComputationNotFound",
      "inputs": [
        {
          "name": "payloadHash",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "InsufficientFunds",
      "inputs": [
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "balance",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "InvalidOutputLength",
      "inputs": [
        {
          "name": "length",
          "type": "uint256",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "error",
      "name": "InvalidOutputSelector",
      "inputs": [
        {
          "name": "selector",
          "type": "bytes4",
          "internalType": "bytes4"
        },
        {
          "name": "expected",
          "type": "bytes4",
          "internalType": "bytes4"
        }
      ]
    },
    {
      "type": "error",
      "name": "MachineHashMismatch",
      "inputs": [
        {
          "name": "current",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "expected",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ]
    },
    {
      "type": "error",
      "name": "UnauthorizedCaller",
      "inputs": [
        {
          "name": "caller",
          "type": "address",
          "internalType": "address"
        }
      ]
    }
  ] as const;
