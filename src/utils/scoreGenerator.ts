import { SCORE_THRESHOLDS } from "./constants";

export interface ScoreInfo {
  score: number;
  band: "Excellent" | "Good" | "Moderate" | "High" | "Critical";
  colorClass: string; // Tailwind color classes for badges/text
  bgClass: string;    // Tailwind background color classes
  description: string;
}

export function calculateCarbonScore(emissionsAnnualKg: number): ScoreInfo {
  // Sustainable target per person is 3,500 kg CO2 / year
  // Annual emissions <= 2000 kg yields a perfect 100 score.
  // We use the formula: Score = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-(Emissions - 2000) / 10000))))
  let score = 100;

  if (emissionsAnnualKg > 2000) {
    score = Math.round(100 * Math.exp(-(emissionsAnnualKg - 2000) / 10000));
  }

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let band: ScoreInfo["band"] = "Excellent";
  let colorClass = "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  let bgClass = "bg-emerald-50 dark:bg-emerald-950/30";
  let description = "";

  if (score >= SCORE_THRESHOLDS.excellent) {
    band = "Excellent";
    colorClass = "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    bgClass = "bg-emerald-50 dark:bg-emerald-950/30";
    description = "Your carbon footprint is well within the sustainable global threshold. Excellent work maintaining low-impact habits!";
  } else if (score >= SCORE_THRESHOLDS.good) {
    band = "Good";
    colorClass = "text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-800";
    bgClass = "bg-lime-50 dark:bg-lime-950/30";
    description = "Your emissions are moderate. With a few minor adjustments to transport or energy usage, you can reach an excellent sustainability rating.";
  } else if (score >= SCORE_THRESHOLDS.moderate) {
    band = "Moderate";
    colorClass = "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    bgClass = "bg-amber-50 dark:bg-amber-950/30";
    description = "Your emissions are close to the average for industrialized regions. Transitioning some habits (like diet or daily transit) could make a substantial impact.";
  } else if (score >= SCORE_THRESHOLDS.high) {
    band = "High";
    colorClass = "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    bgClass = "bg-orange-50 dark:bg-orange-950/30";
    description = "Your carbon footprint is high. Major sources like regular car travel or high grid electricity usage are pushing your footprint beyond sustainable levels.";
  } else {
    band = "Critical";
    colorClass = "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
    bgClass = "bg-red-50 dark:bg-red-950/30";
    description = "Your carbon footprint is critical. Immediate, significant modifications to transportation, diet, and electricity consumption are highly recommended.";
  }

  return {
    score,
    band,
    colorClass,
    bgClass,
    description,
  };
}
