import { Box, Typography } from "@mui/material";
import { getChainName } from "constants/chainid-map";
import { useChainId } from "hooks/readonly-provider";

function AppBar() {
  const { chainId, chainIdStatus } = useChainId();
  return (
    <Box
      sx={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "8px 24px",
      }}
    >
      <Typography
        color={chainIdStatus === "notSupported" ? "error" : "inherit"}
        fontWeight="bold"
        aria-label="network"
      >
        {getChainName(chainId)}
      </Typography>
    </Box>
  );
}

export default AppBar;
