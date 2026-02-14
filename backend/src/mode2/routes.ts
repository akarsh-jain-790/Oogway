import { Router } from "express";
import { getDirections } from "./google";
import { estimatePricing } from "./pricing";
import { analyzeRisk } from "./gemini";

const router = Router();

/**
 * CONFIG ENDPOINT
 */
router.get("/config", (req, res) => {
  res.json({
    inputs: [
      { id: "destination", type: "text" },
      { id: "departure_time", type: "datetime" },
      {
        id: "transport_mode",
        type: "select",
        options: ["Cab", "Bike", "Auto"]
      }
    ]
  });
});

/**
 * ANALYZE ENDPOINT
 */
router.post("/analyze", async (req, res) => {
  try {
    const { origin, destination, departure_time } = req.body;

    // 🔒 Basic validation
    if (!origin || !destination || !departure_time) {
      return res.status(400).json({
        error: "origin, destination and departure_time are required"
      });
    }

    /**
     * ===== PRIMARY ANALYSIS =====
     */
    const directions = await getDirections(
      origin,
      destination,
      departure_time
    );

    const traffic_delay_minutes =
      directions.duration_in_traffic_minutes -
      directions.duration_minutes;

    const pricing = estimatePricing(
      directions.distance_km,
      directions.duration_in_traffic_minutes
    );

    const geminiRaw = await analyzeRisk({
      origin,
      destination,
      distance_km: directions.distance_km,
      duration_minutes: directions.duration_in_traffic_minutes,
      departure_time
    });

    /**
     * Clean Gemini markdown output
     */
    let geminiParsed;
    try {
      const cleaned = geminiRaw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      geminiParsed = JSON.parse(cleaned);
    } catch {
      geminiParsed = {
        risk_level: "Unknown",
        reasoning: geminiRaw,
        recommended_departure_adjustment_minutes: 0
      };
    }

    /**
     * ===== ALTERNATIVE ANALYSIS (+30 MINUTES) =====
     */
    const laterTime = new Date(
      new Date(departure_time).getTime() + 30 * 60000
    ).toISOString();

    const laterDirections = await getDirections(
      origin,
      destination,
      laterTime
    );

    const laterTrafficDelay =
      laterDirections.duration_in_traffic_minutes -
      laterDirections.duration_minutes;

    /**
     * ===== FINAL RESPONSE =====
     */
    res.json({
      trip_summary: {
        distance_km: directions.distance_km,
        duration_minutes: directions.duration_minutes,
        duration_in_traffic_minutes:
          directions.duration_in_traffic_minutes,
        traffic_delay_minutes: Math.round(traffic_delay_minutes)
      },

      ride_pricing: pricing,

      risk_analysis: geminiParsed,

      alternative_departure_analysis: {
        departure_time_plus_30min: laterTime,
        duration_in_traffic_minutes:
          laterDirections.duration_in_traffic_minutes,
        traffic_delay_minutes: Math.round(laterTrafficDelay)
      }
    });

  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal Server Error"
    });
  }
});

export default router;
