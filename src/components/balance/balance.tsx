import * as React from "react";
import { ethers } from "ethers";
import { useConnectedMetaMask } from "metamask-react";
import { useQuery } from "react-query";
import { Box } from "@mui/material";
import EthIcon from "components/eth-icon";

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
  ariaLabel?: string;
};
function Balance({ account, ariaLabel }: BalanceProps) {
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
    <Box
      component="span"
      display="flex"
      alignItems="center"
      aria-label={ariaLabel}
    >
      <span>
        {Number(ethers.utils.formatUnits(balanceQuery.data, "ether")).toFixed(
          2
        )}
      </span>
      <EthIcon />
    </Box>
  );
}

export default Balance;
