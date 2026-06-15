"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCarbon } from "@/context/CarbonContext";
import { useToast } from "@/components/ui/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { REGIONS } from "@/utils/regions";
import { calculateEmissions, CarbonEntry } from "@/utils/carbonCalculations";
import { calculateCarbonScore } from "@/utils/scoreGenerator";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Zap,
  Utensils,
  Trash2,
  ShoppingBag,
  Info,
  CheckCircle,
  TreePine,
} from "lucide-react";

// Form Validation Schema
const trackerSchema = z.object({
  region: z.string(),
  householdSize: z.coerce.number().min(1, "Must be at least 1 person"),
  // Transportation (km/week)
  walking: z.coerce.number().min(0, "Must be at least 0"),
  bicycle: z.coerce.number().min(0, "Must be at least 0"),
  motorcycle: z.coerce.number().min(0, "Must be at least 0"),
  car: z.coerce.number().min(0, "Must be at least 0"),
  bus: z.coerce.number().min(0, "Must be at least 0"),
  metro: z.coerce.number().min(0, "Must be at least 0"),
  train: z.coerce.number().min(0, "Must be at least 0"),
  flight: z.coerce.number().min(0, "Must be at least 0"), // km/year
  // Electricity
  electricity: z.coerce.number().min(0, "Must be at least 0"), // monthly kWh
  // Food
  food: z.enum(["vegan", "vegetarian", "mixed", "meat-heavy"]),
  // Waste
  recyclingFrequency: z.enum(["always", "sometimes", "never"]),
  plasticUsage: z.enum(["low", "medium", "high"]),
  composting: z.boolean(),
  wasteGeneration: z.enum(["low", "medium", "high"]),
  // Shopping
  shopping: z.enum(["low", "medium", "high"]),
});

type FormValues = z.infer<typeof trackerSchema>;

