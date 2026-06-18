"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { useCarbon } from "@/context/CarbonContext";
import { motion } from "framer-motion";
import {
  Activity,
  Sparkles,
  LineChart,
  Target,
  CalendarRange,
  Trophy,
  ArrowRight,
  TrendingDown,
  TreePine,
  Flame,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    title: "Carbon Tracking",
    description: "Log travel, food, home power usage, waste, and shopping in seconds with smart inputs.",
    icon: Activity,
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "AI Recommendations",
    description: "Get hyper-personalized recommendations tailored by AI based on your emission spikes.",
    icon: Sparkles,
    gradient: "from-teal-500/20 to-cyan-500/10",
    iconColor: "text-teal-500",
  },
  {
    title: "Progress Analytics",
    description: "Understand your footprints with clear interactive trend charts, pie slices, and category compares.",
    icon: LineChart,
    gradient: "from-emerald-600/20 to-green-500/10",
    iconColor: "text-green-600",
  },
  {
    title: "Sustainability Goals",
    description: "Set personalized weekly and monthly emission targets to track and complete your carbon-neutral path.",
    icon: Target,
    gradient: "from-lime-500/20 to-emerald-500/10",
    iconColor: "text-lime-600 dark:text-lime-400",
  },
  {
    title: "Habit Building",
    description: "Engage in daily carbon-saving routines. Maintain streaks to build lifelong sustainable habits.",
    icon: CalendarRange,
    gradient: "from-cyan-500/20 to-emerald-500/10",
    iconColor: "text-cyan-500",
  },
  {
    title: "Eco Challenges",
    description: "Take on weekly eco-challenges like vegetarian meal days or walking missions for extra achievements.",
    icon: Trophy,
    gradient: "from-amber-500/20 to-lime-500/10",
    iconColor: "text-amber-500",
  },
];

export default function LandingPage() {
  const { isOnboarded, emissionsBreakdown, habits } = useCarbon();

  // Dynamic user-specific stats or attractive global mock metrics if not onboarded yet
  const totalCO2SavedVal = isOnboarded 
    ? Math.round(18000 - emissionsBreakdown.total) // mock baseline of 18 tons vs current footprint
    : 12450;
  
  const formattedCO2Saved = totalCO2SavedVal > 0 
    ? `${(totalCO2SavedVal / 1000).toFixed(1)} t` 
    : "0.2 t";

  const treesEquivalent = isOnboarded
    ? Math.max(5, Math.round(totalCO2SavedVal / 22)) // 22kg CO2 per tree per year
    : 185;

  const activeHabitsCount = isOnboarded
    ? habits.filter((h) => h.completedToday).length
    : 14;

  const weeklyImprovement = isOnboarded
    ? "18%"
    : "15%";

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden relative">
      {/* Background blobs for premium glassmorphic depth */}
      <div className="absolute top-20 left-[-10%] w-[50%] h-[600px] bg-gradient-to-tr from-emerald-400/20 to-teal-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[550px] bg-gradient-to-tr from-lime-400/10 to-emerald-400/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section aria-label="Introduction" className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-20 md:pt-24 md:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Tagline */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Smarter Sustainability Powered by Gemini
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-950 dark:text-zinc-50">
              Understand. Track. <br className="hidden sm:inline" />
              Reduce. Your <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-500 dark:from-emerald-400 dark:to-lime-400 bg-clip-text text-transparent">Carbon Footprint.</span>
            </h1>

            {/* Subheading */}
            <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              AI-powered sustainability insights that help you make smarter everyday decisions, build green habits, and reduce emissions step-by-step.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href={isOnboarded ? "/tracker" : "/tracker"} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto group flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {isOnboarded && (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Explore Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Interactive Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-white/20 dark:border-zinc-800/30 p-8 shadow-2xl relative glass"
            >
              {/* Outer floating circle decorations */}
              <div className="absolute top-[10%] right-[-5%] w-24 h-24 bg-gradient-to-br from-lime-400/20 to-emerald-400/20 rounded-full blur-xl animate-float" />
              <div className="absolute bottom-[10%] left-[-5%] w-28 h-28 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }} />

              {/* Graphic container */}
              <div className="w-full h-full flex flex-col justify-between items-center text-center relative z-10 py-6">
                <div className="space-y-2">
                  <div className="inline-flex p-4 bg-emerald-500/15 rounded-3xl text-emerald-600 dark:text-emerald-400 animate-bounce">
                    <TreePine className="h-10 w-10" />
                  </div>
                  <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-50">Empowering Green Action</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-xs">
                    Calculate emissions from transportation, electricity, food, and shopping instantly.
                  </p>
                </div>

                {/* Score Mock Indicator */}
                <div className="w-full p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-white/40 dark:border-zinc-800/40 shadow-inner flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Live Carbon Score</span>
                  </div>
                  <span className="font-extrabold text-2xl text-emerald-600 dark:text-emerald-400">88<span className="text-xs font-semibold text-zinc-500">/100</span></span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section aria-label="Platform Statistics" className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="glass rounded-3xl p-8 sm:p-12 border border-white/30 dark:border-zinc-800/30 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
            {/* Stat 1 */}
            <div className="text-center pt-6 lg:pt-0 lg:px-4 space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium block">Total CO₂ Saved</span>
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight block">
                {formattedCO2Saved}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <TrendingDown className="h-3 w-3" /> User baseline impact
              </span>
            </div>

            {/* Stat 2 */}
            <div className="text-center pt-6 lg:pt-0 lg:px-4 space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium block">Trees Equivalent</span>
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight block">
                {treesEquivalent}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <TreePine className="h-3 w-3" /> Annual tree seedlings
              </span>
            </div>

            {/* Stat 3 */}
            <div className="text-center pt-6 lg:pt-0 lg:px-4 space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium block">Active Eco Habits</span>
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight block">
                {activeHabitsCount}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Flame className="h-3 w-3" /> Streak habits logged
              </span>
            </div>

            {/* Stat 4 */}
            <div className="text-center pt-6 lg:pt-0 lg:px-4 space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium block">Weekly Improvement</span>
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight block">
                {weeklyImprovement}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" /> Average reduction rate
              </span>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section aria-label="Key Features" className="max-w-7xl mx-auto px-6 sm:px-8 py-20 md:py-28 space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Powerful Core Features
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base">
              Everything you need to calculate, monitor, and optimize your carbon footprint, all in a beautiful interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card glass-card-interactive p-8 space-y-6"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feat.gradient} ${feat.iconColor}`}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{feat.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
