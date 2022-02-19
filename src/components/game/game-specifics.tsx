import * as React from "react";
import { ethers } from "ethers";
import { Box, Paper, Typography } from "@mui/material";
import { useConnectedMetaMask } from "metamask-react";
import { contracts, RainbowToken__factory } from "rainbow-token-contracts";
import { useQuery } from "react-query";

function useRainbowToken() {
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

function useProvider() {
  const { ethereum, chainId } = useConnectedMetaMask();
  return React.useMemo(() => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    return provider;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethereum, chainId]);
}

function GameSpecifics() {
  const rainbowToken = useRainbowToken();
  const provider = useProvider();

  const targetColorQuery = useQuery("targetColor", () =>
    rainbowToken.getTargetColor()
  );
  const contractBalanceQuery = useQuery(
    "contractBalance",
    () => provider.getBalance(rainbowToken.address),
    {
      refetchInterval: 1000,
    }
  );

  const globalSuccess =
    targetColorQuery.status === "success" &&
    contractBalanceQuery.status === "success";

  return (
    <Paper>
      <Typography component="h2" variant="h6">
        Game Specifics
      </Typography>
      {globalSuccess ? (
        <Box>
          <Typography>
            Target color: RGB({targetColorQuery.data.r},{" "}
            {targetColorQuery.data.g}, {targetColorQuery.data.b})
          </Typography>
          <Typography>
            Contract balance:{" "}
            {ethers.utils.formatUnits(contractBalanceQuery.data, "ether")} ETH{" "}
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
}

export default GameSpecifics;
