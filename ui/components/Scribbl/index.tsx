"use client";
import useWallet from "@/components/Wallet/useWallet";
import {
    useReadTaskManagerGetNoticeResult,
    useSimulateTaskManagerRunExecution,
    useWriteTaskManagerRunExecution,
} from "@/contracts/generated/scribbleTaskManager";
import { useRefetchOnBlockChange } from "@/hooks/useRefetchOnBlockChange";
import { Button, Tooltip } from "@heroui/react";
import { motion, Transition } from "framer-motion";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { FaEraser, FaPaperPlane, FaUndo } from "react-icons/fa";
import { Hex, isHex, keccak256, toHex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { ResultModal } from "./ResultModal";
import { ThemeSelector } from "./ThemeSelector";
import { ValidThemes } from "./themes";
import { NoticeResult, SubmissionData } from "./types";
import { useCanvas } from "./useCanvas";

const transition: Transition = {
    duration: 0.8,
    bounce: 0.5,
    type: "spring",
};

const preparePayload = (dataUrl: string, theme: string) => {
    const [_mimeEncoding, data] = dataUrl.split(",");
    const payload = { image: data, theme };
    console.log("Preparing payload", payload);
    return toHex(JSON.stringify(payload));
};

const prepareNotice = (noticeResult: NoticeResult) => {
    const [passed, theme, confidence, probabilities] = noticeResult;

    const notice = {
        passed,
        theme,
        confidence,
        predictions: probabilities.map(({ class: theme, probability }) => {
            return {
                theme,
                probability,
            };
        }),
    };

    return notice;
};

const useReadNoticeResult = (
    submissionData: SubmissionData,
    updater: Dispatch<SetStateAction<SubmissionData>>,
) => {
    const watchResult = submissionData.state === "pending" && isHex(submissionData.payloadHash);
    const { data, error, queryKey } = useReadTaskManagerGetNoticeResult({
        args: [submissionData.payloadHash!],
        query: {
            enabled: watchResult,
        },
    });

    useRefetchOnBlockChange(queryKey, { watch: watchResult, numberOfBlocks: 1n });

    useEffect(() => {
        if (error) {
            console.error(`Error when trying to read the notice result`, error);
            updater({ state: "errored" });
            return;
        }

        if (watchResult && data !== undefined) {
            const notice = prepareNotice(data as NoticeResult);
            if (notice.theme !== "") {
                updater({ state: "ready", result: notice });
            }
        }
    }, [watchResult, data, error]);
};

export const Scribbl: FC = () => {
    const [canvasAnimationEnded, setCanvasAnimationEnded] = useState<boolean>(false);
    const { isConnected, isReadyToSendTransaction, openChainModal, openConnectModal, address } =
        useWallet();
    const [payload, setPayload] = useState<Hex | null>(null);
    const [theme, setTheme] = useState<ValidThemes>("circle");
    const { clearCanvas, hasContent, prepareToExport, removeLastEntry, canvasRef, isReady } =
        useCanvas();
    const [submissionData, setSubmissionData] = useState<SubmissionData>({ state: "idle" });

    useReadNoticeResult(submissionData, setSubmissionData);

    const prepare = useSimulateTaskManagerRunExecution({
        args: [payload!],
        query: {
            enabled: isHex(payload) && isReadyToSendTransaction,
        },
    });

    const execute = useWriteTaskManagerRunExecution();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const canSubmit =
        isReadyToSendTransaction &&
        isHex(payload) &&
        !prepare.isLoading &&
        prepare.error === null &&
        execute.error === null;
    const isSubmitting = prepare.isLoading || execute.isPending || wait.isLoading;

    if (execute.error) {
        console.error("Write error", execute.error);
    }

    if (prepare.error) {
        console.error("Simulate error", prepare.error);
    }

    useEffect(() => {
        // submission and watching for results from coprocessor
        if (canSubmit) {
            console.log("Executing...");
            execute.writeContract(prepare.data!.request, {
                onSuccess: () => {
                    setSubmissionData((current) => ({
                        ...current,
                        payloadHash: keccak256(payload),
                        state: "pending",
                    }));
                },
                onError: (_err) => {
                    setSubmissionData({ state: "idle" });
                    setPayload(null);
                    execute.reset();
                    prepare.refetch();
                },
            });
        }
    }, [canSubmit, payload, isConnected]);

    useEffect(() => {
        if (wait.isSuccess) {
            setPayload(null);
            clearCanvas();
            execute.reset();
        }
    }, [wait, clearCanvas]);

    return (
        <div style={{ overflow: canvasAnimationEnded ? "visible" : "hidden" }} className="pb-10">
            <motion.div
                initial={{ y: -520 }}
                animate={isReady ? { y: 0 } : false}
                transition={transition}
                onAnimationComplete={() => {
                    setCanvasAnimationEnded(true);
                }}
            >
                <div className="flex flex-col gap-2">
                    <div className="p-3 sm:py-3 sm:px-0">
                        <ThemeSelector onValueChange={setTheme} selectedTheme={theme} />
                    </div>
                    <div className="flex justify-between gap-1 px-3 sm:px-0">
                        <div className="flex gap-1">
                            <Button
                                color="warning"
                                variant="shadow"
                                className="uppercase"
                                onPress={() => {
                                    removeLastEntry();
                                }}
                                startContent={<FaUndo />}
                            >
                                Undo
                            </Button>
                            <Button
                                color="danger"
                                className="uppercase"
                                variant="solid"
                                onPress={clearCanvas}
                                startContent={<FaEraser />}
                            >
                                Clear
                            </Button>
                        </div>

                        <Tooltip
                            isDisabled={hasContent}
                            className="capitalize bg-secondary-500"
                            content="To submit you need to draw something!"
                        >
                            <Button
                                className={`${
                                    hasContent ? "bg-secondary-700" : "bg-secondary-400"
                                } uppercase`}
                                variant="shadow"
                                isLoading={isSubmitting}
                                startContent={<FaPaperPlane />}
                                onPress={() => {
                                    if (hasContent) {
                                        if (isReadyToSendTransaction) {
                                            const dataUrl = prepareToExport();
                                            setPayload(preparePayload(dataUrl, theme));
                                        } else {
                                            if (!isConnected)
                                                openConnectModal && openConnectModal();
                                            else openChainModal && openChainModal();
                                        }
                                    }
                                }}
                            >
                                {" "}
                                Submit
                            </Button>
                        </Tooltip>
                    </div>
                    <canvas
                        ref={canvasRef}
                        className={canvasAnimationEnded ? "scribbl-canvas-shadow" : ""}
                    />
                </div>
            </motion.div>

            <ResultModal
                submissionData={submissionData}
                onClose={() => setSubmissionData({ state: "idle" })}
            />
        </div>
    );
};
