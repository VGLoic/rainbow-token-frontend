import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@mui/material";
import { useConnectedMetaMask, useMetaMask } from "metamask-react";
import { getChainEndpoint, getChainName, isChainIdSupported } from "constants/chainid-map";
import Address from "components/address";
import { ethers } from "ethers";

const DEFAULT_CHAIN_ID = "0x5"

function useChainId() {
  const metaMask = useMetaMask();
  const isWalletChainIdSupported = metaMask.status === "connected" && isChainIdSupported(metaMask.chainId);
  const chainId = isWalletChainIdSupported
    ? metaMask.chainId
    : DEFAULT_CHAIN_ID;
  return {
    walletChainId: metaMask.chainId,
    isWalletChainIdSupported,
    chainId
  }
}

function useReadonlyProvider() {
  const { chainId } = useChainId();
  return React.useMemo(() => {
    const provider = new ethers.providers.JsonRpcProvider(getChainEndpoint(chainId));
    
  }, [chainId])
}

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
