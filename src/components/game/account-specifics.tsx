import * as React from "react";
import { Box, Button, Paper, SxProps, Typography } from "@mui/material";
import { useConnectedMetaMask } from "metamask-react";
import { contracts, RainbowToken__factory } from "rainbow-token-contracts";
import { BigNumberish, ethers } from "ethers";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ENTRY_FEE } from "constants/rainbow-token";
import Balance from "components/balance";

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
        .joinGame({ value: ENTRY_FEE.toHexString() })
        .then((tx) => tx.wait()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["isPlayer"]);
      },
    }
  );

  return (
    <Button variant="contained" onClick={() => mutate()}>
      {status === "loading" ? "Joining..." : "Join the Game"}
    </Button>
  );
}

type RainbowTokenAccountProps = {
  account: string;
};
function RainbowTokenAccount({ account }: RainbowTokenAccountProps) {
  const rainbowToken = useRainbowToken();
  const { status, data } = useQuery(["player", { account }], () =>
    rainbowToken.getPlayer(account)
  );

  if (status !== "success") return null;

  const player = {
    blendingPrice: data?.[2],
    color: {
      r: data?.[0].r,
      g: data?.[0].g,
      b: data?.[0].b,
    },
    originalColor: {
      r: data?.[1].r,
      g: data?.[1].g,
      b: data?.[1].b,
    },
  };

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
  const rainbowToken = useRainbowToken();

  const { data, status } = useQuery(["isPlayer", { account }], () =>
    rainbowToken.isPlayer(account)
  );

  const isPlayer = status === "success" && Boolean(data);

  return (
    <Paper sx={{ padding: "16px", ...style }}>
      <Typography component="h2" variant="h6" mb="8px">
        Account Specifics
      </Typography>
      {isPlayer ? <RainbowTokenAccount account={account} /> : <JoinGame />}
    </Paper>
  );
}

export default AccountSpecifics;
