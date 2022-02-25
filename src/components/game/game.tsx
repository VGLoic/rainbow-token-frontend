import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import AccountSpecifics from "./account-specifics";
import GameSpecifics from "./game-specifics";
import Players from "./players";
import { useChainId } from "hooks/readonly-provider";
import { getChainName } from "constants/chainid-map";
import { useConnectedMetaMask } from "metamask-react";
import { contracts } from "rainbow-token-contracts";
import { ethers } from "ethers";

type NetworkNotSupportedProps = {
  chainId: string;
};
function NetworkNotSupported({ chainId }: NetworkNotSupportedProps) {
  const { ethereum } = useConnectedMetaMask();

  const requestNetworkSwitch = (chainId: string) =>
    ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  const supportedChainIds = contracts.rainbowToken.supportedNetworks
    .filter((chainId) => {
      if (process.env.NODE_ENV !== "development") {
        return Number(chainId) !== 31337;
      }
      return true;
    })
    .map((chainId) => ethers.utils.hexValue(chainId));
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "64px",
        paddingBottom: "64px",
      }}
    >
      <Paper sx={{ padding: "64px" }}>
        <Typography fontWeight="bold" mb="8px" color="error">
          {getChainName(chainId)} is currently not supported.
        </Typography>
        <Typography>
          Please switch to one of the supported following networks.
        </Typography>
        <Box display="flex">
          {supportedChainIds.map((chainId) => (
            <Button
              key={chainId}
              variant="contained"
              onClick={() => requestNetworkSwitch(chainId)}
              sx={{ margin: "8px" }}
            >
              {getChainName(chainId)}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

function Game() {
  const theme = useTheme();
  const { chainIdStatus, chainId } = useChainId();

  if (chainIdStatus === "notSupported") {
    return <NetworkNotSupported chainId={chainId} />;
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
