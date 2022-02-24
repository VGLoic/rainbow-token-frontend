import * as React from "react";
import { BigNumber, ethers } from "ethers";
import { RainbowToken } from "rainbow-token-contracts";
import { useQuery, useQueryClient } from "react-query";
import { formatPlayer, formatColor } from "utils";
import { useChainId, useReadonlyRainbowToken } from "hooks";
import { Color, Player } from "common";
import { DEFAULT_BLENDING_PRICE } from "constants/rainbow-token";

async function fetchPlayerList(rainbowToken: RainbowToken) {
  const events = await rainbowToken.queryFilter(
    rainbowToken.filters.PlayerJoined()
  );
  return events.map((e) => ethers.utils.getAddress(e.args.account));
}

type PlayerStore = {
  entries: Record<string, Player>;
  accounts: string[];
};

function generateEmptyPlayerStore(): PlayerStore {
  return { entries: {}, accounts: [] };
}

async function fetchPlayers(playerList: string[], rainbowToken: RainbowToken) {
  const players = await rainbowToken.getPlayers(playerList);
  return players.reduce((acc, p, index) => {
    const address = playerList[index];
    acc.entries[address] = formatPlayer(address, p);
    acc.accounts.push(address);
    return acc;
  }, generateEmptyPlayerStore());
}

function playerJoinedUpdater<SolidityColor extends Color>(
  playerStore: PlayerStore | undefined,
  account: string,
  originalColor: SolidityColor
): PlayerStore {
  const newPlayer: Player = {
    account,
    blendingPrice: DEFAULT_BLENDING_PRICE,
    color: formatColor(originalColor),
    originalColor: formatColor(originalColor),
  };
  if (!playerStore)
    return {
      entries: { [newPlayer.account]: newPlayer },
      accounts: [newPlayer.account],
    };

  const newAccounts = new Set([...playerStore.accounts, newPlayer.account]);
  return {
    entries: {
      ...playerStore.entries,
      [newPlayer.account]: newPlayer,
    },
    accounts: Array.from(newAccounts),
  };
}

function blendingPriceUpdatedUpdater(
  playerStore: PlayerStore | undefined,
  account: string,
  blendingPrice: BigNumber
): PlayerStore {
  if (!playerStore) return generateEmptyPlayerStore();
  if (!playerStore.entries[account]) return generateEmptyPlayerStore();
  const newPlayer: Player = {
    ...playerStore.entries[account],
    blendingPrice,
  };
  return {
    entries: {
      ...playerStore.entries,
      [newPlayer.account]: newPlayer,
    },
    accounts: playerStore.accounts,
  };
}

function blendedUpdater<SolidityColor extends Color>(
  playerStore: PlayerStore | undefined,
  account: string,
  color: SolidityColor
): PlayerStore {
  if (!playerStore) return generateEmptyPlayerStore();
  if (!playerStore.entries[account]) return generateEmptyPlayerStore();
  const newPlayer = {
    ...playerStore.entries[account],
    color: formatColor(color),
  };
  return {
    entries: {
      ...playerStore.entries,
      [newPlayer.account]: newPlayer,
    },
    accounts: playerStore.accounts,
  };
}
function selfBlendedUpdater<SolidityColor extends Color>(
  playerStore: PlayerStore | undefined,
  account: string,
  color: SolidityColor
): PlayerStore {
  if (!playerStore) return generateEmptyPlayerStore();
  if (!playerStore.entries[account]) return generateEmptyPlayerStore();
  const newPlayer = {
    ...playerStore.entries[account],
    color: formatColor(color),
  };
  return {
    entries: {
      ...playerStore.entries,
      [newPlayer.account]: newPlayer,
    },
    accounts: playerStore.accounts,
  };
}

function useEventSubscriptions(rainbowToken: RainbowToken, chainId: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const onPlayerJoined = <SolidityColor extends Color>(
      account: string,
      originalColor: SolidityColor
    ) => {
      queryClient.setQueryData([{ chainId }, "players"], (playerStore) =>
        playerJoinedUpdater(playerStore as PlayerStore, account, originalColor)
      );
    };
    rainbowToken.on(rainbowToken.filters.PlayerJoined(), onPlayerJoined);
    return () => {
      rainbowToken.off(rainbowToken.filters.PlayerJoined(), onPlayerJoined);
    };
  }, [rainbowToken, queryClient, chainId]);

  React.useEffect(() => {
    const onBlendingPriceUpdated = (
      account: string,
      blendingPrice: BigNumber,
      _: unknown
    ) => {
      queryClient.setQueryData([{ chainId }, "players"], (playerStore) =>
        blendingPriceUpdatedUpdater(
          playerStore as PlayerStore,
          account,
          blendingPrice
        )
      );
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
  }, [rainbowToken, queryClient, chainId]);

  React.useEffect(() => {
    const onBlended = (
      account: string,
      _: string,
      color: Color,
      __: unknown
    ) => {
      queryClient.setQueryData([{ chainId }, "players"], (playerStore) =>
        blendedUpdater(playerStore as PlayerStore, account, color)
      );
    };
    rainbowToken.on(rainbowToken.filters.Blended(), onBlended);
    return () => {
      rainbowToken.off(rainbowToken.filters.Blended(), onBlended);
    };
  }, [rainbowToken, queryClient, chainId]);

  React.useEffect(() => {
    const onSelfBlended = (account: string, color: Color, _: unknown) => {
      queryClient.setQueryData([{ chainId }, "players"], (playerStore) =>
        selfBlendedUpdater(playerStore as PlayerStore, account, color)
      );
    };
    rainbowToken.on(rainbowToken.filters.SelfBlended(), onSelfBlended);
    return () => {
      rainbowToken.off(rainbowToken.filters.SelfBlended(), onSelfBlended);
    };
  }, [rainbowToken, queryClient, chainId]);
}

export function usePlayers() {
  const rainbowToken = useReadonlyRainbowToken();
  const { chainId } = useChainId();

  const playerListQuery = useQuery([{ chainId }, "playerList"], () =>
    fetchPlayerList(rainbowToken)
  );

  const playersQuery = useQuery(
    [{ chainId }, "players"],
    () => fetchPlayers(playerListQuery.data as string[], rainbowToken),
    {
      enabled: playerListQuery.status === "success",
    }
  );

  useEventSubscriptions(rainbowToken, chainId);

  const players =
    playersQuery.status === "success"
      ? playersQuery.data.accounts.map(
          (account) => playersQuery.data.entries[account]
        )
      : null;

  return {
    status: playersQuery.status,
    players,
  } as
    | { status: "success"; players: Player[] }
    | { status: "idle" | "error" | "loading"; players: null };
}
