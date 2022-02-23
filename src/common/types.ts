import { BigNumber } from "ethers";

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type RawPlayer = {
  blendingPrice: BigNumber;
  color: Color;
  originalColor: Color;
};

export type Player = RawPlayer & {
  account: string;
};
