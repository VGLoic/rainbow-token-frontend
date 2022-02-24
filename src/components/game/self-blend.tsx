import * as React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Box,
} from "@mui/material";
import { Player } from "common";
import { useConnectedMetaMask } from "metamask-react";
import { useRainbowToken } from "hooks";
import { mergeColors } from "utils";
import { useMutation, useQueryClient } from "react-query";
import { SELF_BLEND_PRICE } from "constants/rainbow-token";
import BlendButton from "components/blend-button";
import ColorToken from "components/color-token";

function useSelfBlend() {
  const { account, chainId } = useConnectedMetaMask();
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
        queryClient.invalidateQueries([{ chainId }, "player", { account }]);
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
      <BlendButton
        onClick={() => setOpen(true)}
        isLoading={selfBlendMutation.status === "loading"}
        selfBlend
      />
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
          <Box display="flex" alignItems="center" mb="8px">
            <Typography mr="8px">My color</Typography>
            <ColorToken color={player.color} ariaLabelPrefix="account color" />
          </Box>
          <Box display="flex" alignItems="center" mb="8px">
            <Typography mr="8px">My original color</Typography>
            <ColorToken
              color={player.originalColor}
              ariaLabelPrefix="original color"
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
