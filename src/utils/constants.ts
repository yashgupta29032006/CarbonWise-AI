/**
 * CarbonWise AI - Centralized Constants
 */

// Global Sustainability Targets
export const SUSTAINABLE_BUDGET_TARGET = 3500; // kg CO2/year per person
export const CLIMATE_NEUTRAL_THRESHOLD = 2000; // kg CO2/year

// Emission Factors (kg CO2 per unit)
export const EMISSION_FACTORS = {
  transport: {
    walking: 0,
    bicycle: 0,
    motorcycle: 0.103, // kg CO2/km
    car: 0.180,        // kg CO2/km
    flight: 0.250,     // kg CO2/km
  },
  food: {
    vegan: 1.5,        // kg CO2/day
    vegetarian: 2.0,   // kg CO2/day
    mixed: 4.7,        // kg CO2/day
    "meat-heavy": 7.2, // kg CO2/day
  },
  shopping: {
    low: 150,          // kg CO2/year
    medium: 450,       // kg CO2/year
    high: 1000,        // kg CO2/year
  },
  waste: {
    recycling: {
      always: -150,    // reduction kg/year
      sometimes: -50,  // reduction kg/year
      never: 0,
    },
    plastic: {
      low: -50,        // reduction kg/year
      medium: 0,
      high: 100,       // addition kg/year
    },
    composting: -100,  // reduction kg/year
    generation: {
      low: -100,       // reduction kg/year
      medium: 0,
      high: 150,       // addition kg/year
    },
  },
};

// Environmental Equivalency Factors (kg CO2 required to offset / equivalent to 1 unit)
export const EQUIVALENTS = {
  trees: 22,           // 22 kg CO2 absorbed by one tree seedling over 10 years
  gas: 8.88,           // 8.88 kg CO2 per gallon of gasoline
  miles: 0.180,        // 0.180 kg CO2 per km of car commute
  phones: 0.0082,      // 0.0082 kg CO2 per smartphone charge
  coal: 0.9,           // 0.9 kg CO2 per kg of coal burned
  homes: 4800,         // 4800 kg CO2 per home per year (electric load)
};

// Carbon Score Band Thresholds
export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  moderate: 40,
  high: 20,
};

// Suggested AI Coach Prompts
export const AI_COACH_PROMPTS = [
  "Explain my carbon score",
  "How can I reduce transportation emissions?",
  "Give me a 30-day sustainability plan",
  "What is my biggest source of emissions?",
  "Suggest the highest impact actions",
  "How can I reduce electricity usage?",
];
