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
