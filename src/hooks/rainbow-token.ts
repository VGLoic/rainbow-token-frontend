import * as React from "react";
import { useConnectedMetaMask } from "metamask-react";
import { ethers } from "ethers";
import { contracts, RainbowToken__factory } from "rainbow-token-contracts";

export function useReadonlyRainbowToken() {
  const { ethereum, chainId } = useConnectedMetaMask();
  const contract = React.useMemo(() => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    return RainbowToken__factory.connect(
      contracts.rainbowToken.getNetworkConfiguration(Number(chainId)).address,
      provider
    );
  }, [ethereum, chainId]);
  return contract;
}

export function useRainbowToken() {
  const { ethereum, chainId } = useConnectedMetaMask();
  const contract = React.useMemo(() => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return RainbowToken__factory.connect(
      contracts.rainbowToken.getNetworkConfiguration(Number(chainId)).address,
      signer
    );
  }, [ethereum, chainId]);
  return contract;
}
