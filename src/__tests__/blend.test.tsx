import {
  screen,
  within,
  waitForElementToBeRemoved,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "App";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import { connectedRender } from "testing-utils";
import * as chainIdUtils from "constants/chainid-map";

describe("Blend with other player", () => {
  const metaMaskTestingUtils = setupEthTesting({
    providerType: "MetaMask",
  });
  const readTestingUtils = setupEthTesting();

  const rainbowTokenReadTestingUtils = readTestingUtils.generateContractUtils(
    contracts.rainbowToken.getNetworkConfiguration(5).abi
  );

  const rainbowTokenWriteTestingUtils =
    metaMaskTestingUtils.generateContractUtils(
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
    readTestingUtils.mockReadonlyProvider({ chainId: "0x5" });
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

  test("the connected user should be able to blend with another player", async () => {
    metaMaskTestingUtils.mockConnectedWallet(
      ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"],
      {
        chainId: "0x5",
      }
    );
    readTestingUtils.mockBalance(
      "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
      ethers.utils.parseUnits("1", "ether").toString()
    );

    rainbowTokenReadTestingUtils
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
    await within(table).findByLabelText(
      /0xA6d6126Ad67F6A64112FD875523AC20794e805af color rgb\(123, 23, 124\)/i
    );
    await waitFor(() => {
      expect(
        within(table).getByLabelText(
          /0xA6d6126Ad67F6A64112FD875523AC20794e805af blending price/i
        )
      ).toHaveTextContent("1.0");
    });

    userEvent.click(within(table).getByRole("button", { name: /blend/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /blend with 0x3E61338c1a69B0d2642314C9fc6936F0B117D284/i,
      hidden: false,
    });

    expect(
      within(dialog).getByLabelText(/account color rgb\(123, 23, 124\)/i)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/blending player color rgb\(12, 232, 12\)/i)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/new color rgb\(67, 127, 68\)/i)
    ).toBeInTheDocument();

    rainbowTokenWriteTestingUtils.mockTransaction("blend", undefined, {
      triggerCallback: () => {
        rainbowTokenReadTestingUtils.mockCall(
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
        rainbowTokenReadTestingUtils.mockEmitLog("Blended", [
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

    await screen.findByLabelText(/current color rgb\(67, 127, 68\)/i);
    await within(table).findByLabelText(
      /0xA6d6126Ad67F6A64112FD875523AC20794e805af color rgb\(67, 127, 68\)/i,
      undefined,
      {
        timeout: 4500,
      }
    );
  }, 10000);
});
