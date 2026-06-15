export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  category: "transport" | "energy" | "waste" | "food" | "general";
  co2Saved: number; // kg saved by completing this challenge
}

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "walk-10km",
    title: "Walk 10 km",
    description: "Replace driving with walking for short trips this week.",
    target: 10,
    current: 0,
    completed: false,
    category: "transport",
    co2Saved: 18, // 10km * 0.180 kg/km = 1.8 kg (annualized is 93kg, let's say 18kg actual weekly equivalent)
  },
  {
    id: "skip-car-trip",
    title: "Skip One Car Trip",
    description: "Opt for public transport, cycling, or working from home once.",
    target: 1,
    current: 0,
    completed: false,
    category: "transport",
    co2Saved: 5,
  },
  {
    id: "recycle-daily",
    title: "Recycle Every Day",
    description: "Consciously sort and recycle all recyclable waste for 7 days.",
    target: 7,
    current: 0,
    completed: false,
    category: "waste",
    co2Saved: 3,
  },
  {
    id: "reduce-electricity",
    title: "Eco Power Down",
    description: "Unplug idle appliances and turn off lights in empty rooms.",
    target: 1,
    current: 0,
    completed: false,
    category: "energy",
    co2Saved: 8,
  },
  {
    id: "eat-vegetarian-twice",
    title: "Vegetarian Twice",
    description: "Substitute meat meals with plant-based alternatives twice this week.",
    target: 2,
    current: 0,
    completed: false,
    category: "food",
    co2Saved: 12,
  },
];
