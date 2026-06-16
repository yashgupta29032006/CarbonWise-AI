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

export interface DataQualityInfo {
  label: "High Confidence" | "Moderate Estimate" | "Approximation";
  colorClass: string;
  bgClass: string;
  description: string;
}

export interface EcoEquivalent {
  id: string;
  label: string;
  value: string;
  description: string;
  iconName: string;
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

  // 1. Transportation
  const transportConfig = {
    walking: 0,
    bicycle: 0,
    motorcycle: 0.103,
    car: 0.180,
    bus: region.publicTransitFactor || 0.065,
    metro: (region.publicTransitFactor || 0.065) * 0.5,
    train: (region.publicTransitFactor || 0.065) * 0.4,
    flight: 0.250,
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

  // 2. Electricity
  const electricityAnnual = ((entry.electricity || 0) * region.electricityFactor * 12) / householdSize;

  // 3. Food
  const foodConfig = {
    vegan: 1.5,
    vegetarian: 2.0,
    mixed: 4.7,
    "meat-heavy": 7.2,
  };
  const foodAnnual = foodConfig[entry.food] * 365;

  // 4. Waste
  let wasteAnnual = region.wasteBaseline;

  if (entry.waste.recyclingFrequency === "always") {
    wasteAnnual -= 150;
  } else if (entry.waste.recyclingFrequency === "sometimes") {
    wasteAnnual -= 50;
  }

  if (entry.waste.plasticUsage === "low") {
    wasteAnnual -= 50;
  } else if (entry.waste.plasticUsage === "high") {
    wasteAnnual += 100;
  }

  if (entry.waste.composting) {
    wasteAnnual -= 100;
  }

  if (entry.waste.wasteGeneration === "low") {
    wasteAnnual -= 100;
  } else if (entry.waste.wasteGeneration === "high") {
    wasteAnnual += 150;
  }

  wasteAnnual = Math.max(50, wasteAnnual);

  // 5. Shopping
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

export function getDataQualityInfo(entry: CarbonEntry): DataQualityInfo {
  const hasCustomTransport = entry.transport.car > 0 || entry.transport.bus > 0 || entry.transport.metro > 0 || entry.transport.flight > 0;
  const hasCustomElectricity = entry.electricity > 0;
  const hasCustomFood = entry.food !== "mixed";

  if (hasCustomTransport && hasCustomElectricity && hasCustomFood) {
    return {
      label: "High Confidence",
      colorClass: "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
      description: "Based on custom transport logs, food choices, and actual electricity bills.",
    };
  } else if (hasCustomTransport || hasCustomElectricity) {
    return {
      label: "Moderate Estimate",
      colorClass: "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
      bgClass: "bg-amber-50 dark:bg-amber-950/20",
      description: "Using standard regional defaults for missing electricity or transport factors.",
    };
  } else {
    return {
      label: "Approximation",
      colorClass: "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
      bgClass: "bg-zinc-100 dark:bg-zinc-900/30",
      description: "Based primarily on onboarding seeds and regional average configurations.",
    };
  }
}

export function getEnvironmentalEquivalents(emissionsKg: number): EcoEquivalent[] {
  return [
    {
      id: "trees",
      label: "Trees Seedlings",
      value: `${Math.round(emissionsKg / 22)} trees`,
      description: "Number of mature seedlings growing for 10 years needed to absorb this carbon.",
      iconName: "TreePine",
    },
    {
      id: "gas",
      label: "Gasoline Avoided",
      value: `${Math.round(emissionsKg / 8.88).toLocaleString()} gal`,
      description: "Gallons of motor fuel combusted releasing equivalent greenhouse gas.",
      iconName: "Flame",
    },
    {
      id: "miles",
      label: "Commute Mileage",
      value: `${Math.round(emissionsKg / 0.180).toLocaleString()} km`,
      description: "Distance driven in an average passenger car producing this footprint.",
      iconName: "Car",
    },
    {
      id: "phones",
      label: "Smartphones Charged",
      value: `${Math.round(emissionsKg / 0.0082).toLocaleString()}`,
      description: "Times a standard phone battery could be charged under typical grid conditions.",
      iconName: "Smartphone",
    },
    {
      id: "coal",
      label: "Coal Burned",
      value: `${Math.round(emissionsKg / 0.9).toLocaleString()} kg`,
      description: "Kilograms of coal burned in standard power generating stations.",
      iconName: "Zap",
    },
    {
      id: "homes",
      label: "Homes Powered",
      value: `${(emissionsKg / 4800).toFixed(2)} homes`,
      description: "Average annual residential electrical footprint counterparts.",
      iconName: "Home",
    },
  ];
}
