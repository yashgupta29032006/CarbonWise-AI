"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCarbon } from "@/context/CarbonContext";
import { useToast } from "@/components/ui/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { getHighestImpactActions, getLocalCoachResponse } from "@/utils/aiCoach";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Leaf,
  Sparkles,
  TrendingDown,
  TreePine,
  Trash2,
  CalendarRange,
  Trophy,
  Activity,
  Flame,
  Award,
  Zap,
  Car,
  Utensils,
  ShoppingBag,
  Info,
  Send,
  Loader2,
  FileDown,
  ArrowRightLeft,
  Target,
  Download,
  Plus,
  Compass,
  Train,
  LayoutDashboard,
  HelpCircle,
  CheckCircle,
} from "lucide-react";

export default function Dashboard() {
  const {
    isOnboarded,
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
    toggleHabit,
    incrementChallenge,
    updateGoals,
  } = useCarbon();

  const { toast } = useToast();
  const [activeChartTab, setActiveChartTab] = useState<"pie" | "trend">("pie");

  // AI Coach Chat State
  const [messages, setMessages] = useState<Array<{ role: "user" | "coach"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Goals Form State
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [newWeeklyGoal, setNewWeeklyGoal] = useState(weeklyReductionTarget);
  const [newMonthlyGoal, setNewMonthlyGoal] = useState(monthlyCO2Target);

  // Explainability Modal state
  const [explainMetric, setExplainMetric] = useState<"score" | "emissions" | "equivalents" | null>(null);

  // Initialize Chat with Welcome Message from AI Coach
  useEffect(() => {
    if (mounted && messages.length === 0) {
      setMessages([
        {
          role: "coach",
          content: getLocalCoachResponse("hello", activeEntry, emissionsBreakdown),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3.5">
            <Loader2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-zinc-500 text-sm font-medium">Loading sustainability dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-xl mx-auto px-6 py-20 text-center flex flex-col justify-center items-center gap-6">
          <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-600">
            <Leaf className="h-10 w-10 animate-bounce" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Setup Your Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
            Please complete the onboarding questionnaire first to calibrate emission math and establish initial targets.
          </p>
          <Link href="/tracker">
            <Button size="lg">Begin Onboarding Wizard</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate high & low emission categories
  const categories = [
    { name: "Transportation", value: emissionsBreakdown.transport, key: "transport", color: "#10b981", icon: Car },
    { name: "Electricity", value: emissionsBreakdown.electricity, key: "electricity", color: "#06b6d4", icon: Zap },
    { name: "Food Habits", value: emissionsBreakdown.food, key: "food", color: "#84cc16", icon: Utensils },
    { name: "Waste Management", value: emissionsBreakdown.waste, key: "waste", color: "#a1a1aa", icon: Trash2 },
    { name: "Shopping Habits", value: emissionsBreakdown.shopping, key: "shopping", color: "#f59e0b", icon: ShoppingBag },
  ];

  const sortedCategories = [...categories].sort((a, b) => a.value - b.value);
  const bestCategory = sortedCategories[0];
  const worstCategory = sortedCategories[sortedCategories.length - 1];

  // Recharts Pie Chart Data
  const pieData = categories
    .filter((c) => c.value > 0)
    .map((c) => ({
      name: c.name,
      value: c.value,
      color: c.color,
    }));

  // AI chat send handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    try {
      // Send chat context to Next.js API Route Handler
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }].slice(-6), // keep last 6 turns
          carbonData: emissionsBreakdown,
          habits: habits,
          region: activeEntry.region,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "coach", content: data.reply }]);
      } else {
        // Fallback to local rule engine if API key is not configured or errors out
        const localReply = getLocalCoachResponse(userMsg, activeEntry, emissionsBreakdown);
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "coach", content: localReply }]);
        }, 800);
      }
    } catch {
      const localReply = getLocalCoachResponse(userMsg, activeEntry, emissionsBreakdown);
      setMessages((prev) => [...prev, { role: "coach", content: localReply }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt);
  };

  // Streaks calculation
  const highestStreak = Math.max(...habits.map((h) => h.streak), 0);

  // Highest Impact recommendations
  const impactActions = getHighestImpactActions(activeEntry, emissionsBreakdown);

  // PDF print trigger
  const handlePrint = () => {
    window.print();
  };

  // Sustainability profile JSON exporter
  const handleDownloadProfile = () => {
    const profileData = {
      platform: "CarbonWise AI",
      generatedAt: new Date().toISOString(),
      region: activeEntry.region,
      householdSize: activeEntry.householdSize,
      carbonBreakdown: emissionsBreakdown,
      carbonScore: scoreInfo,
      habits: habits,
      badges: badges.filter((b) => b.unlocked),
      challenges: challenges,
    };

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sustainability-profile-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Sustainability profile downloaded!", "success");
  };

  // Render Badge Icon
  const renderBadgeIcon = (iconName: string, active: boolean) => {
    const color = active ? "text-emerald-500" : "text-zinc-400";
    switch (iconName) {
      case "Leaf":
        return <Leaf className={`h-6 w-6 ${color}`} />;
      case "Compass":
        return <Compass className={`h-6 w-6 ${color}`} />;
      case "Award":
        return <Award className={`h-6 w-6 ${color}`} />;
      case "Trash2":
        return <Trash2 className={`h-6 w-6 ${color}`} />;
      case "Train":
        return <Train className={`h-6 w-6 ${color}`} />;
      case "Zap":
        return <Zap className={`h-6 w-6 ${color}`} />;
      default:
        return <Leaf className={`h-6 w-6 ${color}`} />;
    }
  };

  const currentMonthlyCO2 = Math.round(emissionsBreakdown.total / 12);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HEADER CONTROLS */}
        <section aria-label="Dashboard Overview" className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 no-print">
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center justify-center md:justify-start gap-2.5">
              <LayoutDashboard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              Sustainability Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              Real-time footprint breakdown, AI-driven feedback, goals, and daily streak trackers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/tracker">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4" />
                Recalculate Footprint
              </Button>
            </Link>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs transition-colors duration-150"
            >
              <FileDown className="h-4 w-4 mr-1.5" />
              Export Dashboard (PDF)
            </button>

            <button
              onClick={handleDownloadProfile}
              className="inline-flex items-center justify-center font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs transition-colors duration-150"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download Profile (.json)
            </button>
          </div>
        </section>

        {/* ROW 1: SUMMARY CARDS GRID */}
        <section aria-label="Footprint Summary Cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Carbon Score */}
          <div className="glass-card print-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Carbon Score</span>
                <span className="text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight block">
                  {scoreInfo.score}<span className="text-xs font-normal text-zinc-400">/100</span>
                </span>
              </div>
              <button
                onClick={() => setExplainMetric("score")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none no-print"
                aria-label="Explain Carbon Score"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold uppercase border ${scoreInfo.bgClass} ${scoreInfo.colorClass}`}>
                {scoreInfo.band}
              </span>
              <span className="text-[10px] text-zinc-500 leading-normal line-clamp-2">{scoreInfo.description}</span>
            </div>
          </div>

          {/* Card 2: Annual Emissions */}
          <div className="glass-card print-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Annual Footprint</span>
                <span className="text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight block">
                  {emissionsBreakdown.total.toLocaleString()}<span className="text-xs font-normal text-zinc-400"> kg</span>
                </span>
              </div>
              <button
                onClick={() => setExplainMetric("emissions")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none no-print"
                aria-label="Explain Footprint calculations"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs divide-x divide-zinc-200 dark:divide-zinc-800">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Monthly Avg</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{Math.round(emissionsBreakdown.total / 12).toLocaleString()} kg</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase font-semibold">Daily Avg</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">{Math.round(emissionsBreakdown.total / 365).toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          {/* Card 3: Best Category */}
          <div className="glass-card print-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Best Category</span>
                <span className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 truncate block max-w-[180px]">
                  {bestCategory.name}
                </span>
              </div>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <bestCategory.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-zinc-500">Annual Emissions:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{bestCategory.value.toLocaleString()} kg CO₂</span>
            </div>
          </div>

          {/* Card 4: Worst Category */}
          <div className="glass-card print-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Worst Category</span>
                <span className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 truncate block max-w-[180px]">
                  {worstCategory.name}
                </span>
              </div>
              <span className="p-2 rounded-lg bg-red-500/10 text-red-600">
                <worstCategory.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-zinc-500">Annual Emissions:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{worstCategory.value.toLocaleString()} kg CO₂</span>
            </div>
          </div>
        </section>

        {/* HIGHEST IMPACT & EQUIVALENTS */}
        <section aria-label="Emissions Reductions Insights" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Highest Impact Actions Checklist */}
          <div className="glass-card print-card lg:col-span-7 p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-500" />
                Highest Impact Reduction Targets
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                These behaviors represent your largest carbon saving points, calculated from your profile.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {impactActions.slice(0, 2).map((act) => {
                return (
                  <div
                    key={act.title}
                    className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/40 flex items-start gap-4"
                  >
                    <div className="bg-emerald-500/10 text-emerald-600 p-2.5 rounded-xl shrink-0 mt-0.5">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{act.title}</span>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10 whitespace-nowrap">
                          -{act.co2SavedAnnual} kg / yr
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">{act.description}</p>
                    </div>
                  </div>
                );
              })}
              {impactActions.length === 0 && (
                <div className="text-center py-6 text-zinc-400 text-sm">
                  No actions suggested. You have achieved an excellent carbon score!
                </div>
              )}
            </div>
          </div>

          {/* Trees Equivalent Visualizer */}
          <div className="glass-card print-card lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-1 flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-emerald-500 animate-pulse" />
                  Eco-Equivalents
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  What your annual emissions represent in ecological units.
                </p>
              </div>
              <button
                onClick={() => setExplainMetric("equivalents")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none no-print"
                aria-label="Explain Equivalents Calculations"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow justify-center">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/40 text-center flex flex-col items-center justify-center space-y-1.5">
                <span className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  <TreePine className="h-5 w-5" />
                </span>
                <span className="text-xs text-zinc-400 font-medium">Seedlings Planted</span>
                <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {Math.round(emissionsBreakdown.total / 22)} trees
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/40 text-center flex flex-col items-center justify-center space-y-1.5">
                <span className="p-2.5 rounded-full bg-orange-500/10 text-orange-600">
                  <Flame className="h-5 w-5" />
                </span>
                <span className="text-xs text-zinc-400 font-medium">Gallons Gasoline</span>
                <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {Math.round(emissionsBreakdown.total / 8.88).toLocaleString()} gal
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ANALYTICS CHARTS */}
        <section aria-label="Emissions Analytics Charts" className="glass-card print-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 no-print">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center justify-center sm:justify-start gap-2">
                <Activity className="h-5 w-5 text-emerald-500" />
                Carbon Footprint Analytics
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                Review emissions by category division or view your 6-month historical trend.
              </p>
            </div>

            <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
              <button
                onClick={() => setActiveChartTab("pie")}
                className={`px-4.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none ${
                  activeChartTab === "pie"
                    ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveChartTab("trend")}
                className={`px-4.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none ${
                  activeChartTab === "trend"
                    ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Historical Trend
              </button>
            </div>
          </div>

          <div className="h-[350px] w-full flex items-center justify-center">
            {activeChartTab === "pie" ? (
              pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={105}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${(typeof percent === "number" ? percent * 100 : 0).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val) => [`${Number(val || 0).toLocaleString()} kg CO₂`, "Emissions"]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-zinc-400 text-sm">No emissions logged yet. Fill the tracker.</div>
              )
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a15" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `${val} kg`} />
                  <RechartsTooltip formatter={(val) => [`${Number(val || 0).toLocaleString()} kg CO₂`, "Total"]} />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* BOTTOM SECTION: AI COACH & GOALS */}
        <section aria-label="AI Coach and Goals Panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* AI SUSTAINABILITY COACH */}
          <div className="glass-card print-card lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between min-h-[480px]">
            <div className="space-y-1 border-b border-zinc-200 dark:border-zinc-800 pb-4 flex items-center justify-between no-print">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  Gemini Sustainability Coach
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Ask questions or request reduction plans tailored to your carbon inputs.
                </p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Message log wrapper */}
            <div className="flex-grow overflow-y-auto max-h-[300px] py-4 space-y-4 my-2 pr-1.5 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              {messages.map((m, index) => {
                const isCoach = m.role === "coach";
                return (
                  <div key={index} className={`flex ${isCoach ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                        isCoach
                          ? "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none font-normal"
                          : "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none font-medium shadow-md shadow-emerald-500/5"
                      }`}
                    >
                      <div className="whitespace-pre-wrap space-y-2">
                        {m.content.split("\n").map((line, lIdx) => {
                          if (line.startsWith("### ")) {
                            return <h4 key={lIdx} className="font-bold text-zinc-900 dark:text-zinc-100 mt-2 text-sm">{line.replace("### ", "")}</h4>;
                          }
                          if (line.startsWith("#### ")) {
                            return <h5 key={lIdx} className="font-bold text-zinc-900 dark:text-zinc-100 mt-1 text-xs">{line.replace("#### ", "")}</h5>;
                          }
                          if (line.startsWith("- ")) {
                            return <li key={lIdx} className="ml-4 list-disc text-xs">{line.replace("- ", "")}</li>;
                          }
                          return <p key={lIdx} className="text-xs sm:text-sm">{line}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                    <span className="text-xs">Coach is generating insights...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick suggested prompt buttons */}
            <div className="flex flex-wrap gap-1.5 py-3 border-t border-zinc-100 dark:border-zinc-800/80 no-print">
              {[
                "Explain my carbon score",
                "How can I reduce transport emissions?",
                "Tips for food reduction",
                "Waste composting tips",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-[10px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-all focus:outline-none"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center mt-2 no-print">
              <input
                type="text"
                placeholder="Ask your AI sustainability coach..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isTyping}
                className="flex-grow px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* GOALS PANEL */}
          <div className="glass-card print-card lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between no-print">
                <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  Sustainability Goals
                </h3>
                <button
                  onClick={() => setIsEditingGoals(!isEditingGoals)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
                >
                  {isEditingGoals ? "Close" : "Adjust Targets"}
                </button>
              </div>
              <h3 className="hidden print:block font-extrabold text-lg text-zinc-950 dark:text-zinc-50">
                Sustainability Goals
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                Keep your current carbon emissions below your defined monthly and weekly limit targets.
              </p>
            </div>

            {/* Adjust Goals Form */}
            {isEditingGoals ? (
              <div className="space-y-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 no-print">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex justify-between">
                    Weekly Reduction Target:
                    <span className="font-extrabold">{newWeeklyGoal} kg CO₂</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={newWeeklyGoal}
                    onChange={(e) => setNewWeeklyGoal(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex justify-between">
                    Monthly CO₂ Footprint Limit:
                    <span className="font-extrabold">{newMonthlyGoal} kg CO₂</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={newMonthlyGoal}
                    onChange={(e) => setNewMonthlyGoal(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <Button
                  size="sm"
                  fullWidth
                  onClick={() => {
                    updateGoals(newWeeklyGoal, newMonthlyGoal);
                    setIsEditingGoals(false);
                    toast("Sustainability targets updated!", "success");
                  }}
                >
                  Save Targets
                </Button>
              </div>
            ) : null}

            {/* Goals metrics progress */}
            <div className="space-y-6 flex-grow flex flex-col justify-center">
              {/* Monthly Target Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Monthly Limit Target</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {currentMonthlyCO2} / {monthlyCO2Target} kg CO₂
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentMonthlyCO2 > monthlyCO2Target
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500"
                    }`}
                    style={{ width: `${Math.min(100, (currentMonthlyCO2 / monthlyCO2Target) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block leading-normal">
                  {currentMonthlyCO2 <= monthlyCO2Target
                    ? "🎉 Nice work! You are currently within your monthly carbon allocation limit."
                    : "⚠️ Warning: Your current logs exceed your sustainable monthly allocation target."}
                </span>
              </div>

              {/* Weekly reduction target progress */}
              <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Weekly Saved CO₂</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {Math.max(0, Math.round(weeklyReductionTarget - (currentMonthlyCO2 / 4.3)))} / {weeklyReductionTarget} kg CO₂
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-lime-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (Math.max(0, weeklyReductionTarget - (currentMonthlyCO2 / 4.3)) / weeklyReductionTarget) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HABITS & CHALLENGES */}
        <section aria-label="Habits and Challenges Panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* DAILY HABIT TRACKER */}
          <div className="glass-card print-card lg:col-span-7 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-emerald-500" />
                  Daily Eco Habits
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Check off eco-friendly habits daily. Maintain streaks to form positive sustainability routines.
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold no-print">
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" />
                Streak: {highestStreak} Days
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 no-print">
              {habits.map((hb) => (
                <button
                  key={hb.id}
                  onClick={() => {
                    toggleHabit(hb.id);
                    if (!hb.completedToday) {
                      toast(`Habit completed: ${hb.name}!`, "success");
                    }
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                    hb.completedToday
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-400"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                        hb.completedToday
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      }`}
                    >
                      {hb.completedToday && <CheckCircle className="h-3 w-3" />}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold leading-tight">{hb.name}</span>
                  </div>

                  {hb.streak > 0 ? (
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-0.5 bg-orange-500/5 px-2 py-0.5 rounded-full">
                      <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                      {hb.streak}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Print Friendly habits list */}
            <div className="hidden print:block">
              <ul className="space-y-2 text-xs">
                {habits.map((h) => (
                  <li key={h.id} className="flex items-center gap-2">
                    <span className={`inline-block h-3.5 w-3.5 rounded-full border ${h.completedToday ? "bg-emerald-500" : ""}`} />
                    <span>{h.name} {h.streak > 0 ? `(Streak: ${h.streak} days)` : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* WEEKLY ECO CHALLENGES */}
          <div className="glass-card print-card lg:col-span-5 p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-emerald-500" />
                Weekly Eco Challenges
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                Participate in weekly sustainability tasks to accelerate your carbon reductions.
              </p>
            </div>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {challenges.map((chal) => (
                <div
                  key={chal.id}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm space-y-2 ${
                    chal.completed
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{chal.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium leading-normal">{chal.description}</p>
                    </div>

                    {!chal.completed ? (
                      <button
                        onClick={() => {
                          incrementChallenge(chal.id);
                          if (chal.current + 1 === chal.target) {
                            toast(`Challenge Completed: ${chal.title}!`, "success");
                            confetti({
                              particleCount: 50,
                              spread: 60,
                              colors: ["#10b981", "#84cc16"],
                            });
                          }
                        }}
                        className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 no-print"
                        aria-label={`Increment ${chal.title}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                      <span>Progress</span>
                      <span>
                        {chal.current} / {chal.target}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full transition-all duration-300"
                        style={{ width: `${(chal.current / chal.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS / BADGES */}
        <section aria-label="Unlocked Achievements Badges" className="glass-card print-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              Sustainability Milestones & Badges
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
              Milestone achievements unlocked by completing onboarding, lowering emissions, and maintaining habit streaks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between gap-3 transition-all duration-300 ${
                  b.unlocked
                    ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5"
                    : "border-zinc-200 dark:border-zinc-800 opacity-50 grayscale"
                }`}
              >
                <div className={`p-3 rounded-full ${b.unlocked ? "bg-emerald-500/10" : "bg-zinc-100 dark:bg-zinc-900"}`}>
                  {renderBadgeIcon(b.iconName, b.unlocked)}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">{b.title}</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-3">
                    {b.description}
                  </p>
                </div>

                <span className="text-[9px] uppercase tracking-wider font-extrabold block text-zinc-400">
                  {b.unlocked ? `Unlocked: ${b.unlockedAt}` : `Target: ${b.criteria}`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* METRICS EXPLAINER MODAL (EXPLAINABILITY) */}
        <AnimatePresence>
          {explainMetric && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 no-print">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md glass-card border border-white/20 dark:border-zinc-800/40 p-6 sm:p-8 shadow-2xl relative"
              >
                {explainMetric === "score" && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-emerald-500" />
                      About Carbon Score
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>What it means:</strong> The Carbon Score represents how close you are to a globally sustainable lifestyle. It grades you from 0 (very high footprint) to 100 (neutrality threshold).
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>How it is calculated:</strong> We compare your total annual footprint against the sustainable target of <strong>3,500 kg CO₂/year</strong>. Standard industrial lifestyles yield lower scores (40-60), while active travel and dietary corrections propel your score to 80+.
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>Why it matters:</strong> Shifting your lifestyle to score 80+ keeps your impact within limits that mitigate the worst effects of global climate change.
                    </p>
                  </div>
                )}

                {explainMetric === "emissions" && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                      <Info className="h-5 w-5 text-emerald-500" />
                      Footprint Calculation Math
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>What it means:</strong> This shows the annual greenhouse gas mass (in kilograms of CO₂ equivalent) generated by your daily energy, transit, and consumer habits.
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>How it is calculated:</strong> We sum category outputs:
                      <br />- <em>Transportation:</em> weekly km * factors * 52 + annual flight km * 0.250.
                      <br />- <em>Electricity:</em> (monthly kWh * regional grid coefficient * 12) / household members.
                      <br />- <em>Food:</em> diet base (vegan, vegetarian, mixed, meat) * 365.
                      <br />- <em>Waste:</em> baseline altered by recycling frequency, composting, and plastic factors.
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>Why it matters:</strong> Seeing the breakdown identifies which categories are carbon-heavy, allowing you to prioritize the highest leverage reductions.
                    </p>
                  </div>
                )}

                {explainMetric === "equivalents" && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                      <TreePine className="h-5 w-5 text-emerald-500" />
                      About Ecological Equivalents
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>Seedlings Planted:</strong> A mature tree seedling absorbs roughly <strong>22 kg CO₂</strong> from the atmosphere per year. We divide your annual CO₂ mass by 22 to show how many seedlings would need to grow for a year to absorb your output.
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                      <strong>Gallons of Gasoline:</strong> Combustion of one gallon of standard motor fuel releases roughly <strong>8.887 kg CO₂</strong>. This illustrates your footprint in terms of fuel combusted.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button size="sm" onClick={() => setExplainMetric(null)}>
                    Got it!
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
