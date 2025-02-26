import { Link, useDisclosure } from "@heroui/react";
import { AnimatePresence, motion, Transition } from "framer-motion";
import { FC } from "react";
import FaucetInstructionModal from "../FaucetInstructionsModal";

const transition: Transition = {
    duration: 0.5,
    bounce: 0.5,
    type: "spring",
};

const slideTransition: Transition = {
    duration: 0.6,
    bounce: 0.5,
    type: "spring",
};

const Notification: FC = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
        <>
            <AnimatePresence>
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transition}
                    key="notification-section"
                    className="w-full bg-primary"
                >
                    <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: 10 }}
                        transition={slideTransition}
                        className="flex gap-1 w-full items-center justify-center"
                    >
                        <article className="text-xl">Do you need holesky Eth?</article>
                        <Link
                            isBlock
                            showAnchorIcon
                            href="#"
                            color="foreground"
                            size="sm"
                            onPress={onOpen}
                        >
                            Click here
                        </Link>
                    </motion.div>
                </motion.section>
            </AnimatePresence>
            <FaucetInstructionModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </>
    );
};

export default Notification;
