"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  CarbonEntry,
  calculateEmissions,
  DEFAULT_ENTRY,
  EmissionsBreakdown,
  DataQualityInfo,
  getDataQualityInfo,
  getSeededEntryFromOnboarding,
  getGoalsFromOnboarding,
} from "../utils/carbonCalculations";
import { calculateCarbonScore, ScoreInfo } from "../utils/scoreGenerator";
import { Badge, INITIAL_BADGES } from "../utils/achievements";
import { Challenge } from "../utils/challenges";
import { useToast } from "@/components/ui/Toast";

export interface OnboardingData {
  region: string;
  householdSize: number;
  transitType: "car" | "public" | "active" | "mixed";
  dietPreference: "vegan" | "vegetarian" | "mixed" | "meat-heavy";
  goalType: "10" | "20" | "neutral";
  // Upgrades
  ageGroup: "under-18" | "18-24" | "25-44" | "45-64" | "65+";
  occupation: "student" | "employed" | "unemployed" | "retired";
  commuteStyle: "drive" | "transit" | "active" | "hybrid" | "remote";
  homeOwnership: "own" | "rent";
  renewableEnergy: "yes" | "no";
  priorities: "emissions" | "cost" | "diet" | "habits";
}

export interface Habit {
  id: string;
  name: string;
  completedToday: boolean;
  streak: number;
  lastCompletedDate: string | null;
}

