const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe("sk_test_your_secret_key_here"); // Replace with your Stripe secret key

router.post("/create-checkout-session", async (req, res, next) => {
  try {
    const { price, sport } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: `Personal Trainer Session: ${sport}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/payment-success",
      cancel_url: "http://localhost:5173/payment-cancel",
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
