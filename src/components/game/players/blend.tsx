import * as React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  SxProps,
  Box,
} from "@mui/material";
import { Color, Player } from "common";
import { useConnectedMetaMask } from "metamask-react";
import { usePlayer, useRainbowToken } from "hooks";
import { mergeColors } from "utils";
import { useMutation, useQueryClient } from "react-query";
import BlendButton from "components/blend-button";
import ColorToken from "components/color-token";

type BlendProps = {
  player: Player;
  buttonStyle?: SxProps;
};
function Blend({ player, buttonStyle }: BlendProps) {
  const [open, setOpen] = React.useState(false);
  const { account, chainId } = useConnectedMetaMask();
  const playerQuery = usePlayer(account);
  const rainbowToken = useRainbowToken();
  const queryClient = useQueryClient();

  const blendMutation = useMutation(
    (blendingPlayer: Player) =>
      rainbowToken
        .blend(blendingPlayer.account, blendingPlayer.color, {
          value: blendingPlayer.blendingPrice,
        })
        .then((tx) => tx.wait()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([{ chainId }, "player", { account }]);
        setOpen(false);
      },
    }
  );

  const mergedColor: Color =
    playerQuery.status === "success"
      ? mergeColors(playerQuery.data.color, player.color)
      : { r: 0, g: 0, b: 0 };

  return (
    <>
      <BlendButton
        onClick={() => setOpen(true)}
        isLoading={blendMutation.status === "loading"}
        style={buttonStyle}
      />
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          Blend with {player.account}
        </DialogTitle>
        {playerQuery.status === "success" ? (
          <>
            <DialogContent>
              <Box display="flex" alignItems="center" mb="8px">
                <Typography mr="8px">My color</Typography>
                <ColorToken
                  color={playerQuery.data.color}
                  ariaLabelPrefix="account color"
                />
              </Box>
              <Box display="flex" alignItems="center" mb="8px">
                <Typography mr="8px">Blending player color</Typography>
                <ColorToken
                  color={player.color}
                  ariaLabelPrefix="blending player color"
                />
              </Box>
              <Box display="flex" alignItems="center" mb="8px">
                <Typography mr="8px">My new color</Typography>
                <ColorToken color={mergedColor} ariaLabelPrefix="new color" />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => blendMutation.mutate(player)}
                disabled={blendMutation.status === "loading"}
              >
                {blendMutation.status === "loading" ? "Blending..." : "Blend"}
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </>
  );
}

export default Blend;
