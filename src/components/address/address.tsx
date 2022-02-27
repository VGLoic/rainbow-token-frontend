import { TypographyProps, Tooltip, Typography } from "@mui/material";
import { useMainNetProvider } from "hooks";
import { useQuery } from "react-query";
import { capitalizedNameGenerator } from "utils";

type AddressProps = {
  address: string;
  typographyProps?: TypographyProps<React.ElementType<any>>;
};
function Address({ address, typographyProps }: AddressProps) {
  const mainNetProvider = useMainNetProvider();
  const ensQuery = useQuery(
    ["ens", { address }],
    () => mainNetProvider.lookupAddress(address),
    {
      staleTime: Infinity,
    }
  );

  const ensOrCutAddress = ensQuery.data || capitalizedNameGenerator(address);

  return (
    <Tooltip title={address}>
      <Typography {...typographyProps}>{ensOrCutAddress}</Typography>
    </Tooltip>
  );
}
export default Address;
