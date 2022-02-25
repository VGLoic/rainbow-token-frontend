import { useQuery } from "react-query";
import { useReadonlyRainbowToken } from "./rainbow-token";
import { useChainId } from "./readonly-provider";

export function useIsPlayer(account: string) {
  const rainbowToken = useReadonlyRainbowToken();
  const { chainId } = useChainId();

  const isPlayerQuery = useQuery(
    [{ chainId }, "isPlayer", { account }],
    () => rainbowToken.isPlayer(account),
    {
      enabled: Boolean(account),
    }
  );

  return {
    status: isPlayerQuery.status,
    isPlayer:
      isPlayerQuery.status === "success" ? Boolean(isPlayerQuery.data) : null,
  };
}
