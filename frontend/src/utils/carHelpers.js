export function formatPrice(p) {
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lakh`;
  return `₹${(p / 1000).toFixed(0)}K`;
}

export function fuelColor(type) {
  const map = {
    Petrol: { bg: "#fff7ed", text: "#c2410c" },
    Diesel: { bg: "#eff6ff", text: "#1d4ed8" },
    Electric: { bg: "#f0fdf4", text: "#15803d" },
    Hybrid: { bg: "#faf5ff", text: "#7c3aed" },
    CNG: { bg: "#ecfeff", text: "#0e7490" },
  };
  return map[type] || { bg: "#f9fafb", text: "#374151" };
}

// Unique identifier for a car so the same model can be tracked
// for selection across different chat messages.
export function carKey(car) {
  return car.name || `${car.brand}-${car.bodyType}-${car.price}`;
}
