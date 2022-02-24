import { ethers } from "ethers";
import { useQuery } from "react-query";
import { Box } from "@mui/material";
import EthIcon from "components/eth-icon";
import { useChainId, useReadonlyProvider } from "hooks";

type BalanceProps = {
  account: string;
  ariaLabel?: string;
};
function Balance({ account, ariaLabel }: BalanceProps) {
  const provider = useReadonlyProvider();
  const { chainId } = useChainId();

  const balanceQuery = useQuery(
    [{ chainId }, "balance", { account }],
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
