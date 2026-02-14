from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class Anchor(BaseModel):
    id: Optional[str] = None
    type: str # 'Work', 'Gym', 'Partner', 'Family'
    name: Optional[str] = None
    latitude: float
    longitude: float

class UserPreferences(BaseModel):
    commutePriority: int = Field(..., ge=1, le=10)
    deliveryImportance: int = Field(..., ge=1, le=10)
    quietVsNightlife: int = Field(..., ge=1, le=10)
    festivalTolerance: int = Field(..., ge=1, le=10)
    schoolsImportance: int = Field(..., ge=1, le=10)
    hospitalsImportance: int = Field(..., ge=1, le=10)
    culturalProximity: int = Field(..., ge=1, le=10)

class Mode1Request(BaseModel):
    anchors: List[Anchor]
    preferences: UserPreferences

class MatchDetails(BaseModel):
    commute: str
    lifestyleMatch: str
    festivalImpact: str
    warning: Optional[str] = None

class Zone(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    festivalDisruption: float
    infrastructureDensity: float
    serviceReliability: float
    monsoonRisk: float
    noiseProfile: int
    deliveryReliability: Literal['High', 'Medium', 'Low']

class ScoredZone(Zone):
    score: float
    matchDetails: MatchDetails

class Mode1Response(BaseModel):
    topChoices: List[ScoredZone]
    allScores: List[dict]
    meta: dict
