const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const Stripe = require("stripe");

setGlobalOptions({maxInstances: 10});

const PRICE_ID = "price_1ULJUsCc3hPFqAj59iZDtQXn";

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});

  response.send("Hello from Firebase!");
});

exports.getProduct = onRequest(
    {
      secrets: ["STRIPE_SECRET_KEY"],
      cors: true,
    },
    async (request, response) => {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const price = await stripe.prices.retrieve(
            PRICE_ID,
            {
              expand: ["product"],
            },
        );

        response.json({
          name: price.product.name,
          price: price.unit_amount / 100,
          currency: price.currency.toUpperCase(),
        });
      } catch (error) {
        logger.error("Stripe product error:", error);
        response.status(500).json({error: error.message});
      }
    },
);

exports.createCheckoutSession = onRequest(
    {
      secrets: ["STRIPE_SECRET_KEY"],
      cors: true,
    },
    async (request, response) => {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const origin = request.body.origin;

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price: PRICE_ID,
              quantity: 1,
            },
          ],
          success_url: `${origin}/success`,
          cancel_url: origin,
        });

        response.json({url: session.url});
      } catch (error) {
        logger.error("Stripe Checkout error:", error);
        response.status(500).json({error: error.message});
      }
    },
);