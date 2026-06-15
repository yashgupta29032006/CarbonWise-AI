import { REGIONS } from "./regions";

export interface CarbonEntry {
  region: string;
  householdSize: number;
  transport: {
    walking: number;
    bicycle: number;
    motorcycle: number;
    car: number;
    bus: number;
    metro: number;
    train: number;
    flight: number; // km per year
  };
  electricity: number; // Monthly kWh
  food: "vegan" | "vegetarian" | "mixed" | "meat-heavy";
  waste: {
    recyclingFrequency: "always" | "sometimes" | "never";
    plasticUsage: "low" | "medium" | "high";
    composting: boolean;
    wasteGeneration: "low" | "medium" | "high";
  };
  shopping: "low" | "medium" | "high";
}

export interface EmissionsBreakdown {
  transport: number; // annual kg CO2
  electricity: number; // annual kg CO2
  food: number; // annual kg CO2
  waste: number; // annual kg CO2
  shopping: number; // annual kg CO2
  total: number; // annual kg CO2
}

export const DEFAULT_ENTRY: CarbonEntry = {
  region: "GLOBAL",
  householdSize: 2,
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
    recyclingFrequency: "sometimes",
    plasticUsage: "medium",
    composting: false,
    wasteGeneration: "medium",
  },
  shopping: "medium",
};

export function calculateEmissions(entry: CarbonEntry): EmissionsBreakdown {
  const region = REGIONS[entry.region] || REGIONS.GLOBAL;
  const householdSize = entry.householdSize || 1;

  // 1. Transportation (Land transit is logged per week, scaled to annual * 52)
  // Flights are logged per year directly.
  const transportConfig = {
    walking: 0,
    bicycle: 0,
    motorcycle: 0.103,
    car: 0.180,
    bus: region.publicTransitFactor || 0.065, // regional public transit factor
    metro: (region.publicTransitFactor || 0.065) * 0.5,
    train: (region.publicTransitFactor || 0.065) * 0.4,
    flight: 0.250, // per flight km (annual)
  };

  const weeklyLandEmissions =
    entry.transport.walking * transportConfig.walking +
    entry.transport.bicycle * transportConfig.bicycle +
    entry.transport.motorcycle * transportConfig.motorcycle +
    entry.transport.car * transportConfig.car +
    entry.transport.bus * transportConfig.bus +
    entry.transport.metro * transportConfig.metro +
    entry.transport.train * transportConfig.train;

  const transportAnnual = (weeklyLandEmissions * 52) + (entry.transport.flight * transportConfig.flight);

  // 2. Electricity: (Monthly kWh * factor * 12) / Household Size
  const electricityAnnual = ((entry.electricity || 0) * region.electricityFactor * 12) / householdSize;

  // 3. Food: daily factor * 365
  const foodConfig = {
    vegan: 1.5,
    vegetarian: 2.0,
    mixed: 4.7,
    "meat-heavy": 7.2,
  };
  const foodAnnual = foodConfig[entry.food] * 365;

  // 4. Waste: Regional Baseline adjusted by recycling, composting, and plastic usage
  let wasteAnnual = region.wasteBaseline;

  // Recycling Frequency
  if (entry.waste.recyclingFrequency === "always") {
    wasteAnnual -= 150;
  } else if (entry.waste.recyclingFrequency === "sometimes") {
    wasteAnnual -= 50;
  }

  // Plastic Usage
  if (entry.waste.plasticUsage === "low") {
    wasteAnnual -= 50;
  } else if (entry.waste.plasticUsage === "high") {
    wasteAnnual += 100;
  }

  // Composting
  if (entry.waste.composting) {
    wasteAnnual -= 100;
  }

  // Waste Generation
  if (entry.waste.wasteGeneration === "low") {
    wasteAnnual -= 100;
  } else if (entry.waste.wasteGeneration === "high") {
    wasteAnnual += 150;
  }

  // Prevent negative waste footprint
  wasteAnnual = Math.max(50, wasteAnnual);

  // 5. Shopping: Baseline based on purchasing volume
  const shoppingConfig = {
    low: 150,
    medium: 450,
    high: 1000,
  };
  const shoppingAnnual = shoppingConfig[entry.shopping];

  return {
    transport: Math.round(transportAnnual),
    electricity: Math.round(electricityAnnual),
    food: Math.round(foodAnnual),
    waste: Math.round(wasteAnnual),
    shopping: Math.round(shoppingAnnual),
    total: Math.round(transportAnnual + electricityAnnual + foodAnnual + wasteAnnual + shoppingAnnual),
  };
}
