"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBlockNumber } from "wagmi";

interface Opts {
    /**
     * Enables/disables listening for block number changes.
     * @default true
     */
    watch?: boolean;
    /**
     * Number of blocks until it runs the query invalidations.
     * @default 10n
     */
    numberOfBlocks?: bigint;
}

type Hook = (queryKey: readonly unknown[], opts?: Opts) => void;

export const useRefetchOnBlockChange: Hook = (queryKey: readonly unknown[], opts) => {
    const { watch = true, numberOfBlocks = 10n } = opts ?? {};
    const queryClient = useQueryClient();
    const { data: blockNumber } = useBlockNumber({ watch });

    useEffect(() => {
        if (watch && blockNumber && blockNumber % numberOfBlocks === 0n) {
            console.info(`${numberOfBlocks} blocks had passed. Refetching...`);
            queryClient.invalidateQueries({ queryKey });
        }
    }, [blockNumber, queryClient, queryKey, watch]);
};
