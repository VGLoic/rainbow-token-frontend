import { render, screen, within, act } from "@testing-library/react";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import AppProviders from "providers";
import { contracts } from "rainbow-token-contracts";
import { useMetaMask } from "metamask-react";
import Players from "components/game/players";

function TestWrapper(props: any) {
  const { status } = useMetaMask();
  if (status !== "connected") return null;
  return props.children;
}

function TestProviders(props: any) {
  return (
    <AppProviders>
      <TestWrapper {...props} />
    </AppProviders>
  );
}

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

  test("the table should display the list of players", async () => {
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
      .mockCall(
        "getPlayer",
        [
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
        { callValues: ["0x3E61338c1a69B0d2642314C9fc6936F0B117D284"] },
        { persistent: true }
      )
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

    render(<Players />, { wrapper: TestProviders });

    const table = await screen.findByRole("table", { name: /players table/i });

    await within(table).findByText(/0xA6d...5af/i);
    await within(table).findByText(/rgb\(123, 23, 124\)/i);
    await within(table).findByText(/1.0 ETH/i);

    await within(table).findByText(/0x3E6...284/i);
    await within(table).findByText(/rgb\(12, 232, 12\)/i);
    await within(table).findByText(/1.1 ETH/i);

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("PlayerJoined", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        { r: 0, g: 0, b: 0 },
      ]);
    });

    await within(table).findByText(/0x39E...c7A/i, undefined, {
      timeout: 4500,
    });
    await within(table).findByText(/rgb\(0, 0, 0\)/i, undefined, {
      timeout: 4500,
    });
    await within(table).findByText(/0.1 ETH/i, undefined, { timeout: 4500 });
  });
});
