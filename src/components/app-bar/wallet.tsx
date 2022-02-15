import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Tooltip,
} from "@mui/material";
import { useConnectedMetaMask, useMetaMask } from "metamask-react";
import { getChainName } from "constants/chainid-map";

function ConnectWallet() {
  const [open, setOpen] = React.useState(false);
  const { connect, status } = useMetaMask();

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Connect Wallet
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Connect wallet</DialogTitle>
        <DialogContent>
          <Button
            variant="contained"
            onClick={connect}
            disabled={status === "connecting"}
          >
            {status === "connecting" ? "Connecting" : "MetaMask"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

type AddressProps = {
  address: string;
};
function Address({ address }: AddressProps) {
  return (
    <Tooltip title={address}>
      <Typography>
        {address.substring(0, 5)}...
        {address.substring(address.length - 3, address.length)}
      </Typography>
    </Tooltip>
  );
}

function ConnectedWallet() {
  const { account, chainId } = useConnectedMetaMask();
  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Typography mr="16px">{getChainName(chainId)}</Typography>
      <Address address={account} />
    </Box>
  );
}

function Wallet() {
  const { status } = useMetaMask();

  if (status === "initializing") return null;

  if (status !== "connected") {
    return <ConnectWallet />;
  }

  return <ConnectedWallet />;
}

export default Wallet;
