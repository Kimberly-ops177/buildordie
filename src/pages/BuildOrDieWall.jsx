import { useState, useEffect } from "react";
import { createCommitment, getCommitments, voteCommitment } from '../services/commitments';
import { getCurrentUser } from '../services/auth';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  shipping: { color: "#00ff88", label: "SHIPPING", bg: "rgba(0,255,136,0.06)" },
  building: { color: "#f5c518", label: "BUILDING", bg: "rgba(245,197,24,0.06)" },
  danger:   { color: "#ff6b35", label: "DANGER",   bg: "rgba(255,107,53,0.06)" },
  failed:   { color: "#ff2244", label: "FAILED",   bg: "rgba(255,34,68,0.06)" },
};

const FILTERS = ["ALL", "SHIPPING", "BUILDING", "DANGER", "FAILED"];
const SORTS = ["NEWEST", "DEADLINE", "MOST VOTED", "PROGRESS"];
const COUNTRY_FLAGS = { KE: "🇰🇪", NG: "🇳🇬", GH: "🇬🇭", ZA: "🇿🇦" };
const STACKS_ALL = ["React", "Node", "Python", "Laravel", "Vue", "Django", "Flutter", "DevOps", "Next.js", "TypeScript", "Docker", "MongoDB"];

// ─── NOISE ────────────────────────────────────────────────────────────────────

function Noise() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      opacity: 0.3,
    }} />
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────

function Bar({ value, color }) {
  return (
    <div style={{ height: 2, background: "#161616", borderRadius: 0 }}>
      <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, transition: "width 0.8s ease", boxShadow: `0 0 6px ${color}50` }} />
    </div>
  );
}

// ─── NEW COMMITMENT MODAL ─────────────────────────────────────────────────────

