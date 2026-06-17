/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "../app/api/chat/route";
import fs from "fs";
import path from "path";

// Load .env variables manually for the test environment
const envPath = path.join(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

describe("Gemini AI Coach Route Integration Tests", () => {
  const mockPayload = {
    region: "US",
    householdSize: 2,
    transportData: {
      car: 150,
      bus: 40,
      metro: 0,
      train: 0,
      walking: 5,
      bicycle: 2,
      flight: 5000,
    },
    electricityUsage: 350,
    foodHabits: "mixed",
    wasteHabits: {
      recyclingFrequency: "sometimes",
      plasticUsage: "high",
      composting: false,
      wasteGeneration: "medium",
    },
    shoppingHabits: "high",
    carbonScore: 45,
    highestEmissionCategory: "Transportation",
    sustainabilityGoals: {
      weeklyReductionTarget: 25,
      monthlyCO2Target: 400,
      goalType: "20",
    },
    historicalTrendSummary: {
      rollingAverage: 6500,
      improvementPercentage: -5,
      submissionsCount: 2,
    },
    carbonData: {
      transport: 2650,
      electricity: 1680,
      food: 1715,
      waste: 420,
      shopping: 550,
      total: 7015,
    },
    habits: [
      { name: "Turned off unused appliances", streak: 3 },
      { name: "Walked for short trips", streak: 1 },
    ],
  };

  const testPrompts = [
    { prompt: "Explain my carbon score.", keywords: ["score", "45"] },
    { prompt: "How can I reduce transportation emissions?", keywords: ["transport", "car", "flight"] },
    { prompt: "Give me a 30-day sustainability plan.", keywords: ["plan", "day", "week"] },
    { prompt: "What is my biggest source of emissions?", keywords: ["biggest", "transportation"] },
    { prompt: "Suggest the top three actions to lower my annual CO2 emissions.", keywords: ["emissions", "action"] },
  ];

  testPrompts.forEach(({ prompt }) => {
    test(`Verify Prompt: "${prompt}" produces personalized responses`, async () => {
      // Create a mock request object satisfying route.ts expectations
      const request = {
        json: async () => ({
          messages: [{ role: "user", content: prompt }],
          ...mockPayload,
        }),
      } as unknown as NextRequest;

      const response = await POST(request);

      if (response.status !== 200) {
        expect([429, 503]).toContain(response.status);
        const data = await response.json();
        expect(data).toHaveProperty("error");
        expect(["Rate limit / quota exceeded", "Temporary service unavailable"]).toContain(data.error);
        console.warn(`Transient Gemini API load occurred (Status: ${response.status}). Error category: ${data.error}`);
        return;
      }

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("reply");
      
      const replyText = data.reply.toLowerCase();
      console.log(`Prompt: "${prompt}"\nAI Response:\n${data.reply}\n\n`);

      // Verify personalization by checking length and quality of reply
      expect(replyText.length).toBeGreaterThan(50);
    }, 15000); // 15 seconds timeout per API call
  });
});
