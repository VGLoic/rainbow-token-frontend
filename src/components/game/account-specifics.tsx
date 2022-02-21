import * as React from "react";
import { Box, Button, Paper, SxProps, Typography } from "@mui/material";
import { useConnectedMetaMask } from "metamask-react";
import { contracts, RainbowToken__factory } from "rainbow-token-contracts";
import { BigNumberish, ethers } from "ethers";
import { useMutation, useQueryClient } from "react-query";
import { ENTRY_FEE } from "constants/rainbow-token";
import Balance from "components/balance";
import { useIsPlayer, usePlayer } from "hooks";

function useRainbowToken() {
  const { ethereum, chainId } = useConnectedMetaMask();
  const contract = React.useMemo(() => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return RainbowToken__factory.connect(
      contracts.rainbowToken.getNetworkConfiguration(Number(chainId)).address,
      signer
    );
  }, [ethereum, chainId]);
  return contract;
}

function JoinGame() {
  const rainbowToken = useRainbowToken();
  const queryClient = useQueryClient();

  const { status, mutate } = useMutation(
    () =>
      rainbowToken
        // TODO: REMIND ME TO FIX THIS PROBLEM
        .joinGame({ value: ENTRY_FEE.toHexString(), gasLimit: "0x18a06" })
        .then((tx) => tx.wait()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["isPlayer"]);
      },
    }
  );

  return (
    <Button
      variant="contained"
      onClick={() => mutate()}
      disabled={status === "loading"}
    >
      {status === "loading" ? "Joining..." : "Join the Game"}
    </Button>
  );
}

type RainbowTokenAccountProps = {
  account: string;
};
function RainbowTokenAccount({ account }: RainbowTokenAccountProps) {
  const playerQuery = usePlayer(account);

  if (playerQuery.status !== "success") return null;

  const player = playerQuery.data;

  return (
    <Box>
      <Typography>
        Blending price:{" "}
        {ethers.utils.formatUnits(
          player.blendingPrice as BigNumberish,
          "ether"
        )}{" "}
        ETH{" "}
      </Typography>
      <Typography>
        Color: RGB({player.color.r}, {player.color.g}, {player.color.b})
      </Typography>
      <Typography>
        Original color: RGB({player.originalColor.r}, {player.originalColor.g},{" "}
        {player.originalColor.b})
      </Typography>
      <Typography>
        Account balance: <Balance account={account} />
      </Typography>
    </Box>
  );
}

type AccountSpecificsProps = {
  style?: SxProps;
};
function AccountSpecifics({ style }: AccountSpecificsProps) {
  const { account } = useConnectedMetaMask();
  const { status, isPlayer } = useIsPlayer(account);

  return (
    <Paper sx={{ padding: "16px", ...style }}>
      <Typography component="h2" variant="h6" mb="8px">
        Account Specifics
      </Typography>
      {status !== "success" ? null : isPlayer ? (
        <RainbowTokenAccount account={account} />
      ) : (
        <JoinGame />
      )}
    </Paper>
  );
}

export default AccountSpecifics;
