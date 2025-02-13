import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from "@heroui/react";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { FC } from "react";
import {
    FaCaretDown,
    FaExclamation,
    FaSignOutAlt,
    FaWallet,
} from "react-icons/fa";
import { useAccount, useDisconnect } from "wagmi";
import Address from "./Address";

export const ConnectButton: FC = () => {
    const { isConnected, chain, address, connector } = useAccount();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();

    if (!isConnected)
        return (
            <Button
                color="primary"
                className="uppercase"
                startContent={<FaWallet />}
                onPress={openConnectModal}
            >
                Sign-in
            </Button>
        );

    if (isConnected && !chain)
        return (
            <Button
                color="danger"
                startContent={<FaExclamation />}
                onPress={openChainModal}
            >
                Wrong Network
            </Button>
        );

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    color="success"
                    className="uppercase"
                    startContent={<FaWallet />}
                    endContent={<FaCaretDown />}
                >
                    <Address address={address ?? "0x"} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Actions">
                <DropdownSection
                    title="Session"
                    className={!isConnected ? "hidden" : ""}
                >
                    <DropdownItem
                        key="disconnect"
                        as={Button}
                        color="danger"
                        title="Disconnect"
                        startContent={<FaSignOutAlt />}
                        onPress={() => disconnect()}
                    />
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
};
