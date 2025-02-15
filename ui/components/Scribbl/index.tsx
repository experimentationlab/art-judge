"use client";
import useWallet from "@/components/Wallet/useWallet";
import {
    taskManagerAbi,
    useSimulateTaskManagerRunExecution,
    useWatchTaskManagerNoticeReceivedEvent,
    useWriteTaskManagerRunExecution,
} from "@/contracts/generated/scribbleTaskManager";
import { Button, Tooltip } from "@heroui/react";
import { motion, Transition } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { FaEraser, FaPaperPlane, FaUndo } from "react-icons/fa";
import { decodeFunctionResult, Hex, isAddress, isHex, keccak256, toHex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { ResultModal } from "./ResultModal";
import { ThemeSelector } from "./ThemeSelector";
import { ValidThemes } from "./themes";
import { SubmissionData } from "./types";
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

const decodeNotice = (encodedNotice: Hex) => {
    const [result, theme, classes, probabilities] = decodeFunctionResult({
        abi: taskManagerAbi,
        functionName: "decodeNoticeData",
        data: encodedNotice,
    });

    const notice = {
        passed: true,
        theme,
        confidence: result,
        predictions: classes.map((name, i) => {
            return {
                theme: name,
                probability: probabilities[i],
            };
        }),
    };

    return notice;
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

    useWatchTaskManagerNoticeReceivedEvent({
        args: {
            payloadHash: submissionData.payloadHash,
            user: address,
        },
        enabled: submissionData.payloadHash !== null && isAddress(address ?? ""),
        onLogs: (logs) => {
            console.info("New logs", logs);
            const [log] = logs;
            try {
                const notice = decodeNotice(log.args.notice!);
                setSubmissionData({ state: "ready", result: notice });
            } catch (error) {
                console.error(`Error when trying to decode the notice`, error);
                setSubmissionData({ state: "errored" });
            }
        },
    });

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
        <div style={{ overflow: canvasAnimationEnded ? "visible" : "hidden" }}>
            <motion.div
                initial={{ y: -520 }}
                animate={isReady ? { y: 0 } : false}
                transition={transition}
                onAnimationComplete={() => {
                    setCanvasAnimationEnded(true);
                }}
            >
                <div className="flex flex-col gap-2">
                    <div className="py-3 w-full">
                        <ThemeSelector onValueChange={setTheme} selectedTheme={theme} />
                    </div>
                    <div className="flex justify-between gap-1">
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
                                            console.log("setting payload", theme);
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
