"use client";
import { useReadTaskManagerGetLeaderboard } from "@/contracts/generated/scribbleTaskManager";
import { useRefetchOnBlockChange } from "@/hooks/useRefetchOnBlockChange";
import {
    getKeyValue,
    Link,
    Pagination,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/react";
import { FC, useEffect, useMemo, useState } from "react";
import { FaMedal } from "react-icons/fa";
import { LoadingRobot, SadRobot, SmilingRobot } from "../Icons";

interface Result {
    user: string;
    score: bigint;
    challengeCount: bigint;
}

type RawData =
    | readonly [readonly `0x${string}`[], readonly bigint[], readonly bigint[]]
    | undefined;

type ColumnKey = "position" | "user" | "score" | "challengeCount";
type Column = { name: string; uid: ColumnKey };

const columns: Column[] = [
    { name: "#", uid: "position" },
    { name: "USER", uid: "user" },
    { name: "SCORE", uid: "score" },
    { name: "CHALLENGES", uid: "challengeCount" },
];

const rowsPerPage = 5;

const prepareResults = (rawData: RawData): Result[] => {
    const [users, scores, challenges] = rawData ?? [[], [], []];

    return users
        .map((user, index) => {
            const score = scores[index] ?? BigInt(0);
            const challengeCount = challenges[index] ?? BigInt(0);

            return {
                user,
                score,
                challengeCount,
            } as Result;
        })
        .sort((a, b) => {
            if (a.score > b.score) return -1;
            if (a.score < b.score) return 1;

            return 0;
        });
};

const useGetLeaderboardResults = () => {
    const [results, setResults] = useState<Result[]>([]);
    const { isLoading, data, error, queryKey } = useReadTaskManagerGetLeaderboard();

    useRefetchOnBlockChange(queryKey, { numberOfBlocks: 5n });

    if (error) console.error(error);

    useEffect(() => {
        if (data) {
            setResults(prepareResults(data));
        }
    }, [data]);

    return {
        isLoading,
        error,
        results,
    };
};

const EmptyContent = () => (
    <div className="flex flex-col justify-center items-center">
        <SmilingRobot />
        <span className="text-2xl text-secondary">Hummm! nobody tried the challenge yet.</span>
        <Link href="/" className="text-primary font-bold" underline="hover">
            Click here and be the first!
        </Link>
    </div>
);

const LoadingContent = () => (
    <div className="flex flex-col gap-3 items-center justify-center">
        <LoadingRobot />
        <div className="flex gap-2">
            <span className="text-xl text-primary font-bold">
                Blip! Blop! Checking the results...
            </span>
            <Spinner size="sm" />
        </div>
    </div>
);

const ErrorContent = () => (
    <div className="flex flex-col gap-3 items-center justify-center">
        <SadRobot />
        <div className="flex flex-col">
            <span className="text-xl text-danger">Hummm! I can't check the results.</span>
            <span className="text-xl text-danger">My creators need to check about it</span>
        </div>
    </div>
);

const renderCell = (result: Result, columnKey: ColumnKey, index: number, page: number) => {
    const cellValue = getKeyValue(result, columnKey);
    const paginationOffset = rowsPerPage * (page - 1);
    const position = index + 1 + paginationOffset;

    const topThree = position >= 1 && position <= 3;
    const topColours = {
        "1": "text-amber-300",
        "2": "text-zinc-300",
        "3": "text-yellow-700",
    };
    const medalColourClass = getKeyValue(topColours, position);

    switch (columnKey) {
        case "position":
            return (
                <div className="flex gap-1 items-center justify-center">
                    {topThree ? <FaMedal className={medalColourClass} /> : ""}
                    <span className={topThree ? "font-bold" : ""}>{position}</span>
                </div>
            );
        default:
            return cellValue;
    }
};

export const GlobalLeaderboard: FC = () => {
    const { error, isLoading, results } = useGetLeaderboardResults();
    const [page, setPage] = useState(1);

    const pages = Math.ceil(results.length / rowsPerPage);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return results.slice(start, end);
    }, [page, results]);

    return (
        <Table
            aria-label="Global Leaderboard table. It displays the theme scored by users."
            className="max-w-3xl"
            bottomContent={
                <div className="flex w-full justify-center">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={pages}
                        onChange={(page) => setPage(page)}
                        hidden={results.length === 0}
                    />
                </div>
            }
            classNames={{
                wrapper: "min-h-[250px]",
            }}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align="center">
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                items={items}
                emptyContent={!error ? <EmptyContent /> : <ErrorContent />}
                isLoading={isLoading}
                loadingContent={<LoadingContent />}
            >
                {items.map((item, index) => (
                    <TableRow key={item.user}>
                        {(columnKey) => (
                            <TableCell>
                                {renderCell(item, columnKey as ColumnKey, index, page)}
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