export interface HistorySubmission {
  timestamp: string;
  entry: CarbonEntry;
  emissions: EmissionsBreakdown;
  score: number;
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
  historySubmissions: HistorySubmission[];
  rollingAverage: number;
  improvementPercentage: number;
  previousBreakdown: EmissionsBreakdown | null;
  dataQuality: DataQualityInfo;
  mounted: boolean;
  completeOnboarding: (data: OnboardingData) => void;
  updateCarbonEntry: (entry: CarbonEntry) => void;
  toggleHabit: (id: string) => void;
  incrementChallenge: (id: string) => void;
  updateGoals: (weeklyTarget: number, monthlyTarget: number) => void;
  resetAllData: () => void;
  regenerateChallenges: () => void;
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

// Tailored weekly challenges by category
const CATEGORY_CHALLENGES: Record<string, Omit<Challenge, "completed" | "current">[]> = {
  transport: [
    { id: "walk-10km", title: "Walk 10 km", description: "Replace driving with walking for short trips this week.", target: 10, category: "transport", co2Saved: 18 },
    { id: "skip-car-trip", title: "Skip 2 Car Trips", description: "Opt for transit, cycling, or working from home twice.", target: 2, category: "transport", co2Saved: 10 },
    { id: "use-bus-metro", title: "Use Public Transit 3 Times", description: "Take the bus or subway for your commute instead of a car.", target: 3, category: "transport", co2Saved: 15 },
    { id: "cycle-ride", title: "Bicycle to Work or Shop", description: "Ride your bicycle for a commute once this week.", target: 1, category: "transport", co2Saved: 8 },
    { id: "carpool", title: "Carpool with Colleagues", description: "Coordinate and share a ride with a coworker or friend.", target: 1, category: "transport", co2Saved: 6 },
  ],
  energy: [
    { id: "unplug-vampires", title: "Unplug Idle Devices", description: "Unplug consoles, chargers, and devices before bed.", target: 7, category: "energy", co2Saved: 8 },
    { id: "cold-wash", title: "Eco Laundry Wash", description: "Wash clothes on cold settings twice this week.", target: 2, category: "energy", co2Saved: 6 },
    { id: "thermostat-adjust", title: "Adjust Thermostat Settings", description: "Keep HVAC adjusted by 2°F to save power for 5 days.", target: 5, category: "energy", co2Saved: 12 },
    { id: "lights-off", title: "Turn Off Office/Room Lights", description: "Consciously switch off empty room lights daily.", target: 7, category: "energy", co2Saved: 4 },
    { id: "air-dry", title: "Air-Dry Your Laundry", description: "Hang dry clothes instead of running the tumble dryer.", target: 2, category: "energy", co2Saved: 10 },
  ],
  food: [
    { id: "veg-days", title: "Vegetarian meals 3 Times", description: "Substitute meat meals with plant-based choices thrice.", target: 3, category: "food", co2Saved: 18 },
    { id: "zero-waste-food", title: "No Food Waste Week", description: "Consciously buy only needed foods and eat all leftovers.", target: 5, category: "food", co2Saved: 10 },
    { id: "local-food", title: "Buy From Local Farm Market", description: "Shop agricultural foods locally to reduce food miles.", target: 1, category: "food", co2Saved: 5 },
    { id: "vegan-day", title: "Go Vegan For a Day", description: "Consume 100% plant-based food for a single day.", target: 1, category: "food", co2Saved: 8 },
    { id: "meal-prep", title: "Plan Weekly Meals", description: "Coordinate your grocery shopping list to avoid decay waste.", target: 1, category: "food", co2Saved: 4 },
  ],
  waste: [
    { id: "compost-scraps", title: "Compost Organic Waste", description: "Separate all kitchen food scraps for composting.", target: 7, category: "waste", co2Saved: 10 },
    { id: "zero-plastic", title: "No Plastic Shopping Bags", description: "Use canvas tote bags for shopping for 7 days.", target: 7, category: "waste", co2Saved: 6 },
    { id: "sort-recycling", title: "Sort Glass and Paper Daily", description: "Sort recyclable products before disposal.", target: 7, category: "waste", co2Saved: 8 },
    { id: "reusable-containers", title: "Pack Reusable Lunch Box", description: "Avoid plastic wrap/foils for work lunches 4 times.", target: 4, category: "waste", co2Saved: 5 },
    { id: "repair-item", title: "Repair a Broken Household Item", description: "Fix clothing or devices rather than throwing them away.", target: 1, category: "waste", co2Saved: 15 },
  ],
  shopping: [
    { id: "impulse-lock", title: "Zero Impulse Purchases", description: "Wait 48 hours before purchasing any non-essential items.", target: 7, category: "shopping", co2Saved: 15 },
    { id: "thrift-shop", title: "Explore Secondhand Shopping", description: "Buy a needed item pre-owned rather than brand new.", target: 1, category: "shopping", co2Saved: 20 },
    { id: "unsub-item", title: "Cancel Unused Subscriptions", description: "Unsubscribe from digital/material delivery lists.", target: 1, category: "shopping", co2Saved: 5 },
    { id: "borrow-item", title: "Borrow Instead of Buying", description: "Borrow a device or tool from neighbors/libraries.", target: 1, category: "shopping", co2Saved: 12 },
    { id: "donate-items", title: "Donate 3 Unused Clothes", description: "Give away unneeded outfits to extend circular lifecycle.", target: 3, category: "shopping", co2Saved: 10 },
  ],
};

export function CarbonProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const lastSerialized = useRef<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [activeEntry, setActiveEntry] = useState<CarbonEntry>(DEFAULT_ENTRY);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [weeklyReductionTarget, setWeeklyReductionTarget] = useState(25);
  const [monthlyCO2Target, setMonthlyCO2Target] = useState(400);

  // Upgrade: Persistence of submissions
  const [historySubmissions, setHistorySubmissions] = useState<HistorySubmission[]>([]);

  // Derived States
  const emissionsBreakdown = useMemo(() => calculateEmissions(activeEntry), [activeEntry]);
  const scoreInfo = useMemo(() => calculateCarbonScore(emissionsBreakdown.total), [emissionsBreakdown.total]);
  const dataQuality = useMemo(() => getDataQualityInfo(activeEntry), [activeEntry]);

  // Map submissions list to HistoryEntry[] for graph plotting
  const history: HistoryEntry[] = useMemo(() => {
    return historySubmissions.map((sub) => {
      const d = new Date(sub.timestamp);
      const dateStr = d.toLocaleString("default", { month: "short" });
      return {
        date: dateStr,
        score: sub.score,
        transport: sub.emissions.transport,
        electricity: sub.emissions.electricity,
        food: sub.emissions.food,
        waste: sub.emissions.waste,
        shopping: sub.emissions.shopping,
        total: sub.emissions.total,
      };
    });
  }, [historySubmissions]);

