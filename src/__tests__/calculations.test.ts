import { calculateEmissions, CarbonEntry } from "../utils/carbonCalculations";

describe("Carbon Calculations Engine", () => {
  const baseEntry: CarbonEntry = {
    region: "GLOBAL",
    householdSize: 1,
    transport: {
      walking: 0,
      bicycle: 0,
      motorcycle: 0,
      car: 0,
      bus: 0,
      metro: 0,
      train: 0,
      flight: 0,
    },
    electricity: 0,
    food: "mixed",
    waste: {
      recyclingFrequency: "never",
      plasticUsage: "medium",
      composting: false,
      wasteGeneration: "medium",
    },
    shopping: "medium",
  };

  test("calculates zero footprint when all fields are zero/minimal", () => {
    const entry: CarbonEntry = {
      ...baseEntry,
      food: "vegan", // low footprint
      waste: {
        recyclingFrequency: "always",
        plasticUsage: "low",
        composting: true,
        wasteGeneration: "low",
      },
      shopping: "low",
    };
    
    const emissions = calculateEmissions(entry);
    expect(emissions.transport).toBe(0);
    expect(emissions.electricity).toBe(0);
    expect(emissions.shopping).toBe(150); // shopping baseline for low
    expect(emissions.total).toBeGreaterThan(0);
  });

  test("calculates transportation emissions correctly", () => {
    const entry: CarbonEntry = {
      ...baseEntry,
      transport: {
        ...baseEntry.transport,
        car: 100, // 100 km/week * 0.180 kg/km = 18 kg/week. Annual = 18 * 52 = 936 kg.
      },
      shopping: "low",
    };

    const emissions = calculateEmissions(entry);
    expect(emissions.transport).toBe(936);
  });

  test("scales electricity by household size", () => {
    const entrySingle: CarbonEntry = {
      ...baseEntry,
      electricity: 500, // 500 kWh/month
      householdSize: 1,
      shopping: "low",
    };

    const entryDouble: CarbonEntry = {
      ...baseEntry,
      electricity: 500,
      householdSize: 2,
      shopping: "low",
    };

    const emissionsSingle = calculateEmissions(entrySingle);
    const emissionsDouble = calculateEmissions(entryDouble);

    // Double household size should cut individual footprint in half
    expect(emissionsDouble.electricity).toBeCloseTo(emissionsSingle.electricity / 2, 0);
  });

  test("checks food emissions boundaries", () => {
    const vegan = calculateEmissions({ ...baseEntry, food: "vegan" });
    const meatHeavy = calculateEmissions({ ...baseEntry, food: "meat-heavy" });

    expect(vegan.food).toBe(Math.round(1.5 * 365));
    expect(meatHeavy.food).toBe(Math.round(7.2 * 365));
    expect(meatHeavy.food).toBeGreaterThan(vegan.food);
  });
});
