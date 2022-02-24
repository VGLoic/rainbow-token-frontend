import { InvertColors } from "@mui/icons-material";
import { CircularProgress, IconButton, SxProps } from "@mui/material";

type BlendButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  selfBlend?: boolean;
  style?: SxProps;
};
function BlendButton({
  onClick,
  isLoading,
  selfBlend,
  style,
}: BlendButtonProps) {
  return (
    <IconButton
      aria-label={selfBlend ? "self blend" : "blend"}
      color="primary"
      size="small"
      onClick={onClick}
      sx={style}
    >
      {isLoading ? <CircularProgress size="24px" /> : <InvertColors />}
    </IconButton>
  );
}

export default BlendButton;
