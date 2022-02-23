import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

type ThemeProviderProps = any;
function ThemeProvider(props: ThemeProviderProps) {
  return <MuiThemeProvider theme={theme} {...props} />;
}

export default ThemeProvider;
