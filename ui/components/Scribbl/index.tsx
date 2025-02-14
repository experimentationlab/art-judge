"use client";
import useWallet from "@/components/Wallet/useWallet";
import {
    useReadTaskManagerGetLeaderboard,
    useReadTaskManagerGetNoticeResult,
    useSimulateTaskManagerRunExecution,
    useWriteTaskManagerRunExecution,
} from "@/contracts/generated/scribbleTaskManager";
import { Button, Input, Link, Tooltip } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, Transition } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { FaEraser, FaPalette, FaPaperPlane, FaUndo } from "react-icons/fa";
import { Hex, isHex, keccak256, toHex } from "viem";
import { useBlockNumber, useWaitForTransactionReceipt } from "wagmi";
import { useCanvas } from "./useCanvas";

const transition: Transition = {
    duration: 0.8,
    bounce: 0.5,
    type: "spring",
};

const preparePayload = (dataUrl: string, theme: string) => {
    const [_mimeEncoding, data] = dataUrl.split(",");
    return toHex(JSON.stringify({ image: data, theme }));
};

const useWatchQueryOnBlockChange = (queryKey: readonly unknown[]) => {
    const queryClient = useQueryClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [blockNumber, queryClient, queryKey]);
};

const useResultReader = () => {
    const [payload, setPayload] = useState<Hex | null>(null);

    if (isHex(payload)) {
        console.log(`watching notice for payload: ${payload}`);
    }

    const result = useReadTaskManagerGetLeaderboard();

    console.log("START LEADERBOARD");
    console.log(result.data);
    console.log("END LEADERBOARD");

    const keccakked = isHex(payload) ? keccak256(payload) : null;

    const noticeResult = useReadTaskManagerGetNoticeResult({
        args: [keccakked!],
        query: {
            enabled: isHex(keccakked),
        },
    });

    console.log(` START NOTICE RESULT ${new Date().toISOString()}`);
    console.log(noticeResult.data);
    console.log("END NOTICE RESULT");

    useWatchQueryOnBlockChange(noticeResult.queryKey);

    return {
        watchResultForPayload: setPayload,
    };
};

export const Scribbl: FC = () => {
    const [downloadLink, setDownloadLink] = useState<string | null>();
    const [canvasAnimationEnded, setCanvasAnimationEnded] = useState<boolean>(false);
    const { isConnected, isReadyToSendTransaction, openChainModal, openConnectModal } = useWallet();
    const [payload, setPayload] = useState<Hex | null>(null);
    const { watchResultForPayload } = useResultReader();
    const [theme, setTheme] = useState<string>("circle");

    const { clearCanvas, hasContent, prepareToExport, removeLastEntry, canvasRef, isReady } =
        useCanvas();

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
        isReadyToSendTransaction && isHex(payload) && !prepare.isLoading && prepare.error === null;
    const isSubmitting = prepare.isLoading || execute.isPending || wait.isLoading;

    // debugging
    if (prepare.error) {
        console.error(prepare.error);
    }

    useEffect(() => {
        if (canSubmit) {
            console.log("Executing...");
            watchResultForPayload(payload);
            execute.writeContract(prepare.data!.request);
        }
    }, [canSubmit, payload, watchResultForPayload, isConnected]);

    useEffect(() => {
        if (wait.isSuccess) {
            setPayload(null);
            clearCanvas();
            execute.reset();
        }
    }, [wait, clearCanvas]);

    useEffect(() => {
        if (!hasContent) setDownloadLink(null);
    }, [hasContent]);

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
                        <Input
                            value={theme}
                            placeholder="Add the theme here! e.g. circle"
                            radius="none"
                            startContent={<FaPalette />}
                            onValueChange={setTheme}
                            isClearable
                        />
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
                                            const dataUrl = prepareToExport();
                                            setDownloadLink(dataUrl);
                                            setPayload(
                                                preparePayload(
                                                    dataUrl,
                                                    theme?.toLowerCase() ?? "circle",
                                                ),
                                            );
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

                    {downloadLink && (
                        <Link color="foreground" href={downloadLink} download="scribbl.png">
                            Download Drawing
                        </Link>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
