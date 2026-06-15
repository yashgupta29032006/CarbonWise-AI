"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CarbonEntry, calculateEmissions, DEFAULT_ENTRY, EmissionsBreakdown } from "../utils/carbonCalculations";
import { calculateCarbonScore, ScoreInfo } from "../utils/scoreGenerator";
import { Badge, INITIAL_BADGES } from "../utils/achievements";
import { Challenge, INITIAL_CHALLENGES } from "../utils/challenges";

export interface OnboardingData {
  region: string;
  householdSize: number;
  transitType: "car" | "public" | "active" | "mixed";
  dietPreference: "vegan" | "vegetarian" | "mixed" | "meat-heavy";
  goalType: "10" | "20" | "neutral";
}

export interface Habit {
  id: string;
  name: string;
  completedToday: boolean;
  streak: number;
  lastCompletedDate: string | null;
}

export interface HistoryEntry {
  date: string;
  score: number;
  transport: number;
  electricity: number;
  food: number;
  waste: number;
  shopping: number;
  total: number;
}

interface CarbonContextType {
  isOnboarded: boolean;
  onboardingData: OnboardingData | null;
  activeEntry: CarbonEntry;
  emissionsBreakdown: EmissionsBreakdown;
  scoreInfo: ScoreInfo;
  weeklyReductionTarget: number; // kg CO2
  monthlyCO2Target: number; // kg CO2
  habits: Habit[];
  badges: Badge[];
  challenges: Challenge[];
  history: HistoryEntry[];
  mounted: boolean;
  completeOnboarding: (data: OnboardingData) => void;
  updateCarbonEntry: (entry: CarbonEntry) => void;
  toggleHabit: (id: string) => void;
  incrementChallenge: (id: string) => void;
  updateGoals: (weeklyTarget: number, monthlyTarget: number) => void;
  resetAllData: () => void;
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined);

const DEFAULT_HABITS: Habit[] = [
  { id: "used-bicycle", name: "Used bicycle instead of car", completedToday: false, streak: 0, lastCompletedDate: null },
  { id: "walked-instead", name: "Walked for short trips", completedToday: false, streak: 0, lastCompletedDate: null },
  { id: "turned-off-appliances", name: "Turned off unused appliances", completedToday: false, streak: 0, lastCompletedDate: null },
  { id: "reusable-bottle", name: "Used reusable bottle/bags", completedToday: false, streak: 0, lastCompletedDate: null },
  { id: "recycled-waste", name: "Recycled all waste products", completedToday: false, streak: 0, lastCompletedDate: null },
  { id: "saved-electricity", name: "Saved electricity in office/home", completedToday: false, streak: 0, lastCompletedDate: null },
];

