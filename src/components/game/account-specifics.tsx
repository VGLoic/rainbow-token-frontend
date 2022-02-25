import {
  Box,
  Button,
  Paper,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import { useConnectedMetaMask, useMetaMask } from "metamask-react";
import { BigNumberish, ethers } from "ethers";
import { useMutation, useQueryClient } from "react-query";
import { ENTRY_FEE } from "constants/rainbow-token";
import Balance from "components/balance";
import { useIsPlayer, usePlayer, useRainbowToken } from "hooks";
import SelfBlend from "./self-blend";
import EditBlendingPrice from "./edit-blending-price";
import ColorToken from "components/color-token";
import EthIcon from "components/eth-icon";
import ConnectWallet from "components/connect-wallet";
import Address from "components/address";

function JoinGame() {
  const rainbowToken = useRainbowToken();
  const queryClient = useQueryClient();
  const { chainId, account } = useConnectedMetaMask();

  const { status, mutate } = useMutation(
    () =>
      rainbowToken
        // TODO: Fix the manual input of gas limit
        .joinGame({ value: ENTRY_FEE.toHexString(), gasLimit: "0x18a06" })
        .then((tx) => tx.wait()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([{ chainId }, "isPlayer"]);
      },
    }
  );

  return (
    <>
      <Typography component="h2" variant="h6" mb="8px">
        <Address address={account} />
      </Typography>
      <Box
        sx={{
          padding: "24px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={() => mutate()}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Joining..." : "Join the Game"}
        </Button>
      </Box>
    </>
  );
}

type RainbowTokenAccountProps = {
  account: string;
};
function RainbowTokenAccount({ account }: RainbowTokenAccountProps) {
  const playerQuery = usePlayer(account);

  const theme = useTheme();

  if (playerQuery.status !== "success") return null;

  const player = playerQuery.data;

  return (
    <>
      <Typography component="h2" variant="h6" mb="8px">
        <Address address={account} />
      </Typography>
      <Box>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            [theme.breakpoints.down("md")]: {
              flexDirection: "column",
              alignItems: "flex-start",
            },
          }}
          mb="8px"
        >
          <Typography>Blending price:</Typography>
          <Box display="flex" alignItems="center" ml="4px">
            <Typography aria-label="account blending price">
              {ethers.utils.formatUnits(
                player.blendingPrice as BigNumberish,
                "ether"
              )}
            </Typography>
            <EthIcon />{" "}
            <EditBlendingPrice
              player={player}
              buttonStyle={{ marginLeft: "8px" }}
            />
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mb="8px">
          <Typography>Current color</Typography>
          <ColorToken
            style={{ marginLeft: "8px" }}
            color={player.color}
            ariaLabelPrefix="current color"
          />
        </Box>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            [theme.breakpoints.down("md")]: {
              flexDirection: "column",
              alignItems: "flex-start",
            },
          }}
          mb="8px"
        >
          <Typography>Original color</Typography>
          <Box display="flex" alignItems="center">
            <ColorToken
              style={{ marginLeft: "8px", marginRight: "8px" }}
              color={player.originalColor}
              ariaLabelPrefix="original color"
            />{" "}
            <SelfBlend player={player} />
          </Box>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            [theme.breakpoints.down("md")]: {
              flexDirection: "column",
              alignItems: "flex-start",
            },
          }}
        >
          <Typography mr="8px">Account balance:</Typography>
          <Balance account={account} ariaLabel="account balance" />
        </Box>
      </Box>
    </>
  );
}

type ConnectedAccountProps = {
  account: string;
};
function ConnectedAccount({ account }: ConnectedAccountProps) {
  const { status, isPlayer } = useIsPlayer(account);

  if (status !== "success") return null;

  if (!isPlayer) {
    return <JoinGame />;
  }

  return <RainbowTokenAccount account={account} />;
}

function NotConnectedAccount() {
  return (
    <>
      <Typography component="h2" variant="h6" mb="8px">
        Wanna play?
      </Typography>
      <Box
        sx={{
          padding: "24px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ConnectWallet />
      </Box>
    </>
  );
}

type AccountSpecificsProps = {
  style?: SxProps;
};
function AccountSpecifics({ style }: AccountSpecificsProps) {
  const metaMask = useMetaMask();

  return (
    <Paper sx={{ padding: "16px", ...style }}>
      {metaMask.status !== "connected" ? (
        <NotConnectedAccount />
      ) : (
        <ConnectedAccount account={metaMask.account} />
      )}
    </Paper>
  );
}

export default AccountSpecifics;
