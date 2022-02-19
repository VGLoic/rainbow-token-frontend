import * as React from "react";
import { MetaMaskProvider } from "metamask-react";
import ThemeProvider from "./theme-provider";
import RQProvider from "./react-query-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};
function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <RQProvider>
        <MetaMaskProvider>{children}</MetaMaskProvider>
      </RQProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
