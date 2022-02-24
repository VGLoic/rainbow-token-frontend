import { Box, Typography, useTheme } from "@mui/material";
import AccountSpecifics from "./account-specifics";
import GameSpecifics from "./game-specifics";
import Players from "./players";
import { useChainId } from "hooks/readonly-provider";

function Game() {
  const theme = useTheme();
  const { chainIdStatus } = useChainId();

  if (chainIdStatus === "notSupported") {
    return <Typography>Network not supported :(</Typography>;
  }

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
      <Players
        style={{
          flex: 5,
          [theme.breakpoints.down("md")]: {
            width: "100%",
          },
        }}
      />
      <Box
        sx={{
          flex: 2,
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
