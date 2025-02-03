import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (user, squareId) => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID, // Your $5 product
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/grid?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/grid`,
    metadata: {
      userId: user.id,
      squareId: squareId,
    },
  });
};
