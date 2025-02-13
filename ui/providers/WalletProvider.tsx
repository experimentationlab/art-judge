"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { State, WagmiProvider } from "wagmi";
import { getWalletConfig } from "./wallet.config";

const queryClient = new QueryClient();
const wagmiConfig = getWalletConfig();

export function WalletProvider(props: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
