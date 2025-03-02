import { createConfig } from "ponder";
import { http } from "viem";
import { ScribbleTaskManagerAbi } from "./abis/ScribbleTaskManagerAbi";
import { TaskIssuerAbi } from "./abis/TaskIssuerAbi";

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
    TaskIssuer: {
      network: "holesky",
      abi: TaskIssuerAbi,
      address: "0xff35E413F5e22A9e1Cc02F92dcb78a5076c1aaf3",
      startBlock: 3358671,
      filter: {
        event: "TaskIssued",
        args: {
          callback: "0x844E494489BEFC2baA9c6d168a659264a7779505"
        }
      },
    },
  },
});
