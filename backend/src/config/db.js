const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB URI. Set MONGODB_URI in your .env file or environment variables."
    );
  }

  await mongoose.connect(mongoUri);

  console.log("MongoDB Connected");
};

module.exports = connectDB;