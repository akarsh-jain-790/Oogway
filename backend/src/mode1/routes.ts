
import { Router, Request, Response } from 'express';
// import { getZones } from './data'; // Mock data (disabled)
import { discoverZones } from '../services/zone-discovery';
import { scoreZones } from '../services/zone-scoring';
import { Mode1Request, Mode1Response } from './models';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { anchors, preferences } = req.body as Mode1Request;

        if (!anchors || !preferences) {
            return res.status(400).json({ error: 'Missing anchors or preferences' });
        }

        console.log("🗺️ Processing Mode 1 Request with Dynamic Logic...");

        // 1. Zone Discovery (3km search radius around anchors)
        // If >1 anchors, we could merge areas or search around all.
        // For now, discover around primary anchor (index 0)
        let discoveredZones = await discoverZones(anchors, 3);
        discoveredZones = discoveredZones.slice(0, 3); // Limit to 3 for rate limits

        if (discoveredZones.length === 0) {
            // Fallback: If fail, return empty or retry with larger radius?
            // Let's retry with 5km
            console.log("⚠️ No zones found in 3km, trying 5km...");
            discoveredZones = await discoverZones(anchors, 5);
        }

        // 2. Zone Scoring (Distance Matrix + Amenities)
        const rankedZones = await scoreZones(discoveredZones, anchors, preferences);

        const response: Mode1Response = {
            topChoices: rankedZones.slice(0, 3), // Return Top 3
            allScores: rankedZones.map((z) => ({ name: z.name, score: z.score })),
            meta: {
                anchorsProcessed: anchors.length,
                prefsApplied: preferences,
            },
        };

        res.json(response);
    } catch (error) {
        console.error('Mode 1 Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
