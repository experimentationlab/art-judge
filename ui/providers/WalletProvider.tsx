"use client";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { getWalletConfig } from "./wallet.config";

const appInfo = {
    appName: "Scribbl",
    learnMoreUrl: "https://scribbl.fun",
};

const queryClient = new QueryClient();
const wagmiConfig = getWalletConfig();

export function WalletProvider(props: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider appInfo={appInfo} theme={lightTheme()}>
                    {props.children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