  // Calculate rolling average
  const rollingAverage = useMemo(() => {
    return historySubmissions.length > 0
      ? Math.round(historySubmissions.reduce((sum, s) => sum + s.emissions.total, 0) / historySubmissions.length)
      : emissionsBreakdown.total;
  }, [historySubmissions, emissionsBreakdown.total]);

  // Calculate improvement percentage vs first submission
  const improvementPercentage = useMemo(() => {
    if (historySubmissions.length > 1) {
      const firstTotal = historySubmissions[0].emissions.total;
      const latestTotal = historySubmissions[historySubmissions.length - 1].emissions.total;
      return firstTotal > 0 ? Math.round(((firstTotal - latestTotal) / firstTotal) * 100) : 0;
    }
    return 0;
  }, [historySubmissions]);

  // Fetch previous category breakdown (for previous vs current comparison)
  const previousBreakdown = useMemo(() => {
    return historySubmissions.length > 1
      ? historySubmissions[historySubmissions.length - 2].emissions
      : null;
  }, [historySubmissions]);

  useEffect(() => {
    const savedOnboarding = localStorage.getItem("cw-onboarding-data");
    const savedEntry = localStorage.getItem("cw-active-entry");
    const savedHabits = localStorage.getItem("cw-habits");
    const savedBadges = localStorage.getItem("cw-badges");
    const savedChallenges = localStorage.getItem("cw-challenges");
    const savedWeeklyTarget = localStorage.getItem("cw-weekly-target");
    const savedMonthlyTarget = localStorage.getItem("cw-monthly-target");
    const savedSubmissions = localStorage.getItem("cw-history-submissions");

    if (savedOnboarding) {
      setIsOnboarded(true);
      setOnboardingData(JSON.parse(savedOnboarding));
      lastSerialized.current["cw-onboarding-data"] = savedOnboarding;
    }
    if (savedEntry) {
      setActiveEntry(JSON.parse(savedEntry));
      lastSerialized.current["cw-active-entry"] = savedEntry;
    }
    if (savedWeeklyTarget) {
      setWeeklyReductionTarget(Number(savedWeeklyTarget));
      lastSerialized.current["cw-weekly-target"] = savedWeeklyTarget;
    }
    if (savedMonthlyTarget) {
      setMonthlyCO2Target(Number(savedMonthlyTarget));
      lastSerialized.current["cw-monthly-target"] = savedMonthlyTarget;
    }

    if (savedSubmissions) {
      setHistorySubmissions(JSON.parse(savedSubmissions));
      lastSerialized.current["cw-history-submissions"] = savedSubmissions;
    }

    // Sync habits and streaks
    if (savedHabits) {
      const loadedHabits: Habit[] = JSON.parse(savedHabits);
      const todayStr = new Date().toDateString();
      const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

      const adjustedHabits = loadedHabits.map((h) => {
        if (h.lastCompletedDate) {
          if (h.lastCompletedDate === todayStr) {
            return { ...h, completedToday: true };
          } else if (h.lastCompletedDate === yesterdayStr) {
            return { ...h, completedToday: false };
          } else {
            return { ...h, completedToday: false, streak: 0 };
          }
        }
        return h;
      });
      setHabits(adjustedHabits);
      lastSerialized.current["cw-habits"] = savedHabits;
    }

    if (savedChallenges) {
      setChallenges(JSON.parse(savedChallenges));
      lastSerialized.current["cw-challenges"] = savedChallenges;
    }

    if (savedBadges) {
      setBadges(JSON.parse(savedBadges));
      lastSerialized.current["cw-badges"] = savedBadges;
    }

    setMounted(true);
  }, []);

  const saveToStorage = useCallback((key: string, value: unknown) => {
    try {
      const serialized = JSON.stringify(value);
      if (lastSerialized.current[key] === serialized) {
        return;
      }
      lastSerialized.current[key] = serialized;
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.error(`Error saving to localStorage: ${key}`, err);
    }
  }, []);

