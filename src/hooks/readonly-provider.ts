import { getChainEndpoint, isChainIdSupported, DEFAULT_CHAIN_ID } from 'constants/chainid-map';
import { ethers } from 'ethers';
import { useMetaMask } from 'metamask-react';
import * as React from 'react';


export function useChainId() {
    const metaMask = useMetaMask();
    const isWalletChainIdSupported = metaMask.status === "connected" && isChainIdSupported(metaMask.chainId);
    const chainId = isWalletChainIdSupported
      ? metaMask.chainId
      : DEFAULT_CHAIN_ID;
    return {
      walletChainId: metaMask.chainId,
      isWalletChainIdSupported,
      chainId
    }
  }
  
  export function useReadonlyProvider() {
    const { chainId } = useChainId();
    return React.useMemo(() => {
      const provider = new ethers.providers.JsonRpcProvider(getChainEndpoint(chainId));
      return provider;
    }, [chainId])
  }
  