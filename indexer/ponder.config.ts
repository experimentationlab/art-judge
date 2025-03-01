import { createConfig } from "ponder";
import { http } from "viem";
import { ScribbleTaskManagerAbi } from "./abis/ScribbleTaskManagerAbi";

export default createConfig({
  networks: {
    holesky: {
      chainId: 17000,
      transport: http(),
    },
  },
  contracts: {
    ScribbleTaskManager: {
      network: "holesky",
      abi: ScribbleTaskManagerAbi,
      address: "0x844E494489BEFC2baA9c6d168a659264a7779505",
      startBlock: 3358559,
      filter: {
        event: "NoticeReceived",
        args: {
          payloadHash: undefined,
          user: undefined
        }
      },
    },
  },
});
