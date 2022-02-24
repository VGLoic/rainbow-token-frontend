import { useConnectedMetaMask } from "metamask-react";
import { useQuery } from "react-query";
import { formatPlayer } from "utils";
import { useReadonlyRainbowToken } from "./rainbow-token";

export function usePlayer(account: string) {
  const rainbowToken = useReadonlyRainbowToken();
  const { chainId } = useConnectedMetaMask();
  const playerQuery = useQuery([{ chainId }, "player", { account }], () =>
    rainbowToken.getPlayer(account).then((p) => formatPlayer(account, p))
  );
  return playerQuery;
}
