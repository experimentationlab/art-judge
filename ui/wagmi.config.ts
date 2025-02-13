import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { Abi } from "viem";

export default defineConfig({
  out: "contracts/generated/scribbl-coprocessor-caller/index.ts",
  contracts: [
    {
      name: "scribbl-coprocessor-caller",
      // TODO: Import the contract here for the generator
      abi: [] as Abi,
    },
  ],
  plugins: [react()],
});
