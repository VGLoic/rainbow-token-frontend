import { QueryClient, QueryClientProvider } from "react-query";

export const queryClient = new QueryClient({});

type RQProviderProps = any;
function RQProvider(props: RQProviderProps) {
  return <QueryClientProvider client={queryClient} {...props} />;
}

export default RQProvider;
