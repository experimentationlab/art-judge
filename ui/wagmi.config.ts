import ScribbleTaskManagerABI from "@/contracts/ScribbleTaskManager.abi.json";
import { defineConfig, loadEnv } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi, isAddress } from "viem";

export default defineConfig(() => {
    const env = loadEnv({ mode: process.env.NODE_ENV, envDir: process.cwd() }) as NodeJS.ProcessEnv;
    const contractAddress = env.NEXT_PUBLIC_COPROCESSOR_CALLER_ADDRESS;

    if (!isAddress(contractAddress))
        throw new Error(
            `Looks like the env variable NEXT_PUBLIC_COPROCESSOR_CALLER_ADDRESS is not an address: ${contractAddress}`,
        );

    return {
        out: "contracts/generated/scribbleTaskManager/index.ts",
        contracts: [
            {
                name: "taskManager",
                abi: ScribbleTaskManagerABI as Abi,
                address: contractAddress,
            },
        ],
        plugins: [react()],
    };
});
