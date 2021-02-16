const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51ILS14CIE24WqIUsZEKUcR01qj3LwtWvXeZPPl4MJNngYGJEVmJdWRUnsQIkebrnA38LHcM9tF8rOmZNDDOJOhNQ00THscMZie"
);
const app = express();
app.use(formidable());

router.post("/pay", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.price * 100,
      currency: "eur",
      description: req.fields.title,
      source: req.fields.stripeToken,
    });
    console.log(response);
    if (response.status === "succeded") {
      res.status(200).json({ message: "Payment succeeded" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
