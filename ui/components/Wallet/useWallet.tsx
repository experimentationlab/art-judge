"use client";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

const useWallet = () => {
    const { isConnected, chain, address } = useAccount();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();

    const onUnsupportedChain = isConnected && !chain;
    const isReadyToSendTransaction = isConnected && !onUnsupportedChain;

    return {
        openConnectModal,
        openChainModal,
        disconnect,
        address,
        isConnected,
        onUnsupportedChain,
        isReadyToSendTransaction,
    };
};

export default useWallet;
