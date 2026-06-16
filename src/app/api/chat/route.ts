import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      messages = [],
      region = "Global",
      householdSize = 1,
      transportData = {},
      electricityUsage = 0,
      foodHabits = "mixed",
      wasteHabits = {},
      shoppingHabits = "medium",
      carbonScore = 50,
      highestEmissionCategory = "None",
      sustainabilityGoals = {},
      historicalTrendSummary = {},
      carbonData = {},
      habits = [],
    } = payload;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("Gemini API Key (GEMINI_API_KEY) is not configured in the server environment.");
      return NextResponse.json(
        { error: "API key is not configured on the server. Falling back to local coach." },
        { status: 404 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Map score to rating bands
    let ratingBand = "Moderate";
    if (carbonScore >= 85) ratingBand = "Excellent";
    else if (carbonScore >= 70) ratingBand = "Good";
    else if (carbonScore >= 50) ratingBand = "Moderate";
    else if (carbonScore >= 30) ratingBand = "High";
    else ratingBand = "Critical";

    // System prompt setup
    const systemInstruction = `You are an expert sustainability coach helping users understand, track, and reduce their carbon footprint. Use the provided user profile and calculations to generate practical, personalized, actionable advice. Explain recommendations clearly and avoid generic responses.

Here is the user's detailed sustainability profile:
- **Region**: ${region}
- **Household Size**: ${householdSize} occupants (emissions split accordingly)
- **Carbon Score**: ${carbonScore}/100 (Rating: ${ratingBand})
- **Highest Emission Category**: ${highestEmissionCategory}
- **Electricity Usage**: ${electricityUsage} kWh/month
- **Food Preference**: ${foodHabits}
- **Shopping Frequency**: ${shoppingHabits}
- **Transportation Details (annual km)**:
  ${Object.entries(transportData || {}).map(([mode, km]) => `- ${mode}: ${km} km`).join("\n  ")}
- **Waste Details**:
  - Recycling Frequency: ${wasteHabits?.recyclingFrequency || "N/A"}
  - Plastic Usage: ${wasteHabits?.plasticUsage || "N/A"}
  - Composting: ${wasteHabits?.composting ? "Yes" : "No"}
  - Waste Generation: ${wasteHabits?.wasteGeneration || "N/A"}
- **Current Carbon Breakdown (kg CO2/year)**:
  - Transport: ${carbonData?.transport ?? 0} kg
  - Electricity: ${carbonData?.electricity ?? 0} kg
  - Food: ${carbonData?.food ?? 0} kg
  - Waste: ${carbonData?.waste ?? 0} kg
  - Shopping: ${carbonData?.shopping ?? 0} kg
  - **Total annual footprint**: ${carbonData?.total ?? 0} kg (Sustainable target is 3,500 kg CO2/year)
- **Sustainability Goals**:
  - Weekly Reduction Target: ${sustainabilityGoals?.weeklyReductionTarget ?? "N/A"} kg CO2
  - Monthly CO2 Target: ${sustainabilityGoals?.monthlyCO2Target ?? "N/A"} kg CO2
  - Target Reduction Level: ${sustainabilityGoals?.goalType ?? "N/A"}%
- **Historical Trends**:
  - Rolling Average: ${historicalTrendSummary?.rollingAverage ?? "N/A"} kg CO2
  - Trend Improvement: ${historicalTrendSummary?.improvementPercentage ?? 0}% compared to initial baseline
  - Total Submissions: ${historicalTrendSummary?.submissionsCount ?? 0} logs
- **Active Daily Habits Checklist**:
  ${habits?.map((h: { name: string; streak: number }) => `- ${h.name} (Streak: ${h.streak} days)`).join("\n  ")}

When the user asks questions, refer directly to their data. Be specific, actionable, and encouraging. Estimate impact in kg CO2 saved or financial savings where possible. Maintain conversation context and memory. Respond in clean Markdown format with clear spacing, bold texts, and lists where appropriate.`;

    const contents = (messages as ChatMessage[]).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: "Hello! Analyze my footprint and give me a brief overview." }],
      });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message?: string } };
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Gemini API error" },
        { status: response.status }
      );
    }

    const resData = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I am unable to generate a response at this time.";

    return NextResponse.json({ reply: replyText });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + errMessage },
      { status: 500 }
    );
  }
}
