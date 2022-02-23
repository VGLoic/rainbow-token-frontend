import { useQuery } from "react-query";
import { useRainbowToken } from "./rainbow-token";

export function useIsPlayer(account: string) {
  const rainbowToken = useRainbowToken();

  const isPlayerQuery = useQuery(["isPlayer", { account }], () =>
    rainbowToken.isPlayer(account)
  );

  return {
    status: isPlayerQuery.status,
    isPlayer:
      isPlayerQuery.status === "success" ? Boolean(isPlayerQuery.data) : null,
  };
}
