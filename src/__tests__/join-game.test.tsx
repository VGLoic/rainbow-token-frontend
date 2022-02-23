import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import { connectedRender } from "testing-utils";
import App from "../App";

describe("Join the game", () => {
  const { provider, testingUtils } = setupEthTesting({
    providerType: "MetaMask",
  });

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

  test("user should be able to join the game, then its informations should be displayed", async () => {
    testingUtils
      .mockConnectedWallet(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"], {
        chainId: "0x5",
      })
      .mockBalance(
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        ethers.utils.parseUnits("1").toString()
      );

    rainbowTokenTestingUtils
      .mockCall("isPlayer", [false])
      .mockTransaction("joinGame", undefined, {
        triggerCallback: () => {
          rainbowTokenTestingUtils.mockCall("isPlayer", [true]);
          rainbowTokenTestingUtils.mockCall("getPlayer", [
            {
              color: {
                r: 123,
                g: 23,
                b: 124,
              },
              originalColor: { r: 0, g: 255, b: 255 },
              blendingPrice: ethers.utils.parseUnits("1", "ether"),
            },
          ]);
        },
      });

    await connectedRender(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /join the game/i })
      ).toBeInTheDocument();
    });

    userEvent.click(screen.getByRole("button", { name: /join the game/i }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("button", { name: /join the game/i })
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByRole("button", { name: /joining/i })
    );
    await screen.findByText(/blending price: 1.0 ETH/i);
    await screen.findByText(/color: rgb\(123, 23, 124\)/i);
    await screen.findByText(/original color: rgb\(0, 255, 255\)/i);
    await waitFor(() =>
      expect(screen.getByText(/account balance/i)).toHaveTextContent(
        "Account balance: 1.00 ETH"
      )
    );
  });

  test("user who is already a player should have its information displayed", async () => {
    testingUtils
      .mockAccounts(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"])
      .mockChainId("0x5")
      .mockBalance(
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        ethers.utils.parseUnits("1").toString()
      );
    rainbowTokenTestingUtils
      .mockCall("isPlayer", [true])
      .mockCall("getPlayer", [
        {
          color: {
            r: 123,
            g: 23,
            b: 124,
          },
          originalColor: { r: 0, g: 255, b: 255 },
          blendingPrice: ethers.utils.parseUnits("1", "ether"),
        },
      ]);

    await connectedRender(<App />);

    await screen.findByText(/blending price: 1.0 ETH/i);
    await screen.findByText(/color: rgb\(123, 23, 124\)/i);
    await screen.findByText(/original color: rgb\(0, 255, 255\)/i);
    await waitFor(() =>
      expect(screen.getByText(/account balance/i)).toHaveTextContent(
        "Account balance: 1.00 ETH"
      )
    );
  });
});
