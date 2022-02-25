import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupEthTesting } from "eth-testing";
import AppProviders from "providers";
import { contracts } from "rainbow-token-contracts";
import App from "../App";
import * as chainIdUtils from "constants/chainid-map";
import { ethers } from "ethers";

describe("App connection", () => {
  const metaMaskTestingUtils = setupEthTesting({
    providerType: "MetaMask",
  });
  const readTestingUtils = setupEthTesting();

  const rainbowTokenTestingUtils = readTestingUtils.generateContractUtils(
    contracts.rainbowToken.getNetworkConfiguration(5).abi
  );

  let originalEth: unknown;
  beforeAll(() => {
    originalEth = global.window.ethereum;
    window.ethereum = metaMaskTestingUtils.getProvider();
  });

  afterAll(() => {
    window.ethereum = originalEth;
  });

  beforeEach(() => {
    jest
      .spyOn(chainIdUtils, "getChainProvider")
      .mockImplementation((_: string) => {
        return new ethers.providers.Web3Provider(
          readTestingUtils.getProvider() as any
        );
      });
  });

  afterEach(() => {
    metaMaskTestingUtils.clearAllMocks();
    readTestingUtils.clearAllMocks();
  });

  test("user should be able to connect using MetaMask", async () => {
    metaMaskTestingUtils
      .mockNotConnectedWallet()
      .mockRequestAccounts(["0xA6d6126Ad67F6A64112FD875523AC20794e805af"], {
        chainId: "0x5",
        triggerCallback: () => {
          rainbowTokenTestingUtils.mockCall(
            "isPlayer",
            [false],
            { callValues: ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"] },
            { persistent: true }
          );
        },
      });

    readTestingUtils.mockReadonlyProvider({ chainId: "0x5" });

    rainbowTokenTestingUtils
      .mockGetLogs("PlayerJoined", [
        [
          "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
          { r: 0, g: 255, b: 255 },
        ],
        [
          "0x3E61338c1a69B0d2642314C9fc6936F0B117D284",
          { r: 255, g: 255, b: 255 },
        ],
      ])
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
      ]);

    render(<App />, { wrapper: AppProviders });

    expect(
      screen.getByRole("table", { name: /players table/i })
    ).toBeInTheDocument();

    await screen.findByLabelText(
      /0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A color rgb\(123, 23, 124\)/i
    );
    await screen.findByLabelText(
      /0x3E61338c1a69B0d2642314C9fc6936F0B117D284 color rgb\(12, 232, 12\)/i
    );

    userEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /connect wallet/i,
      hidden: false,
    });

    userEvent.click(within(dialog).getByRole("button", { name: /metamask/i }));
    expect(
      within(dialog).getByRole("button", { name: /connecting/i })
    ).toBeDisabled();

    await waitForElementToBeRemoved(dialog);

    expect(screen.getByText(/goerli/i)).toBeInTheDocument();

    await screen.findByText(/0xA6d...5af/i);
    expect(
      screen.getByRole("button", { name: /join the game/i })
    ).toBeInTheDocument();
  });
});