  // Generate historical submission database mock
  const generateMockSubmissions = (current: EmissionsBreakdown, entry: CarbonEntry): HistorySubmission[] => {
    const monthsBack = 5;
    const list: HistorySubmission[] = [];

    for (let i = monthsBack; i > 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      // Decreasing footprint from earlier months
      const factor = 1.15 - (monthsBack - i) * 0.03;
      const transport = Math.round(current.transport * factor);
      const electricity = Math.round(current.electricity * factor);
      const food = Math.round(current.food * factor);
      const waste = Math.round(current.waste * factor);
      const shopping = Math.round(current.shopping * factor);
      const total = transport + electricity + food + waste + shopping;
      const score = calculateCarbonScore(total).score;

      list.push({
        timestamp: date.toISOString(),
        entry: { ...entry },
        emissions: { transport, electricity, food, waste, shopping, total },
        score,
      });
    }

    // Current entry as the latest submission
    list.push({
      timestamp: new Date().toISOString(),
      entry: { ...entry },
      emissions: { ...current },
      score: calculateCarbonScore(current.total).score,
    });

    return list;
  };

  // Dynamically recalculate badge progress numbers
  const updateBadgeProgressList = useCallback((
    currentBadges: Badge[],
    entry: CarbonEntry,
    score: number,
    habitList: Habit[],
    challengeList: Challenge[]
  ): Badge[] => {
    return currentBadges.map((b) => {
      let progress = 0;
      const target = b.targetProgress;
      let unlocked = b.unlocked;

      switch (b.id) {
        case "eco-beginner":
          progress = isOnboarded ? 1 : 0;
          unlocked = progress >= target;
          break;
        case "green-explorer":
          progress = habitList.filter((h) => h.completedToday).length;
          unlocked = unlocked || progress >= target;
          break;
        case "climate-champion":
          progress = score;
          unlocked = unlocked || progress >= target;
          break;
        case "zero-waste-hero":
          const recyclePt = entry.waste.recyclingFrequency === "always" ? 1 : 0;
          const compostPt = entry.waste.composting ? 1 : 0;
          progress = recyclePt + compostPt;
          unlocked = unlocked || progress >= target;
          break;
        case "public-transport-pro":
          const transitKms = entry.transport.bus + entry.transport.metro + entry.transport.train;
          progress = entry.transport.car === 0 ? Math.min(50, transitKms) : 0;
          unlocked = unlocked || (progress >= target && entry.transport.car === 0);
          break;
        case "sustainability-master":
          const maxStreak = Math.max(...habitList.map((h) => h.streak), 0);
          const challengesDone = challengeList.every((c) => c.completed);
          progress = challengesDone ? Math.min(7, maxStreak) : 0;
          unlocked = unlocked || (progress >= target && challengesDone);
          break;
      }

      return {
        ...b,
        currentProgress: progress,
        unlocked,
        unlockedAt: unlocked && !b.unlocked ? new Date().toLocaleDateString() : b.unlockedAt,
      };
    });
  }, [isOnboarded]);

  // Load weekly challenges adapted to worst category
  const getAdaptedChallenges = (worst: string): Challenge[] => {
    const list = CATEGORY_CHALLENGES[worst] || CATEGORY_CHALLENGES.transport;
    return list.map((c) => ({
      ...c,
      current: 0,
      completed: false,
    }));
  };

  const regenerateChallenges = useCallback(() => {
    // Determine weakest category
    const cats = [
      { id: "transport", value: emissionsBreakdown.transport },
      { id: "energy", value: emissionsBreakdown.electricity },
      { id: "food", value: emissionsBreakdown.food },
      { id: "waste", value: emissionsBreakdown.waste },
      { id: "shopping", value: emissionsBreakdown.shopping },
    ];
    const sorted = [...cats].sort((a, b) => b.value - a.value);
    const worstCat = sorted[0].id;

    const newChallenges = getAdaptedChallenges(worstCat);
    setChallenges(newChallenges);
    saveToStorage("cw-challenges", newChallenges);
    toast("Weekly challenges adapted to your weakest category!", "info");
  }, [emissionsBreakdown, toast, saveToStorage]);

