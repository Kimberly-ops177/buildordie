import { useState, useEffect } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CURRENT_SPRINT = {
  id: "S-047",
  title: "Build a REST API with authentication",
  description: "Build a complete REST API with user registration, login, JWT authentication, and at least 3 protected endpoints. Must include input validation, error handling, and a README.",
  requirements: [
    "User registration + login endpoints",
    "JWT access + refresh token flow",
    "At least 3 protected routes",
    "Input validation on all endpoints",
    "Error handling with proper HTTP codes",
    "README with setup instructions",
  ],
  constraints: [
    "No auth libraries like Passport or Auth0",
    "Must be tested with at least 5 manual test cases",
    "No frontend required — API only",
  ],
  difficulty: "INTERMEDIATE",
  xpReward: 450,
  participants: 1203,
  submitted: 489,
  endsAt: Date.now() + (11 * 3600 + 34 * 60 + 22) * 1000,
  tags: ["Backend", "Auth", "REST", "Security"],
  week: 47,
};

const PAST_SPRINTS = [
  { id: "S-046", title: "Real-time Chat with WebSockets", difficulty: "INTERMEDIATE", participants: 934, submitted: 412, winner: "aisha_dev", xp: 450, tags: ["Realtime", "WebSockets"] },
  { id: "S-045", title: "Deploy a full stack app in 48hrs", difficulty: "HARD", participants: 1102, submitted: 298, winner: "zara_tech", xp: 650, tags: ["DevOps", "Fullstack"] },
  { id: "S-044", title: "Build a CLI tool from scratch", difficulty: "BEGINNER", participants: 1540, submitted: 891, winner: "dev_nancy", xp: 250, tags: ["CLI", "Node"] },
  { id: "S-043", title: "Data pipeline with visualisation", difficulty: "HARD", participants: 876, submitted: 201, winner: "brian_254", xp: 650, tags: ["Data", "Python"] },
  { id: "S-042", title: "Component library in React", difficulty: "INTERMEDIATE", participants: 1021, submitted: 534, winner: "mercy_ux", xp: 450, tags: ["React", "UI"] },
];

const SUBMISSIONS = [
  { user: "aisha_dev", repo: "github.com/aisha/rest-auth-api", time: "3h ago", votes: 34, stack: ["Node", "Express", "JWT"], comment: "Used Redis for token blacklisting. Clean, tested, documented.", country: "🇳🇬" },
  { user: "zara_tech", repo: "github.com/zara/auth-service", time: "5h ago", votes: 28, stack: ["Go", "PostgreSQL"], comment: "Went with Go for the performance. Refresh token rotation implemented.", country: "🇿🇦" },
  { user: "john_ke", repo: "github.com/johnke/node-jwt", time: "8h ago", votes: 19, stack: ["Node", "MongoDB", "JWT"], comment: "First time building auth from scratch. Learned a ton.", country: "🇰🇪" },
  { user: "chidi_ng", repo: "github.com/chidi/fastapi-auth", time: "11h ago", votes: 15, stack: ["Python", "FastAPI"], comment: "FastAPI makes validation so clean. Pydantic schemas for everything.", country: "🇳🇬" },
  { user: "dev_nancy", repo: "github.com/nancy/express-auth", time: "14h ago", votes: 22, stack: ["Express", "Redis", "JWT"], comment: "Sliding session windows with Redis. Took some research but worth it.", country: "🇰🇪" },
];

const DIFFICULTY_CFG = {
  BEGINNER:     { color: "#00ff88", bg: "rgba(0,255,136,0.06)" },
  INTERMEDIATE: { color: "#f5c518", bg: "rgba(245,197,24,0.06)" },
  HARD:         { color: "#ff2244", bg: "rgba(255,34,68,0.06)" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, "0"); }

function Noise() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      opacity: 0.3,
    }} />
  );
}

function Tag({ label, color = "#444" }) {
  return (
    <span style={{ background: "#111", color, padding: "3px 10px", fontSize: 9, letterSpacing: 2, border: `1px solid ${color}20` }}>
      {label}
    </span>
  );
}

function Bar({ value, color = "#ff2244" }) {
  return (
    <div style={{ height: 2, background: "#161616" }}>
      <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, boxShadow: `0 0 6px ${color}50`, transition: "width 1s ease" }} />
    </div>
  );
}

// ─── SUBMIT MODAL ─────────────────────────────────────────────────────────────

function SubmitModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ repo: "", comment: "", stack: [] });
  const [submitted, setSubmitted] = useState(false);
  const STACKS = ["Node", "Express", "Python", "FastAPI", "Go", "Laravel", "Django", "MongoDB", "PostgreSQL", "Redis", "JWT", "Docker"];

  const toggle = s => setForm(f => ({ ...f, stack: f.stack.includes(s) ? f.stack.filter(x => x !== s) : [...f.stack, s] }));

  const handleSubmit = () => {
    if (!form.repo.trim() || form.stack.length === 0) return;
    setSubmitted(true);
    setTimeout(() => { onSubmit(form); onClose(); }, 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0a0a0a", width: "100%", maxWidth: 520,
        border: "1px solid #1a1a1a", borderTop: "2px solid #00ff88",
        padding: "40px", fontFamily: "'Courier New', monospace",
        animation: "slideUp 0.3s ease both",
      }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 4, marginBottom: 12 }}>SUBMISSION RECEIVED</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>SHIPPED. 🔥</div>
            <div style={{ fontSize: 12, color: "#444", marginTop: 12 }}>+450 XP added to your profile.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#00ff88", marginBottom: 12 }}>— SUBMIT YOUR BUILD</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 28 }}>
              READY TO SHIP?
            </h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, letterSpacing: 3, color: "#444", display: "block", marginBottom: 8 }}>GITHUB REPO URL</label>
              <input value={form.repo} onChange={e => setForm({ ...form, repo: e.target.value })}
                placeholder="github.com/you/your-project"
                style={{ width: "100%", background: "#0c0c0c", border: "1px solid #1a1a1a", borderLeft: "3px solid #00ff88", color: "#fff", padding: "13px 16px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, letterSpacing: 3, color: "#444", display: "block", marginBottom: 8 }}>WHAT DID YOU LEARN? (OPTIONAL)</label>
              <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                placeholder="One sentence. What was the hardest part?"
                rows={2}
                style={{ width: "100%", background: "#0c0c0c", border: "1px solid #1a1a1a", color: "#fff", padding: "13px 16px", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 10, letterSpacing: 3, color: "#444", display: "block", marginBottom: 12 }}>STACK USED — {form.stack.length} SELECTED</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STACKS.map(s => {
                  const sel = form.stack.includes(s);
                  return (
                    <button key={s} onClick={() => toggle(s)} style={{
                      padding: "6px 12px", background: sel ? "rgba(0,255,136,0.08)" : "transparent",
                      border: `1px solid ${sel ? "#00ff88" : "#1a1a1a"}`,
                      color: sel ? "#00ff88" : "#444",
                      fontSize: 9, letterSpacing: 2, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
                    }}>
                      {sel ? "✓ " : ""}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{ flex: "0 0 auto", padding: "14px 20px", background: "transparent", color: "#333", border: "1px solid #1a1a1a", fontSize: 10, letterSpacing: 3, fontFamily: "inherit", cursor: "pointer" }}>CANCEL</button>
              <button onClick={handleSubmit} disabled={!form.repo.trim() || form.stack.length === 0}
                style={{ flex: 1, padding: "14px", background: (!form.repo.trim() || form.stack.length === 0) ? "#001a08" : "#00ff88", color: (!form.repo.trim() || form.stack.length === 0) ? "#00ff88" : "#080808", border: "none", fontSize: 11, letterSpacing: 3, fontWeight: 900, fontFamily: "inherit", cursor: "pointer" }}>
                SHIP IT →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

function Countdown({ endsAt }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, total: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endsAt - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s, total: diff });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [endsAt]);

  const pct = (time.total / (48 * 3600000)) * 100;
  const isUrgent = time.h < 6;
  const color = isUrgent ? "#ff2244" : time.h < 12 ? "#f5c518" : "#00ff88";

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Big clock */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[
          { label: "HOURS", val: pad(time.h) },
          { label: "MINUTES", val: pad(time.m) },
          { label: "SECONDS", val: pad(time.s) },
        ].map(({ label, val }, i) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{
              background: "#0c0c0c", padding: "20px 8px",
              textAlign: "center",
              borderTop: `2px solid ${color}`,
              position: "relative", overflow: "hidden",
            }}>
              {/* Glow */}
              {isUrgent && (
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`, pointerEvents: "none" }} />
              )}
              <div style={{
                fontSize: 52, fontWeight: 900, color,
                letterSpacing: -2, lineHeight: 1,
                textShadow: isUrgent ? `0 0 20px ${color}80` : "none",
                fontVariantNumeric: "tabular-nums",
                transition: "color 0.5s",
              }}>{val}</div>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: 4, marginTop: 8 }}>{label}</div>
            </div>
            {i < 2 && (
              <div style={{ position: "relative", top: -44, left: "100%", width: 4, textAlign: "center", fontSize: 24, color: color, fontWeight: 900, opacity: 0.5 }}>:</div>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#0c0c0c", position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${100 - pct}%`,
          background: `linear-gradient(to right, ${color}00, ${color})`,
          transition: "width 1s linear",
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 3 }}>SPRINT STARTED</span>
        <span style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 3 }}>DEADLINE</span>
      </div>

      {isUrgent && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(255,34,68,0.06)", borderLeft: "3px solid #ff2244", animation: "fadeUp 0.4s ease both" }}>
          <div style={{ fontSize: 10, color: "#ff2244", letterSpacing: 3 }}>
            ⚠ FINAL HOURS — SUBMIT NOW OR MISS THE SPRINT
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function SprintPage() {
  const [tab, setTab] = useState("current");
  const [showModal, setShowModal] = useState(false);
  const [submissions, setSubmissions] = useState(SUBMISSIONS);
  const [joined, setJoined] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [votedIds, setVotedIds] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleJoin = () => { setJoined(true); showToast("JOINED SPRINT #047. Clock is ticking."); };
  const handleSubmit = data => {
    setSubmitted(true);
    setSubmissions(s => [{ ...data, user: "k_ops177", time: "just now", votes: 0, country: "🇰🇪" }, ...s]);
    showToast("SHIPPED. +450 XP earned.");
  };
  const handleVote = user => {
    if (votedIds.includes(user)) return;
    setVotedIds(v => [...v, user]);
    setSubmissions(s => s.map(sub => sub.user === user ? { ...sub, votes: sub.votes + 1 } : sub));
  };

  const diffCfg = DIFFICULTY_CFG[CURRENT_SPRINT.difficulty];
  const submissionPct = Math.round((CURRENT_SPRINT.submitted / CURRENT_SPRINT.participants) * 100);

  return (
    <div style={{ background: "#080808", minHeight: "100vh", fontFamily: "'Courier New', monospace", color: "#e8e8e8" }}>
      <Noise />

      {showModal && <SubmitModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 150, background: "#0c0c0c", border: "1px solid #00ff88", borderLeft: "3px solid #00ff88", padding: "14px 20px", fontFamily: "'Courier New', monospace", animation: "slideIn 0.3s ease both" }}>
          <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 3 }}>{toast}</div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>

        {/* Header */}
        <div style={{ padding: "48px 0 32px", borderBottom: "1px solid #0f0f0f" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2244", boxShadow: "0 0 8px #ff2244", animation: "pulse 1.5s infinite" }} />
                ⚡ WEEK {CURRENT_SPRINT.week} — LIVE SPRINT
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 1, margin: 0 }}>
                48HR<br />
                <span style={{ color: "transparent", WebkitTextStroke: "1px #333" }}>SPRINTS.</span>
              </h1>
              <p style={{ color: "#444", fontSize: 13, marginTop: 12, lineHeight: 1.8 }}>
                A new challenge every week. 48 hours to build and ship.<br />
                No tutorials. No hand-holding. Just you and the deadline.
              </p>
            </div>

            {/* XP badge */}
            <div style={{ background: "#0c0c0c", padding: "24px 28px", borderTop: "2px solid #f5c518", textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#f5c518", letterSpacing: -2 }}>+{CURRENT_SPRINT.xpReward}</div>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: 3, marginTop: 4 }}>XP FOR SHIPPING</div>
              <div style={{ marginTop: 12, fontSize: 9, color: "#333", letterSpacing: 2 }}>{CURRENT_SPRINT.participants.toLocaleString()} participants</div>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 32 }}>
            {[["current", "CURRENT SPRINT"], ["submissions", `SUBMISSIONS (${CURRENT_SPRINT.submitted})`], ["past", "PAST SPRINTS"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "12px 24px", background: tab === id ? "#ff2244" : "transparent",
                color: tab === id ? "#fff" : "#444",
                border: `1px solid ${tab === id ? "#ff2244" : "#1a1a1a"}`,
                fontSize: 10, letterSpacing: 3, fontFamily: "inherit", cursor: "pointer", fontWeight: tab === id ? 900 : "normal", transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── CURRENT SPRINT TAB ── */}
        {tab === "current" && (
          <div style={{ padding: "40px 0 80px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 2 }}>

              {/* Left: Brief */}
              <div>
                {/* Sprint ID + difficulty */}
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontSize: 9, color: "#333", letterSpacing: 3, background: "#0c0c0c", padding: "6px 12px" }}>SPRINT #{CURRENT_SPRINT.id}</span>
                  <span style={{ fontSize: 9, color: diffCfg.color, letterSpacing: 3, background: diffCfg.bg, padding: "6px 12px", border: `1px solid ${diffCfg.color}30` }}>{CURRENT_SPRINT.difficulty}</span>
                  {CURRENT_SPRINT.tags.map(t => <Tag key={t} label={t} color="#555" />)}
                </div>

                <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1.2, marginBottom: 20 }}>
                  {CURRENT_SPRINT.title}
                </h2>
                <p style={{ color: "#555", fontSize: 13, lineHeight: 1.9, marginBottom: 32 }}>
                  {CURRENT_SPRINT.description}
                </p>

                {/* Requirements */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>✓ REQUIREMENTS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {CURRENT_SPRINT.requirements.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 16px", background: "#0c0c0c", borderLeft: "2px solid #1a1a1a" }}>
                        <span style={{ color: "#00ff88", fontSize: 10, flexShrink: 0, marginTop: 1 }}>→</span>
                        <span style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>✗ CONSTRAINTS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {CURRENT_SPRINT.constraints.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 16px", background: "#0c0c0c", borderLeft: "2px solid #ff244420" }}>
                        <span style={{ color: "#ff2244", fontSize: 10, flexShrink: 0, marginTop: 1 }}>✗</span>
                        <span style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Timer + actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>

                {/* Countdown */}
                <div style={{ background: "#0a0a0a", padding: "28px", borderTop: "2px solid #ff2244" }}>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 20 }}>TIME REMAINING</div>
                  <Countdown endsAt={CURRENT_SPRINT.endsAt} />
                </div>

                {/* Participation stats */}
                <div style={{ background: "#0a0a0a", padding: "24px" }}>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>PARTICIPATION</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{CURRENT_SPRINT.submitted} submitted</span>
                    <span style={{ fontSize: 11, color: "#555" }}>{CURRENT_SPRINT.participants} joined</span>
                  </div>
                  <Bar value={submissionPct} color="#f5c518" />
                  <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 8, letterSpacing: 2 }}>{submissionPct}% submission rate</div>
                </div>

                {/* CTA */}
                <div style={{ background: "#0a0a0a", padding: "24px" }}>
                  {submitted ? (
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                      <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 4, marginBottom: 8 }}>✓ SUBMITTED</div>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>SPRINT COMPLETE.</div>
                      <div style={{ fontSize: 11, color: "#444", marginTop: 8 }}>+450 XP · Results in {pad(11)}h</div>
                    </div>
                  ) : joined ? (
                    <>
                      <div style={{ padding: "12px 16px", background: "rgba(0,255,136,0.04)", borderLeft: "3px solid #00ff88", marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 3 }}>✓ YOU'RE IN. NOW BUILD.</div>
                      </div>
                      <button onClick={() => setShowModal(true)} style={{ width: "100%", padding: "16px", background: "#00ff88", color: "#080808", border: "none", fontSize: 11, letterSpacing: 3, fontWeight: 900, fontFamily: "inherit", cursor: "pointer", transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        SUBMIT BUILD →
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleJoin} style={{ width: "100%", padding: "16px", background: "#ff2244", color: "#fff", border: "none", fontSize: 11, letterSpacing: 3, fontWeight: 900, fontFamily: "inherit", cursor: "pointer", marginBottom: 12, transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#ff2244"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#ff2244"; e.currentTarget.style.color = "#fff"; }}>
                        JOIN SPRINT →
                      </button>
                      <div style={{ fontSize: 9, color: "#2a2a2a", textAlign: "center", letterSpacing: 2, lineHeight: 1.8 }}>
                        JOINING IS PUBLIC.<br />MISS IT AND THE WALL KNOWS.
                      </div>
                    </>
                  )}
                </div>

                {/* XP breakdown */}
                <div style={{ background: "#0a0a0a", padding: "20px 24px" }}>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 14 }}>XP BREAKDOWN</div>
                  {[["Ship on time", "+450 XP"], ["Early submission", "+50 XP"], ["Community votes", "+10 XP each"], ["Missed deadline", "−0 XP, public fail"]].map(([label, val], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#444" }}>{label}</span>
                      <span style={{ fontSize: 11, color: i === 3 ? "#ff2244" : "#f5c518", letterSpacing: 1 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {tab === "submissions" && (
          <div style={{ padding: "40px 0 80px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: "#444" }}>
                {submissions.length} SUBMISSIONS — SORTED BY VOTES
              </div>
              {!submitted && joined && (
                <button onClick={() => setShowModal(true)} style={{ padding: "12px 24px", background: "#00ff88", color: "#080808", border: "none", fontSize: 10, letterSpacing: 3, fontWeight: 900, fontFamily: "inherit", cursor: "pointer" }}>
                  + SUBMIT YOUR BUILD
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...submissions].sort((a, b) => b.votes - a.votes).map((s, i) => (
                <div key={s.user} style={{
                  background: "#0c0c0c", padding: "24px",
                  borderLeft: `3px solid ${i === 0 ? "#f5c518" : i === 1 ? "#888" : i === 2 ? "#cd7f32" : "#1a1a1a"}`,
                  display: "grid", gridTemplateColumns: "40px 1fr auto",
                  gap: 20, alignItems: "center",
                  animation: "fadeUp 0.4s ease both",
                  animationDelay: `${i * 0.05}s`,
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#111"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0c0c0c"}>

                  {/* Rank */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: i < 3 ? ["#f5c518", "#888", "#cd7f32"][i] : "#2a2a2a" }}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 9 }}>{s.country}</span>
                      <span style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>@{s.user}</span>
                      <span style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 2 }}>· {s.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#4a9eff", marginBottom: 8, cursor: "pointer", letterSpacing: 1 }}
                      onMouseEnter={e => e.target.style.color = "#7ab8ff"}
                      onMouseLeave={e => e.target.style.color = "#4a9eff"}>
                      🔗 {s.repo}
                    </div>
                    {s.comment && <div style={{ fontSize: 11, color: "#555", fontStyle: "italic", marginBottom: 10 }}>"{s.comment}"</div>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {s.stack.map(t => <Tag key={t} label={t} />)}
                    </div>
                  </div>

                  {/* Vote */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <button onClick={() => handleVote(s.user)} style={{
                      background: votedIds.includes(s.user) ? "rgba(0,255,136,0.08)" : "transparent",
                      border: `1px solid ${votedIds.includes(s.user) ? "#00ff88" : "#1a1a1a"}`,
                      color: votedIds.includes(s.user) ? "#00ff88" : "#444",
                      padding: "10px 16px", fontSize: 10, letterSpacing: 2,
                      fontFamily: "inherit", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      transition: "all 0.2s",
                    }}>
                      <span style={{ fontSize: 14 }}>{votedIds.includes(s.user) ? "✓" : "↑"}</span>
                      <span>{s.votes + (votedIds.includes(s.user) ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAST SPRINTS TAB ── */}
        {tab === "past" && (
          <div style={{ padding: "40px 0 80px" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 24 }}>
              {PAST_SPRINTS.length} COMPLETED SPRINTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {PAST_SPRINTS.map((s, i) => {
                const dcfg = DIFFICULTY_CFG[s.difficulty];
                return (
                  <div key={s.id} style={{
                    background: "#0c0c0c", padding: "24px 28px",
                    display: "grid", gridTemplateColumns: "80px 1fr auto",
                    gap: 24, alignItems: "center",
                    borderLeft: `3px solid #1a1a1a`,
                    transition: "background 0.2s, border-left-color 0.2s",
                    cursor: "pointer",
                    animation: "fadeUp 0.4s ease both",
                    animationDelay: `${i * 0.06}s`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderLeftColor = dcfg.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#0c0c0c"; e.currentTarget.style.borderLeftColor = "#1a1a1a"; }}>

                    <div>
                      <div style={{ fontSize: 10, color: "#333", letterSpacing: 2 }}>{s.id}</div>
                      <div style={{ fontSize: 9, color: dcfg.color, letterSpacing: 3, marginTop: 4 }}>{s.difficulty}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 10 }}>{s.title}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {s.tags.map(t => <Tag key={t} label={t} />)}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 6 }}>
                        {s.submitted}/{s.participants} shipped
                      </div>
                      <div style={{ fontSize: 9, color: "#f5c518", letterSpacing: 2, marginBottom: 8 }}>
                        🏆 @{s.winner}
                      </div>
                      <div style={{ fontSize: 9, color: "#333", letterSpacing: 2 }}>+{s.xp} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coming up next */}
            <div style={{ marginTop: 32, padding: "28px", background: "#0a0a0a", borderTop: "2px solid #ff2244" }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: "#ff2244", marginBottom: 12 }}>NEXT SPRINT — DROPPING IN 36H</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#333", letterSpacing: -1 }}>
                ??? — DETAILS REVEAL WHEN CURRENT SPRINT ENDS
              </div>
              <div style={{ fontSize: 11, color: "#2a2a2a", marginTop: 8 }}>Difficulty: HARD · XP: +650</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #ff2244; }
        input::placeholder, textarea::placeholder { color: #2a2a2a; }
        textarea { resize: none; }
      `}</style>
    </div>
  );
}
