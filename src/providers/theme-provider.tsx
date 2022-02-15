import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";

const theme = createTheme({});

type ThemeProviderProps = any;
function ThemeProvider(props: ThemeProviderProps) {
  return <MuiThemeProvider theme={theme} {...props} />;
}

export default ThemeProvider;
