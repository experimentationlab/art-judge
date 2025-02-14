import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from "@heroui/react";
import { FC } from "react";
import { FaCaretDown, FaExclamation, FaSignOutAlt, FaWallet } from "react-icons/fa";
import Address from "./Address";
import useWallet from "./useWallet";

export const ConnectButton: FC = () => {
    const {
        address,
        disconnect,
        isConnected,
        onUnsupportedChain,
        openChainModal,
        openConnectModal,
    } = useWallet();

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

    if (onUnsupportedChain)
        return (
            <Button color="danger" startContent={<FaExclamation />} onPress={openChainModal}>
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
                <DropdownSection title="Session" className={!isConnected ? "hidden" : ""}>
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
