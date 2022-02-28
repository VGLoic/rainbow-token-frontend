import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";

export const chainIdToNameMap: Record<string, string> = {
  1: "Ethereum",
  3: "Ropsten",
  4: "Rinkeby",
  5: "Goerli",
  42: "Kovan",
  61: "Ethereum Classic",
  62: "Morden",
  31337: "Localhost",
};

const chainIdToEndpointMap: Record<string, string> = {
  1: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  3: `https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  4: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  5: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  42: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  31337: "http://localhost:8545",
};

export const DEFAULT_CHAIN_ID = "0x5";

function getChainEndpoint(chainId: string) {
  const chainEndpoint = chainIdToEndpointMap[Number(chainId)];
  if (!chainEndpoint) {
    throw new Error(`Endpoint not found for chain ID: ${chainId}`);
  }
  return chainEndpoint;
}

export function getChainProvider(chainId: string) {
  const chainEndpoint = getChainEndpoint(chainId);
  return new ethers.providers.JsonRpcProvider(chainEndpoint);
}

export function getChainName(chainId: string) {
  const chainName = chainIdToNameMap[Number(chainId)];
  if (chainName) return chainName;
  return "Unknown";
}

export function isChainIdSupported(chainId: string) {
  const isDeployed = contracts.rainbowToken.isNetworkSupported(Number(chainId));
  if (process.env.NODE_ENV === "development") {
    return isDeployed;
  }
  const isLocalhost = Number(chainId) === 31337;
  return isDeployed && !isLocalhost;
}
