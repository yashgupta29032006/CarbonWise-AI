"use client";

import React, { useState, useEffect } from "react";
import { useCarbon, OnboardingData } from "@/context/CarbonContext";
import Button from "./ui/Button";
import { REGIONS } from "@/utils/regions";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Users, Car, Utensils, Target, Leaf, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingModal() {
  const { isOnboarded, completeOnboarding, mounted } = useCarbon();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [region, setRegion] = useState("GLOBAL");
  const [householdSize, setHouseholdSize] = useState(2);
  const [transitType, setTransitType] = useState<OnboardingData["transitType"]>("mixed");
  const [dietPreference, setDietPreference] = useState<OnboardingData["dietPreference"]>("mixed");
  const [goalType, setGoalType] = useState<OnboardingData["goalType"]>("20");

  useEffect(() => {
    if (mounted && !isOnboarded) {
      setIsOpen(true);
    }
  }, [mounted, isOnboarded]);

  if (!isOpen) return null;

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    completeOnboarding({
      region,
      householdSize,
      transitType,
      dietPreference,
      goalType,
    });
    setIsOpen(false);
  };

  const stepsCount = 5;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const stepSlideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-xl glass-card border border-white/20 dark:border-zinc-800/40 p-8 sm:p-10 shadow-2xl relative flex flex-col justify-between overflow-hidden"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Setup Profile
            </span>
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            Step {step} of {stepsCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${(step / stepsCount) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME & REGION */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 flex-grow"
            >
              <div className="space-y-2">
                <h2 id="onboarding-title" className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Select Your Region
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Calculations are tuned to local grid intensities, municipal waste profiles, and transit baselines.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(REGIONS).map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => setRegion(reg.id)}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      region === reg.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <span className="font-semibold text-sm">{reg.name}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      Grid Intensity: {reg.electricityFactor.toFixed(3)} kg/kWh
                    </span>
                  </button>
                ))}
              </div>

              <blockquote className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-xs text-zinc-500 leading-relaxed">
                <strong>Why it matters:</strong> Powering a home in APAC relies more on coal than in Europe, meaning a kWh there results in roughly 2.4x higher emissions. We calibrate for this.
              </blockquote>
            </motion.div>
          )}

          {/* STEP 2: HOUSEHOLD SIZE */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 flex-grow"
            >
              <div className="space-y-2">
                <h2 id="onboarding-title" className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Household Size
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  How many people live in your home? Shared energy footprints are distributed equally per person.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setHouseholdSize(num)}
                    className={`py-4 rounded-xl border text-center font-bold text-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      householdSize === num
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    {num === 4 ? "4+" : num}
                  </button>
                ))}
              </div>

              <blockquote className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-xs text-zinc-500 leading-relaxed">
                <strong>Why it matters:</strong> Heating and baseload electricity (refrigeration, etc.) are shared footprints. Splitting them fairly ensures your individual footprint isn&apos;t artificially inflated.
              </blockquote>
            </motion.div>
          )}

          {/* STEP 3: TRANSIT TYPE */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 flex-grow"
            >
              <div className="space-y-2">
                <h2 id="onboarding-title" className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Car className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Primary Transportation Habit
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Select your primary mode of local travel. This seeds realistic weekly mileage parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "car", label: "Private Vehicle", desc: "Mainly drive gasoline/diesel cars" },
                  { id: "public", label: "Public Transit", desc: "Mainly take buses, metros, and trains" },
                  { id: "active", label: "Active Transport", desc: "Walking, cycling, electric scooters" },
                  { id: "mixed", label: "Mixed Habit", desc: "Combination of car and transit travel" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTransitType(item.id as OnboardingData["transitType"])}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      transitType === item.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <span className="font-semibold text-sm">{item.label}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              <blockquote className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-xs text-zinc-500 leading-relaxed">
                <strong>Why it matters:</strong> A single car trip averages 0.18 kg CO₂/km, whereas trains/metros emit just 0.035 kg CO₂/km (an 80% reduction).
              </blockquote>
            </motion.div>
          )}

          {/* STEP 4: DIET PREFERENCE */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 flex-grow"
            >
              <div className="space-y-2">
                <h2 id="onboarding-title" className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Utensils className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Dietary Habits
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Seafood, meats, and agricultural supply chains heavily shape your carbon footprints.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "vegan", label: "Vegan", desc: "Entirely plant-based products (~1.5 kg/day)" },
                  { id: "vegetarian", label: "Vegetarian", desc: "No meat, but consume dairy/eggs (~2.0 kg/day)" },
                  { id: "mixed", label: "Mixed Diet", desc: "Moderate meat, poultry, and fish (~4.7 kg/day)" },
                  { id: "meat-heavy", label: "Meat-Heavy", desc: "Regular beef, pork, or lamb (~7.2 kg/day)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDietPreference(item.id as OnboardingData["dietPreference"])}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      dietPreference === item.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <span className="font-semibold text-sm">{item.label}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              <blockquote className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-xs text-zinc-500 leading-relaxed">
                <strong>Why it matters:</strong> Shifting to vegan/vegetarian diets is one of the highest leverage personal actions, saving upwards of 1.5 to 2.0 metric tons of CO₂ per year!
              </blockquote>
            </motion.div>
          )}

          {/* STEP 5: REDUCTION GOAL */}
          {step === 5 && (
            <motion.div
              key="step5"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 flex-grow"
            >
              <div className="space-y-2">
                <h2 id="onboarding-title" className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Sustainability Goal
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Define your initial footprint reduction target. We will configure your goals page based on this.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "10", label: "Moderate (10% Reduction)", desc: "Minor modifications to daily routines. Ideal for beginners." },
                  { id: "20", label: "Committed (20% Reduction)", desc: "Consistent active travel and minor dietary adjustments." },
                  { id: "neutral", label: "Climate Neutrality (50% Target)", desc: "Significant lifestyle updates to achieve minimal environmental impact." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoalType(item.id as OnboardingData["goalType"])}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      goalType === item.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <span className="font-semibold text-sm">{item.label}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/10 text-xs font-semibold leading-relaxed">
                <Sparkles className="h-4 w-4 shrink-0" />
                This calibration unlocks your dashboard. You can review detailed breakdowns at any time.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-1.5 ${step === 1 ? "opacity-0" : ""}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {step < stepsCount ? (
            <Button onClick={handleNext} className="flex items-center gap-1.5">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} variant="accent" className="flex items-center gap-1.5">
              Launch Dashboard
              <Leaf className="h-4 w-4 text-zinc-950 animate-bounce" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
