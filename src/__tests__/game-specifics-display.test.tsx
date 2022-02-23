import { screen, waitFor } from "@testing-library/react";
import App from "App";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import { connectedRender } from "testing-utils";

describe("Game specifics display", () => {
  const { provider, testingUtils } = setupEthTesting({
    providerType: "MetaMask",
  });

  const contractAddress =
    contracts.rainbowToken.getNetworkConfiguration(5).address;

  const rainbowTokenTestingUtils = testingUtils.generateContractUtils(
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
    testingUtils
      .mockConnectedWallet(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"], {
        chainId: "0x5",
      })
      .mockBalance(
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        ethers.utils.parseUnits("1").toString()
      )
      .mockBalance(contractAddress, ethers.utils.parseUnits("10").toString());

    rainbowTokenTestingUtils
      .mockCall("isPlayer", [false])
      .mockCall("getTargetColor", [
        {
          r: 125,
          g: 12,
          b: 87,
        },
      ]);

    await connectedRender(<App />);

    await screen.findByText(/target color: rgb\(125, 12, 87\)/i);
    await waitFor(() =>
      expect(screen.getByText(/contract balance:/i)).toHaveTextContent(
        /contract balance: 10.00 ETH/i
      )
    );

    // Balance is updated to 11 eth
    testingUtils.mockBalance(
      contractAddress,
      ethers.utils.parseUnits("11").toString()
    );

    await waitFor(
      () =>
        expect(screen.getByText(/contract balance:/i)).toHaveTextContent(
          /contract balance: 11.00 ETH/i
        ),
      { timeout: 1500 }
    );
  });
});
