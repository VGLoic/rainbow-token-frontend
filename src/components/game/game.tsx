import { Box, useTheme } from "@mui/material";
import { useMetaMask } from "metamask-react";
import AccountSpecifics from "./account-specifics";
import GameSpecifics from "./game-specifics";
import Players from "./players";
import { isChainIdSupported } from "constants/chainid-map";

function Game() {
  const theme = useTheme();
  const metaMask = useMetaMask();

  if (metaMask.status !== "connected") return null;

  if (!isChainIdSupported(metaMask.chainId)) return null;

  return (
    <Box
      sx={{
        height: "calc(100% - 64px)",
        display: "flex",
        padding: "64px",
        [theme.breakpoints.down("md")]: {
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
          display: "flex",
          flexDirection: "column",
          marginLeft: "48px",
          [theme.breakpoints.down("md")]: {
            width: "100%",
            marginLeft: "0",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        }}
      >
        <AccountSpecifics
          style={{
            marginBottom: "16px",
            [theme.breakpoints.down("md")]: {
              marginBottom: 0,
              marginRight: "16px",
            },
          }}
        />
        <GameSpecifics />
      </Box>
    </Box>
  );
}

export default Game;
