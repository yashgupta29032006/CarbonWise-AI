export interface RegionConfig {
  id: string;
  name: string;
  electricityFactor: number; // kg CO2 per kWh
  wasteBaseline: number;      // kg CO2 per year
  publicTransitFactor: number;// kg CO2 per km
  avgHouseholdSize: number;
}

export const REGIONS: Record<string, RegionConfig> = {
  US: {
    id: "US",
    name: "United States (US)",
    electricityFactor: 0.380,
    wasteBaseline: 700,
    publicTransitFactor: 0.095,
    avgHouseholdSize: 2.5,
  },
  EU: {
    id: "EU",
    name: "European Union (EU)",
    electricityFactor: 0.230,
    wasteBaseline: 480,
    publicTransitFactor: 0.055,
    avgHouseholdSize: 2.2,
  },
  APAC: {
    id: "APAC",
    name: "Asia-Pacific (APAC)",
    electricityFactor: 0.550,
    wasteBaseline: 380,
    publicTransitFactor: 0.040,
    avgHouseholdSize: 3.5,
  },
  GLOBAL: {
    id: "GLOBAL",
    name: "Global Average",
    electricityFactor: 0.475,
    wasteBaseline: 500,
    publicTransitFactor: 0.065,
    avgHouseholdSize: 3.0,
  },
};
