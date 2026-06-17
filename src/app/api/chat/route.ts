import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
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

    const rawApiKey = process.env.GEMINI_API_KEY;
    const apiKey = rawApiKey?.trim();
    const model = "gemini-2.5-flash";

    if (isDev) {
      console.log(`[Gemini Diagnostics] process.env.GEMINI_API_KEY present: ${!!rawApiKey}`);
      console.log(`[Gemini Diagnostics] API Key non-empty after trim: ${!!apiKey}`);
      console.log(`[Gemini Diagnostics] Model to be used: ${model}`);
    }

    if (!apiKey) {
      if (isDev) {
        console.log(`[Gemini Diagnostics] Aborting request: Invalid or missing API key.`);
      }
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 400 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

    let response: Response;
    try {
      if (isDev) {
        console.log(`[Gemini Diagnostics] Sending request to Gemini API...`);
      }
      response = await fetch(endpoint, {
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
      if (isDev) {
        console.log(`[Gemini Diagnostics] Request reached Gemini. Status code: ${response.status}`);
      }
    } catch (fetchErr: unknown) {
      const errorMsg = fetchErr instanceof Error ? fetchErr.message : "Unknown fetch error";
      if (isDev) {
        console.log(`[Gemini Diagnostics] Failed to reach Gemini. Network connectivity issue: ${errorMsg}`);
      }
      return NextResponse.json(
        { error: "Network connectivity issue" },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const status = response.status;
      let errorCategory = "Unknown server error";
      let errorData: Record<string, unknown> = {};

      try {
        errorData = (await response.json()) as Record<string, unknown>;
      } catch {
        errorCategory = "Unknown server error";
      }

      if (status === 400 || status === 403) {
        const geminiError = errorData?.error as { message?: string } | undefined;
        const errMsg = geminiError?.message || "";
        if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("invalid") || status === 403) {
          errorCategory = "Authentication failure";
        } else {
          errorCategory = "Invalid request format";
        }
      } else if (status === 429) {
        errorCategory = "Rate limit / quota exceeded";
      } else if (status === 503 || status === 504) {
        errorCategory = "Temporary service unavailable";
      } else if (status === 404) {
        errorCategory = "Invalid request format";
      }

      if (isDev) {
        console.error(`[Gemini Diagnostics] Gemini API error response (HTTP ${status}). Category: ${errorCategory}`, errorData);
      }

      return NextResponse.json(
        { error: errorCategory },
        { status }
      );
    }

    interface GeminiResponse {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    }

    let resData: GeminiResponse = {};
    try {
      resData = (await response.json()) as GeminiResponse;
    } catch {
      if (isDev) {
        console.error(`[Gemini Diagnostics] Parsing failure for success response.`);
      }
      return NextResponse.json(
        { error: "Unknown server error" },
        { status: 500 }
      );
    }

    if (isDev) {
      console.log(`[Gemini Diagnostics] Response received successfully.`);
    }

    const replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I am unable to generate a response at this time.";

    return NextResponse.json({ reply: replyText });

  } catch (error: unknown) {
    if (isDev) {
      console.error("[Gemini Diagnostics] Unknown route error:", error);
    }
    return NextResponse.json(
      { error: "Unknown server error" },
      { status: 500 }
    );
  }
}
