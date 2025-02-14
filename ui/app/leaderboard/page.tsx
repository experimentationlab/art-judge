import { GlobalLeaderboard } from "@/components/GlobalLeaderboard";

export default function Leaderboard() {
    return (
        <main className="flex flex-col items-center sm:items-center py-32 justify-center">
            <h1 className="text-5xl pb-8">Global Leaderboard</h1>
            <GlobalLeaderboard />
        </main>
    );
}
