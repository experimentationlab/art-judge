"use client";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { State } from "wagmi";
import { WalletProvider } from "./WalletProvider";

export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  const router = useRouter();
  return (
    <WalletProvider initialState={initialState}>
      <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>
    </WalletProvider>
  );
}
