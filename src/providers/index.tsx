import * as React from "react";
import { MetaMaskProvider } from "metamask-react";
import ThemeProvider from "./theme-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};
function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <MetaMaskProvider>{children}</MetaMaskProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
