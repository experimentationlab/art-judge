import {
    Button,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import { FC } from "react";
import { SmilingRobot } from "./Icons";

const Instructions = () => {
    return (
        <div className="flex flex-col gap-2 items-center pb-16">
            <SmilingRobot width={120} height={120} />
            <div className="flex flex-col gap-1 justify-start py-5 text-center text-xl">
                <p>To be able to submit a drawing you will need Eth.</p>
                <p>As such, you can get eth from a Faucet running in the network.</p>
                <p>
                    Faucet as you can imagine "drips" water (i.e. eth), but it may be dry and you
                    will need to search for a working one.
                </p>
            </div>
            <span className=" text-slate-500 text-lg">A Holesky Faucet:</span>
            <Link
                color="secondary"
                href="https://cloud.google.com/application/web3/faucet/ethereum/holesky"
                target="_blank"
                underline="always"
            >
                <span className="text-sm break-all">
                    https://cloud.google.com/application/web3/faucet/ethereum/holesky
                </span>
            </Link>
        </div>
    );
};

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const FaucetInstructionModal: FC<Props> = ({ isOpen, onOpenChange }) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl" scrollBehavior="inside">
            <ModalContent className="font-mono">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Holesky Faucets</ModalHeader>
                        <ModalBody>
                            <Instructions />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default FaucetInstructionModal;
