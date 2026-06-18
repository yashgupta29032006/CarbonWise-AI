export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  category: "transport" | "energy" | "waste" | "food" | "general" | "shopping";
  co2Saved: number; // kg saved by completing this challenge
}


