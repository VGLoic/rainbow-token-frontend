import { screen, act, waitFor } from "@testing-library/react";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import Players from "components/game/players";
import * as chainIdUtils from "constants/chainid-map";
import { wrappedRender } from "testing-utils";
import { capitalizedNameGenerator } from "utils";

describe("Display player list", () => {
  const mainNetTestingUtils = setupEthTesting();
  const readTestingUtils = setupEthTesting();

  const rainbowTokenTestingUtils = readTestingUtils.generateContractUtils(
    contracts.rainbowToken.getNetworkConfiguration(5).abi
  );

  beforeEach(() => {
    readTestingUtils.mockReadonlyProvider({ chainId: "0x5" });
    mainNetTestingUtils.mockReadonlyProvider();

    jest
      .spyOn(chainIdUtils, "getChainProvider")
      .mockImplementation((chainId: string) => {
        if (chainId === "0x1")
          return new ethers.providers.Web3Provider(
            mainNetTestingUtils.getProvider() as any
          );
        return new ethers.providers.Web3Provider(
          readTestingUtils.getProvider() as any
        );
      });
  });

  afterEach(() => {
    mainNetTestingUtils.clearAllMocks();
    readTestingUtils.clearAllMocks();
  });

  test("the table should display the list of players and update with events", async () => {
    mainNetTestingUtils.ens.mockEnsName(
      "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
      "blabla.eth"
    );
    mainNetTestingUtils.ens.mockEmptyReverse([
      "0x3E61338c1a69B0d2642314C9fc6936F0B117D284",
      "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
    ]);

    rainbowTokenTestingUtils
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

    wrappedRender(<Players />);

    expect(
      screen.getByRole("table", { name: /players table/i })
    ).toBeInTheDocument();

    await screen.findByText("blabla.eth");
    await screen.findByLabelText(
      /0xA6d6126Ad67F6A64112FD875523AC20794e805af color rgb\(123, 23, 124\)/i
    );
    await waitFor(() => {
      expect(
        screen.getByLabelText(
          /0xA6d6126Ad67F6A64112FD875523AC20794e805af blending price/i
        )
      ).toHaveTextContent("1.0");
    });

    await screen.findByText(
      capitalizedNameGenerator("0x3E61338c1a69B0d2642314C9fc6936F0B117D284")
    );
    await screen.findByLabelText(
      /0x3E61338c1a69B0d2642314C9fc6936F0B117D284 color rgb\(12, 232, 12\)/i
    );
    await waitFor(() => {
      expect(
        screen.getByLabelText(
          /0x3E61338c1a69B0d2642314C9fc6936F0B117D284 blending price/i
        )
      ).toHaveTextContent("1.1");
    });

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("PlayerJoined", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        { r: 0, g: 0, b: 0 },
      ]);
    });

    await screen.findByText(
      capitalizedNameGenerator("0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A"),
      undefined,
      {
        timeout: 4500,
      }
    );
    await screen.findByLabelText(/rgb\(0, 0, 0\)/i, undefined, {
      timeout: 4500,
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText(
          /0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A blending price/i
        )
      ).toHaveTextContent("0.1");
    });

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("BlendingPriceUpdated", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        ethers.utils.parseUnits("2.1", "ether").toHexString(),
      ]);
    });
    await waitFor(
      () => {
        expect(
          screen.getByLabelText(
            /0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A blending price/i
          )
        ).toHaveTextContent("2.1");
      },
      { timeout: 4500 }
    );

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("Blended", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        { r: 0, g: 127, b: 127 },
        { r: 0, g: 255, b: 255 },
      ]);
    });
    await screen.findByLabelText(
      /0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A color rgb\(0, 127, 127\)/i,
      undefined,
      {
        timeout: 4500,
      }
    );

    act(() => {
      rainbowTokenTestingUtils.mockEmitLog("SelfBlended", [
        "0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A",
        { r: 0, g: 63, b: 63 },
      ]);
    });
    await screen.findByLabelText(
      /0x39EB1f596CB19eE8c0DFef0391BE9B7201b2ac7A color rgb\(0, 63, 63\)/i,
      undefined,
      {
        timeout: 4500,
      }
    );
  }, 30000);
});
