/// <reference types="react-scripts" />

interface Window {
  ethereum: unknown;
}

declare module "mnemonic-generator" {
  export default function generator(address: string): string;
}
