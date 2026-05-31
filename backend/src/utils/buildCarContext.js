const buildCarContext = (cars) => {
  return cars
    .map(
      (car) => `
Name: ${car.name}
Brand: ${car.brand}
Body Type: ${car.bodyType}
Price: ₹${car.price}

Mileage: ${car.mileage} kmpl

Safety Rating: ${car.safetyRating}/5

Fuel Type: ${car.fuelType}

Description: ${car.description}
`
    )
    .join("\n\n");
};

module.exports = buildCarContext;