export function CarbonProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [activeEntry, setActiveEntry] = useState<CarbonEntry>(DEFAULT_ENTRY);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [weeklyReductionTarget, setWeeklyReductionTarget] = useState(15); // kg CO2 weekly target reduction
  const [monthlyCO2Target, setMonthlyCO2Target] = useState(400); // kg CO2 monthly target limit
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Calculate real-time emissions and score based on active carbon entry
  const emissionsBreakdown = calculateEmissions(activeEntry);
  const scoreInfo = calculateCarbonScore(emissionsBreakdown.total);

  useEffect(() => {
    // 1. Load data from localStorage on mount
    const savedOnboarding = localStorage.getItem("cw-onboarding-data");
    const savedEntry = localStorage.getItem("cw-active-entry");
    const savedHabits = localStorage.getItem("cw-habits");
    const savedBadges = localStorage.getItem("cw-badges");
    const savedChallenges = localStorage.getItem("cw-challenges");
    const savedWeeklyTarget = localStorage.getItem("cw-weekly-target");
    const savedMonthlyTarget = localStorage.getItem("cw-monthly-target");
    const savedHistory = localStorage.getItem("cw-history");

    if (savedOnboarding) {
      setIsOnboarded(true);
      setOnboardingData(JSON.parse(savedOnboarding));
    }
    if (savedEntry) {
      setActiveEntry(JSON.parse(savedEntry));
    }
    if (savedHabits) {
      // Check habit streaks on load
      const loadedHabits: Habit[] = JSON.parse(savedHabits);
      const todayStr = new Date().toDateString();
      const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

      const adjustedHabits = loadedHabits.map((h) => {
        if (h.lastCompletedDate) {
          if (h.lastCompletedDate === todayStr) {
            // Already completed today
            return { ...h, completedToday: true };
          } else if (h.lastCompletedDate === yesterdayStr) {
            // Completed yesterday, streak active but not completed today yet
            return { ...h, completedToday: false };
          } else {
            // Missed a day, streak resets
            return { ...h, completedToday: false, streak: 0 };
          }
        }
        return h;
      });
      setHabits(adjustedHabits);
    }
    if (savedBadges) {
      setBadges(JSON.parse(savedBadges));
    }
    if (savedChallenges) {
      setChallenges(JSON.parse(savedChallenges));
    }
    if (savedWeeklyTarget) {
      setWeeklyReductionTarget(Number(savedWeeklyTarget));
    }
    if (savedMonthlyTarget) {
      setMonthlyCO2Target(Number(savedMonthlyTarget));
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      // Generate nice historical data based on current footprint to make graphs look rich
      const initialHistory = generateMockHistory(emissionsBreakdown);
      setHistory(initialHistory);
      localStorage.setItem("cw-history", JSON.stringify(initialHistory));
    }

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state changes with localStorage
  const saveToStorage = (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const generateMockHistory = (current: EmissionsBreakdown): HistoryEntry[] => {
    // We generate data for the last 6 months showing gradual improvement
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];


    return months.map((month, idx) => {
      // Footprint decreases by 4% each month to show progress
      const factor = 1.2 - (idx * 0.04);
      const transport = Math.round(current.transport * factor);
      const electricity = Math.round(current.electricity * factor);
      const food = Math.round(current.food * factor);
      const waste = Math.round(current.waste * factor);
      const shopping = Math.round(current.shopping * factor);
      const total = transport + electricity + food + waste + shopping;
      const score = calculateCarbonScore(total).score;

      return {
        date: month,
        score,
        transport,
        electricity,
        food,
        waste,
        shopping,
        total,
      };
    });
  };

  // 1. Complete onboarding wizard
  const completeOnboarding = (data: OnboardingData) => {
    setIsOnboarded(true);
    setOnboardingData(data);
    saveToStorage("cw-onboarding-data", data);

    // Bootstrap initial active entry based on onboarding defaults
    const updatedEntry: CarbonEntry = {
      region: data.region,
      householdSize: data.householdSize,
      transport: {
        walking: data.transitType === "active" ? 15 : data.transitType === "mixed" ? 10 : 2,
        bicycle: data.transitType === "active" ? 20 : data.transitType === "mixed" ? 10 : 0,
        motorcycle: 0,
        car: data.transitType === "car" ? 250 : data.transitType === "mixed" ? 100 : 0,
        bus: data.transitType === "public" ? 80 : data.transitType === "mixed" ? 40 : 0,
        metro: data.transitType === "public" ? 50 : 0,
        train: 0,
        flight: 2500, // standard default
      },
      electricity: data.region === "US" ? 850 : data.region === "EU" ? 350 : 500,
      food: data.dietPreference,
      waste: {
        recyclingFrequency: "sometimes",
        plasticUsage: "medium",
        composting: false,
        wasteGeneration: "medium",
      },
      shopping: "medium",
    };

    setActiveEntry(updatedEntry);
    saveToStorage("cw-active-entry", updatedEntry);

    // Initial targets based on goal selection
    const initialBreakdown = calculateEmissions(updatedEntry);
    const initialMonthlyTotal = Math.round(initialBreakdown.total / 12);
    let monthlyGoal = Math.round(initialMonthlyTotal * 0.9); // default 10% reduction
    let weeklyReductionGoal = Math.round((initialBreakdown.total * 0.1) / 52);

    if (data.goalType === "20") {
      monthlyGoal = Math.round(initialMonthlyTotal * 0.8);
      weeklyReductionGoal = Math.round((initialBreakdown.total * 0.8) / 52);
    } else if (data.goalType === "neutral") {
      monthlyGoal = Math.round(initialMonthlyTotal * 0.5); // high target
      weeklyReductionGoal = Math.round((initialBreakdown.total * 0.5) / 52);
    }

    setMonthlyCO2Target(monthlyGoal);
    setWeeklyReductionTarget(weeklyReductionGoal);
    saveToStorage("cw-monthly-target", monthlyGoal);
    saveToStorage("cw-weekly-target", weeklyReductionGoal);

    // Create history
    const initialHistory = generateMockHistory(initialBreakdown);
    setHistory(initialHistory);
    saveToStorage("cw-history", initialHistory);

    // Unlock Eco Beginner badge
    unlockBadge("eco-beginner");
  };

  // 2. Update carbon active entry
  const updateCarbonEntry = (entry: CarbonEntry) => {
    setActiveEntry(entry);
    saveToStorage("cw-active-entry", entry);

    // Dynamically regenerate history based on new entries to show current month update
    const newBreakdown = calculateEmissions(entry);
    const updatedHistory = [...history];
    if (updatedHistory.length > 0) {
      const lastIdx = updatedHistory.length - 1;
      updatedHistory[lastIdx] = {
        date: "Jun", // current month
        score: calculateCarbonScore(newBreakdown.total).score,
        transport: newBreakdown.transport,
        electricity: newBreakdown.electricity,
        food: newBreakdown.food,
        waste: newBreakdown.waste,
        shopping: newBreakdown.shopping,
        total: newBreakdown.total,
      };
      setHistory(updatedHistory);
      saveToStorage("cw-history", updatedHistory);
    }

    // Badge Check: Climate Champion (Score >= 80)
    const newScore = calculateCarbonScore(newBreakdown.total).score;
    if (newScore >= 80) {
      unlockBadge("climate-champion");
    }

    // Badge Check: Zero Waste Hero
    if (entry.waste.recyclingFrequency === "always" && entry.waste.composting) {
      unlockBadge("zero-waste-hero");
    }

    // Badge Check: Transit Advocate
    const landTransitKms = entry.transport.bus + entry.transport.metro + entry.transport.train;
    if (landTransitKms >= 50 && entry.transport.car === 0) {
      unlockBadge("public-transport-pro");
    }
  };

  // 3. Toggle habits & calculate streaks
  const toggleHabit = (id: string) => {
    const todayStr = new Date().toDateString();


    const updatedHabits = habits.map((h) => {
      if (h.id === id) {
        const completed = !h.completedToday;
        let nextStreak = h.streak;

        if (completed) {
          nextStreak += 1;
          h.lastCompletedDate = todayStr;
        } else {
          nextStreak = Math.max(0, nextStreak - 1);
          h.lastCompletedDate = null;
        }

        return { ...h, completedToday: completed, streak: nextStreak };
      }
      return h;
    });

    setHabits(updatedHabits);
    saveToStorage("cw-habits", updatedHabits);

    // Count completed habits
    const totalCompleted = updatedHabits.filter(h => h.completedToday).length;

    // Badge Check: Green Explorer (complete 3 habits)
    if (totalCompleted >= 3) {
      unlockBadge("green-explorer");
    }

    // Badge Check: Sustainability Master (7 day streak + all challenges complete)
    const hasLongStreak = updatedHabits.some(h => h.streak >= 7);
    const allChallengesDone = challenges.every(c => c.completed);
    if (hasLongStreak && allChallengesDone) {
      unlockBadge("sustainability-master");
    }

    // Eco challenge update: "Recycle every day" habit integration
    if (id === "recycled-waste") {
      const isCompleted = updatedHabits.find(h => h.id === "recycled-waste")?.completedToday;
      if (isCompleted) {
        incrementChallenge("recycle-daily");
      }
    }
  };

  // 4. Increment Weekly Challenges
  const incrementChallenge = (id: string) => {
    const updatedChallenges = challenges.map((c) => {
      if (c.id === id && !c.completed) {
        const nextVal = Math.min(c.target, c.current + 1);
        const completed = nextVal === c.target;
        return { ...c, current: nextVal, completed };
      }
      return c;
    });

    setChallenges(updatedChallenges);
    saveToStorage("cw-challenges", updatedChallenges);

    // Badge Check: Sustainability Master
    const hasLongStreak = habits.some(h => h.streak >= 7);
    const allChallengesDone = updatedChallenges.every(c => c.completed);
    if (hasLongStreak && allChallengesDone) {
      unlockBadge("sustainability-master");
    }
  };

  // 5. Unlock specific Badge
  const unlockBadge = (id: string) => {
    setBadges((prevBadges) => {
      const updated = prevBadges.map((b) => {
        if (b.id === id && !b.unlocked) {
          // Play sounds/trigger confettis inside component but flag here
          return { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
        }
        return b;
      });
      saveToStorage("cw-badges", updated);
      return updated;
    });
  };

  // 6. Update Goals
  const updateGoals = (weeklyTarget: number, monthlyTarget: number) => {
    setWeeklyReductionTarget(weeklyTarget);
    setMonthlyCO2Target(monthlyTarget);
    saveToStorage("cw-weekly-target", weeklyTarget);
    saveToStorage("cw-monthly-target", monthlyTarget);
  };

  // 7. Reset all data to defaults
  const resetAllData = () => {
    localStorage.removeItem("cw-onboarding-data");
    localStorage.removeItem("cw-active-entry");
    localStorage.removeItem("cw-habits");
    localStorage.removeItem("cw-badges");
    localStorage.removeItem("cw-challenges");
    localStorage.removeItem("cw-weekly-target");
    localStorage.removeItem("cw-monthly-target");
    localStorage.removeItem("cw-history");

    setIsOnboarded(false);
    setOnboardingData(null);
    setActiveEntry(DEFAULT_ENTRY);
    setHabits(DEFAULT_HABITS);
    setBadges(INITIAL_BADGES);
    setChallenges(INITIAL_CHALLENGES);
    setWeeklyReductionTarget(15);
    setMonthlyCO2Target(400);
    setHistory(generateMockHistory(calculateEmissions(DEFAULT_ENTRY)));
  };

  return (
    <CarbonContext.Provider
      value={{
        isOnboarded,
        onboardingData,
        activeEntry,
        emissionsBreakdown,
        scoreInfo,
        weeklyReductionTarget,
        monthlyCO2Target,
        habits,
        badges,
        challenges,
        history,
        mounted,
        completeOnboarding,
        updateCarbonEntry,
        toggleHabit,
        incrementChallenge,
        updateGoals,
        resetAllData,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
}

export function useCarbon() {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error("useCarbon must be used within a CarbonProvider");
  }
  return context;
}
