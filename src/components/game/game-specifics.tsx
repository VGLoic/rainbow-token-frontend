import * as React from "react";
import { Box, Paper, SxProps, Typography } from "@mui/material";
import { useQuery } from "react-query";
import Balance from "components/balance";
import ColorToken from "components/color-token";
import { useReadonlyRainbowToken, useChainId } from "hooks";

type GameSpecificsProps = {
  style?: SxProps;
};
function GameSpecifics({ style }: GameSpecificsProps) {
  const rainbowToken = useReadonlyRainbowToken();
  const { chainId } = useChainId();

  const targetColorQuery = useQuery(
    [{ chainId }, "targetColor"],
    () => rainbowToken.getTargetColor(),
    {
      staleTime: Infinity,
    }
  );

  return (
    <Paper sx={{ padding: "16px", ...style }}>
      <Typography component="h2" variant="h6" mb="8px">
        The game
      </Typography>
      {targetColorQuery.status === "success" ? (
        <Box>
          <Box display="flex" alignItems="center" mb="8px">
            Target color
            <ColorToken
              style={{ marginLeft: "8px" }}
              color={targetColorQuery.data}
              ariaLabelPrefix="target color"
            />
          </Box>
          <Box display="flex" alignItems="center">
            <Typography mr="8px">Contract balance:</Typography>
            <Balance
              account={rainbowToken.address}
              ariaLabel="contract balance"
            />
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}

export default GameSpecifics;
