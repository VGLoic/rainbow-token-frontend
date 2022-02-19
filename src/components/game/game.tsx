import { Box, Paper, useTheme } from "@mui/material";
import { contracts } from "rainbow-token-contracts";
import { useMetaMask } from "metamask-react";
import AccountSpecifics from "./account-specifics";
import GameSpecifics from "./game-specifics";

function Players() {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        height: "100%",
        flex: 3,
        [theme.breakpoints.down("sm")]: {
          width: "100%",
        },
      }}
    >
      Player tables
    </Paper>
  );
}

function Game() {
  const theme = useTheme();
  const { status, chainId } = useMetaMask();

  if (status !== "connected") return null;

  if (!contracts.rainbowToken.isNetworkSupported(Number(chainId))) return null;

  return (
    <Box
      sx={{
        height: "calc(100% - 64px)",
        display: "flex",
        padding: "64px",
        [theme.breakpoints.down("sm")]: {
          padding: "48px",
          flexDirection: "column-reverse",
          alignItems: "center",
        },
      }}
    >
      <Players />
      <Box
        sx={{
          height: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "48px",
          [theme.breakpoints.down("sm")]: {
            width: "100%",
            marginLeft: "0",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        }}
      >
        <AccountSpecifics />
        <GameSpecifics />
      </Box>
    </Box>
  );
}

export default Game;
