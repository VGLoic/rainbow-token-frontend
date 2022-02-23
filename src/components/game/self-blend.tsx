import * as React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
} from "@mui/material";
import { Player } from "common";
import { useConnectedMetaMask } from "metamask-react";
import { useRainbowToken } from "hooks";
import { mergeColors } from "utils";
import { useMutation, useQueryClient } from "react-query";
import { SELF_BLEND_PRICE } from "constants/rainbow-token";

function useSelfBlend() {
  const { account } = useConnectedMetaMask();
  const rainbowToken = useRainbowToken();
  const queryClient = useQueryClient();

  const selfBlendMutation = useMutation(
    () =>
      rainbowToken
        .selfBlend({
          value: SELF_BLEND_PRICE.toHexString(),
        })
        .then((tx) => tx.wait()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["player", { account }]);
      },
    }
  );

  return selfBlendMutation;
}

type SelfBlendProps = {
  player: Player;
};
function SelfBlend({ player }: SelfBlendProps) {
  const [open, setOpen] = React.useState(false);
  const selfBlendMutation = useSelfBlend();

  const mergedColor = mergeColors(player.color, player.originalColor);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {selfBlendMutation.status === "loading" ? "Blending..." : "Self Blend"}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          Self blend
        </DialogTitle>
        <DialogContent>
          <Typography>
            My color: RGB({player.color.r}, {player.color.g}, {player.color.b})
          </Typography>
          <Typography>
            My original color: RGB({player.originalColor.r},{" "}
            {player.originalColor.g}, {player.originalColor.b})
          </Typography>
          <Typography>
            My new color: RGB({mergedColor.r}, {mergedColor.g}, {mergedColor.b})
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              selfBlendMutation.mutate(undefined, {
                onSuccess: () => setOpen(false),
              })
            }
            disabled={selfBlendMutation.status === "loading"}
          >
            {selfBlendMutation.status === "loading" ? "Blending..." : "Blend"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SelfBlend;
