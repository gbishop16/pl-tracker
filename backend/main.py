from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Premier League Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("FOOTBALL_API_KEY", "")
BASE_URL = "https://v3.football.api-sports.io"
PL_ID = 39       # Premier League
SEASON = 2024    # Current season

HEADERS = {
    "x-apisports-key": API_KEY
}


async def fetch(endpoint: str, params: dict = {}):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="FOOTBALL_API_KEY not configured")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{BASE_URL}/{endpoint}", headers=HEADERS, params=params, timeout=15)
            data = resp.json()
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=data)
            return data
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=str(e))


@app.get("/")
def root():
    return {"status": "PL Tracker API running"}


@app.get("/api/standings")
async def get_standings():
    """Get current Premier League standings."""
    data = await fetch("standings", {"league": PL_ID, "season": SEASON})
    return data


@app.get("/api/results")
async def get_results(last: int = 10):
    """Get most recent Premier League match results."""
    data = await fetch("fixtures", {
        "league": PL_ID,
        "season": SEASON,
        "last": last,
        "status": "FT"
    })
    return data


@app.get("/api/fixtures")
async def get_fixtures(next: int = 10):
    """Get upcoming Premier League fixtures."""
    data = await fetch("fixtures", {
        "league": PL_ID,
        "season": SEASON,
        "next": next,
        "status": "NS"
    })
    return data


@app.get("/api/team/{team_id}/players")
async def get_players(team_id: int):
    """Get top players for a specific team."""
    data = await fetch("players", {
        "team": team_id,
        "league": PL_ID,
        "season": SEASON
    })
    return data


@app.get("/api/topscorers")
async def get_topscorers():
    """Get Premier League top scorers."""
    data = await fetch("players/topscorers", {
        "league": PL_ID,
        "season": SEASON
    })
    return data


@app.get("/api/topassists")
async def get_topassists():
    """Get Premier League top assists."""
    data = await fetch("players/topassists", {
        "league": PL_ID,
        "season": SEASON
    })
    return data


@app.get("/api/teams")
async def get_teams():
    """Get all Premier League teams."""
    data = await fetch("teams", {"league": PL_ID, "season": SEASON})
    return data
