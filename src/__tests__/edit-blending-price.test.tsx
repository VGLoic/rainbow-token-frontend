import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import AppProviders from "providers";
import { contracts } from "rainbow-token-contracts";
import App from "../App";

describe("Edit blending price", () => {
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

  test("user should be able to update its blending price", async () => {
    testingUtils
      .mockAccounts(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"])
      .mockChainId("0x5")
      .mockBalance(
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        ethers.utils.parseUnits("1").toString()
      );

    // REMIND ME
    testingUtils.lowLevel.mockRequest("eth_blockNumber", "0x01");

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
      ])
      .mockTransaction("updateBlendingPrice", undefined, {
        triggerCallback: () => {
          rainbowTokenTestingUtils.mockCall("getPlayer", [
            {
              color: {
                r: 123,
                g: 23,
                b: 124,
              },
              originalColor: { r: 0, g: 255, b: 255 },
              blendingPrice: ethers.utils.parseUnits("1.1", "ether"),
            },
          ]);
        },
      });

    render(<App />, { wrapper: AppProviders });

    await screen.findByText(/blending price: 1.0 ETH/i);
    await screen.findByText(/color: rgb\(123, 23, 124\)/i);
    await screen.findByText(/original color: rgb\(0, 255, 255\)/i);
    await waitFor(() =>
      expect(screen.getByText(/account balance/i)).toHaveTextContent(
        "Account balance: 1.00 ETH"
      )
    );

    userEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(
      screen.getByRole("dialog", {
        name: /edit blending price/i,
        hidden: false,
      })
    ).toBeInTheDocument();

    userEvent.type(
      screen.getByRole("spinbutton", {
        name: /blending price \(in eth\)/i,
      }),
      "1.1"
    );

    userEvent.click(screen.getByRole("button", { name: /update/i }));

    await screen.findByRole("button", { name: /updating.../i });

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("dialog", { name: /edit blending price/i })
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByText(/blending price: 1.1 ETH/i)).toBeInTheDocument();
  });
});
