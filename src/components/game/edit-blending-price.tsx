import * as React from "react";
import { useRainbowToken } from "hooks";
import { useConnectedMetaMask } from "metamask-react";
import { useMutation, useQueryClient } from "react-query";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  SxProps,
  TextField,
} from "@mui/material";
import { Player } from "common";
import { ethers } from "ethers";
import { Edit } from "@mui/icons-material";

function useEditBlendingPrice() {
  const { account } = useConnectedMetaMask();
  const rainbowToken = useRainbowToken();
  const queryClient = useQueryClient();

  const updateBlendingPriceMutation = useMutation(
    (newBlendingPrice: string) =>
      rainbowToken
        .updateBlendingPrice(ethers.utils.parseUnits(newBlendingPrice, "ether"))
        .then((tx) => tx.wait()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["player", { account }]);
      },
    }
  );

  return updateBlendingPriceMutation;
}

type EditBlendingPriceProps = {
  player: Player;
  buttonStyle?: SxProps;
};
function EditBlendingPrice({ player, buttonStyle }: EditBlendingPriceProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(() =>
    ethers.utils.formatUnits(player.blendingPrice, "ether")
  );
  const updateBlendingPriceMutation = useEditBlendingPrice();

  return (
    <>
      <IconButton
        aria-label="edit blending price"
        color="primary"
        size="small"
        onClick={() => setOpen(true)}
        sx={buttonStyle}
      >
        {updateBlendingPriceMutation.status === "loading" ? (
          <CircularProgress size="24px" />
        ) : (
          <Edit />
        )}
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          Edit blending price
        </DialogTitle>
        <DialogContent>
          <TextField
            id="blending-price-input"
            label="Blending price (in ETH)"
            variant="standard"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
            inputProps={{ step: "0.1" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              updateBlendingPriceMutation.mutate(value, {
                onSuccess: () => setOpen(false),
              })
            }
            disabled={
              updateBlendingPriceMutation.status === "loading" ||
              !value ||
              value === ethers.utils.formatUnits(player.blendingPrice, "ether")
            }
          >
            {updateBlendingPriceMutation.status === "loading"
              ? "Updating..."
              : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditBlendingPrice;
