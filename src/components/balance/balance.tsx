import * as React from "react";
import { ethers } from "ethers";
import { useConnectedMetaMask } from "metamask-react";
import { useQuery } from "react-query";

function useProvider() {
  const { ethereum, chainId } = useConnectedMetaMask();
  return React.useMemo(() => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    return provider;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereum, chainId]);
}

type BalanceProps = {
  account: string;
};
function Balance({ account }: BalanceProps) {
  const provider = useProvider();
  const balanceQuery = useQuery(
    ["balance", { account }],
    () => provider.getBalance(account),
    {
      refetchInterval: 1000,
    }
  );
  if (balanceQuery.status !== "success") return null;

  return (
    <span>
      {Number(ethers.utils.formatUnits(balanceQuery.data, "ether")).toFixed(2)}{" "}
      ETH{" "}
    </span>
  );
}

export default Balance;
