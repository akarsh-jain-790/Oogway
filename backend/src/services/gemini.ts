
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not set. Gemini services will return placeholders.");
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export interface ZoneVibe {
    festival_impact: 'Low' | 'Moderate' | 'High';
    noise_profile: string; // e.g. "Low daytime, active weekends"
    monsoon_risk: 'Low' | 'Medium' | 'High';
    delivery_reliability: 'High' | 'Medium' | 'Low';
    vibe_description: string; // Short summary
}

export async function getZoneVibe(zoneName: string, city: string = "India"): Promise<ZoneVibe> {
    if (!apiKey) {
        return {
            festival_impact: 'Moderate',
            noise_profile: 'Average residential profile',
            monsoon_risk: 'Medium',
            delivery_reliability: 'High',
            vibe_description: 'Standard residential area.'
        };
    }

    try {
        const prompt = `
        Analyze the residential area '${zoneName}' in '${city}'.
        Return a JSON object with strictly these fields:
        - festival_impact: "Low" | "Moderate" | "High" (Consider major festivals like Ganesh Chaturthi constraints)
        - noise_profile: Short string (e.g. "Quiet residential", "Busy market area")
        - monsoon_risk: "Low" | "Medium" | "High" (Waterlogging probability)
        - delivery_reliability: "High" | "Medium" | "Low" (Serviceability by major apps)
        - vibe_description: One sentence summary of the area's vibe.

        Return ONLY valid JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic cleanup for markdown code blocks if Gemini wraps it
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr) as ZoneVibe;

        return {
            festival_impact: data.festival_impact || 'Moderate', // Fallback
            noise_profile: data.noise_profile || 'Unknown',
            monsoon_risk: data.monsoon_risk || 'Medium',
            delivery_reliability: data.delivery_reliability || 'High',
            vibe_description: data.vibe_description || `A typical neighborhood in ${city}.`
        };

    } catch (error) {
        console.error(`Gemini Error for ${zoneName}:`, error);
        return {
            festival_impact: 'Moderate',
            noise_profile: 'Assessment unavailable',
            monsoon_risk: 'Medium',
            delivery_reliability: 'High',
            vibe_description: 'Unable to generate insights.'
        };
    }
}

export async function getBatchZoneVibes(zoneNames: string[], city: string = "Bangalore", retries: number = 3): Promise<Record<string, ZoneVibe>> {
    if (!apiKey) {
        const results: Record<string, ZoneVibe> = {};
        zoneNames.forEach(name => {
            results[name] = {
                festival_impact: 'Moderate',
                noise_profile: 'Average residential profile',
                monsoon_risk: 'Medium',
                delivery_reliability: 'High',
                vibe_description: 'Standard residential area.'
            };
        });
        return results;
    }

    try {
        const prompt = `
        Analyze these residential areas in '${city}': ${zoneNames.join(', ')}.
        Return a JSON object where each key is the zone name and the value is a JSON object with strictly these fields:
        - festival_impact: "Low" | "Moderate" | "High"
        - noise_profile: Short string
        - monsoon_risk: "Low" | "Medium" | "High"
        - delivery_reliability: "High" | "Medium" | "Low"
        - vibe_description: One sentence summary of the area's vibe.

        Return ONLY valid JSON. Ensure the keys match the input zone names exactly.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr) as Record<string, ZoneVibe>;

        return data;

    } catch (error: any) {
        if (error.status === 429 && retries > 0) {
            console.log(`⚠️ Rate limited on Batch. Retrying in 2s... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return getBatchZoneVibes(zoneNames, city, retries - 1);
        }
        console.error(`Gemini Batch Error for ${city}:`, error);
        return {};
    }
}
