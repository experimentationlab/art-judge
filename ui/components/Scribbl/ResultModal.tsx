"use client";
import {
    Button,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
} from "@heroui/react";
import { FC, ReactNode } from "react";
import { LoadingRobot, SadRobot, ShinyEyesRobot } from "../Icons";
import { Result, SubmissionData, SubmissionState } from "./types";

interface Props {
    submissionData: SubmissionData;
    onClose?: () => void;
}

const getModalConfig = (state: SubmissionState) => {
    switch (state) {
        case "errored":
            return {
                color: "danger",
                title: "Hummm!",
            };
        case "pending":
            return {
                color: "warning",
                title: "Waiting Results!",
            };
        case "ready":
            return {
                color: "primary",
                title: "Results",
            };
        default:
            return {
                color: "secondary",
                title: "Nothing here to check!",
            };
    }
};

const ContentWrapper: FC<{ children: ReactNode }> = ({ children }) => {
    return <div className="flex flex-col gap-3 items-center text-3xl pb-16">{children}</div>;
};

const PendingContent = () => {
    return (
        <ContentWrapper>
            <LoadingRobot width={120} height={120} />
            <div className="flex gap-1 justify-start">
                <p>
                    <span>Your results are cooking...</span>
                </p>
                <Spinner size="lg" />
            </div>
            <span className=" text-slate-500 pt-8">Taking too long?</span>
        </ContentWrapper>
    );
};

const ErrorContent = () => {
    return (
        <ContentWrapper>
            <SadRobot width={120} height={120} />
            <div className="flex gap-1 justify-start text-danger">
                <p>Blip! Blop! Feels like some malfunction is going on...</p>
            </div>
        </ContentWrapper>
    );
};

const replaceUnderscore = (text: string) => text?.replace("_", " ");

const MoreLike: FC<{
    predictions: {
        theme: string;
        probability: bigint;
    }[];
}> = ({ predictions }) => {
    const quantity = predictions.length;

    if (quantity === 1)
        return (
            <p>
                It looks more like a{" "}
                <span className="capitalize">{replaceUnderscore(predictions[0].theme)}</span> by{" "}
                <span>{predictions[0].probability} %</span>{" "}
            </p>
        );

    return (
        <>
            <p>It looks more like:</p>
            {predictions.map((pred, i) => (
                <section key={`morelike-${i}-${pred.theme}`}>
                    A <span className="capitalize">{replaceUnderscore(pred.theme)}</span> by{" "}
                    <span>{pred.probability} %</span>
                </section>
            ))}
        </>
    );
};

const ReadyContent: FC<{ result: Result }> = ({ result }) => {
    const theme = result.theme;
    const confidence = result.confidence;
    const position = result.predictions.findIndex(
        (pred) => pred.theme.toLowerCase() === theme.toLowerCase(),
    );
    const isInTheList = position !== -1;
    const isFirst = position === 0;
    const likelyhoodTxt = `It is ${confidence}% like one.`;
    const predictionsToShow = isInTheList
        ? result.predictions.slice(0, position)
        : result.predictions;

    return (
        <ContentWrapper>
            <ShinyEyesRobot width={120} height={120} />
            <div className="flex flex-col gap-1 items-center">
                <p>
                    Well! For the{" "}
                    <span className="capitalize">{replaceUnderscore(result.theme)}</span>
                </p>
                <p>{likelyhoodTxt}</p>

                {!isFirst && (
                    <section className="pt-3 flex flex-col items-center">
                        <p className="text-secondary"> However!!!</p>
                        <MoreLike predictions={predictionsToShow} />
                        <p>Maybe... change the theme?</p>
                    </section>
                )}
            </div>
        </ContentWrapper>
    );
};

export const ResultModal: FC<Props> = ({ submissionData, onClose }) => {
    const state = submissionData.state;
    const isOpen = state !== "idle";
    const modalConfig = getModalConfig(state);
    const confidence = submissionData.result?.confidence ?? 0n;

    return (
        <Modal
            isOpen={isOpen}
            placement="auto"
            hideCloseButton
            backdrop="blur"
            size="2xl"
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose && onClose();
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className={`flex flex-col gap-1`}>
                            <span className={`text-${modalConfig.color}`}>{modalConfig.title}</span>
                        </ModalHeader>
                        <ModalBody>
                            {state === "pending" ? (
                                <PendingContent />
                            ) : state === "errored" ? (
                                <ErrorContent />
                            ) : state === "ready" ? (
                                <ReadyContent result={submissionData.result!} />
                            ) : (
                                ""
                            )}
                        </ModalBody>
                        <ModalFooter className="gap-5">
                            <Link
                                className="text-primary-700"
                                underline="hover"
                                href="/leaderboard"
                            >
                                Check the leaderboard
                            </Link>

                            {state === "ready" && confidence < 60n && (
                                <Button color="primary" variant="shadow" onPress={onClose}>
                                    Try again
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
