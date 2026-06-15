import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: string;
  content: string;
}

interface CarbonData {
  total: number;
  transport: number;
  electricity: number;
  food: number;
  waste: number;
  shopping: number;
}

interface HabitData {
  name: string;
  streak: number;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, carbonData, habits, region } = await req.json() as {
      messages: ChatMessage[];
      carbonData: CarbonData;
      habits: HabitData[];
      region: string;
    };

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Using client fallback." },
        { status: 404 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `
      You are the "CarbonWise AI Coach", an expert sustainability coach.
      The user is tracking their carbon footprint on CarbonWise AI.
      Here is the user's current carbon footprint data (annual emissions):
      - Total Annual Footprint: ${carbonData.total} kg CO2 equivalent.
      - Transportation: ${carbonData.transport} kg CO2.
      - Electricity: ${carbonData.electricity} kg CO2.
      - Food Habits: ${carbonData.food} kg CO2.
      - Waste Management: ${carbonData.waste} kg CO2.
      - Shopping: ${carbonData.shopping} kg CO2.
      - User Region: ${region}
      
      Active habits logged: ${habits.map((h) => `${h.name} (Streak: ${h.streak} days)`).join(", ")}.

      Your role is to offer encouraging, intelligent, highly actionable advice to help the user reduce their footprint.
      Provide realistic suggestions, such as carpooling, transit, dietary shifts (meat reduction), composting, and energy efficiency.
      Keep your response concise, engaging, and formatted in clean markdown. 
      Speak directly to the user's data. Avoid generic fluff. Make sure you compare their score or emissions to the sustainable target of 3,500 kg CO2/year.
    `;

    const contents = messages.map((m) => ({
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
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message?: string } };
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
