import {
  getChainEndpoint,
  isChainIdSupported,
  DEFAULT_CHAIN_ID,
} from "constants/chainid-map";
import { ethers } from "ethers";
import { useMetaMask } from "metamask-react";
import * as React from "react";

export function useChainId() {
  const metaMask = useMetaMask();
  const chainId =
    metaMask.status === "connected" ? metaMask.chainId : DEFAULT_CHAIN_ID;

  const chainIdStatus =
    metaMask.status !== "connected"
      ? "fallback"
      : isChainIdSupported(metaMask.chainId)
      ? "supported"
      : "notSupported";
  return {
    walletChainId: metaMask.chainId,
    chainIdStatus,
    chainId,
  };
}

export function useReadonlyProvider() {
  const { chainId } = useChainId();
  return React.useMemo(() => {
    const provider = new ethers.providers.JsonRpcProvider(
      getChainEndpoint(chainId)
    );
    return provider;
  }, [chainId]);
}
