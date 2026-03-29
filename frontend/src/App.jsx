import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (dateStr) => {
  const d = new Date(dateStr * 1000);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};
const fmtDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

async function api(path) {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

// ── sub-components ────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="loader">
      <div className="loader-bar" />
      <span>Loading...</span>
    </div>
  );
}

function Err({ msg }) {
  return <div className="err-box">⚠ {msg || "Something went wrong"}</div>;
}

function Standings() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api("/api/standings")
      .then(d => setData(d?.response?.[0]?.league?.standings?.[0] || []))
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <Err msg={err} />;
  if (!data) return <Loader />;

  return (
    <div className="table-wrap">
      <table className="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Club</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GD</th>
            <th className="pts-col">PTS</th>
            <th className="form-col">Form</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const pos = row.rank;
            const zone =
              pos <= 4 ? "ucl" : pos === 5 ? "uel" : pos >= 18 ? "rel" : "";
            return (
              <tr key={row.team.id} className={`row-${zone}`}>
                <td className="pos-cell">
                  <span className={`pos-dot pos-${zone}`}>{pos}</span>
                </td>
                <td className="club-cell">
                  <img src={row.team.logo} alt="" className="team-logo-sm" />
                  <span>{row.team.name}</span>
                </td>
                <td>{row.all.played}</td>
                <td>{row.all.win}</td>
                <td>{row.all.draw}</td>
                <td>{row.all.lose}</td>
                <td className={row.goalsDiff > 0 ? "pos-num" : row.goalsDiff < 0 ? "neg-num" : ""}>
                  {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                </td>
                <td className="pts-col bold">{row.points}</td>
                <td className="form-col">
                  {row.form?.split("").map((f, i) => (
                    <span key={i} className={`form-dot form-${f}`}>{f}</span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="legend">
        <span className="leg ucl">Champions League</span>
        <span className="leg uel">Europa League</span>
        <span className="leg rel">Relegation</span>
      </div>
    </div>
  );
}

function MatchCard({ match, upcoming }) {
  const home = match.teams.home;
  const away = match.teams.away;
  const goals = match.goals;
  const isHomeWin = goals.home > goals.away;
  const isAwayWin = goals.away > goals.home;

  return (
    <div className="match-card">
      <div className="match-date">{fmtDate(match.fixture.date)}</div>
      <div className="match-body">
        <div className={`match-team ${!upcoming && isHomeWin ? "winner" : ""}`}>
          <img src={home.logo} alt="" className="team-logo-sm" />
          <span>{home.name}</span>
        </div>
        {upcoming ? (
          <div className="match-vs">VS</div>
        ) : (
          <div className="match-score">
            <span className={isHomeWin ? "score-win" : ""}>{goals.home}</span>
            <span className="score-sep">–</span>
            <span className={isAwayWin ? "score-win" : ""}>{goals.away}</span>
          </div>
        )}
        <div className={`match-team match-team-away ${!upcoming && isAwayWin ? "winner" : ""}`}>
          <img src={away.logo} alt="" className="team-logo-sm" />
          <span>{away.name}</span>
        </div>
      </div>
      <div className="match-venue">{match.fixture.venue?.name}</div>
    </div>
  );
}

function Results() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api("/api/results?last=12")
      .then(d => setData(d?.response || []))
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <Err msg={err} />;
  if (!data) return <Loader />;

  return (
    <div className="matches-grid">
      {data.map(m => <MatchCard key={m.fixture.id} match={m} upcoming={false} />)}
    </div>
  );
}

function Fixtures() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api("/api/fixtures?next=12")
      .then(d => setData(d?.response || []))
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <Err msg={err} />;
  if (!data) return <Loader />;

  return (
    <div className="matches-grid">
      {data.map(m => <MatchCard key={m.fixture.id} match={m} upcoming={true} />)}
    </div>
  );
}

function PlayerStats() {
  const [tab, setTab] = useState("scorers");
  const [scorers, setScorers] = useState(null);
  const [assists, setAssists] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    Promise.all([
      api("/api/topscorers").then(d => d?.response || []),
      api("/api/topassists").then(d => d?.response || []),
    ])
      .then(([s, a]) => { setScorers(s); setAssists(a); })
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <Err msg={err} />;
  if (!scorers) return <Loader />;

  const list = tab === "scorers" ? scorers : assists;
  const statKey = tab === "scorers" ? "goals" : "assists";
  const statLabel = tab === "scorers" ? "Goals" : "Assists";

  return (
    <div>
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "scorers" ? "active" : ""}`} onClick={() => setTab("scorers")}>
          ⚽ Top Scorers
        </button>
        <button className={`tab-btn ${tab === "assists" ? "active" : ""}`} onClick={() => setTab("assists")}>
          🎯 Top Assists
        </button>
      </div>
      <div className="players-list">
        {list.slice(0, 15).map((p, i) => {
          const player = p.player;
          const stats = p.statistics?.[0];
          const val = stats?.goals?.[statKey] ?? 0;
          const maxVal = list[0]?.statistics?.[0]?.goals?.[statKey] ?? 1;
          return (
            <div key={player.id} className="player-row">
              <div className="player-rank">{i + 1}</div>
              <img src={player.photo} alt="" className="player-photo" />
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-team">
                  <img src={stats?.team?.logo} alt="" className="team-logo-xs" />
                  {stats?.team?.name}
                </div>
              </div>
              <div className="player-bar-wrap">
                <div className="player-bar" style={{ width: `${(val / maxVal) * 100}%` }} />
              </div>
              <div className="player-stat">
                <span className="stat-num">{val}</span>
                <span className="stat-lbl">{statLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── main app ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "standings", label: "Standings", icon: "🏆" },
  { id: "results", label: "Results", icon: "📋" },
  { id: "fixtures", label: "Fixtures", icon: "📅" },
  { id: "players", label: "Players", icon: "⚽" },
];

export default function App() {
  const [tab, setTab] = useState("standings");

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0e0a;
          --bg2: #0f140f;
          --bg3: #151c15;
          --border: #1f2b1f;
          --accent: #39ff14;
          --accent-dim: rgba(57,255,20,0.15);
          --accent2: #ff6b35;
          --text: #b8ccb8;
          --text-dim: #4a5e4a;
          --text-bright: #e8f5e8;
          --ucl: #4a9eff;
          --uel: #ff9f40;
          --rel: #ff4444;
          --display: 'Bebas Neue', sans-serif;
          --body: 'DM Sans', sans-serif;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--body); }

        .app {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse at 50% -20%, rgba(57,255,20,0.06) 0%, transparent 60%);
        }

        /* header */
        header {
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          padding: 0 32px;
          display: flex;
          align-items: center;
          gap: 20px;
          height: 64px;
        }

        .header-logo {
          font-family: var(--display);
          font-size: 28px;
          letter-spacing: 0.08em;
          color: var(--text-bright);
        }

        .header-logo span { color: var(--accent); }

        .header-badge {
          background: var(--accent-dim);
          border: 1px solid var(--accent);
          color: var(--accent);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          padding: 3px 8px;
          text-transform: uppercase;
        }

        .header-season {
          margin-left: auto;
          font-size: 12px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
        }

        /* nav */
        nav {
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          padding: 0 32px;
          display: flex;
          gap: 4px;
        }

        .nav-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          font-family: var(--body);
          font-size: 13px;
          font-weight: 500;
          padding: 14px 20px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-btn:hover { color: var(--text); }
        .nav-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

        /* main */
        main { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }

        .section-title {
          font-family: var(--display);
          font-size: 32px;
          letter-spacing: 0.06em;
          color: var(--text-bright);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* loader */
        .loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px;
          color: var(--text-dim);
          font-size: 12px;
          letter-spacing: 0.15em;
        }

        .loader-bar {
          width: 200px; height: 2px;
          background: var(--border);
          overflow: hidden;
        }

        .loader-bar::after {
          content: '';
          display: block;
          height: 100%;
          background: var(--accent);
          animation: scan 1.2s ease-in-out infinite;
        }

        @keyframes scan {
          0% { transform: translateX(-100%); width: 100%; }
          100% { transform: translateX(200%); width: 100%; }
        }

        .err-box {
          border: 1px solid var(--accent2);
          background: rgba(255,107,53,0.05);
          color: var(--accent2);
          padding: 16px 20px;
          font-size: 13px;
        }

        /* standings */
        .table-wrap { overflow-x: auto; }

        .standings-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .standings-table th {
          text-align: left;
          padding: 10px 12px;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: var(--text-dim);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
          font-weight: 500;
        }

        .standings-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
        }

        .standings-table tr:hover td { background: var(--bg3); }

        .pts-col { text-align: left; }
        .form-col { text-align: left; }
        .bold { font-weight: 700; color: var(--text-bright); }

        .pos-cell { width: 40px; }

        .pos-dot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px; height: 24px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-dim);
        }

        .pos-ucl { color: var(--ucl); }
        .pos-uel { color: var(--uel); }
        .pos-rel { color: var(--rel); }

        .row-ucl td:first-child { border-left: 2px solid var(--ucl); }
        .row-uel td:first-child { border-left: 2px solid var(--uel); }
        .row-rel td:first-child { border-left: 2px solid var(--rel); }

        .club-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          color: var(--text-bright);
          min-width: 180px;
          height: 100%
        }

        .team-logo-sm { width: 20px; height: 20px; object-fit: contain; }
        .team-logo-xs { width: 14px; height: 14px; object-fit: contain; }

        .form-dot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px; height: 18px;
          font-size: 9px;
          font-weight: 700;
          margin-left: 2px;
          border-radius: 2px;
        }

        .form-W { background: rgba(57,255,20,0.2); color: var(--accent); }
        .form-D { background: rgba(255,170,0,0.15); color: #ffaa00; }
        .form-L { background: rgba(255,68,68,0.15); color: var(--rel); }

        .pos-num { color: var(--accent); font-weight: 600; }
        .neg-num { color: var(--rel); }

        .legend {
          display: flex;
          gap: 20px;
          margin-top: 16px;
          font-size: 11px;
        }

        .leg { display: flex; align-items: center; gap: 6px; color: var(--text-dim); }
        .leg::before { content: ''; display: block; width: 10px; height: 10px; border-radius: 2px; }
        .leg.ucl::before { background: var(--ucl); }
        .leg.uel::before { background: var(--uel); }
        .leg.rel::before { background: var(--rel); }

        /* matches */
        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2px;
        }

        .match-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          padding: 16px;
          transition: border-color 0.2s;
        }

        .match-card:hover { border-color: rgba(57,255,20,0.3); }

        .match-date {
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--text-dim);
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .match-body {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .match-team {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .match-team.winner { color: var(--text-bright); font-weight: 700; }
        .match-team-away { flex-direction: row-reverse; text-align: right; }

        .match-score {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--display);
          font-size: 26px;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          min-width: 70px;
          justify-content: center;
        }

        .score-win { color: var(--text-bright); }
        .score-sep { color: var(--border); font-size: 20px; }

        .match-vs {
          font-family: var(--display);
          font-size: 18px;
          color: var(--text-dim);
          min-width: 50px;
          text-align: center;
        }

        .match-venue {
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.08em;
          text-align: center;
        }

        /* players */
        .tab-bar {
          display: flex;
          gap: 2px;
          margin-bottom: 20px;
        }

        .tab-btn {
          background: var(--bg2);
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-family: var(--body);
          font-size: 13px;
          font-weight: 500;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: var(--accent-dim);
          border-color: var(--accent);
          color: var(--accent);
        }

        .players-list { display: flex; flex-direction: column; gap: 2px; }

        .player-row {
          background: var(--bg2);
          border: 1px solid var(--border);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.2s;
        }

        .player-row:hover { border-color: rgba(57,255,20,0.3); }

        .player-rank {
          font-family: var(--display);
          font-size: 22px;
          color: var(--text-dim);
          min-width: 28px;
          text-align: center;
        }

        .player-photo {
          width: 36px; height: 36px;
          border-radius: 50%;
          object-fit: cover;
          background: var(--bg3);
          border: 1px solid var(--border);
        }

        .player-info { flex: 1; min-width: 0; }

        .player-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-bright);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-team {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-dim);
          margin-top: 2px;
        }

        .player-bar-wrap {
          flex: 1;
          max-width: 180px;
          height: 4px;
          background: var(--bg3);
          border-radius: 2px;
          overflow: hidden;
        }

        .player-bar {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 0.8s ease;
        }

        .player-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 40px;
        }

        .stat-num {
          font-family: var(--display);
          font-size: 24px;
          color: var(--accent);
          line-height: 1;
        }

        .stat-lbl {
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text-dim);
          text-transform: uppercase;
        }
      `}</style>

      <header>
        <div className="header-logo">PL<span>TRACKER</span></div>
        <div className="header-badge">2024/25</div>
        <div className="header-season">Premier League · Live Data</div>
      </header>

      <nav>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <main>
        {tab === "standings" && (
          <>
            <div className="section-title">🏆 Table</div>
            <Standings />
          </>
        )}
        {tab === "results" && (
          <>
            <div className="section-title">📋 Recent Results</div>
            <Results />
          </>
        )}
        {tab === "fixtures" && (
          <>
            <div className="section-title">📅 Upcoming Fixtures</div>
            <Fixtures />
          </>
        )}
        {tab === "players" && (
          <>
            <div className="section-title">⚽ Player Stats</div>
            <PlayerStats />
          </>
        )}
      </main>
    </div>
  );
}