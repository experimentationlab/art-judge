"use client";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { WalletProvider } from "./WalletProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return (
        <WalletProvider>
            <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>
        </WalletProvider>
    );
}
