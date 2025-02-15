"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBlockNumber } from "wagmi";

export const useRefetchOnBlockChange = (queryKey: readonly unknown[]) => {
    const queryClient = useQueryClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [blockNumber, queryClient, queryKey]);
};
