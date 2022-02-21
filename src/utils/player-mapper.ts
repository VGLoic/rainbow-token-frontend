import { Player, RawPlayer, Color } from "common";

export function formatColor<SolidityColor extends Color>(
  solidityColor: SolidityColor
): Color {
  return {
    r: solidityColor.r,
    g: solidityColor.g,
    b: solidityColor.b,
  };
}

export function formatPlayer<SolidityPlayer extends RawPlayer>(
  account: string,
  player: SolidityPlayer
): Player {
  return {
    account,
    blendingPrice: player.blendingPrice,
    color: formatColor(player.color),
    originalColor: formatColor(player.originalColor),
  };
}
