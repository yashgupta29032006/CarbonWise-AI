import { CarbonEntry, EmissionsBreakdown } from "./carbonCalculations";
import { calculateCarbonScore } from "./scoreGenerator";
import { EMISSION_FACTORS, CLIMATE_NEUTRAL_THRESHOLD, SUSTAINABLE_BUDGET_TARGET } from "./constants";

export interface CoachSuggestion {
  category: "transport" | "energy" | "food" | "waste" | "shopping";
  title: string;
  description: string;
  co2SavedAnnual: number;
  difficulty: "Easy" | "Medium" | "Hard";
  timeline: "Immediate" | "1-3 months" | "6+ months";
  confidence: "High" | "Medium" | "Estimate";
}

// Generate the "Top 3 Highest Impact Actions" checklist for the dashboard
export function getHighestImpactActions(
  entry: CarbonEntry,
  emissions: EmissionsBreakdown
): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];

  // 1. Car Switch (High leverage)
  if (entry.transport.car > 0) {
    const weeklyKm = entry.transport.car;
    // Replacing 25% of car travel with public/active transport
    const potentialSaving = Math.round(weeklyKm * 0.25 * EMISSION_FACTORS.transport.car * 52);
    if (potentialSaving > 20) {
      suggestions.push({
        category: "transport",
        title: "Ditch the Car for 25% of Trips",
        description: `Replace 25% of your driving (${Math.round(weeklyKm * 0.25)} km/week) with cycling, walking, or public transit.`,
        co2SavedAnnual: potentialSaving,
        difficulty: "Medium",
        timeline: "1-3 months",
        confidence: "High",
      });
    }
  }

  // 2. Reduce Electricity by 10%
  if (entry.electricity > 0) {
    const potentialSaving = Math.round(emissions.electricity * 0.10);
    if (potentialSaving > 20) {
      suggestions.push({
        category: "energy",
        title: "Reduce Electricity Usage by 10%",
        description: "Turn off idle devices, adjust heating/cooling, and choose energy-star appliances.",
        co2SavedAnnual: potentialSaving,
        difficulty: "Easy",
        timeline: "Immediate",
        confidence: "Medium",
      });
    }
  }

  // 3. Shift Diet (Meat heavy / Mixed)
  if (entry.food === "meat-heavy" || entry.food === "mixed") {
    // Replace 3 meat meals per week (equivalent to ~3/21 or 15% of food)
    const factor = entry.food === "meat-heavy"
      ? (EMISSION_FACTORS.food["meat-heavy"] - EMISSION_FACTORS.food.vegetarian)
      : (EMISSION_FACTORS.food.mixed - EMISSION_FACTORS.food.vegetarian); // saving vs vegetarian
    const potentialSaving = Math.round(factor * (3 / 7) * 365);
    suggestions.push({
      category: "food",
      title: "Replace 3 Meat Meals per Week",
      description: "Introduce plant-based or vegetarian lunches three times a week.",
      co2SavedAnnual: potentialSaving,
      difficulty: "Easy",
      timeline: "Immediate",
      confidence: "High",
    });
  }

  // 4. Waste Composting & Recycling
  if (entry.waste.recyclingFrequency !== "always" || !entry.waste.composting) {
    let potentialSaving = 0;
    const description = "Begin separating paper/plastic recycling and organic composting.";
    if (entry.waste.recyclingFrequency !== "always") potentialSaving -= EMISSION_FACTORS.waste.recycling.always;
    if (!entry.waste.composting) potentialSaving -= EMISSION_FACTORS.waste.composting;

    suggestions.push({
      category: "waste",
      title: "Recycle and Compost Waste",
      description,
      co2SavedAnnual: potentialSaving,
      difficulty: "Medium",
      timeline: "1-3 months",
      confidence: "Estimate",
    });
  }

  // 5. Shopping Habit reduction
  if (entry.shopping === "high" || entry.shopping === "medium") {
    const savings = entry.shopping === "high"
      ? (EMISSION_FACTORS.shopping.high - EMISSION_FACTORS.shopping.medium)
      : (EMISSION_FACTORS.shopping.medium - EMISSION_FACTORS.shopping.low);
    suggestions.push({
      category: "shopping",
      title: "Reduce Buying Frequency by 20%",
      description: "Repair existing products, swap clothes, and choose secondhand options.",
      co2SavedAnnual: savings,
      difficulty: "Medium",
      timeline: "1-3 months",
      confidence: "Estimate",
    });
  }

  // Sort by highest potential savings and return top 3
  return suggestions.sort((a, b) => b.co2SavedAnnual - a.co2SavedAnnual).slice(0, 3);
}

