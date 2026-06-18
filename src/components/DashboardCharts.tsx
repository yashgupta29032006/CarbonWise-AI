"use client";

import React from "react";
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

interface DashboardChartsProps {
  activeChartTab: "pie" | "trend";
  pieData: Array<{ name: string; value: number; color: string }>;
  history: Array<{
    date: string;
    score: number;
    transport: number;
    electricity: number;
    food: number;
    waste: number;
    shopping: number;
    total: number;
  }>;
}

export default function DashboardCharts({
  activeChartTab,
  pieData,
  history,
}: DashboardChartsProps) {
  if (activeChartTab === "pie") {
    if (pieData.length === 0) {
      return (
        <div className="text-zinc-400 text-sm">
          No emissions logged yet. Fill the tracker.
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={95}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name || ""} ${(typeof percent === "number" ? percent * 100 : 0).toFixed(0)}%`
            }
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            formatter={(val) => [
              `${Number(val || 0).toLocaleString()} kg CO₂`,
              "Emissions",
            ]}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={history}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a15" />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={11}
          tickLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={11}
          tickLine={false}
          tickFormatter={(val) => `${val} kg`}
        />
        <RechartsTooltip
          formatter={(val) => [
            `${Number(val || 0).toLocaleString()} kg CO₂`,
            "Total",
          ]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#10b981"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
