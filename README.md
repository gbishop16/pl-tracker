# PLTracker — Premier League Dashboard

A full-stack Premier League tracker built with **FastAPI** + **React (Vite)**.
Pulls live data from the API-Football API and displays standings, results, fixtures, and player stats.

---

## Get Your Free API Key

1. Sign up at [api-football.com](https://www.api-football.com) (RapidAPI also works)
2. Free tier: **100 requests/day** — plenty for development
3. Copy your API key

---

## Run Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and paste your FOOTBALL_API_KEY

uvicorn main:app --reload
# API running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# .env: VITE_API_URL=http://localhost:8000

npm run dev
# App running at http://localhost:5173
```

---

## Deploy to Railway

### Backend
1. Push repo to GitHub
2. railway.app → New Project → Deploy from GitHub
3. Set **Root Directory** to `backend`
4. Add environment variable: `FOOTBALL_API_KEY=your_key`
5. Copy the deployed URL

### Frontend
1. New service in same Railway project → same repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.railway.app`
4. Railway builds with `npm run build` automatically

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/standings` | Current PL table |
| `GET /api/results?last=10` | Recent match results |
| `GET /api/fixtures?next=10` | Upcoming fixtures |
| `GET /api/topscorers` | Top goalscorers |
| `GET /api/topassists` | Top assists |
| `GET /api/team/{id}/players` | Players for a team |

---

## Features

- 🏆 **Standings** — Full table with UCL/UEL/Relegation zones, form guide, goal difference
- 📋 **Results** — Recent match scorelines with winner highlighting
- 📅 **Fixtures** — Upcoming matches with venue info
- ⚽ **Player Stats** — Top scorers and assists with visual bar chart

---

## Ideas to Extend

- [ ] Click a team to see their full squad and season stats
- [ ] Head-to-head comparison between two teams
- [ ] Add notifications for match reminders (using a scheduler + email API)
- [ ] Historical season data — compare across multiple years
- [ ] Add Championship / La Liga / Champions League toggle
- [ ] Mobile-responsive PWA with home screen install
