import { Box, SxProps, Tooltip } from "@mui/material";
import { Color } from "common";

type ColorTokenProps = {
  color: Color;
  ariaLabelPrefix?: string;
  style?: SxProps;
};
function ColorToken({ color, style, ariaLabelPrefix }: ColorTokenProps) {
  return (
    <Tooltip title={`RGB(${color.r}, ${color.g}, ${color.b})`}>
      <Box
        aria-label={`${ariaLabelPrefix} RGB(${color.r}, ${color.g}, ${color.b})`}
        component="span"
        sx={{
          display: "inline-block",
          minWidth: "24px",
          minHeight: "24px",
          borderRadius: "50%",
          backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
          boxShadow: "0px 0px 1px white",
          ...style,
        }}
      />
    </Tooltip>
  );
}

export default ColorToken;
