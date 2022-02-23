import { screen, act } from "@testing-library/react";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import Players from "components/game/players";
import { connectedRender } from "testing-utils";

describe("Display player list", () => {
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

  test("the table should display the list of players and update with events", async () => {
    testingUtils.mockConnectedWallet(
      ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"],
      { chainId: "0x5" }
    );

    rainbowTokenTestingUtils
      .mockCall("isPlayer", [true], {
        callValues: ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"],
      })
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

    await connectedRender(<Players />);

    await screen.findByRole("table", { name: /players table/i });

    await screen.findByText(/0xA6d...5af/i);
    await screen.findByText(/rgb\(123, 23, 124\)/i);
    await screen.findByText(/1.0 ETH/i);

    await screen.findByText(/0x3E6...284/i);
    await screen.findByText(/rgb\(12, 232, 12\)/i);
    await screen.findByText(/1.1 ETH/i);

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("PlayerJoined", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        { r: 0, g: 0, b: 0 },
      ]);
    });

    await screen.findByText(/0x39E...c7A/i, undefined, {
      timeout: 4500,
    });
    await screen.findByText(/rgb\(0, 0, 0\)/i, undefined, {
      timeout: 4500,
    });
    await screen.findByText(/0.1 ETH/i, undefined, { timeout: 4500 });

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("BlendingPriceUpdated", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        ethers.utils.parseUnits("2.1", "ether").toHexString(),
      ]);
    });
    await screen.findByText(/2.1 ETH/i, undefined, { timeout: 4500 });

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("Blended", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        { r: 0, g: 127, b: 127 },
        { r: 0, g: 255, b: 255 },
      ]);
    });
    await screen.findByText(/rgb\(0, 127, 127\)/i, undefined, {
      timeout: 4500,
    });

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("SelfBlended", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        { r: 0, g: 63, b: 63 },
      ]);
    });
    await screen.findByText(/rgb\(0, 63, 63\)/i, undefined, {
      timeout: 4500,
    });
  }, 30000);
});
