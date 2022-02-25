import {
  queries,
  Queries,
  render,
  RenderOptions,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { useMetaMask } from "metamask-react";
import AppProviders from "providers";

function TestWrapper(props: any) {
  const { status } = useMetaMask();
  if (status !== "connected") return <div data-testid="test-loading" />;
  return props.children;
}

function TestProviders(props: any) {
  return (
    <AppProviders>
      <TestWrapper {...props} />
    </AppProviders>
  );
}

export async function connectedRender<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement
>(
  ui: React.ReactElement,
  options?: RenderOptions<Q, Container>
): Promise<RenderResult<Q, Container>> {
  const testUtils = render(ui, { wrapper: TestProviders, ...options });
  await waitForElementToBeRemoved(() => screen.getByTestId("test-loading"));
  return testUtils;
}

export function wrappedRender<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement
>(
  ui: React.ReactElement,
  options?: RenderOptions<Q, Container>
): RenderResult<Q, Container> {
  return render(ui, { wrapper: AppProviders, ...options });
}
