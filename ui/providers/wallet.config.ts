import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
    coinbaseWallet,
    metaMaskWallet,
    walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
    cookieStorage,
    createConfig,
    createStorage,
    fallback,
    http,
} from "wagmi";
import { anvil, holesky } from "wagmi/chains";

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
const holeskyRpcURL = process.env.NEXT_PUBLIC_NODE_RPC_17000;
const devnetRpcUrl = process.env.NEXT_PUBLIC_NODE_RPC_31337;
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "default-project-id";

const [defaultAnvilRpc] = anvil.rpcUrls.default.http;
const [defaultHoleskyRpcUrl] = holesky.rpcUrls.default.http;

const holeskyTransport = holeskyRpcURL
    ? fallback([http(holeskyRpcURL), http(defaultHoleskyRpcUrl)])
    : http(defaultHoleskyRpcUrl);
const anvilTransport = http(devnetRpcUrl ?? defaultAnvilRpc);

const chain = [holesky, anvil].find((chain) => chain.id === chainId) || anvil;

const connectorsForWalletsParameters = {
    appName: "Scribbl",
    projectId,
};

export const getWalletConfig = () => {
    const connectors = connectorsForWallets(
        [
            {
                groupName: "Popular",
                wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet],
            },
        ],
        connectorsForWalletsParameters,
    );

    const wagmiConfig = createConfig({
        chains: [chain],
        connectors: connectors,
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            [holesky.id]: holeskyTransport,
            [anvil.id]: anvilTransport,
        },
    });

    return wagmiConfig;
};
