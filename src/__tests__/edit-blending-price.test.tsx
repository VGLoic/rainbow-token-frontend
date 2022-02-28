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
import * as chainIdUtils from "constants/chainid-map";

describe("Edit blending price", () => {
  const mainNetTestingUtils = setupEthTesting();
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
    mainNetTestingUtils.mockReadonlyProvider();
    readTestingUtils.mockReadonlyProvider({ chainId: "0x5" });

    mainNetTestingUtils.ens.mockAllToEmpty();

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
    metaMaskTestingUtils.clearAllMocks();
    readTestingUtils.clearAllMocks();
  });

  test("user should be able to update its blending price", async () => {
    metaMaskTestingUtils.mockConnectedWallet(
      ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"],
      {
        chainId: "0x5",
      }
    );
    readTestingUtils.mockBalance(
      "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
      ethers.utils.parseUnits("1").toString()
    );

    rainbowTokenReadTestingUtils
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
    rainbowTokenWriteTestingUtils.mockTransaction(
      "updateBlendingPrice",
      undefined,
      {
        triggerCallback: () => {
          rainbowTokenReadTestingUtils.mockCall("getPlayer", [
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
      }
    );

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

    userEvent.click(
      screen.getByRole("button", { name: /edit blending price/i })
    );

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
    await waitFor(() =>
      expect(
        screen.getByLabelText(/account blending price/i)
      ).toHaveTextContent("1.1")
    );
  });
});