  // 1. Complete onboarding wizard
  const completeOnboarding = useCallback((data: OnboardingData) => {
    setIsOnboarded(true);
    setOnboardingData(data);
    saveToStorage("cw-onboarding-data", data);

    // Seed preset active entry based on onboarding defaults
    const updatedEntry = getSeededEntryFromOnboarding(data);

    setActiveEntry(updatedEntry);
    saveToStorage("cw-active-entry", updatedEntry);

    const initialBreakdown = calculateEmissions(updatedEntry);

    // Seed historical submissions list
    const mockSubs = generateMockSubmissions(initialBreakdown, updatedEntry);
    setHistorySubmissions(mockSubs);
    saveToStorage("cw-history-submissions", mockSubs);

    // Seed targets
    const { monthlyGoal, weeklyReductionGoal } = getGoalsFromOnboarding(data, initialBreakdown.total);

    setMonthlyCO2Target(monthlyGoal);
    setWeeklyReductionTarget(weeklyReductionGoal);
    saveToStorage("cw-monthly-target", monthlyGoal);
    saveToStorage("cw-weekly-target", weeklyReductionGoal);

    // Load adapted challenges based on highest seeded category
    const cats = [
      { id: "transport", value: initialBreakdown.transport },
      { id: "energy", value: initialBreakdown.electricity },
      { id: "food", value: initialBreakdown.food },
      { id: "waste", value: initialBreakdown.waste },
      { id: "shopping", value: initialBreakdown.shopping },
    ];
    const sorted = [...cats].sort((a, b) => b.value - a.value);
    const worst = sorted[0].id;
    const initialChallenges = getAdaptedChallenges(worst);
    setChallenges(initialChallenges);
    saveToStorage("cw-challenges", initialChallenges);

    // Recalculate badges progress
    const updatedBadges = updateBadgeProgressList(
      INITIAL_BADGES,
      updatedEntry,
      calculateCarbonScore(initialBreakdown.total).score,
      habits,
      initialChallenges
    );
    setBadges(updatedBadges);
    saveToStorage("cw-badges", updatedBadges);
  }, [habits, updateBadgeProgressList, saveToStorage]);

  // 2. Update carbon active entry (Tracker form submit)
  const updateCarbonEntry = useCallback((entry: CarbonEntry) => {
    setActiveEntry(entry);
    saveToStorage("cw-active-entry", entry);

    const newBreakdown = calculateEmissions(entry);
    const score = calculateCarbonScore(newBreakdown.total).score;

    // Log tracker entry in historical submissions
    const newSubmission: HistorySubmission = {
      timestamp: new Date().toISOString(),
      entry: { ...entry },
      emissions: { ...newBreakdown },
      score,
    };

    setHistorySubmissions((prevSubs) => {
      const updatedSubs = [...prevSubs, newSubmission];
      if (updatedSubs.length > 12) {
        updatedSubs.shift();
      }
      saveToStorage("cw-history-submissions", updatedSubs);
      return updatedSubs;
    });

    // Re-check challenges category (if worst category has changed, load adapted challenges)
    const cats = [
      { id: "transport", value: newBreakdown.transport },
      { id: "energy", value: newBreakdown.electricity },
      { id: "food", value: newBreakdown.food },
      { id: "waste", value: newBreakdown.waste },
      { id: "shopping", value: newBreakdown.shopping },
    ];
    const sorted = [...cats].sort((a, b) => b.value - a.value);
    const worst = sorted[0].id;

    setChallenges((prevChallenges) => {
      let currentChallenges = [...prevChallenges];
      if (prevChallenges.length === 0 || prevChallenges[0].category !== worst) {
        currentChallenges = getAdaptedChallenges(worst);
        saveToStorage("cw-challenges", currentChallenges);
      }
      
      // Dynamic Badge checks
      setBadges((prevBadges) => {
        const updatedBadges = updateBadgeProgressList(prevBadges, entry, score, habits, currentChallenges);
        saveToStorage("cw-badges", updatedBadges);
        return updatedBadges;
      });

      return currentChallenges;
    });
  }, [habits, updateBadgeProgressList, saveToStorage]);

