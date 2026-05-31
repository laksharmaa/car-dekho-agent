const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: String,

    brand: String,

    bodyType: String,

    price: Number,

    mileage: Number,

    safetyRating: Number,

    fuelType: String,

    description: String,

    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Car", carSchema);