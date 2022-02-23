import {
  screen,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "App";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import { connectedRender } from "testing-utils";

describe("Blend with other player", () => {
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

  test("the connected user should be able to blend with another player", async () => {
    testingUtils
      .mockConnectedWallet(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"], {
        chainId: "0x5",
      })
      .mockBalance(
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        ethers.utils.parseUnits("1", "ether").toString()
      );

    rainbowTokenTestingUtils
      .mockCall(
        "isPlayer",
        [true],
        {
          callValues: ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"],
        },
        { persistent: true }
      )
      .mockCall(
        "getPlayer",
        [
          {
            color: {
              r: 123,
              g: 23,
              b: 124,
            },
            originalColor: { r: 0, g: 255, b: 255 },
            blendingPrice: ethers.utils.parseUnits("1", "ether"),
          },
        ],
        { callValues: ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"] },
        { persistent: true }
      )
      .mockCall("getPlayers", [
        [
          {
            color: {
              r: 123,
              g: 23,
              b: 124,
            },
            originalColor: { r: 0, g: 255, b: 255 },
            blendingPrice: ethers.utils.parseUnits("1", "ether"),
          },
          {
            color: {
              r: 12,
              g: 232,
              b: 12,
            },
            originalColor: { r: 255, g: 255, b: 255 },
            blendingPrice: ethers.utils.parseUnits("1.1", "ether"),
          },
        ],
      ])
      .mockGetLogs("PlayerJoined", [
        [
          "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
          { r: 0, g: 255, b: 255 },
        ],
        [
          "0x3E61338c1a69B0d2642314C9fc6936F0B117D284",
          { r: 255, g: 255, b: 255 },
        ],
      ]);

    await connectedRender(<App />);

    const table = await screen.findByRole("table", { name: /players table/i });

    await within(table).findByText(/0xA6d...5af/i);
    await within(table).findByText(/rgb\(123, 23, 124\)/i);
    await within(table).findByText(/1.0 ETH/i);

    userEvent.click(within(table).getByRole("button", { name: /blend/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /blend with 0x3E61338c1a69B0d2642314C9fc6936F0B117D284/i,
      hidden: false,
    });

    expect(
      screen.getByText(/my color: rgb\(123, 23, 124\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/blending player color: rgb\(12, 232, 12\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/my new color: rgb\(67, 127, 68\)/i)
    ).toBeInTheDocument();

    rainbowTokenTestingUtils.mockTransaction("blend", undefined, {
      triggerCallback: () => {
        rainbowTokenTestingUtils.mockCall(
          "getPlayer",
          [
            {
              color: {
                r: 67,
                g: 127,
                b: 68,
              },
              originalColor: { r: 0, g: 255, b: 255 },
              blendingPrice: ethers.utils.parseUnits("1.0", "ether"),
            },
          ],
          { callValues: ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"] },
          { persistent: true }
        );
        rainbowTokenTestingUtils.mockEmitLog("Blended", [
          "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
          "0x3E61338c1a69B0d2642314C9fc6936F0B117D284",
          {
            r: 67,
            g: 127,
            b: 68,
          },
          {
            r: 12,
            g: 232,
            b: 12,
          },
        ]);
      },
    });

    userEvent.click(within(dialog).getByRole("button", { name: /blend/i }));

    await screen.findByRole("button", { name: /blending.../i });

    await waitForElementToBeRemoved(() =>
      screen.queryByRole("dialog", {
        name: /blend with 0x3E61338c1a69B0d2642314C9fc6936F0B117D284/i,
      })
    );

    expect(
      within(table).getByRole("button", { name: /blend/i })
    ).toBeInTheDocument();

    await screen.findByText(/color: rgb\(67, 127, 68\)/i);
    await within(table).findByText(/rgb\(67, 127, 68\)/i, undefined, {
      timeout: 4500,
    });
  }, 10000);
});
