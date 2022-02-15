import {
  render,
  screen,
  waitForElementToBeRemoved,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupEthTesting } from "eth-testing";
import AppProviders from "providers";
import App from "../App";

describe("App connection", () => {
  const { provider, testingUtils } = setupEthTesting({
    providerType: "MetaMask",
  });

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

  test("user should be able to connect using MetaMask", async () => {
    testingUtils.mockAccounts([]);
    testingUtils.mockRequestAccounts(
      ["0xA6d6126Ad67F6A64112FD875523AC20794e805af"],
      { chainId: "0x1" }
    );

    render(<App />, { wrapper: AppProviders });

    await screen.findByRole("button", { name: /connect wallet/i });

    userEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /metamask/i }));
    expect(screen.getByRole("button", { name: /connecting/i })).toBeDisabled();

    await waitForElementToBeRemoved(screen.queryByRole("dialog"));

    expect(screen.getByText(/ethereum/i)).toBeInTheDocument();
    expect(screen.getByText("0xA6d...5af")).toBeInTheDocument();

    act(() => {
      testingUtils.mockChainChanged("0x5");
    });
    expect(screen.getByText(/goerli/i)).toBeInTheDocument();
  });
});
