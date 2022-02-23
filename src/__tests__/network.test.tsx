import { screen, act } from "@testing-library/react";
import { setupEthTesting } from "eth-testing";
import { contracts } from "rainbow-token-contracts";
import { connectedRender } from "testing-utils";
import App from "../App";

describe("Networks", () => {
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

  test("user should be able to see the game only on supported networks", async () => {
    testingUtils.mockConnectedWallet([
      "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
    ]);

    rainbowTokenTestingUtils.mockCall("isPlayer", [false]);

    await connectedRender(<App />);

    expect(screen.getByText(/ethereum/i)).toBeInTheDocument();
    expect(screen.getByText("0xA6d...5af")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /join the game/i })
    ).not.toBeInTheDocument();

    // Switch to a supported network
    act(() => {
      testingUtils.mockChainChanged("0x5");
    });
    expect(screen.getByText(/goerli/i)).toBeInTheDocument();

    await screen.findByRole("button", { name: /join the game/i });

    // Switch to a non supported network
    act(() => {
      testingUtils.mockChainChanged("0x1");
    });
    expect(
      screen.queryByRole("button", { name: /join the game/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/ethereum/i)).toBeInTheDocument();
  });
});
