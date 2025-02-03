export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Update square payment status
    await prisma.square.update({
      where: { stripeSessionId: session.id },
      data: { isPaid: true },
    });
  }

  res.json({ received: true });
}
