declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * A custom http node-rpc endpoint (e.g. alchemy / infura) for holesky
     */
    NEXT_PUBLIC_NODE_RPC_17000: string;

    /**
     * devnet node-rpc endpoint. Default to http://localhost:8545
     */
    NEXT_PUBLIC_NODE_RPC_31337: string;
    /**
     * Wallet connect project id
     */
    NEXT_PUBLIC_WC_PROJECT_ID: string;

    /**
     * The coprocessor caller contract address
     */
    NEXT_PUBLIC_COPROCESSOR_CALLER_ADDRESS: string;
  }
}
