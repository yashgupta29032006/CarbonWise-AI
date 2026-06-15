export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon mapping name
  unlocked: boolean;
  unlockedAt?: string;
  criteria: string;
}

export const INITIAL_BADGES: Badge[] = [
  {
    id: "eco-beginner",
    title: "Eco Beginner",
    description: "Successfully completed onboarding and created your first sustainability profile.",
    iconName: "Leaf",
    unlocked: false,
    criteria: "Complete Onboarding",
  },
  {
    id: "green-explorer",
    title: "Green Explorer",
    description: "Logged and completed 3 daily eco-friendly habits.",
    iconName: "Compass",
    unlocked: false,
    criteria: "Complete 3 habits",
  },
  {
    id: "climate-champion",
    title: "Climate Champion",
    description: "Achieved an excellent Carbon Score of 80 or above.",
    iconName: "Award",
    unlocked: false,
    criteria: "Carbon Score >= 80",
  },
  {
    id: "zero-waste-hero",
    title: "Zero Waste Hero",
    description: "Maximized recycling efforts and adopted home composting.",
    iconName: "Trash2",
    unlocked: false,
    criteria: "Recycle Always & Compost Yes",
  },
  {
    id: "public-transport-pro",
    title: "Transit Advocate",
    description: "Prioritized eco-friendly land transit (bus, train, metro) over private car travel.",
    iconName: "Train",
    unlocked: false,
    criteria: "Transit travel >= 50km and Car travel = 0km",
  },
  {
    id: "sustainability-master",
    title: "Sustainability Master",
    description: "Achieved a 7-day habit streak and completed all weekly challenges.",
    iconName: "Zap",
    unlocked: false,
    criteria: "7-day streak & all weekly challenges completed",
  },
];
