import { contracts } from "rainbow-token-contracts";

export const chainIdMap: Record<string, string> = {
  1: "Ethereum",
  3: "Ropsten",
  4: "Rinkeby",
  5: "Goerli",
  42: "Kovan",
  61: "Ethereum Classic",
  62: "Morden",
  31337: "Localhost",
};

export function getChainName(chainId: string) {
  const chainName = chainIdMap[Number(chainId)];
  if (chainName) return chainName;
  return "Unknown";
}

export function isChainIdSupported(chainId: number) {
  const isDeployed = contracts.rainbowToken.isNetworkSupported(chainId);
  if (process.env.NODE_ENV === "development") {
    return isDeployed;
  }
  const isLocalhost = chainId === 31337;
  return isDeployed && !isLocalhost;
}
