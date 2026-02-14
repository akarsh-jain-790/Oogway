import { Router, Request, Response } from 'express';
import { getZones } from './data';
import { rankZones } from './scoring';
import { Mode1Request, Mode1Response } from './models';

const router = Router();

router.post('/', (req: Request, res: Response) => {
    try {
        const { anchors, preferences } = req.body as Mode1Request;

        if (!anchors || !preferences) {
            return res.status(400).json({ error: 'Missing anchors or preferences' });
        }

        const zones = getZones();
        const rankedZones = rankZones(zones, anchors, preferences);

        const response: Mode1Response = {
            topChoices: rankedZones.slice(0, 3),
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