// Local chatbot response engine for fallback
export function getLocalCoachResponse(
  message: string,
  entry: CarbonEntry,
  emissions: EmissionsBreakdown
): string {
  const query = message.toLowerCase();

  if (query.includes("transport") || query.includes("car") || query.includes("fly") || query.includes("flight")) {
    const carKms = entry.transport.car;
    const flightKms = entry.transport.flight;
    return `### 🚗 Transportation Insights
Your current transport emissions are **${emissions.transport.toLocaleString()} kg CO₂/year**.
${
  carKms > 0
    ? `- **Driving Impact:** You log **${carKms} km/week** by car. Replacing 25% of this with public transit or walking would save roughly **${Math.round(carKms * 0.25 * EMISSION_FACTORS.transport.car * 52)} kg CO₂** annually.\n`
    : ""
}
${
  flightKms > 0
    ? `- **Aviation Impact:** You travel **${flightKms.toLocaleString()} km/year** by flight. Aviation has a massive footprint (${(EMISSION_FACTORS.transport.flight).toFixed(3)} kg/km). Offsetting flights or choosing trains when traveling locally cuts this footprint.\n`
    : ""
}
- **Eco Habits:** Try checking off the *'Used bicycle instead of car'* or *'Walked for short trips'* habits daily on the dashboard to build streaks!`;
  }

  if (query.includes("energy") || query.includes("electricity") || query.includes("kwh") || query.includes("power")) {
    const kwh = entry.electricity;
    const regionText = entry.region === "US" ? "United States" : entry.region === "EU" ? "European Union" : "Global Grid";
    return `### ⚡ Electricity & Energy Insights
Your energy footprint is **${emissions.electricity.toLocaleString()} kg CO₂/year** based on **${kwh} kWh/month** in the **${regionText}** region.
- **Grid Carbon Intensity:** Your region's emissions factor is **${(emissions.electricity > 0 ? (emissions.electricity * entry.householdSize / (kwh * 12)).toFixed(3) : "0.400")} kg CO₂/kWh**.
- **Action Plan:**
  1. Unplug vampire appliances (consoles, TVs) when not in use.
  2. Switch to LED bulbs, which consume 75% less energy.
  3. Lower your thermostat by 1-2 degrees in winter or raise it in summer.
- **Household Share:** Since your household size is **${entry.householdSize}**, you share baseload emissions. Good job keeping grid impacts down!`;
  }

  if (query.includes("food") || query.includes("diet") || query.includes("meat") || query.includes("vegan")) {
    const diet = entry.food;
    let tip = "";
    if (diet === "meat-heavy") {
      tip = `Your diet is **Meat-Heavy** (~${EMISSION_FACTORS.food["meat-heavy"]} kg CO₂/day). Shifting to vegetarian three times a week saves over **500 kg CO₂/year**!`;
    } else if (diet === "mixed") {
      tip = `Your diet is **Mixed** (~${EMISSION_FACTORS.food.mixed} kg CO₂/day). Substituting meat meals with vegetarian or vegan alternatives 3 times weekly saves **280 kg CO₂/year**.`;
    } else {
      tip = `Your diet is **${diet}**, which is highly eco-friendly! You save significant carbon compared to average mixed diets (~1.7 tons saved annually).`;
    }
    return `### 🍏 Food & Dietary Insights
Your annual food-related emissions total **${emissions.food.toLocaleString()} kg CO₂**.
- ${tip}
- **Avoid Food Waste:** About 30% of global food is wasted. Buying only what you need and composting scraps significantly mitigates municipal landfill methane emissions.`;
  }

  if (query.includes("score") || query.includes("calculate") || query.includes("explain")) {
    const scoreInfo = calculateCarbonScore(emissions.total);
    return `### 📊 Carbon Score Analysis
Your Current Carbon Score is **${scoreInfo.score}/100** (**${scoreInfo.band}** rating).
- **How it works:** The score is calculated relative to a global sustainable per capita budget of **${SUSTAINABLE_BUDGET_TARGET} kg CO₂/year**.
- **Emissions Scale:**
  - Annual footprint <= ${CLIMATE_NEUTRAL_THRESHOLD} kg: Score 100 (Climate Neutrality)
  - Annual footprint ${SUSTAINABLE_BUDGET_TARGET} kg: Score 86 (Sustainable Budget Target)
  - Annual footprint 8,000 kg: Score 55 (Industrial Average)
  - Annual footprint > 20,000 kg: Score 0-20 (Critical Footprint)
- **Current Footprint:** Your footprint is **${emissions.total.toLocaleString()} kg CO₂/year**. Reducing this value will directly increase your score.`;
  }

  // General fallback
  const actions = getHighestImpactActions(entry, emissions);
  return `### 🌱 Hello! I am your AI Sustainability Coach.
Based on your carbon profile, here is a custom analysis of your footprint (**${emissions.total.toLocaleString()} kg CO₂/year**):

${
  actions.length > 0
    ? `#### Top Impact Action Suggested:
**${actions[0].title}**
*${actions[0].description}*
👉 *Potential annual carbon savings: **${actions[0].co2SavedAnnual} kg CO₂/year***`
    : "You have excellent sustainability habits! Continue log tracking to watch your trends."
}

#### Quick Tips:
1. Try logging daily habits on the habit tracker below to keep streaks active.
2. Complete weekly challenges like walking or skipping car trips.
3. Check the tooltips next to dashboard metrics to learn what they mean.

*Ask me about specific categories like "transport", "energy", "food" or "score" for detailed assistance.*`;
}

