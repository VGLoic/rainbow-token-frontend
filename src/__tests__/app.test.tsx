import { render, screen } from "@testing-library/react";
import App from "../App";

describe("app", () => {
  test("it will always work", () => {
    render(<App />);
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });
});
