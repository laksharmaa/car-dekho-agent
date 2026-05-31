require("dotenv").config();

const connectDB =
  require("../config/db");

const Car =
  require("../models/Car");

const cars =
  require("./data/cars");

const {
  generateEmbedding,
} = require("../services/embeddingService");

async function seed() {
  try {
    await connectDB();

    await Car.deleteMany();

    for (const car of cars) {
      const text = `
${car.name}
${car.brand}
${car.bodyType}
${car.description}
${car.fuelType}
Safety ${car.safetyRating}
Mileage ${car.mileage}
`;

      const embedding =
        await generateEmbedding(text);

      await Car.create({
        ...car,
        embedding,
      });

      console.log(
        `Seeded ${car.name}`
      );
    }

    console.log(
      "Database seeded successfully"
    );

    process.exit();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

seed();