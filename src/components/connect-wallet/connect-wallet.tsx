import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useMetaMask } from "metamask-react";

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

// REMIND ME TO DELETE IF NOT USED
// function ConnectedWallet() {
//   const { account, chainId } = useConnectedMetaMask();
//   return (
//     <Box
//       sx={{
//         display: "flex",
//       }}
//     >
//       <Typography mr="16px">{getChainName(chainId)}</Typography>
//       <Address address={account} />
//     </Box>
//   );
// }

// function Wallet() {
//   const { status } = useMetaMask();

//   if (status === "initializing") return null;

//   if (status !== "connected") {
//     return <ConnectWallet />;
//   }

//   return <ConnectedWallet />;
// }

export default ConnectWallet;
