declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * A custom http node-rpc endpoint (e.g. alchemy / infura) for holesky
         */
        NEXT_PUBLIC_NODE_RPC_17000: string;

        /**
         * The supported chain-id used in the runnings instance. Either 17000 or 31337
         */
        NEXT_PUBLIC_CHAIN_ID: string;

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

        /**
         * Opengraph image url.
         */
        OG_IMAGE_URL: string;

        /**
         * Meant for twitter image cards. In case it is not defined will default to whatever value is on
         * OG_IMAGE_URL env var.
         * @default OG_IMAGE_URL
         */
        TWT_IMAGE_URL: string;

        NEXT_PUBLIC_WWW_DOMAIN: string;
        NEXT_PUBLIC_PLAUSIBLE_DOMAIN: string;

        /**
         * The URL for the deployed app e.g. FQDN or IP.
         */
        WEB_APP_BASE_URL: string;
    }
}
