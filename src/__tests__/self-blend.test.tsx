import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import { connectedRender } from "testing-utils";
import App from "../App";

describe("Self blend", () => {
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
      .mockConnectedWallet(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"], {
        chainId: "0x5",
      })
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

    await waitFor(() =>
      expect(
        screen.getByLabelText(/account blending price/i)
      ).toHaveTextContent("1.0")
    );
    await screen.findByLabelText(/current color rgb\(123, 23, 124\)/i);
    await screen.findByLabelText(/original color rgb\(0, 255, 255\)/i);
    await waitFor(() =>
      expect(screen.getByLabelText(/account balance/i)).toHaveTextContent(
        "1.00"
      )
    );

    userEvent.click(screen.getByRole("button", { name: /self blend/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /self blend/i,
      hidden: false,
    });

    expect(
      within(dialog).getByLabelText(/account color rgb\(123, 23, 124\)/i)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/original color rgb\(0, 255, 255\)/i)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/new color rgb\(61, 139, 189\)/i)
    ).toBeInTheDocument();

    rainbowTokenTestingUtils.mockTransaction("selfBlend", undefined, {
      triggerCallback: () => {
        rainbowTokenTestingUtils.mockCall("getPlayer", [
          {
            color: {
              r: 61,
              g: 139,
              b: 189,
            },
            originalColor: { r: 0, g: 255, b: 255 },
            blendingPrice: ethers.utils.parseUnits("1.0", "ether"),
          },
        ]);
      },
    });

    userEvent.click(within(dialog).getByRole("button", { name: /blend/i }));

    await within(dialog).findByRole("button", { name: /blending/i });

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("dialog", { name: /self blend/i })
    );

    expect(
      screen.getByRole("button", { name: /self blend/i })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/current color rgb\(61, 139, 189\)/i)
    ).toBeInTheDocument();
  });
});
