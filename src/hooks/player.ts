import { useQuery } from "react-query";
import { formatPlayer } from "utils";
import { useReadonlyRainbowToken } from "./rainbow-token";

export function usePlayer(account: string) {
  const rainbowToken = useReadonlyRainbowToken();
  const playerQuery = useQuery(["player", { account }], () =>
    rainbowToken.getPlayer(account).then((p) => formatPlayer(account, p))
  );
  return playerQuery;
}
