import { rest } from "msw";

export const handlers = [
  rest.get("/api/squares", (req, res, ctx) => {
    return res(
      ctx.json([{ x: 0, y: 0, isPaid: true, owner: { name: "Test User" } }])
    );
  }),
  rest.post("/api/squares/select", (req, res, ctx) => {
    return res(ctx.json({ sessionId: "mock_stripe_session" }));
  }),
];
