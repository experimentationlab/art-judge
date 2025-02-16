import { Hex } from "viem";

export interface Result {
    passed: boolean;
    theme: string;
    confidence: bigint;
    predictions: {
        theme: string;
        probability: bigint;
    }[];
}

export type SubmissionState = "pending" | "ready" | "idle" | "errored";

export interface SubmissionData {
    state: SubmissionState;
    result?: Result;
    payloadHash?: Hex;
}

type Predictions = readonly [
    { class: string; probability: bigint },
    { class: string; probability: bigint },
    { class: string; probability: bigint },
];

export type NoticeResult = [boolean, string, bigint, Predictions];
