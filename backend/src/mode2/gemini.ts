import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * ===== RISK ANALYSIS =====
 */
export async function analyzeRisk(input: {
  origin: string;
  destination: string;
  distance_km: number;
  duration_minutes: number;
  departure_time: string;
}) {
  try {
    const genAI = new GoogleGenerativeAI(
      process.env.MODE2_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
You are an urban mobility intelligence engine analyzing traffic in Bangalore.

Trip Details:
- Origin: ${input.origin}
- Destination: ${input.destination}
- Distance: ${input.distance_km} km
- Travel Time (in traffic): ${input.duration_minutes} minutes
- Departure Time: ${input.departure_time}

Consider:
- Bangalore peak hour congestion
- Known traffic bottlenecks
- Evening office commute patterns
- General unpredictability of traffic

Analyze the trip and determine:

1. Overall traffic risk level
2. Brief reasoning
3. Whether the user should leave earlier or later

Respond ONLY in valid JSON format.
Do NOT use markdown.
Do NOT include code blocks.

Format strictly as:

{
  "risk_level": "Low | Moderate | High",
  "reasoning": "Short, clear explanation.",
  "recommended_departure_adjustment_minutes": number
}

Use negative number if user should leave earlier.
Use positive number if user can leave later.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text;

  } catch (error: any) {
    return JSON.stringify({
      risk_level: "Unknown",
      reasoning: "AI analysis failed. Using fallback logic.",
      recommended_departure_adjustment_minutes: 0
    });
  }
}


/**
 * ===== AGENTIC TRANSPORT DECISION =====
 */
export async function generateModeDecision(input: {
  traffic_level: string;
  delay: number;
  cab_cost: number;
  bus_cost: number;
  temperature: number | null;
  isRaining: boolean;
}) {
  try {
    const genAI = new GoogleGenerativeAI(
      process.env.MODE2_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
You are a mobility optimization decision agent.

Live Conditions:
- Traffic Level: ${input.traffic_level}
- Traffic Delay: ${input.delay} minutes
- Cab Cost: ₹${input.cab_cost}
- Bus Cost: ₹${input.bus_cost}
- Temperature: ${input.temperature}
- Rain Present: ${input.isRaining}

Your job:
Choose the most optimal transport mode based on:
- Cost efficiency
- Travel time stability
- Weather impact
- Congestion level

Respond ONLY in valid JSON format.
Do NOT include markdown.

Format:

{
  "recommended_mode": "Cab | Bus",
  "reasoning": "Short explanation of why this mode is optimal.",
  "confidence_score": number (0-1),
  "decision_factors": ["factor1", "factor2", "factor3"]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (error: any) {
    return {
      recommended_mode: "Cab",
      reasoning: "Fallback decision due to AI evaluation error.",
      confidence_score: 0.5,
      decision_factors: ["Fallback mode"]
    };
  }
}
