import * as React from "react";
import { useRainbowToken } from "hooks";
import { useConnectedMetaMask } from "metamask-react";
import { useMutation, useQueryClient } from "react-query";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Player } from "common";
import { ethers } from "ethers";

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
};
function EditBlendingPrice({ player }: EditBlendingPriceProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(() =>
    ethers.utils.formatUnits(player.blendingPrice, "ether")
  );
  const updateBlendingPriceMutation = useEditBlendingPrice();

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {updateBlendingPriceMutation.status === "loading" ? "Updating" : "Edit"}
      </Button>
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
