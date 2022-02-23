import * as React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { BigNumber, ethers } from "ethers";
import { useConnectedMetaMask } from "metamask-react";
import { RainbowToken } from "rainbow-token-contracts";
import { useQuery, useQueryClient } from "react-query";
import { formatPlayer, areAddressesEqual, formatColor } from "utils";
import Address from "components/address";
import { useIsPlayer, useReadonlyRainbowToken } from "hooks";
import Blend from "./blend";
import { Color, Player } from "common";
import { DEFAULT_BLENDING_PRICE } from "constants/rainbow-token";

async function fetchPlayerList(rainbowToken: RainbowToken) {
  const events = await rainbowToken.queryFilter(
    rainbowToken.filters.PlayerJoined()
  );
  return events.map((e) => e.args.account);
}

async function fetchPlayers(playerList: string[], rainbowToken: RainbowToken) {
  const players = await Promise.all(
    playerList.map((account) => rainbowToken.getPlayer(account))
  );
  return players.map((p, index) => formatPlayer(playerList[index], p));
}

function usePlayers() {
  const rainbowToken = useReadonlyRainbowToken();
  const playerListQuery = useQuery("playerList", () =>
    fetchPlayerList(rainbowToken)
  );

  const playersQuery = useQuery(
    "players",
    () => fetchPlayers(playerListQuery.data as string[], rainbowToken),
    {
      enabled: playerListQuery.status === "success",
    }
  );

  const queryClient = useQueryClient();
  React.useEffect(() => {
    const onPlayerJoined = <SolidityColor extends Color>(
      account: string,
      originalColor: SolidityColor
    ) => {
      const updater = (currentPlayers: Player[] | undefined): Player[] => {
        const newPlayer: Player = {
          account,
          blendingPrice: DEFAULT_BLENDING_PRICE,
          color: formatColor(originalColor),
          originalColor: formatColor(originalColor),
        };
        if (!currentPlayers) return [newPlayer];
        return [...currentPlayers, newPlayer];
      };
      queryClient.setQueryData("players", updater);
    };
    rainbowToken.on(rainbowToken.filters.PlayerJoined(), onPlayerJoined);
    return () => {
      rainbowToken.off(rainbowToken.filters.PlayerJoined(), onPlayerJoined);
    };
  }, [rainbowToken, queryClient]);

  React.useEffect(() => {
    const onBlendingPriceUpdated = (
      account: string,
      blendingPrice: BigNumber,
      _: unknown
    ) => {
      const updater = (currentPlayers: Player[] | undefined): Player[] => {
        if (!currentPlayers) return [];
        return currentPlayers.map((player) => {
          if (areAddressesEqual(account, player.account)) {
            return { ...player, blendingPrice };
          }
          return player;
        });
      };
      queryClient.setQueryData("players", updater);
    };
    rainbowToken.on(
      rainbowToken.filters.BlendingPriceUpdated(),
      onBlendingPriceUpdated
    );
    return () => {
      rainbowToken.off(
        rainbowToken.filters.BlendingPriceUpdated(),
        onBlendingPriceUpdated
      );
    };
  }, [rainbowToken, queryClient]);

  React.useEffect(() => {
    const onBlended = (
      account: string,
      _: string,
      color: Color,
      __: unknown
    ) => {
      const updater = (currentPlayers: Player[] | undefined): Player[] => {
        if (!currentPlayers) return [];
        return currentPlayers.map((player) => {
          if (areAddressesEqual(account, player.account)) {
            return { ...player, color: formatColor(color) };
          }
          return player;
        });
      };
      queryClient.setQueryData("players", updater);
    };
    rainbowToken.on(rainbowToken.filters.Blended(), onBlended);
    return () => {
      rainbowToken.off(rainbowToken.filters.Blended(), onBlended);
    };
  }, [rainbowToken, queryClient]);

  React.useEffect(() => {
    const onSelfBlended = (account: string, color: Color, _: unknown) => {
      const updater = (currentPlayers: Player[] | undefined): Player[] => {
        if (!currentPlayers) return [];
        return currentPlayers.map((player) => {
          if (areAddressesEqual(account, player.account)) {
            return { ...player, color: formatColor(color) };
          }
          return player;
        });
      };
      queryClient.setQueryData("players", updater);
    };
    rainbowToken.on(rainbowToken.filters.SelfBlended(), onSelfBlended);
    return () => {
      rainbowToken.off(rainbowToken.filters.SelfBlended(), onSelfBlended);
    };
  }, [rainbowToken, queryClient]);

  return playersQuery;
}

function Players() {
  const theme = useTheme();

  const playersQuery = usePlayers();
  const { account } = useConnectedMetaMask();
  const { isPlayer } = useIsPlayer(account);

  return (
    <TableContainer
      component={Paper}
      sx={{
        flex: 3,
        [theme.breakpoints.down("md")]: {
          width: "100%",
        },
      }}
    >
      <Table aria-label="players table">
        <TableHead>
          <TableRow>
            <TableCell>Address</TableCell>
            <TableCell align="center">Color</TableCell>
            <TableCell align="center">Blending price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {playersQuery.status === "success"
            ? playersQuery.data.map((player) => (
                <TableRow
                  key={player.account}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Address address={player.account} />
                  </TableCell>
                  <TableCell align="center">
                    RGB({player.color.r}, {player.color.g}, {player.color.b}){" "}
                    {isPlayer && !areAddressesEqual(player.account, account) ? (
                      <Blend player={player} />
                    ) : null}
                  </TableCell>
                  <TableCell align="center">
                    {ethers.utils.formatUnits(player.blendingPrice, "ether")}{" "}
                    ETH
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
