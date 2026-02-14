from typing import List
from .models import Zone

# Mock Data Repository
def get_zones() -> List[Zone]:
    return [
        Zone(
            id='z1',
            name='Bandra West',
            latitude=19.0596,
            longitude=72.8295,
            festivalDisruption=0.9,
            infrastructureDensity=0.9,
            serviceReliability=0.95,
            monsoonRisk=0.3,
            noiseProfile=9,
            deliveryReliability='High'
        ),
        Zone(
            id='z2',
            name='Powai',
            latitude=19.1176,
            longitude=72.9060,
            festivalDisruption=0.4,
            infrastructureDensity=0.85,
            serviceReliability=0.8,
            monsoonRisk=0.2,
            noiseProfile=4,
            deliveryReliability='High'
        ),
        Zone(
            id='z3',
            name='Dadar',
            latitude=19.0178,
            longitude=72.8478,
            festivalDisruption=1.0,
            infrastructureDensity=1.0,
            serviceReliability=1.0,
            monsoonRisk=0.6,
            noiseProfile=8,
            deliveryReliability='High'
        ),
        Zone(
            id='z4',
            name='Navi Mumbai (Vashi)',
            latitude=19.0771,
            longitude=72.9986,
            festivalDisruption=0.2,
            infrastructureDensity=0.7,
            serviceReliability=0.7,
            monsoonRisk=0.1,
            noiseProfile=3,
            deliveryReliability='Medium'
        ),
        Zone(
            id='z5',
            name='Juhu',
            latitude=19.0989,
            longitude=72.8306,
            festivalDisruption=0.8,
            infrastructureDensity=0.8,
            serviceReliability=0.9,
            monsoonRisk=0.4,
            noiseProfile=7,
            deliveryReliability='High'
        ),
        Zone(
            id='z6',
            name='Andheri West',
            latitude=19.1363,
            longitude=72.8277,
            festivalDisruption=0.7,
            infrastructureDensity=0.9,
            serviceReliability=0.9,
            monsoonRisk=0.5,
            noiseProfile=8,
            deliveryReliability='High'
        ),
        Zone(
            id='z7',
            name='South Bombay (Colaba)',
            latitude=18.9067,
            longitude=72.8147,
            festivalDisruption=0.5,
            infrastructureDensity=0.8,
            serviceReliability=0.9,
            monsoonRisk=0.2,
            noiseProfile=5,
            deliveryReliability='High'
        )
    ]
