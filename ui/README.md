## Summary

Scribbl UI application.

## Getting Started

### Environment Variables

First create your own .env (not versioned) inside the `ui/` folder and set the following environment variables.

> Supported Chains: 17000 (Holesky), 31337 (Devnet)

|                 Variables                 |    Default     |                             Description                              |
| :---------------------------------------: | :------------: | :------------------------------------------------------------------: |
|           PUBLIC_NEXT_CHAIN_ID            |     31337      |                         Chain id to be used                          |
| NEXT*PUBLIC_NODE_RPC*{supported_chain_id} | localhost:8545 |                          node-rpc endpoint.                          |
|         NEXT_PUBLIC_WC_PROJECT_ID         |      null      | Required to use walletconnect protocol.If not using, just ignore it. |
|  NEXT_PUBLIC_COPROCESSOR_CALLER_ADDRESS   |      null      |            Required coprocessor caller contract address.             |

> Install the project's dependencies.

```bash
pnpm install
```

Run the codegen task that will generate all the necessary hooks to comunicate with the blockchain. (Make sure you have the `NEXT_PUBLIC_COPROCESSOR_CALLER_ADDRESS` before running below command.)

```bash
pnpm codegen
```

Then just run the server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
