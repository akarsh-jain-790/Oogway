from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.mode1.router import router as mode1_router

app = FastAPI(title="SusMap Backend")

# CORS Configuration
origins = [
    "http://localhost:3000", # Next.js frontend
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(mode1_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "SusMap Backend is running"}
