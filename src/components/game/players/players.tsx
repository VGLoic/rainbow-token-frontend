import * as React from "react";
import {
  Box,
  Paper,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useMetaMask } from "metamask-react";
import { areAddressesEqual } from "utils";
import Address from "components/address";
import { useIsPlayer } from "hooks";
import Blend from "./blend";
import ColorToken from "components/color-token";
import EthIcon from "components/eth-icon";
import { usePlayers } from "./use-players";

type PlayersProps = {
  style?: SxProps;
};
function Players({ style }: PlayersProps) {
  const playersQuery = usePlayers();
  const metaMask = useMetaMask();
  const { isPlayer } = useIsPlayer(
    metaMask.status === "connected" ? metaMask.account : ""
  );

  return (
    <TableContainer component={Paper} sx={style}>
      <Table aria-label="players table">
        <TableHead>
          <TableRow>
            <TableCell>Address</TableCell>
            <TableCell align="right">Color</TableCell>
            <TableCell align="right">
              <Box display="flex" alignItems="center">
                <Box flex={1}>Blending price (</Box>
                <EthIcon />
                <div>)</div>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {playersQuery.status === "success"
            ? playersQuery.players.map((player) => (
                <TableRow
                  key={player.account}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Address address={player.account} />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center">
                      <Box flex={1}>
                        {metaMask.status === "connected" &&
                        isPlayer &&
                        !areAddressesEqual(player.account, metaMask.account) ? (
                          <Blend
                            player={player}
                            buttonStyle={{ marginRight: "8px" }}
                          />
                        ) : null}
                      </Box>
                      <ColorToken
                        color={player.color}
                        ariaLabelPrefix={`${player.account} color`}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography aria-label={`${player.account} blending price`}>
                      {ethers.utils.formatUnits(player.blendingPrice, "ether")}{" "}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Players;
