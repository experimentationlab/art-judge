import {
    cookieStorage,
    createConfig,
    createStorage,
    fallback,
    http,
} from "wagmi";
import { anvil, holesky } from "wagmi/chains";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

const holeskyRpcURL = process.env.NEXT_PUBLIC_NODE_RPC_17000;
const devnetRpcUrl = process.env.NEXT_PUBLIC_NODE_RPC_31337;
const [defaultAnvilRpc] = anvil.rpcUrls.default.http;
const [defaultHoleskyRpcUrl] = holesky.rpcUrls.default.http;

const holeskyTransport = holeskyRpcURL
    ? fallback([http(holeskyRpcURL), http(defaultHoleskyRpcUrl)])
    : http(defaultHoleskyRpcUrl);
const anvilTransport = http(devnetRpcUrl ?? defaultAnvilRpc);

const wagmiConfig = createConfig({
    chains: [holesky, anvil],
    connectors: [
        metaMask(),
        coinbaseWallet(),
        walletConnect({
            projectId:
                process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "default-project-id",
        }),
    ],
    storage: createStorage({
        storage: cookieStorage,
    }),
    ssr: true,
    transports: {
        [holesky.id]: holeskyTransport,
        [anvil.id]: anvilTransport,
    },
});

export const getWalletConfig = () => wagmiConfig;
