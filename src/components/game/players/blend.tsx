import * as React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
} from "@mui/material";
import { Color, Player } from "common";
import { useConnectedMetaMask } from "metamask-react";
import { usePlayer, useRainbowToken } from "hooks";
import { mergeColors } from "utils";
import { useMutation, useQueryClient } from "react-query";

type BlendProps = {
  player: Player;
};
function Blend({ player }: BlendProps) {
  const [open, setOpen] = React.useState(false);
  const { account } = useConnectedMetaMask();
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
        queryClient.invalidateQueries(["player", { account }]);
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
      <Button variant="contained" onClick={() => setOpen(true)}>
        {blendMutation.status === "loading" ? "Blending..." : "Blend"}
      </Button>
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
              <Typography>
                My color: RGB({playerQuery.data.color.r},{" "}
                {playerQuery.data.color.g}, {playerQuery.data.color.b})
              </Typography>
              <Typography>
                Blending player color: RGB({player.color.r}, {player.color.g},{" "}
                {player.color.b})
              </Typography>
              <Typography>
                My new color: RGB({mergedColor.r}, {mergedColor.g},{" "}
                {mergedColor.b})
              </Typography>
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
