const express = require("express");
const app = express();
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_PUBLIC_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
const paymentRoute = require("./routes/payment");
app.use(paymentRoute);

app.all("*", (req, res) => {
  res.status(404).json("Page not found");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started");
});
