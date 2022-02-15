import { Box } from "@mui/material";
import Wallet from "./wallet";

function AppBar() {
  return (
    <Box
      sx={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 8px",
      }}
    >
      <Wallet />
    </Box>
  );
}

export default AppBar;
