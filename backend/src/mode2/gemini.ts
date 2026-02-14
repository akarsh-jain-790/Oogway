import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeRisk(input: {
  origin: string;
  destination: string;
  distance_km: number;
  duration_minutes: number;
  departure_time: string;
}) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.MODE2_GEMINI_API_KEY!);

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
