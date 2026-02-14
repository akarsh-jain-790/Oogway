from fastapi import APIRouter, HTTPException
from .models import Mode1Request, Mode1Response
from .data import get_zones
from .scoring import calculate_scores

router = APIRouter(
    prefix="/mode1",
    tags=["mode1"]
)

@router.post("/", response_model=Mode1Response)
async def get_ranked_zones(request: Mode1Request):
    try:
        # 1. Fetch Zones (Mock)
        zones = get_zones()
        
        # 2. Calculate Scores
        ranked_zones = calculate_scores(zones, request.anchors, request.preferences)
        
        # 3. Format Response
        return Mode1Response(
            topChoices=ranked_zones[:3],
            allScores=[{"name": z.name, "score": z.score} for z in ranked_zones],
            meta={
                "anchorsProcessed": len(request.anchors),
                "prefsApplied": request.preferences.model_dump()
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
