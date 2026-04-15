import { createConfig, http } from "wagmi";
import { arcTestnet } from "./arc-config";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "Arc USDC Transfer",
  projectId: "5da801378826acf33a1ae02038d78f58",
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
  },
});