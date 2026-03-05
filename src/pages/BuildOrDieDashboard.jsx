import { useState, useEffect } from "react";
import { getCurrentUser } from '../services/auth';
import { getMyCommitments } from '../services/commitments';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ACTIVITY = [
  { type: "shipped", text: "mercy_ux shipped Design System", time: "4m ago", color: "#00ff88" },
  { type: "commit", text: "aisha_dev committed to ML Dashboard", time: "12m ago", color: "#f5c518" },
  { type: "failed", text: "tunde_codes FAILED E-Commerce API", time: "1h ago", color: "#ff2244" },
  { type: "shipped", text: "brian_254 shipped Auth Microservice", time: "2h ago", color: "#00ff88" },
  { type: "streak", text: "dev_nancy hit a 21-day streak", time: "3h ago", color: "#f5c518" },
  { type: "commit", text: "john_ke committed to Portfolio v2", time: "5h ago", color: "#f5c518" },
];

const LEADERBOARD = [
  { rank: 1, user: "aisha_dev", shipped: 24, streak: 42, xp: 12400 },
  { rank: 2, user: "mercy_ux", shipped: 19, streak: 38, xp: 9800 },
  { rank: 3, user: "brian_254", shipped: 17, streak: 29, xp: 8200 },
];

const SPRINT = {
  title: "Build a REST API with auth",
  endsIn: { h: 11, m: 34, s: 22 },
  participants: 847,
  submitted: 312,
};

const NAV_ITEMS = [
  { id: "dashboard", label: "DASHBOARD", icon: "⬛" },
  { id: "wall", label: "COMMIT WALL", icon: "📋" },
  { id: "sprints", label: "48HR SPRINTS", icon: "⚡" },
  { id: "arena", label: "ARENA", icon: "⚔️" },
  { id: "leaderboard", label: "LEADERBOARD", icon: "🏆" },
  { id: "portfolio", label: "PORTFOLIO", icon: "📦" },
];

const STATUS_CFG = {
  building: { color: "#f5c518", label: "BUILDING" },
  danger:   { color: "#ff2244", label: "DANGER" },
  shipped:  { color: "#00ff88", label: "SHIPPED" },
};

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────

function Noise() {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.3 }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.02) 2px,rgba(0,0,0,0.02) 4px)" }} />
    </>
  );
}

