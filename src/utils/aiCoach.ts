import { CarbonEntry, EmissionsBreakdown } from "./carbonCalculations";
import { calculateCarbonScore } from "./scoreGenerator";

export interface CoachSuggestion {
  category: "transport" | "energy" | "food" | "waste" | "shopping";
  title: string;
  description: string;
  co2SavedAnnual: number;
}

// Generate the "Highest Impact Actions" checklist for the dashboard
export function getHighestImpactActions(
  entry: CarbonEntry,
  emissions: EmissionsBreakdown
): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];

  // 1. Check transportation leverage (Car travel)
  if (entry.transport.car > 20) {
    const weeklyKm = entry.transport.car;
    // Estimate potential: Replacing 20% of weekly car mileage with active/public transit
    const potentialSaving = Math.round(weeklyKm * 0.2 * 0.180 * 52); // 20% * 0.180kg/km * 52
    if (potentialSaving > 50) {
      suggestions.push({
        category: "transport",
        title: "Ditch the Car for 20% of Trips",
        description: `Replacing 20% of your weekly car travel (${Math.round(weeklyKm * 0.2)} km) with public transit or walking will significantly lower vehicle exhaust.`,
        co2SavedAnnual: potentialSaving,
      });
    }
  }

  // 2. Check electricity leverage
  if (entry.electricity > 100) {
    // Estimate potential: Lowering electricity usage by 15% via efficiency
    const potentialSaving = Math.round(emissions.electricity * 0.15);
    if (potentialSaving > 40) {
      suggestions.push({
        category: "energy",
        title: "Energy Efficiency Audit",
        description: "Reducing home electricity by 15% (unplugging idle appliances, switching to LEDs, eco thermostats) makes a direct power grid impact.",
        co2SavedAnnual: potentialSaving,
      });
    }
  }

  // 3. Check food diet leverage
  if (entry.food === "meat-heavy" || entry.food === "mixed") {
    // Shifting to vegetarian 2 days a week
    // Meat heavy (7.2kg) to vegetarian (2.0kg) = 5.2kg difference.
    // Mixed (4.7kg) to vegetarian (2.0kg) = 2.7kg difference.
    const diff = entry.food === "meat-heavy" ? 5.2 : 2.7;
    const potentialSaving = Math.round(diff * (2 / 7) * 365);
    suggestions.push({
      category: "food",
      title: "Introduce Meatless Days",
      description: "Substituting meat meals with vegetarian or vegan alternatives twice a week cuts agricultural supply chain emissions.",
      co2SavedAnnual: potentialSaving,
    });
  }

  // 4. Check waste leverage
  if (entry.waste.recyclingFrequency !== "always" || !entry.waste.composting) {
    let potentialSaving = 0;
    let description = "Upgrading habits can lower trash decay emissions: ";
    if (entry.waste.recyclingFrequency !== "always") {
      potentialSaving += 100;
      description += "Recycle all papers/containers. ";
    }
    if (!entry.waste.composting) {
      potentialSaving += 100;
      description += "Begin home composting organic matter to avoid landfill methane.";
    }
    if (potentialSaving > 0) {
      suggestions.push({
        category: "waste",
        title: "Optimize Waste Management",
        description,
        co2SavedAnnual: potentialSaving,
      });
    }
  }

  // 5. Check shopping leverage
  if (entry.shopping === "high" || entry.shopping === "medium") {
    const savings = entry.shopping === "high" ? 550 : 300; // shifting high to medium, or medium to low
    suggestions.push({
      category: "shopping",
      title: "Conscious Consumer Shift",
      description: "Reducing monthly purchases by choosing refurbished electronics, pre-owned clothes, and repairing household items.",
      co2SavedAnnual: savings,
    });
  }

  // Sort by highest potential savings
  return suggestions.sort((a, b) => b.co2SavedAnnual - a.co2SavedAnnual);
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
  carKms > 50
    ? `- **Private Driving:** You log **${carKms} km/week** by car. Replacing even 10% of this with walking or train transit would save roughly **${Math.round(carKms * 0.1 * 0.180 * 52)} kg CO₂** annually.\n`
    : ""
}
${
  flightKms > 1000
    ? `- **Aviation Footprint:** You travel **${flightKms.toLocaleString()} km/year** by flight. Air travel has a massive intensity per km (${(0.250).toFixed(3)} kg/km). Offsetting or substituting long flights with rail can drastically cut this.\n`
    : ""
}
- **Eco Habits:** Try checking off the *'Used bicycle instead of car'* or *'Walked for short trips'* habits daily on the dashboard to build streaks!`;
  }

  if (query.includes("energy") || query.includes("electricity") || query.includes("kwh") || query.includes("power")) {
    const kwh = entry.electricity;
    const regionText = entry.region === "US" ? "United States" : entry.region === "EU" ? "European Union" : "Global Grid";
    return `### ⚡ Electricity & Energy Insights
Your energy footprint is **${emissions.electricity.toLocaleString()} kg CO₂/year** based on **${kwh} kWh/month** in the **${regionText}** region.
- **Regional Grid Intensity:** Your region's emissions factor is **${(emissions.electricity > 0 ? (emissions.electricity * entry.householdSize / (kwh * 12)).toFixed(3) : "0.400")} kg CO₂/kWh**.
- **Action Plan:**
  1. Unplug vampire power devices (chargers, consoles) when not in use.
  2. Switch to LED lightbulbs, which use 75% less energy.
  3. Lower your thermostat by 1-2 degrees in winter or raise it in summer.
- **Shared Footprint:** Since your household size is **${entry.householdSize}**, you save emissions collectively. Keep it up!`;
  }

  if (query.includes("food") || query.includes("diet") || query.includes("meat") || query.includes("vegan")) {
    const diet = entry.food;
    let tip = "";
    if (diet === "meat-heavy") {
      tip = "Your diet is **Meat-Heavy**, emitting ~7.2 kg CO₂/day. Shifting to vegetarian twice a week saves over **500 kg CO₂/year**!";
    } else if (diet === "mixed") {
      tip = "Your diet is **Mixed**, emitting ~4.7 kg CO₂/day. Introducing vegetarian or vegan meals 2-3 times weekly will save roughly **280 kg CO₂/year**.";
    } else {
      tip = `Your diet is **${diet}**, which is highly eco-friendly! You are saving significant carbon compared to average mixed diets (~1.7 tons saved annually).`;
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
- **How it works:** The score is calculated relative to a global sustainable per capita budget of **3,500 kg CO₂/year**.
- **Emissions Scale:**
  - Annual footprint <= 2,000 kg: Score 100 (Climate Neutrality)
  - Annual footprint 3,500 kg: Score 86 (Sustainable Budget Target)
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
    ? `#### Highest Impact Action Recommended:
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
