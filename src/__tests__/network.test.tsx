import { screen, act } from "@testing-library/react";
import { setupEthTesting } from "eth-testing";
import { contracts } from "rainbow-token-contracts";
import { connectedRender } from "testing-utils";
import App from "../App";
import * as chainIdUtils from "constants/chainid-map";
import { ethers } from "ethers";

describe("Networks", () => {
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

  test("user should be able to see the game only on supported networks", async () => {
    metaMaskTestingUtils.mockConnectedWallet([
      "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
    ]);
    readTestingUtils.mockReadonlyProvider({ chainId: "0x5" });

    rainbowTokenTestingUtils
      .mockGetLogs("PlayerJoined", [])
      .mockCall("getPlayers", [[]])
      .mockCall("isPlayer", [false], undefined, { persistent: true });

    await connectedRender(<App />);

    expect(screen.getByLabelText(/network/i)).toHaveTextContent("Ethereum");
    expect(
      screen.getByText(/ethereum is currently not supported/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /join the game/i })
    ).not.toBeInTheDocument();

    // Switch to a supported network
    act(() => {
      metaMaskTestingUtils.mockChainChanged("0x5");
    });
    expect(screen.getByLabelText(/network/i)).toHaveTextContent("Goerli");

    await screen.findByRole(
      "button",
      { name: /join the game/i },
      { timeout: 1500 }
    );

    // Switch to a non supported network
    act(() => {
      metaMaskTestingUtils.mockChainChanged("0x1");
    });
    expect(
      screen.queryByRole("button", { name: /join the game/i })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/network/i)).toHaveTextContent("Ethereum");
    expect(
      screen.queryByRole("button", { name: /join the game/i })
    ).not.toBeInTheDocument();
  });
});