export default function CarbonTracker() {
  const router = useRouter();
  const { activeEntry, updateCarbonEntry } = useCarbon();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"transit" | "energy" | "food" | "waste" | "shopping">("transit");

  // Initialize form with active entry from Context
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(trackerSchema),
    defaultValues: {
      region: activeEntry.region,
      householdSize: activeEntry.householdSize,
      walking: activeEntry.transport.walking,
      bicycle: activeEntry.transport.bicycle,
      motorcycle: activeEntry.transport.motorcycle,
      car: activeEntry.transport.car,
      bus: activeEntry.transport.bus,
      metro: activeEntry.transport.metro,
      train: activeEntry.transport.train,
      flight: activeEntry.transport.flight,
      electricity: activeEntry.electricity,
      food: activeEntry.food,
      recyclingFrequency: activeEntry.waste.recyclingFrequency,
      plasticUsage: activeEntry.waste.plasticUsage,
      composting: activeEntry.waste.composting,
      wasteGeneration: activeEntry.waste.wasteGeneration,
      shopping: activeEntry.shopping,
    },
  });

  // Watch form values in real time to calculate emissions live
  const watchedValues = useWatch({ control });

  // Map form values to CarbonEntry for calculation
  const getLiveEntry = (): CarbonEntry => {
    return {
      region: watchedValues.region || "GLOBAL",
      householdSize: Number(watchedValues.householdSize) || 1,
      transport: {
        walking: Number(watchedValues.walking) || 0,
        bicycle: Number(watchedValues.bicycle) || 0,
        motorcycle: Number(watchedValues.motorcycle) || 0,
        car: Number(watchedValues.car) || 0,
        bus: Number(watchedValues.bus) || 0,
        metro: Number(watchedValues.metro) || 0,
        train: Number(watchedValues.train) || 0,
        flight: Number(watchedValues.flight) || 0,
      },
      electricity: Number(watchedValues.electricity) || 0,
      food: watchedValues.food || "mixed",
      waste: {
        recyclingFrequency: watchedValues.recyclingFrequency || "sometimes",
        plasticUsage: watchedValues.plasticUsage || "medium",
        composting: !!watchedValues.composting,
        wasteGeneration: watchedValues.wasteGeneration || "medium",
      },
      shopping: watchedValues.shopping || "medium",
    };
  };

  const liveEntry = getLiveEntry();
  const liveEmissions = calculateEmissions(liveEntry);
  const liveScoreInfo = calculateCarbonScore(liveEmissions.total);

  const onSubmit = (data: FormValues) => {
    const entry: CarbonEntry = {
      region: data.region,
      householdSize: data.householdSize,
      transport: {
        walking: data.walking,
        bicycle: data.bicycle,
        motorcycle: data.motorcycle,
        car: data.car,
        bus: data.bus,
        metro: data.metro,
        train: data.train,
        flight: data.flight,
      },
      electricity: data.electricity,
      food: data.food,
      waste: {
        recyclingFrequency: data.recyclingFrequency,
        plasticUsage: data.plasticUsage,
        composting: data.composting,
        wasteGeneration: data.wasteGeneration,
      },
      shopping: data.shopping,
    };

    updateCarbonEntry(entry);
    toast("Sustainability profile saved successfully!", "success");

    // Success fireworks
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#34d399", "#a3e635"],
    });

    router.push("/dashboard");
  };

  const tabs = [
    { id: "transit", label: "Transportation", icon: Car },
    { id: "energy", label: "Electricity", icon: Zap },
    { id: "food", label: "Food Habits", icon: Utensils },
    { id: "waste", label: "Waste Management", icon: Trash2 },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6 mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Log Carbon Emissions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-2xl">
            Update your daily travel distance, household energy statements, waste recycling routines, and purchasing habits to adjust your carbon score.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL: TABS & INPUTS */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tab Buttons */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as "transit" | "energy" | "food" | "waste" | "shopping")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Inputs Body */}
            <div className="glass-card p-6 sm:p-8 space-y-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* 1. TRANSPORT TABS */}
                {activeTab === "transit" && (
                  <motion.div
                    key="transit-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                      <h2 className="font-bold text-lg text-zinc-950 dark:text-zinc-100">Transportation Details</h2>
                      <span className="text-xs text-zinc-400">Weekly ground distance & Annual flight distance</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Car */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Car (Petrol/Diesel)
                          <span className="text-[10px] text-zinc-400 font-normal">km / week</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("car")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                        {errors.car && <span className="text-xs text-red-500">{errors.car.message}</span>}
                      </div>

                      {/* Bus */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Public Bus
                          <span className="text-[10px] text-zinc-400 font-normal">km / week</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("bus")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                        {errors.bus && <span className="text-xs text-red-500">{errors.bus.message}</span>}
                      </div>

                      {/* Metro / Subway */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Subway / Metro / Tram
                          <span className="text-[10px] text-zinc-400 font-normal">km / week</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("metro")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                        {errors.metro && <span className="text-xs text-red-500">{errors.metro.message}</span>}
                      </div>

                      {/* Train */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Intercity Train
                          <span className="text-[10px] text-zinc-400 font-normal">km / week</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("train")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                        {errors.train && <span className="text-xs text-red-500">{errors.train.message}</span>}
                      </div>

                      {/* Motorcycle */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Motorcycle / Moped
                          <span className="text-[10px] text-zinc-400 font-normal">km / week</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("motorcycle")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                        {errors.motorcycle && <span className="text-xs text-red-500">{errors.motorcycle.message}</span>}
                      </div>

                      {/* Flight */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Flights / Air Travel
                          <span className="text-[10px] text-zinc-400 font-normal">km / year</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("flight")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                        {errors.flight && <span className="text-xs text-red-500">{errors.flight.message}</span>}
                      </div>

                      {/* Walking */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Walking / Foot travel
                          <span className="text-[10px] text-zinc-400 font-normal">km / week</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("walking")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                      </div>

                      {/* Bicycle */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          Bicycle / Cycling
                          <span className="text-[10px] text-zinc-400 font-normal">km / week</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register("bicycle")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. ENERGY TABS */}
                {activeTab === "energy" && (
                  <motion.div
                    key="energy-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                      <h2 className="font-bold text-lg text-zinc-950 dark:text-zinc-100">Electricity & Region Setup</h2>
                      <span className="text-xs text-zinc-400">Monthly utility parameters</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Region Selection */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Region Setup</label>
                        <select
                          {...register("region")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        >
                          {Object.values(REGIONS).map((reg) => (
                            <option key={reg.id} value={reg.id}>
                              {reg.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Household Size */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Household Size</label>
                        <input
                          type="number"
                          {...register("householdSize")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Monthly Electricity */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                        Monthly Electricity Consumption
                        <span className="text-[10px] text-zinc-400 font-normal">kWh / month</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        {...register("electricity")}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                      />
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Refer to your electric bill. Electricity emissions are calculated using regional carbon coefficients and divided across your household members.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 3. FOOD TABS */}
                {activeTab === "food" && (
                  <motion.div
                    key="food-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                      <h2 className="font-bold text-lg text-zinc-950 dark:text-zinc-100">Dietary Profile</h2>
                      <span className="text-xs text-zinc-400">Dietary carbon scale</span>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                        Select your diet profile:
                      </label>

                      {[
                        { id: "vegan", label: "Vegan", desc: "No animal products. Highly sustainable.", emissions: "1.5 kg CO₂ / day" },
                        { id: "vegetarian", label: "Vegetarian", desc: "No meat, poultry or fish. Includes dairy & eggs.", emissions: "2.0 kg CO₂ / day" },
                        { id: "mixed", label: "Mixed Diet (Average)", desc: "Average consumption of vegetables, grains, and meats.", emissions: "4.7 kg CO₂ / day" },
                        { id: "meat-heavy", label: "Meat-Heavy Diet", desc: "Regular beef, lamb, pork, or dairy products.", emissions: "7.2 kg CO₂ / day" },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${
                            watchedValues.food === item.id
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <input
                            type="radio"
                            value={item.id}
                            {...register("food")}
                            className="mr-3 mt-1 accent-emerald-500"
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                            <div>
                              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                                {item.label}
                              </span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                                {item.desc}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-0">
                              {item.emissions}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. WASTE TABS */}
                {activeTab === "waste" && (
                  <motion.div
                    key="waste-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                      <h2 className="font-bold text-lg text-zinc-950 dark:text-zinc-100">Waste & Composting</h2>
                      <span className="text-xs text-zinc-400">Waste reduction modifiers</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Recycling Frequency */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Recycling Frequency</label>
                        <select
                          {...register("recyclingFrequency")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        >
                          <option value="always">Always (Recycle all paper, plastics, glass)</option>
                          <option value="sometimes">Sometimes (Occasional recycling)</option>
                          <option value="never">Never (Throw everything in general trash)</option>
                        </select>
                      </div>

                      {/* Plastic Usage */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Plastic Usage</label>
                        <select
                          {...register("plasticUsage")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        >
                          <option value="low">Low (Avoid single-use plastics entirely)</option>
                          <option value="medium">Medium (Moderate usage)</option>
                          <option value="high">High (Heavy single-use plastic reliance)</option>
                        </select>
                      </div>

                      {/* Waste Generation */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Waste Generation</label>
                        <select
                          {...register("wasteGeneration")}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        >
                          <option value="low">Low (Conscious minimal waste household)</option>
                          <option value="medium">Medium (Standard garbage volume)</option>
                          <option value="high">High (Excessive household trash bags)</option>
                        </select>
                      </div>

                      {/* Composting */}
                      <div className="flex items-center gap-3.5 pt-4">
                        <input
                          type="checkbox"
                          id="composting"
                          {...register("composting")}
                          className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="composting" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                          We compost food waste at home
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. SHOPPING TABS */}
                {activeTab === "shopping" && (
                  <motion.div
                    key="shopping-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                      <h2 className="font-bold text-lg text-zinc-950 dark:text-zinc-100">Shopping Habits</h2>
                      <span className="text-xs text-zinc-400">Monthly purchasing carbon profile</span>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                        Select your typical monthly purchasing volume (clothes, electronics, appliances):
                      </label>

                      {[
                        { id: "low", label: "Low", desc: "Rarely buy new items. Prefer thrift stores and repairs.", emissions: "150 kg CO₂ / year" },
                        { id: "medium", label: "Medium", desc: "Occasional purchases of clothing, devices, and home goods.", emissions: "450 kg CO₂ / year" },
                        { id: "high", label: "High", desc: "Frequent buying, upgrading electronics and fashion items.", emissions: "1,000 kg CO₂ / year" },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${
                            watchedValues.shopping === item.id
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <input
                            type="radio"
                            value={item.id}
                            {...register("shopping")}
                            className="mr-3 mt-1 accent-emerald-500"
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                            <div>
                              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                                {item.label}
                              </span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                                {item.desc}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-0">
                              {item.emissions}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action controls */}
            <div className="flex items-center justify-between sm:justify-end gap-3.5">
              <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" variant="accent">
                Save & Update Profile
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE SUMMARY CARD */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden border-emerald-500/10">
              {/* Highlight green gradient background */}
              <div className="absolute top-[-30%] right-[-30%] w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50">Live Footprint Summary</h3>
                <p className="text-xs text-zinc-400">Calculated in real-time as you enter data</p>
              </div>

              {/* Emissions breakdown display */}
              <div className="space-y-4 pt-2">
                <div className="flex items-baseline justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Annual Footprint:</span>
                  <span className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                    {liveEmissions.total.toLocaleString()} <span className="text-xs font-semibold text-zinc-400">kg CO₂</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40 text-center">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Monthly Avg</span>
                    <span className="block text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {Math.round(liveEmissions.total / 12).toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">kg</span>
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40 text-center">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">Daily Avg</span>
                    <span className="block text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {Math.round(liveEmissions.total / 365).toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">kg</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Score breakdown indicator */}
              <div className="p-4 rounded-xl border flex gap-3.5 items-start bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/40">
                <div className={`px-3 py-2.5 rounded-xl border font-bold text-xl flex items-center justify-center ${liveScoreInfo.bgClass} ${liveScoreInfo.colorClass}`}>
                  {liveScoreInfo.score}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Live Carbon Score:</span>
                    <span className={`text-xs font-extrabold uppercase ${liveScoreInfo.colorClass}`}>{liveScoreInfo.band}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">{liveScoreInfo.description}</p>
                </div>
              </div>

              {/* Carbon equivalents calculator */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <TreePine className="h-4 w-4 text-emerald-500" />
                  Your Environmental Equivalent
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-zinc-500 dark:text-zinc-400">Trees required to offset (annually)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round(liveEmissions.total / 22)} seedlings
                    </span>
                  </div>
                </div>
              </div>

              {/* Fact Explainer Tooltip list */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-zinc-400" />
                  Calculation Explanations
                </h4>
                <div className="space-y-1.5">
                  {[
                    { id: "car", label: "Car Factor", desc: "Estimated average petrol car emissions are 0.180 kg CO₂ per km." },
                    { id: "electricity", label: "Grid Energy", desc: `Calibrated for region selected (${watchedValues.region || "GLOBAL"}). Factored per household member.` },
                    { id: "food", label: "Food Footprint", desc: "Based on dietary supply chains, agricultural methane, and logistics." },
                  ].map((tip) => (
                    <div key={tip.id} className="text-[11px] leading-relaxed text-zinc-500 flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-700 dark:text-zinc-300">{tip.label}:</strong> {tip.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