function StatCard({ label, value, sub, color = "#ff2244", delay = 0 }) {
  return (
    <div style={{
      background: "#0c0c0c", padding: "28px 24px",
      borderTop: `2px solid ${color}`,
      animation: `fadeUp 0.5s ease ${delay}s both`,
      transition: "background 0.2s", cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "#111"}
      onMouseLeave={e => e.currentTarget.style.background = "#0c0c0c"}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: -2, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#333", marginTop: 8, letterSpacing: 2 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, color = "#ff2244" }) {
  return (
    <div style={{ height: 2, background: "#161616", marginTop: 12 }}>
      <div style={{
        height: "100%", width: `${value}%`,
        background: color,
        boxShadow: `0 0 8px ${color}60`,
        transition: "width 1s ease",
      }} />
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      background: "#111", color: "#444",
      padding: "3px 10px", fontSize: 9,
      letterSpacing: 2, border: "1px solid #1a1a1a",
    }}>{label}</span>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function Sidebar({ active, onNav, user }) {
  return (
    <div style={{
      width: 220, background: "#060606",
      borderRight: "1px solid #0f0f0f",
      display: "flex", flexDirection: "column",
      padding: "0", position: "relative",
      flexShrink: 0,
    }}>
      <div style={{
        padding: "28px 24px",
        borderBottom: "1px solid #0f0f0f",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff2244", boxShadow: "0 0 8px #ff2244", animation: "pulse 1.5s infinite" }} />
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>
          BUILD<span style={{ color: "#ff2244" }}>OR</span>DIE
        </span>
      </div>

      <nav style={{ flex: 1, padding: "16px 0" }}>
        {NAV_ITEMS.map(item => (
          <div key={item.id} onClick={() => onNav(item.id)} style={{
            padding: "12px 24px",
            display: "flex", alignItems: "center", gap: 12,
            background: active === item.id ? "rgba(255,34,68,0.06)" : "transparent",
            borderLeft: `2px solid ${active === item.id ? "#ff2244" : "transparent"}`,
            cursor: "pointer", transition: "all 0.15s",
            color: active === item.id ? "#fff" : "#444",
          }}
            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.color = "#888"; }}
            onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.color = "#444"; }}>
            <span style={{ fontSize: 11 }}>{item.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: 3, fontWeight: active === item.id ? "bold" : "normal" }}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      <div style={{ padding: "20px 24px", borderTop: "1px solid #0f0f0f", background: "#080808" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, background: "#ff2244",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || "B"}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#fff", fontWeight: "bold", letterSpacing: 1 }}>
              @{user?.username || "builder"}
            </div>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 2 }}>LVL {user?.level || 1} BUILDER</div>
          </div>
        </div>
        <div style={{ height: 2, background: "#111" }}>
          <div style={{ height: "100%", width: `${((user?.xp || 0) % 500) / 5}%`, background: "#ff2244" }} />
        </div>
        <div style={{ fontSize: 9, color: "#333", marginTop: 6, letterSpacing: 2 }}>
          {user?.xp || 0} XP
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

function DashboardMain({ user, commitments }) {
  const [sprintTime, setSprintTime] = useState(SPRINT.endsIn);
  const [newCommit, setNewCommit] = useState("");
  const [commitAdded, setCommitAdded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSprintTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return prev;
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = n => String(n).padStart(2, "0");

  const handleAddCommit = () => {
    if (newCommit.trim().length > 3) {
      setCommitAdded(true);
      setTimeout(() => setCommitAdded(false), 3000);
      setNewCommit("");
    }
  };

  const leaderboardWithMe = [
    ...LEADERBOARD,
    { rank: "?", user: user?.username || "you", shipped: user?.shipped || 0, xp: user?.xp || 0, isMe: true },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>

      {/* Header */}
      <div style={{ marginBottom: 40, animation: "fadeUp 0.4s ease both" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 8 }}>
          — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", year: "numeric" }).toUpperCase()}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -2, margin: 0 }}>
          GOOD MORNING, <span style={{ color: "#ff2244" }}>{user?.username?.toUpperCase() || "BUILDER"}.</span>
        </h1>
        <p style={{ color: "#444", fontSize: 13, marginTop: 8 }}>
          {user?.streak || 0} day streak. {user?.shipped || 0} projects shipped. Don't stop now.
        </p>
      </div>

      {/* Streak warning */}
      <div style={{
        padding: "16px 20px", marginBottom: 32,
        background: "rgba(245,197,24,0.04)",
        borderLeft: "3px solid #f5c518",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        animation: "fadeUp 0.4s ease 0.1s both",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "#f5c518", letterSpacing: 3, marginBottom: 4 }}>
            🔥 {user?.streak || 0}-DAY STREAK ACTIVE
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            You haven't shipped today. The wall is watching.
          </div>
        </div>
        <button style={{
          background: "#f5c518", color: "#080808",
          border: "none", padding: "10px 20px",
          fontSize: 10, letterSpacing: 3, fontWeight: 900,
          fontFamily: "'Courier New', monospace", cursor: "pointer",
          whiteSpace: "nowrap",
        }}>SHIP TODAY →</button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 32 }}>
        <StatCard label="CURRENT STREAK"   value={`${user?.streak || 0}d`}         sub="Keep going"           color="#f5c518" delay={0.1} />
        <StatCard label="PROJECTS SHIPPED" value={user?.shipped || 0}               sub="↑ ship more"          color="#00ff88" delay={0.15} />
        <StatCard label="BUILDER XP"       value={user?.xp || 0}                    sub={`Level ${user?.level || 1}`} color="#ff2244" delay={0.2} />
        <StatCard label="SKILLS DECLARED"  value={user?.skills?.length || 0}        sub="In the arena"        color="#888"    delay={0.25} />
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 2, marginBottom: 2 }}>

        {/* Active commitments */}
        <div style={{ animation: "fadeUp 0.5s ease 0.3s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444" }}>ACTIVE COMMITMENTS</div>
            <button style={{
              background: "transparent", color: "#ff2244",
              border: "1px solid #ff2244", padding: "6px 14px",
              fontSize: 9, letterSpacing: 3,
              fontFamily: "'Courier New', monospace", cursor: "pointer",
            }}>+ NEW</button>
          </div>

          {(!commitments || commitments.length === 0) ? (
            <div style={{ padding: "40px 24px", background: "#0c0c0c", borderLeft: "3px solid #1a1a1a", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#333", letterSpacing: 3 }}>NO COMMITMENTS YET.</div>
              <div style={{ fontSize: 11, color: "#2a2a2a", marginTop: 8 }}>What are you building?</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {commitments.map((c, i) => {
                const cfg = STATUS_CFG[c.status] || STATUS_CFG.building;
                return (
                  <div key={c._id || i} style={{
                    background: "#0c0c0c", padding: "24px",
                    borderLeft: `3px solid ${cfg.color}`,
                    transition: "background 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#111"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0c0c0c"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "#fff", marginBottom: 8 }}>
                          {c.project}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(c.stack || []).map(s => <Tag key={s} label={s} />)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                        <div style={{ fontSize: 10, color: cfg.color, letterSpacing: 3, fontWeight: "bold", marginBottom: 4 }}>
                          {cfg.label}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, marginRight: 16 }}>
                        <ProgressBar value={c.progress || 0} color={cfg.color} />
                      </div>
                      <span style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}>{c.progress || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick commit input */}
          <div style={{ marginTop: 2 }}>
            {commitAdded ? (
              <div style={{ padding: "20px 24px", background: "rgba(0,255,136,0.04)", borderLeft: "3px solid #00ff88", animation: "fadeUp 0.3s ease both" }}>
                <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 3 }}>✓ COMMITTED. NOW BUILD IT.</div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 0 }}>
                <input
                  value={newCommit}
                  onChange={e => setNewCommit(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddCommit()}
                  placeholder="Add new commitment..."
                  style={{
                    flex: 1, background: "#0c0c0c",
                    border: "1px solid #111", borderRight: "none",
                    color: "#fff", padding: "16px 20px",
                    fontSize: 12, fontFamily: "'Courier New', monospace", outline: "none",
                  }}
                />
                <button onClick={handleAddCommit} style={{
                  background: "#ff2244", color: "#fff", border: "none",
                  padding: "16px 24px", fontSize: 10, letterSpacing: 3,
                  cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: "bold",
                }}>COMMIT</button>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Sprint timer */}
          <div style={{ background: "#0c0c0c", padding: "24px", borderTop: "2px solid #ff2244", animation: "fadeUp 0.5s ease 0.35s both" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>⚡ LIVE 48HR SPRINT</div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: "bold", marginBottom: 16, lineHeight: 1.5 }}>
              {SPRINT.title}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[{ label: "HRS", val: pad(sprintTime.h) }, { label: "MIN", val: pad(sprintTime.m) }, { label: "SEC", val: pad(sprintTime.s) }].map(({ label, val }) => (
                <div key={label} style={{ flex: 1, textAlign: "center", background: "#111", padding: "12px 8px" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#ff2244", letterSpacing: -1 }}>{val}</div>
                  <div style={{ fontSize: 8, color: "#333", letterSpacing: 3 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 16 }}>
              {SPRINT.submitted} / {SPRINT.participants} submitted
            </div>
            <ProgressBar value={(SPRINT.submitted / SPRINT.participants) * 100} color="#ff2244" />
            <button style={{
              width: "100%", marginTop: 16,
              background: "transparent", color: "#ff2244",
              border: "1px solid #ff2244", padding: "12px",
              fontSize: 10, letterSpacing: 3, fontWeight: "bold",
              fontFamily: "'Courier New', monospace", cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff2244"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff2244"; }}>
              JOIN SPRINT →
            </button>
          </div>

          {/* Mini leaderboard */}
          <div style={{ background: "#0c0c0c", padding: "24px", animation: "fadeUp 0.5s ease 0.4s both" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>🏆 LEADERBOARD</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {leaderboardWithMe.map((u, i) => (
                <div key={i} style={{
                  padding: "10px 12px",
                  background: u.isMe ? "rgba(255,34,68,0.06)" : "#0a0a0a",
                  borderLeft: `2px solid ${u.isMe ? "#ff2244" : u.rank <= 3 ? "#f5c518" : "#1a1a1a"}`,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 10, color: u.rank <= 3 ? "#f5c518" : "#333", width: 20, textAlign: "center" }}>#{u.rank}</span>
                  <span style={{ fontSize: 11, color: u.isMe ? "#fff" : "#666", flex: 1, fontWeight: u.isMe ? "bold" : "normal" }}>@{u.user}</span>
                  <span style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}>{u.shipped} shipped</span>
                </div>
              ))}
            </div>
            <button style={{
              width: "100%", marginTop: 12,
              background: "transparent", color: "#333",
              border: "1px solid #111", padding: "10px",
              fontSize: 9, letterSpacing: 3,
              fontFamily: "'Courier New', monospace", cursor: "pointer",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "#333"}>
              VIEW FULL LEADERBOARD →
            </button>
          </div>

          {/* Skills */}
          <div style={{ background: "#0c0c0c", padding: "24px", animation: "fadeUp 0.5s ease 0.45s both" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>⚔️ YOUR ARSENAL</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(user?.skills || []).length === 0 ? (
                <div style={{ fontSize: 10, color: "#333", letterSpacing: 2 }}>NO SKILLS DECLARED YET</div>
              ) : (
                (user?.skills || []).map(skill => (
                  <span key={skill} style={{
                    background: "rgba(255,34,68,0.06)", border: "1px solid rgba(255,34,68,0.2)",
                    color: "#ff2244", padding: "6px 12px", fontSize: 9, letterSpacing: 2,
                  }}>{skill}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div style={{ marginTop: 2, animation: "fadeUp 0.5s ease 0.5s both" }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 12 }}>LIVE ACTIVITY FEED</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{
              padding: "14px 16px", background: "#0c0c0c",
              borderLeft: `2px solid ${a.color}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#555" }}>{a.text}</span>
              <span style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 1, marginLeft: 12, whiteSpace: "nowrap" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PLACEHOLDER PAGES ────────────────────────────────────────────────────────

function PlaceholderPage({ title, sub }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 16 }}>— COMING SOON</div>
      <h2 style={{ fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: -2, marginBottom: 12 }}>{title}</h2>
      <p style={{ color: "#444", fontSize: 13 }}>{sub}</p>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────

function TopBar({ page, user }) {
  const label = NAV_ITEMS.find(n => n.id === page)?.label || "DASHBOARD";
  return (
    <div style={{
      height: 56, background: "#080808",
      borderBottom: "1px solid #0f0f0f",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", flexShrink: 0,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#333" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <span style={{ fontSize: 10, color: "#444", letterSpacing: 3 }}>ALERTS</span>
          <div style={{ position: "absolute", top: -3, right: -8, width: 6, height: 6, borderRadius: "50%", background: "#ff2244", boxShadow: "0 0 6px #ff2244" }} />
        </div>
        <div style={{ width: 1, height: 16, background: "#111" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: "#ff2244", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff" }}>
            {user?.username?.[0]?.toUpperCase() || "B"}
          </div>
          <span style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>@{user?.username || "builder"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function BuildOrDieDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [realUser, setRealUser] = useState(null);
  const [realCommitments, setRealCommitments] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { window.location.href = '/auth'; return; }
    setRealUser(user);

    getMyCommitments()
      .then(data => setRealCommitments(data))
      .catch(() => {});
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardMain user={realUser} commitments={realCommitments} />;
      case "wall":        return <PlaceholderPage title="COMMIT WALL"  sub="See who's building and who's failing." />;
      case "sprints":     return <PlaceholderPage title="48HR SPRINTS" sub="Weekly builds. Hard deadlines. No excuses." />;
      case "arena":       return <PlaceholderPage title="THE ARENA"    sub="Real problems. No tutorials. Just build." />;
      case "leaderboard": return <PlaceholderPage title="LEADERBOARD"  sub="The wall ranks builders by shipped work only." />;
      case "portfolio":   return <PlaceholderPage title="PORTFOLIO"    sub="Every ship automatically documented here." />;
      default: return <DashboardMain user={realUser} commitments={realCommitments} />;
    }
  };

  return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      fontFamily: "'Courier New', monospace",
      color: "#e8e8e8", display: "flex", flexDirection: "column",
    }}>
      <Noise />
      <div style={{ display: "flex", flex: 1, position: "relative", zIndex: 1 }}>
        <Sidebar active={activePage} onNav={setActivePage} user={realUser} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TopBar page={activePage} user={realUser} />
          {renderPage()}
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #ff2244; }
      `}</style>
    </div>
  );
}