import { Tooltip, Typography } from "@mui/material";

type AddressProps = {
  address: string;
};
function Address({ address }: AddressProps) {
  return (
    <Tooltip title={address}>
      <Typography>
        {address.substring(0, 5)}...
        {address.substring(address.length - 3, address.length)}
      </Typography>
    </Tooltip>
  );
}
export default Address;
