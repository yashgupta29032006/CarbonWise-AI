"use client";

import React, { useState, useEffect } from "react";
import { useCarbon, OnboardingData } from "@/context/CarbonContext";
import Button from "./ui/Button";
import { REGIONS } from "@/utils/regions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Users,
  Car,
  Utensils,
  Target,
  Leaf,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function OnboardingModal() {
  const { isOnboarded, completeOnboarding, mounted } = useCarbon();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form States
  const [region, setRegion] = useState("GLOBAL");
  const [householdSize, setHouseholdSize] = useState(2);
  const [transitType, setTransitType] = useState<OnboardingData["transitType"]>("mixed");
  const [dietPreference, setDietPreference] = useState<OnboardingData["dietPreference"]>("mixed");
  const [goalType, setGoalType] = useState<OnboardingData["goalType"]>("20");

  // Upgrade States
  const [ageGroup, setAgeGroup] = useState<OnboardingData["ageGroup"]>("25-44");
  const [occupation, setOccupation] = useState<OnboardingData["occupation"]>("employed");
  const [commuteStyle, setCommuteStyle] = useState<OnboardingData["commuteStyle"]>("hybrid");
  const [homeOwnership, setHomeOwnership] = useState<OnboardingData["homeOwnership"]>("rent");
  const [renewableEnergy, setRenewableEnergy] = useState<OnboardingData["renewableEnergy"]>("no");
  const [priorities, setPriorities] = useState<OnboardingData["priorities"]>("emissions");

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
      ageGroup,
      occupation,
      commuteStyle,
      homeOwnership,
      renewableEnergy,
      priorities,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6 overflow-y-auto"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between overflow-hidden my-auto"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Setup Custom Profile
            </span>
          </div>
          <span className="text-xs text-zinc-500 font-semibold">
            Step {step} of {stepsCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${(step / stepsCount) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: REGION & HOME SETUP */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5 flex-grow"
            >
              <div className="space-y-1">
                <h2 id="onboarding-title" className="text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Globe className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                  Select Region & Home Setup
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select your home region and electricity details to calibrate grid carbon intensity estimates.
                </p>
              </div>

              {/* Region Select */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Region / Country</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(REGIONS).map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => setRegion(reg.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 text-xs font-semibold focus:outline-none ${
                        region === reg.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      {reg.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Home setup */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase">Home Ownership</label>
                  <div className="flex gap-2">
                    {[
                      { id: "own", label: "Own" },
                      { id: "rent", label: "Rent" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setHomeOwnership(item.id as "own" | "rent")}
                        className={`flex-1 py-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                          homeOwnership === item.id
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase">Renewable Energy</label>
                  <div className="flex gap-2">
                    {[
                      { id: "yes", label: "Solar/Green" },
                      { id: "no", label: "Standard Grid" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRenewableEnergy(item.id as "yes" | "no")}
                        className={`flex-1 py-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                          renewableEnergy === item.id
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DEMOGRAPHICS & HOUSEHOLD */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5 flex-grow"
            >
              <div className="space-y-1">
                <h2 id="onboarding-title" className="text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Users className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                  Demographics & Household
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sharing footprints depends on occupant count, age group, and career parameters.
                </p>
              </div>

              {/* Household Size */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Household Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setHouseholdSize(num)}
                      className={`py-2 rounded-xl border text-center font-bold text-xs transition-all ${
                        householdSize === num
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      {num === 4 ? "4+" : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Age Group</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["under-18", "18-24", "25-44", "45-64", "65+"].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAgeGroup(age as OnboardingData["ageGroup"])}
                      className={`py-2 rounded-lg border text-[10px] font-semibold text-center transition-all ${
                        ageGroup === age
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {age === "under-18" ? "<18" : age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Occupation Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "student", label: "Student" },
                    { id: "employed", label: "Employed" },
                    { id: "unemployed", label: "Unemployed" },
                    { id: "retired", label: "Retired" },
                  ].map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccupation(occ.id as OnboardingData["occupation"])}
                      className={`py-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        occupation === occ.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TRANSPORTATION & COMMUTING */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5 flex-grow"
            >
              <div className="space-y-1">
                <h2 id="onboarding-title" className="text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Car className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                  Transportation & Commute
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Transportation is often the largest single source of personal emissions. Setup your commute parameters.
                </p>
              </div>

              {/* Commute Style */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Commute Style</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: "drive", label: "Drive" },
                    { id: "transit", label: "Transit" },
                    { id: "active", label: "Walk/Bike" },
                    { id: "hybrid", label: "Hybrid" },
                    { id: "remote", label: "Remote" },
                  ].map((comm) => (
                    <button
                      key={comm.id}
                      type="button"
                      onClick={() => setCommuteStyle(comm.id as OnboardingData["commuteStyle"])}
                      className={`py-2 rounded-lg border text-[10px] font-semibold text-center transition-all ${
                        commuteStyle === comm.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {comm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Transit Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Primary Vehicle Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "car", label: "Private Car", desc: "Gasoline/diesel vehicle travel" },
                    { id: "public", label: "Public Transit", desc: "Buses, subway, and regional trains" },
                    { id: "active", label: "Active Transport", desc: "Walking, cycling, or green scooters" },
                    { id: "mixed", label: "Mixed Habit", desc: "Balanced vehicle & public travel" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTransitType(item.id as OnboardingData["transitType"])}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 focus:outline-none ${
                        transitType === item.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <span className="font-semibold text-xs">{item.label}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DIET & PRIORITIES */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5 flex-grow"
            >
              <div className="space-y-1">
                <h2 id="onboarding-title" className="text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Utensils className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                  Diet & Platform Priorities
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Configure food choices and highlight what you want to achieve on the platform.
                </p>
              </div>

              {/* Diet Preference */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Food Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "vegan", label: "Vegan", desc: "No animal products" },
                    { id: "vegetarian", label: "Vegetarian", desc: "Dairy/eggs, no meat" },
                    { id: "mixed", label: "Mixed Diet", desc: "Average meat & fish" },
                    { id: "meat-heavy", label: "Meat-Heavy", desc: "Regular beef/lamb meals" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDietPreference(item.id as OnboardingData["dietPreference"])}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 focus:outline-none ${
                        dietPreference === item.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <span className="font-semibold text-xs">{item.label}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priorities */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase">Sustainability Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "emissions", label: "CO2 Cut" },
                    { id: "cost", label: "Save Cash" },
                    { id: "diet", label: "Diet Change" },
                    { id: "habits", label: "Habit Streaks" },
                  ].map((pri) => (
                    <button
                      key={pri.id}
                      type="button"
                      onClick={() => setPriorities(pri.id as OnboardingData["priorities"])}
                      className={`py-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        priorities === pri.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {pri.label}
                    </button>
                  ))}
                </div>
              </div>
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
              className="space-y-5 flex-grow"
            >
              <div className="space-y-1">
                <h2 id="onboarding-title" className="text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Target className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                  Sustainability Goal & Finish
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select your final emission reduction target. This configures your dashboard targets.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: "10", label: "Moderate (10% Reduction)", desc: "Minor modifications to daily routines. Ideal for beginners." },
                  { id: "20", label: "Committed (20% Reduction)", desc: "Consistent active travel and minor dietary adjustments." },
                  { id: "neutral", label: "Climate Neutrality (50% Target)", desc: "Significant lifestyle updates to achieve minimal environmental impact." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoalType(item.id as OnboardingData["goalType"])}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 focus:outline-none ${
                      goalType === item.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <span className="font-semibold text-xs">{item.label}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-505 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 text-xs font-semibold leading-relaxed">
                <Sparkles className="h-4 w-4 shrink-0" />
                This calibration configures your dashboard. You can modify tracking details at any time.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
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
