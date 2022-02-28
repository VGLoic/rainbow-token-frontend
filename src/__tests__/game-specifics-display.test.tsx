import { screen, waitFor } from "@testing-library/react";
import App from "App";
import { setupEthTesting } from "eth-testing";
import { ethers } from "ethers";
import { contracts } from "rainbow-token-contracts";
import { wrappedRender } from "testing-utils";
import * as chainIdUtils from "constants/chainid-map";

describe("Game specifics display", () => {
  const mainNetTestingUtils = setupEthTesting();
  const contractAddress =
    contracts.rainbowToken.getNetworkConfiguration(5).address;

  const readTestingUtils = setupEthTesting();

  const rainbowTokenTestingUtils = readTestingUtils.generateContractUtils(
    contracts.rainbowToken.getNetworkConfiguration(5).abi
  );

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
    readTestingUtils.clearAllMocks();
  });

  test("a user should be able to see the game informations", async () => {
    readTestingUtils
      .mockReadonlyProvider({ chainId: "0x5" })
      .mockBalance(
        "0xA6d6126Ad67F6A64112FD875523AC20794e805af",
        ethers.utils.parseUnits("1").toString()
      )
      .mockBalance(contractAddress, ethers.utils.parseUnits("10").toString());

    rainbowTokenTestingUtils
      .mockCall("isPlayer", [false])
      .mockCall("getTargetColor", [
        {
          r: 125,
          g: 12,
          b: 87,
        },
      ]);

    wrappedRender(<App />);

    await screen.findByLabelText(/target color rgb\(125, 12, 87\)/i);
    await waitFor(() =>
      expect(screen.getByLabelText(/contract balance/i)).toHaveTextContent(
        "10.00"
      )
    );

    // Balance is updated to 11 eth
    readTestingUtils.mockBalance(
      contractAddress,
      ethers.utils.parseUnits("11").toString()
    );

    await waitFor(
      () =>
        expect(screen.getByLabelText(/contract balance/i)).toHaveTextContent(
          "11.00"
        ),
      { timeout: 1500 }
    );
  });
});