  // 4. Increment Weekly Challenges
  const incrementChallenge = useCallback((id: string) => {
    setChallenges((prevChallenges) => {
      const updatedChallenges = prevChallenges.map((c) => {
        if (c.id === id && !c.completed) {
          const nextVal = Math.min(c.target, c.current + 1);
          const completed = nextVal === c.target;
          return { ...c, current: nextVal, completed };
        }
        return c;
      });
      saveToStorage("cw-challenges", updatedChallenges);

      // Update Badge Progress
      setBadges((prevBadges) => {
        const score = calculateCarbonScore(emissionsBreakdown.total).score;
        const updatedBadges = updateBadgeProgressList(prevBadges, activeEntry, score, habits, updatedChallenges);
        saveToStorage("cw-badges", updatedBadges);
        return updatedBadges;
      });

      return updatedChallenges;
    });
  }, [emissionsBreakdown.total, activeEntry, habits, updateBadgeProgressList, saveToStorage]);

  // 3. Toggle habits
  const toggleHabit = useCallback((id: string) => {
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

    // Update challenges progress if linked
    if (id === "recycled-waste") {
      const isCompleted = updatedHabits.find((h) => h.id === "recycled-waste")?.completedToday;
      if (isCompleted) {
        incrementChallenge("recycle-daily");
      }
    }

    // Update Badge Progress
    const score = calculateCarbonScore(emissionsBreakdown.total).score;
    const updatedBadges = updateBadgeProgressList(badges, activeEntry, score, updatedHabits, challenges);
    setBadges(updatedBadges);
    saveToStorage("cw-badges", updatedBadges);
  }, [habits, badges, activeEntry, emissionsBreakdown.total, challenges, incrementChallenge, updateBadgeProgressList, saveToStorage]);

  // 5. Update Goals
  const updateGoals = useCallback((weeklyTarget: number, monthlyTarget: number) => {
    setWeeklyReductionTarget(weeklyTarget);
    setMonthlyCO2Target(monthlyTarget);
    saveToStorage("cw-weekly-target", weeklyTarget);
    saveToStorage("cw-monthly-target", monthlyTarget);
  }, [saveToStorage]);

  // 6. Reset all data
  const resetAllData = useCallback(() => {
    localStorage.removeItem("cw-onboarding-data");
    localStorage.removeItem("cw-active-entry");
    localStorage.removeItem("cw-habits");
    localStorage.removeItem("cw-badges");
    localStorage.removeItem("cw-challenges");
    localStorage.removeItem("cw-weekly-target");
    localStorage.removeItem("cw-monthly-target");
    localStorage.removeItem("cw-history-submissions");

    setIsOnboarded(false);
    setOnboardingData(null);
    setActiveEntry(DEFAULT_ENTRY);
    setHabits(DEFAULT_HABITS);
    setBadges(INITIAL_BADGES);
    setChallenges([]);
    setWeeklyReductionTarget(25);
    setMonthlyCO2Target(400);
    setHistorySubmissions([]);
  }, []);

  const contextValue = useMemo(() => ({
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
    historySubmissions,
    rollingAverage,
    improvementPercentage,
    previousBreakdown,
    dataQuality,
    mounted,
    completeOnboarding,
    updateCarbonEntry,
    toggleHabit,
    incrementChallenge,
    updateGoals,
    resetAllData,
    regenerateChallenges,
  }), [
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
    historySubmissions,
    rollingAverage,
    improvementPercentage,
    previousBreakdown,
    dataQuality,
    mounted,
    completeOnboarding,
    updateCarbonEntry,
    toggleHabit,
    incrementChallenge,
    updateGoals,
    resetAllData,
    regenerateChallenges,
  ]);

  return (
    <CarbonContext.Provider value={contextValue}>
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
