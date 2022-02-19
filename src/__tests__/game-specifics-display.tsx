import { render, screen } from "@testing-library/react";
import App from "App";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import AppProviders from "providers";
import { contracts } from "rainbow-token-contracts";

describe("Game specifics display", () => {
  const { provider, testingUtils, generateContractUtils } = setupEthTesting({
    providerType: "MetaMask",
  });

  const rainbowTokenTestingUtils = generateContractUtils(
    contracts.rainbowToken.getNetworkConfiguration(5).abi
  );

  let originalEth: unknown;
  beforeAll(() => {
    originalEth = global.window.ethereum;
    window.ethereum = provider;
  });

  afterAll(() => {
    window.ethereum = originalEth;
  });

  afterEach(() => {
    testingUtils.clearAllMocks();
  });

  test("a connected user should be able to see the game informations", async () => {
    testingUtils.mockAccounts(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"]);
    testingUtils.mockChainId("0x5");

    rainbowTokenTestingUtils.mockCall("isPlayer", [false]);
    rainbowTokenTestingUtils.mockCall("getTargetColor", [
      {
        r: 125,
        g: 12,
        b: 87,
      },
    ]);
    testingUtils.lowLevel.mockRequest(
      "eth_getBalance",
      ethers.utils.parseUnits("10", "ether"),
      {
        condition: (params) =>
          params[0] ===
          contracts.rainbowToken
            .getNetworkConfiguration(5)
            .address.toLowerCase(),
      }
    );
    testingUtils.lowLevel.mockRequest(
      "eth_getBalance",
      ethers.utils.parseUnits("11", "ether"),
      {
        condition: (params) =>
          params[0] ===
          contracts.rainbowToken
            .getNetworkConfiguration(5)
            .address.toLowerCase(),
      }
    );

    render(<App />, { wrapper: AppProviders });

    await screen.findByText(/target color: rgb\(125, 12, 87\)/i);
    await screen.findByText(/contract balance: 10.0 ETH/i);

    await screen.findByText(/contract balance: 11.0 ETH/i, undefined, {
      timeout: 1500,
    });
  });
});
