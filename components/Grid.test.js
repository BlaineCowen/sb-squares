import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import Grid from "./Grid";
import { rest } from "msw";
import { server } from "../mocks/server";

// Mock next-auth
jest.mock("next-auth/react");

test("requires login for square selection", () => {
  useSession.mockReturnValue({ data: null });
  render(<Grid />);

  fireEvent.click(screen.getAllByRole("button")[0]);
  expect(screen.getByText(/please login first/i)).toBeInTheDocument();
});

test("renders 100 squares", () => {
  useSession.mockReturnValue({ data: {} });
  render(<Grid />);

  expect(screen.getAllByRole("button")).toHaveLength(100);
});

test("handles square selection", async () => {
  useSession.mockReturnValue({ data: { user: { id: "123" } } });
  render(<Grid />);

  fireEvent.click(screen.getAllByRole("button")[5]);
  await screen.findByText(/processing payment/i); // Add loading state in your component
});

test("handles square selection errors", async () => {
  useSession.mockReturnValue({ data: { user: { id: "123" } } });

  server.use(
    rest.post("/api/squares/select", (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({ error: "Square taken" }));
    })
  );

  render(<Grid />);
  fireEvent.click(screen.getAllByRole("button")[0]);

  await waitFor(() => {
    expect(screen.getByText(/square taken/i)).toBeInTheDocument();
  });
});
