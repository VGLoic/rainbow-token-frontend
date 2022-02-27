import * as React from "react";
import {
  isChainIdSupported,
  DEFAULT_CHAIN_ID,
  getChainProvider,
} from "constants/chainid-map";
import { useMetaMask } from "metamask-react";

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
    const provider = getChainProvider(chainId);
    return provider;
  }, [chainId]);
}

export function useMainNetProvider() {
  return React.useMemo(() => {
    const provider = getChainProvider("0x1");
    return provider;
  }, []);
}
