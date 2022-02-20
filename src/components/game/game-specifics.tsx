import * as React from "react";
import { ethers } from "ethers";
import { Box, Paper, SxProps, Typography } from "@mui/material";
import { useConnectedMetaMask } from "metamask-react";
import { contracts, RainbowToken__factory } from "rainbow-token-contracts";
import { useQuery } from "react-query";
import Balance from "components/balance";

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

type GameSpecificsProps = {
  style?: SxProps;
};
function GameSpecifics({ style }: GameSpecificsProps) {
  const rainbowToken = useRainbowToken();

  const targetColorQuery = useQuery("targetColor", () =>
    rainbowToken.getTargetColor()
  );

  return (
    <Paper sx={{ padding: "16px", ...style }}>
      <Typography component="h2" variant="h6" mb="8px">
        Game Specifics
      </Typography>
      {targetColorQuery.status === "success" ? (
        <Box>
          <Typography>
            Target color: RGB({targetColorQuery.data.r},{" "}
            {targetColorQuery.data.g}, {targetColorQuery.data.b})
          </Typography>
          <Typography>
            Contract balance: <Balance account={rainbowToken.address} />
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
}

export default GameSpecifics;
