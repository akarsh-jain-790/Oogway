import { Router } from "express";
import { getDirections } from "./google";
import { estimatePricing } from "./pricing";
import { analyzeRisk, generateModeDecision } from "./gemini";
import { getWeather } from "./weather";

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

    const congestionRatio =
      traffic_delay_minutes /
      directions.duration_in_traffic_minutes;

    let trafficLevel = "LOW";
    if (congestionRatio > 0.25) trafficLevel = "HIGH";
    else if (congestionRatio > 0.12) trafficLevel = "MODERATE";

    /**
     * ===== WEATHER =====
     */
    const weather = await getWeather(
      directions.destination_lat,
      directions.destination_lng
    );

    const isRaining =
      weather.weather_code !== null &&
      weather.weather_code >= 51;

    /**
     * ===== PRICING =====
     */
    const pricing = estimatePricing(
      directions.distance_km,
      directions.duration_in_traffic_minutes,
      traffic_delay_minutes,
      isRaining
    );

    /**
     * ===== GEMINI RISK ANALYSIS =====
     */
    const geminiRaw = await analyzeRisk({
      origin,
      destination,
      distance_km: directions.distance_km,
      duration_minutes: directions.duration_in_traffic_minutes,
      departure_time
    });

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
    const laterDate = new Date(
      new Date(departure_time).getTime() + 30 * 60000
    );

    const laterDirections = await getDirections(
      origin,
      destination,
      laterDate.toISOString()
    );

    const laterTrafficDelay =
      laterDirections.duration_in_traffic_minutes -
      laterDirections.duration_minutes;

    // Convert to IST properly
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const laterTimeIST = istFormatter.format(laterDate);

    /**
     * ===== PUBLIC TRANSIT =====
     */
    const busDuration = Math.round(
      directions.duration_in_traffic_minutes * 1.1
    );

    const busCost = 60;

    /**
     * ===== CARBON ESTIMATION =====
     */
    const carbonCab = Number(
      (directions.distance_km * 0.15).toFixed(2)
    );

    const carbonBus = Number(
      (directions.distance_km * 0.05).toFixed(2)
    );

    /**
     * ===== AGENTIC DECISION =====
     */
    const decision = await generateModeDecision({
      traffic_level: trafficLevel,
      delay: Math.round(traffic_delay_minutes),
      cab_cost: pricing.ola_estimate,
      bus_cost: busCost,
      temperature: weather.temperature_c,
      isRaining
    });

    /**
     * ===== EXECUTIVE SUMMARY =====
     */
    const executiveSummary = `
For this trip from ${origin} to ${destination}, traffic is currently ${trafficLevel}
with a ${Math.round(traffic_delay_minutes)} minute delay.
Based on live conditions and pricing, the recommended transport mode is ${decision.recommended_mode}.
This option optimizes cost, stability, and sustainability under current congestion.
`.replace(/\s+/g, " ").trim();

    /**
     * ===== FINAL RESPONSE =====
     */
    res.json({
      executive_summary: executiveSummary,

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
        departure_time_plus_30min_ist: laterTimeIST,
        duration_in_traffic_minutes:
          laterDirections.duration_in_traffic_minutes,
        traffic_delay_minutes: Math.round(laterTrafficDelay)
      },

      live_conditions: {
        temperature_c: weather.temperature_c,
        traffic_level: trafficLevel,
        congestion_ratio: Number(congestionRatio.toFixed(2)),
        is_raining: isRaining
      },

      public_transit_option: {
        mode: "Bus",
        estimated_duration_minutes: busDuration,
        estimated_cost_inr: busCost,
        time_difference_vs_cab_minutes:
          busDuration -
          Math.round(directions.duration_in_traffic_minutes)
      },

      agent_decision: decision,

      sustainability: {
        carbon_cab_kg: carbonCab,
        carbon_bus_kg: carbonBus,
        carbon_savings_kg: Number(
          (carbonCab - carbonBus).toFixed(2)
        )
      }
    });

  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Internal Server Error"
    });
  }
});

export default router;