function Modal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ project: "", description: "", deadline: "", stack: [] });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const toggle = s => setForm(f => ({ ...f, stack: f.stack.includes(s) ? f.stack.filter(x => x !== s) : [...f.stack, s] }));

  const validate1 = () => {
    const e = {};
    if (form.project.trim().length < 4) e.project = "Be specific. Min 4 characters.";
    if (form.description.trim().length < 10) e.description = "Describe what you're building.";
    return e;
  };

  const handleNext = () => {
    const e = validate1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = () => {
    if (!form.deadline || form.stack.length === 0) return;
    onSubmit(form);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0a0a0a", width: "100%", maxWidth: 560,
        border: "1px solid #1a1a1a", borderTop: "2px solid #ff2244",
        padding: "40px", animation: "slideUp 0.3s ease both",
        fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 2, background: s <= step ? "#ff2244" : "#1a1a1a", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 12 }}>
          — {step === 1 ? "DECLARE YOUR PROJECT" : "SET YOUR TERMS"}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 28 }}>
          {step === 1 ? "WHAT ARE YOU BUILDING?" : "WHEN DOES IT SHIP?"}
        </h2>

        {step === 1 ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, letterSpacing: 3, color: "#444", display: "block", marginBottom: 8 }}>PROJECT NAME</label>
              <input value={form.project} onChange={e => setForm({ ...form, project: e.target.value })}
                placeholder="Be specific. Vague = unshippable."
                style={{ width: "100%", background: "#0c0c0c", border: `1px solid ${errors.project ? "#ff2244" : "#1a1a1a"}`, borderLeft: `3px solid #ff2244`, color: "#fff", padding: "13px 16px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              {errors.project && <div style={{ fontSize: 10, color: "#ff2244", marginTop: 6, letterSpacing: 2 }}>✗ {errors.project}</div>}
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 10, letterSpacing: 3, color: "#444", display: "block", marginBottom: 8 }}>WHAT DOES IT DO?</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="One sentence. What problem does it solve?"
                rows={3}
                style={{ width: "100%", background: "#0c0c0c", border: `1px solid ${errors.description ? "#ff2244" : "#1a1a1a"}`, borderLeft: `3px solid ${errors.description ? "#ff2244" : "#1a1a1a"}`, color: "#fff", padding: "13px 16px", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", boxSizing: "border-box" }} />
              {errors.description && <div style={{ fontSize: 10, color: "#ff2244", marginTop: 6, letterSpacing: 2 }}>✗ {errors.description}</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{ flex: "0 0 auto", padding: "14px 20px", background: "transparent", color: "#333", border: "1px solid #1a1a1a", fontSize: 10, letterSpacing: 3, fontFamily: "inherit", cursor: "pointer" }}>CANCEL</button>
              <button onClick={handleNext} style={{ flex: 1, padding: "14px", background: "#ff2244", color: "#fff", border: "none", fontSize: 11, letterSpacing: 3, fontWeight: 900, fontFamily: "inherit", cursor: "pointer" }}>NEXT →</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, letterSpacing: 3, color: "#444", display: "block", marginBottom: 8 }}>DEADLINE (DAYS FROM TODAY)</label>
              <input type="number" min="1" max="90" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                placeholder="How many days? Be honest."
                style={{ width: "100%", background: "#0c0c0c", border: "1px solid #1a1a1a", borderLeft: "3px solid #ff2244", color: "#fff", padding: "13px 16px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 10, letterSpacing: 3, color: "#444", display: "block", marginBottom: 12 }}>TECH STACK — {form.stack.length} SELECTED</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STACKS_ALL.map(s => {
                  const sel = form.stack.includes(s);
                  return (
                    <button key={s} onClick={() => toggle(s)} style={{ padding: "7px 14px", background: sel ? "rgba(255,34,68,0.1)" : "transparent", border: `1px solid ${sel ? "#ff2244" : "#1a1a1a"}`, color: sel ? "#ff2244" : "#444", fontSize: 9, letterSpacing: 2, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s" }}>
                      {sel ? "✓ " : ""}{s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "14px 16px", background: "rgba(255,34,68,0.04)", borderLeft: "3px solid #ff2244", marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#ff2244", letterSpacing: 2, lineHeight: 1.8 }}>
                ⚠ THIS IS PUBLIC. MISS YOUR DEADLINE AND THE WALL MARKS YOU FAILED.<br />NO EXTENSIONS. NO EXCUSES.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: "0 0 auto", padding: "14px 20px", background: "transparent", color: "#333", border: "1px solid #1a1a1a", fontSize: 10, letterSpacing: 3, fontFamily: "inherit", cursor: "pointer" }}>← BACK</button>
              <button onClick={handleSubmit} disabled={!form.deadline || form.stack.length === 0 || loading}
                style={{ flex: 1, padding: "14px", background: (!form.deadline || form.stack.length === 0) ? "#1a0008" : "#ff2244", color: (!form.deadline || form.stack.length === 0) ? "#ff2244" : "#fff", border: "none", fontSize: 11, letterSpacing: 3, fontWeight: 900, fontFamily: "inherit", cursor: (!form.deadline || form.stack.length === 0) ? "not-allowed" : "pointer" }}>
                {loading ? "COMMITTING..." : "COMMIT PUBLICLY →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── COMMITMENT CARD ──────────────────────────────────────────────────────────

function Card({ c, onVote }) {
  const [expanded, setExpanded] = useState(false);
  const [voted, setVoted] = useState(false);
  const cfg = STATUS_CFG[c.status] || STATUS_CFG.building;

  const daysLeft = c.deadline
    ? Math.ceil((new Date(c.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isCritical = daysLeft !== null && daysLeft <= 1 && c.status !== "failed";

  const handleVote = async () => {
    if (voted) return;
    setVoted(true);
    try { await onVote(c._id || c.id); } catch { setVoted(false); }
  };

  const username = c.user?.username || c.user || "builder";
  const country = c.user?.country || c.country || "KE";
  const voteCount = c.votes?.length ?? c.votes ?? 0;

  return (
    <div style={{
      background: "#0c0c0c", borderLeft: `3px solid ${cfg.color}`,
      transition: "background 0.2s", animation: "fadeUp 0.4s ease both",
      position: "relative", overflow: "hidden",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "#111"}
      onMouseLeave={e => e.currentTarget.style.background = "#0c0c0c"}>

      {isCritical && (
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 2, background: "#ff2244", animation: "blink 1s infinite" }} />
      )}

      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ flex: 1, marginRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>{COUNTRY_FLAGS[country] || "🌍"} @{username}</span>
              <span style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: 2 }}>· {new Date(c.createdAt || Date.now()).toISOString().split("T")[0]}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: -0.5, lineHeight: 1.3 }}>
              {c.project}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: cfg.color, letterSpacing: 3, fontWeight: "bold", marginBottom: 4, textShadow: `0 0 8px ${cfg.color}60` }}>
              {cfg.label}
            </div>
            <div style={{ fontSize: 10, color: isOverdue ? "#ff2244" : "#444", letterSpacing: 1 }}>
              {daysLeft === null ? "—" : isOverdue ? `${Math.abs(daysLeft)}d OVERDUE` : `${daysLeft}d left`}
            </div>
          </div>
        </div>

        {expanded && c.description && (
          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.8, marginBottom: 14, borderLeft: "2px solid #1a1a1a", paddingLeft: 12, animation: "fadeUp 0.2s ease both" }}>
            {c.description}
          </p>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {(c.stack || []).map(s => (
            <span key={s} style={{ background: "#111", color: "#444", padding: "3px 10px", fontSize: 9, letterSpacing: 2, border: "1px solid #1a1a1a" }}>{s}</span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}><Bar value={c.progress || 0} color={cfg.color} /></div>
          <span style={{ fontSize: 10, color: "#444", letterSpacing: 1, width: 32, textAlign: "right" }}>{c.progress || 0}%</span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={handleVote} style={{
            padding: "7px 14px", background: voted ? "rgba(0,255,136,0.08)" : "transparent",
            border: `1px solid ${voted ? "#00ff88" : "#1a1a1a"}`,
            color: voted ? "#00ff88" : "#444", fontSize: 9, letterSpacing: 2,
            fontFamily: "'Courier New', monospace", cursor: "pointer", transition: "all 0.2s",
          }}>
            {voted ? "✓" : "↑"} {voteCount + (voted ? 1 : 0)}
          </button>

          <button onClick={() => setExpanded(e => !e)} style={{
            marginLeft: "auto", padding: "7px 14px", background: "transparent",
            border: "1px solid #1a1a1a", color: "#333", fontSize: 9, letterSpacing: 2,
            fontFamily: "'Courier New', monospace", cursor: "pointer", transition: "color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#333"}>
            {expanded ? "COLLAPSE ↑" : "DETAILS ↓"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN WALL ────────────────────────────────────────────────────────────────

export default function CommitmentWall() {
  const [commitments, setCommitments] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [liveCount, setLiveCount] = useState(1203);
  const [newEntry, setNewEntry] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const currentUser = getCurrentUser();

  // Load commitments from API
  useEffect(() => {
    getCommitments({ sort, status: filter === "ALL" ? "" : filter.toLowerCase(), search })
      .then(data => {
        setCommitments(data.commitments || []);
        setPageLoading(false);
      })
      .catch(() => setPageLoading(false));
  }, [filter, sort, search]);

  // Live count ticker
  useEffect(() => {
    const i = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 3)), 4000);
    return () => clearInterval(i);
  }, []);

  const handleVote = async (id) => {
    if (!currentUser) { window.location.href = '/auth'; return; }
    try {
      await voteCommitment(id);
      setCommitments(cs => cs.map(c => (c._id === id || c.id === id) ? { ...c, votes: [...(c.votes || []), currentUser._id] } : c));
    } catch {}
  };

  const handleNewCommit = async (form) => {
    if (!currentUser) { window.location.href = '/auth'; return; }
    setSubmitLoading(true);
    try {
      const newC = await createCommitment(form.project, form.description, form.stack, form.deadline);
      setCommitments(cs => [newC, ...cs]);
      setNewEntry(true);
      setTimeout(() => setNewEntry(false), 3000);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create commitment");
    } finally {
      setSubmitLoading(false);
    }
  };

  const counts = {
    shipping: commitments.filter(c => c.status === "shipping").length,
    building: commitments.filter(c => c.status === "building").length,
    danger:   commitments.filter(c => c.status === "danger").length,
    failed:   commitments.filter(c => c.status === "failed").length,
    all:      commitments.length,
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", fontFamily: "'Courier New', monospace", color: "#e8e8e8" }}>
      <Noise />

      {showModal && <Modal onClose={() => setShowModal(false)} onSubmit={handleNewCommit} loading={submitLoading} />}

      {newEntry && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 150,
          background: "#0c0c0c", border: "1px solid #00ff88", borderLeft: "3px solid #00ff88",
          padding: "16px 20px", animation: "slideIn 0.3s ease both",
        }}>
          <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 3 }}>✓ COMMITTED PUBLICLY</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>The wall is watching. Now build it.</div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>

        {/* Header */}
        <div style={{ padding: "48px 0 32px", borderBottom: "1px solid #0f0f0f" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2244", boxShadow: "0 0 8px #ff2244", animation: "pulse 1.5s infinite" }} />
                LIVE — {liveCount.toLocaleString()} BUILDERS ACTIVE
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 1, margin: 0 }}>
                THE COMMIT<br />
                <span style={{ color: "transparent", WebkitTextStroke: "1px #333" }}>WALL.</span>
              </h1>
              <p style={{ color: "#444", fontSize: 13, marginTop: 12, lineHeight: 1.8 }}>
                Public commitments. Real deadlines. Zero excuses.<br />
                Ship it or the wall marks you failed. Forever.
              </p>
            </div>
            <button onClick={() => currentUser ? setShowModal(true) : window.location.href = '/auth'} style={{
              background: "#ff2244", color: "#fff", border: "none",
              padding: "18px 36px", fontSize: 12, letterSpacing: 4,
              fontWeight: 900, fontFamily: "inherit", cursor: "pointer",
              transition: "all 0.2s", flexShrink: 0, marginTop: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#ff2244"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ff2244"; e.currentTarget.style.color = "#fff"; }}>
              + MAKE COMMITMENT
            </button>
          </div>

          {/* Status summary bar */}
          <div style={{ display: "flex", gap: 2, marginTop: 32 }}>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <div key={key} style={{ flex: 1, padding: "12px 16px", background: "#0a0a0a", borderTop: `2px solid ${cfg.color}` }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: cfg.color }}>{counts[key]}</div>
                <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginTop: 4 }}>{cfg.label}</div>
              </div>
            ))}
            <div style={{ flex: 1, padding: "12px 16px", background: "#0a0a0a", borderTop: "2px solid #555" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#555" }}>{counts.all}</div>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginTop: 4 }}>TOTAL</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ padding: "24px 0", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid #0f0f0f" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 200 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects, users, stacks..."
              style={{ width: "100%", background: "#0c0c0c", border: "1px solid #111", borderLeft: "2px solid #ff2244", color: "#fff", padding: "11px 16px", fontSize: 11, fontFamily: "inherit", outline: "none", boxSizing: "border-box", letterSpacing: 1 }} />
          </div>

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {FILTERS.map(f => {
              const active = filter === f;
              const cfg = f === "ALL" ? null : STATUS_CFG[f.toLowerCase()];
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "10px 16px", background: active ? (cfg?.color || "#fff") : "transparent",
                  color: active ? "#080808" : (cfg?.color || "#444"),
                  border: `1px solid ${active ? (cfg?.color || "#fff") : "#1a1a1a"}`,
                  fontSize: 9, letterSpacing: 3, fontFamily: "inherit", cursor: "pointer",
                  fontWeight: active ? 900 : "normal", transition: "all 0.15s",
                }}>{f}</button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {SORTS.map(s => (
              <button key={s} onClick={() => setSort(s)} style={{
                padding: "10px 14px", background: sort === s ? "rgba(255,34,68,0.1)" : "transparent",
                color: sort === s ? "#ff2244" : "#333",
                border: `1px solid ${sort === s ? "#ff2244" : "#1a1a1a"}`,
                fontSize: 8, letterSpacing: 2, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
              }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px 0", fontSize: 10, color: "#333", letterSpacing: 3 }}>
          {pageLoading ? "LOADING..." : `SHOWING ${commitments.length} COMMITMENT${commitments.length !== 1 ? "S" : ""}`}
          {search && ` FOR "${search.toUpperCase()}"`}
        </div>

        {pageLoading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 12, color: "#333", letterSpacing: 4 }}>LOADING THE WALL...</div>
          </div>
        ) : commitments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#1a1a1a", letterSpacing: -2, marginBottom: 16 }}>NOTHING HERE.</div>
            <div style={{ fontSize: 12, color: "#333" }}>No commitments yet. Be the first to commit.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 2, paddingBottom: 80 }}>
            {commitments.map((c, i) => (
              <div key={c._id || c.id || i} style={{ animationDelay: `${i * 0.04}s` }}>
                <Card c={c} onVote={handleVote} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
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