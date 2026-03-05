import { useState, useEffect, useRef } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────


const PROBLEMS = {
  React: {
    title: "Build a virtualized list component",
    difficulty: "INTERMEDIATE",
    description: "You have 100,000 items to render in a list. The browser will die if you render all of them at once. Build a React component that only renders the items currently visible in the viewport. No libraries. No tutorials. Just logic.",
    constraints: ["No react-window or react-virtual", "Must handle dynamic item heights", "Smooth scroll required", "No layout thrashing"],
    hints: ["Think about what 'visible' means mathematically", "What data do you need to track?", "When should you recalculate?"],
    xp: 380,
  },
  Node: {
    title: "Rate limiter from scratch",
    difficulty: "INTERMEDIATE",
    description: "Build a rate limiting middleware for Express that limits requests per IP. Implement both fixed window and sliding window algorithms. No external rate-limit libraries allowed.",
    constraints: ["Two algorithms: fixed + sliding window", "Must work across multiple Node processes", "Store state in Redis", "Return proper 429 responses with retry-after headers"],
    hints: ["Fixed window: what defines a 'window'?", "Sliding window: how do you track time precisely?", "What happens when Redis is down?"],
    xp: 420,
  },
  Python: {
    title: "Build a task queue without Celery",
    difficulty: "HARD",
    description: "Implement a distributed task queue in Python. Workers should pick up tasks, execute them, handle failures with retries, and report results. No Celery, no RQ, no shortcuts.",
    constraints: ["Use Redis as the broker", "Implement retry logic with exponential backoff", "Dead letter queue for permanently failed tasks", "Worker health monitoring"],
    hints: ["How does a queue guarantee at-least-once delivery?", "What makes a task 'permanently failed'?", "How do you prevent two workers from stealing the same task?"],
    xp: 580,
  },
  DevOps: {
    title: "Zero-downtime deployment pipeline",
    difficulty: "HARD",
    description: "Design and implement a CI/CD pipeline that deploys a Node.js app with zero downtime. Traffic must never hit a dead instance. Rollback must be automatic on health check failure.",
    constraints: ["Blue-green or canary strategy", "Automated rollback on failure", "Health checks before traffic switch", "No paid services — open source only"],
    hints: ["What does 'zero downtime' actually require at the load balancer level?", "How do you define 'healthy'?", "What's the smallest safe canary percentage?"],
    xp: 650,
  },
  MongoDB: {
    title: "Design a schema for a Twitter clone",
    difficulty: "INTERMEDIATE",
    description: "Design and implement a MongoDB schema for a Twitter-like app. Optimise for the most common read patterns: user timeline, trending tweets, followers feed. Justify every design decision.",
    constraints: ["Must handle 10M users", "Timeline query must be < 50ms", "No full collection scans on hot paths", "Document embedding vs referencing — justify your choices"],
    hints: ["What's read more often: who you follow or who follows you?", "Should a tweet exist in one place or many?", "What indexes will your most common queries need?"],
    xp: 400,
  },
  Docker: {
    title: "Multi-stage production Dockerfile",
    difficulty: "BEGINNER",
    description: "Write a production-ready Dockerfile for a Node.js app. It must be secure, minimal, and fast to build. Your final image must be under 100MB. Justify every instruction.",
    constraints: ["Multi-stage build required", "Final image < 100MB", "Non-root user", "No secrets in layers", "Build cache optimised"],
    hints: ["Which base image is smallest?", "What's the right order for COPY instructions and why?", "What should NOT be in a production image?"],
    xp: 250,
  },
};

const DIFFICULTY_CFG = {
  BEGINNER:     { color: "#00ff88", bg: "rgba(0,255,136,0.06)" },
  INTERMEDIATE: { color: "#f5c518", bg: "rgba(245,197,24,0.06)" },
  HARD:         { color: "#ff2244", bg: "rgba(255,34,68,0.06)" },
};

const MENTOR_INTRO = `I'm your Arena mentor. I don't give answers — I ask better questions.

You declared skills. Now prove them. Pick a problem and start building.

When you're stuck, describe what you've tried and I'll help you think further. Not further along — further *in*.`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Noise() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      opacity: 0.3 }} />
  );
}

function Tag({ label, color = "#444" }) {
  return <span style={{ background: "#111", color, padding: "3px 10px", fontSize: 9, letterSpacing: 2, border: `1px solid ${color}20` }}>{label}</span>;
}

// ─── AI MENTOR ────────────────────────────────────────────────────────────────

function MentorPanel({ problem, skill }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: MENTOR_INTRO }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
    if (problem) {
      setMessages([
        { role: "assistant", text: MENTOR_INTRO },
        { role: "assistant", text: `Problem loaded: **${problem.title}**\n\nRead the brief carefully. Don't ask me to explain it — figure out what you don't understand first. Then come to me with a specific question about *your thinking*, not about *the answer*.` }
      ]);
    }
  }, [problem?.title]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const systemPrompt = `You are the BuildOrDie Arena Mentor. Your ONLY job is to help developers think, not to give them answers.

RULES — NEVER BREAK THESE:
- NEVER write code for the user. Not even a single line.
- NEVER give direct answers. Always respond with a question or a thinking prompt.
- If they ask "how do I do X", respond with "What have you tried? What do you think X requires?"
- If they're stuck, ask them to explain their current thinking first.
- Be brutally honest. If their thinking is wrong, say so — but make them figure out why.
- Keep responses SHORT. Max 3-4 sentences. You are a Socratic interrogator, not a lecturer.
- You can affirm good thinking briefly, then push further.
- Tone: sharp, direct, no fluff. Think: senior engineer who respects your intelligence but won't carry you.

Current problem: ${problem ? problem.title : "No problem selected yet"}
Skill being tested: ${skill || "General"}

If the user hasn't selected a problem yet, push them to pick one and start.`;

      const history = messages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });

      const data = await res.json();
      const reply = data?.content?.[0]?.text || "...";
      setMessages(m => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Connection error. Think while I'm gone. That's the point anyway." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#060606", borderLeft: "1px solid #0f0f0f" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #0f0f0f", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff2244", boxShadow: "0 0 8px #ff2244", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>AI MENTOR</span>
        </div>
        <div style={{ fontSize: 9, color: "#333", letterSpacing: 3, marginTop: 6 }}>
          ASKS QUESTIONS. NEVER GIVES ANSWERS.
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ animation: "fadeUp 0.3s ease both" }}>
            {m.role === "assistant" ? (
              <div>
                <div style={{ fontSize: 9, color: "#ff2244", letterSpacing: 3, marginBottom: 6 }}>MENTOR</div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {m.text.split("**").map((part, j) =>
                    j % 2 === 1
                      ? <span key={j} style={{ color: "#fff", fontWeight: "bold" }}>{part}</span>
                      : part
                  )}
                </div>
              </div>
            ) : (
              <div style={{ paddingLeft: 16, borderLeft: "2px solid #1a1a1a" }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: 3, marginBottom: 6 }}>YOU</div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.8 }}>{m.text}</div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div>
            <div style={{ fontSize: 9, color: "#ff2244", letterSpacing: 3, marginBottom: 6 }}>MENTOR</div>
            <div style={{ display: "flex", gap: 4, alignItems: "center", height: 20 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff2244", animation: `bounce 1s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px", borderTop: "1px solid #0f0f0f", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 0 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Describe your thinking, not your problem..."
            rows={3}
            style={{ flex: 1, background: "#0c0c0c", border: "1px solid #1a1a1a", borderRight: "none", color: "#fff", padding: "12px 16px", fontSize: 11, fontFamily: "'Courier New', monospace", outline: "none", resize: "none", lineHeight: 1.6 }}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={{
            background: loading ? "#0c0c0c" : "#ff2244",
            color: loading ? "#ff2244" : "#fff",
            border: "none", padding: "0 16px",
            fontSize: 10, letterSpacing: 2, fontWeight: 900,
            fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
            writingMode: "vertical-rl", transition: "all 0.2s",
          }}>
            {loading ? "..." : "SEND"}
          </button>
        </div>
        <div style={{ fontSize: 9, color: "#222", marginTop: 8, letterSpacing: 2 }}>
          ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
        </div>
      </div>
    </div>
  );
}

// ─── PROBLEM CARD ─────────────────────────────────────────────────────────────

function ProblemCard({ skill, problem, active, onSelect }) {
  const dcfg = DIFFICULTY_CFG[problem.difficulty];
  return (
    <div onClick={() => onSelect(skill)} style={{
      background: active ? "#111" : "#0c0c0c",
      borderLeft: `3px solid ${active ? "#ff2244" : "#1a1a1a"}`,
      padding: "20px 24px", cursor: "pointer",
      transition: "all 0.2s",
      animation: "fadeUp 0.4s ease both",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#0f0f0f"; e.currentTarget.style.borderLeftColor = "#333"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "#0c0c0c"; e.currentTarget.style.borderLeftColor = "#1a1a1a"; } }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: active ? "#ff2244" : "#444", letterSpacing: 3, marginBottom: 6 }}>
            {active ? "● ACTIVE" : skill.toUpperCase()}
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, color: active ? "#fff" : "#666", letterSpacing: -0.5 }}>
            {problem.title}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 9, color: dcfg.color, letterSpacing: 3, background: dcfg.bg, padding: "4px 10px", marginBottom: 6 }}>
            {problem.difficulty}
          </div>
          <div style={{ fontSize: 9, color: "#f5c518", letterSpacing: 2 }}>+{problem.xp} XP</div>
        </div>
      </div>
      {active && (
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7, marginTop: 8, animation: "fadeUp 0.3s ease both" }}>
          {problem.description.slice(0, 120)}...
        </div>
      )}
    </div>
  );
}

// ─── PROBLEM DETAIL ───────────────────────────────────────────────────────────

function ProblemDetail({ skill, problem, onSubmit, submitted }) {
  const [showHint, setShowHint] = useState(null);
  const dcfg = DIFFICULTY_CFG[problem.difficulty];

  return (
    <div style={{ overflowY: "auto", padding: "32px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <Tag label={skill} color="#ff2244" />
          <span style={{ fontSize: 9, color: dcfg.color, letterSpacing: 3, background: dcfg.bg, padding: "4px 10px" }}>
            {problem.difficulty}
          </span>
          <span style={{ fontSize: 9, color: "#f5c518", letterSpacing: 2 }}>+{problem.xp} XP</span>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1.2, marginBottom: 16 }}>
          {problem.title}
        </h2>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.9 }}>
          {problem.description}
        </p>
      </div>

      {/* Constraints */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>✗ CONSTRAINTS — NO EXCEPTIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {problem.constraints.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 16px", background: "#0c0c0c", borderLeft: "2px solid rgba(255,34,68,0.2)" }}>
              <span style={{ color: "#ff2244", fontSize: 10, flexShrink: 0, marginTop: 1 }}>✗</span>
              <span style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hints — gated */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 16 }}>
          💡 THINKING PROMPTS — USE ONLY WHEN TRULY STUCK
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {problem.hints.map((h, i) => (
            <div key={i}>
              {showHint === i ? (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 16px", background: "#0c0c0c", borderLeft: "2px solid rgba(245,197,24,0.3)", animation: "fadeUp 0.3s ease both" }}>
                  <span style={{ color: "#f5c518", fontSize: 10, flexShrink: 0, marginTop: 1 }}>→</span>
                  <span style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{h}</span>
                </div>
              ) : (
                <button onClick={() => setShowHint(i)} style={{
                  width: "100%", padding: "12px 16px", background: "#0c0c0c",
                  border: "none", borderLeft: "2px solid #1a1a1a",
                  color: "#333", fontSize: 11, letterSpacing: 2, fontFamily: "inherit",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 12,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderLeftColor = "#f5c518"; e.currentTarget.style.color = "#f5c518"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "#1a1a1a"; e.currentTarget.style.color = "#333"; }}>
                  <span>🔒</span>
                  <span>REVEAL HINT {i + 1}</span>
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 12, letterSpacing: 2 }}>
          EACH HINT COSTS 50 XP FROM YOUR REWARD. THINK FIRST.
        </div>
      </div>

      {/* Submit */}
      <div style={{ padding: "24px", background: "#0a0a0a", borderTop: `2px solid ${submitted ? "#00ff88" : "#ff2244"}` }}>
        {submitted ? (
          <div>
            <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 4, marginBottom: 8 }}>✓ SOLUTION SUBMITTED</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 8 }}>
              UNDER PEER REVIEW.
            </div>
            <div style={{ fontSize: 11, color: "#444" }}>
              3 builders will review your solution. Results in ~24h. XP pending.
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444", marginBottom: 12 }}>READY TO SUBMIT?</div>
            <p style={{ fontSize: 12, color: "#444", lineHeight: 1.8, marginBottom: 20 }}>
              Submit your GitHub repo. Three peers will review it against the constraints.<br />
              <span style={{ color: "#ff2244" }}>No partial credit. Either you met the constraints or you didn't.</span>
            </p>
            <button onClick={onSubmit} style={{
              width: "100%", padding: "16px", background: "#ff2244",
              color: "#fff", border: "none", fontSize: 12, letterSpacing: 4,
              fontWeight: 900, fontFamily: "inherit", cursor: "pointer",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#ff2244"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ff2244"; e.currentTarget.style.color = "#fff"; }}>
              SUBMIT FOR PEER REVIEW →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SKILL DECLARATION SCREEN ─────────────────────────────────────────────────

function SkillGate({ onEnter }) {
  const [selected, setSelected] = useState([]);
  const ALL = ["React", "Node", "Python", "DevOps", "MongoDB", "Docker", "Vue", "Django", "Flutter", "TypeScript", "Laravel", "Go"];
  const toggle = s => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ maxWidth: 600, width: "100%", animation: "fadeUp 0.5s ease both" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 16 }}>— ENTER THE ARENA</div>
        <h1 style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: -2, lineHeight: 1, marginBottom: 12 }}>
          DECLARE YOUR<br />
          <span style={{ color: "transparent", WebkitTextStroke: "1px #333" }}>SKILLS.</span>
        </h1>
        <p style={{ color: "#444", fontSize: 13, lineHeight: 1.9, marginBottom: 32 }}>
          The Arena will throw real problems at every skill you claim.<br />
          <span style={{ color: "#ff2244" }}>Don't lie. There are no tutorials inside.</span>
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {ALL.map(s => {
            const sel = selected.includes(s);
            return (
              <button key={s} onClick={() => toggle(s)} style={{
                padding: "10px 18px", background: sel ? "rgba(255,34,68,0.1)" : "transparent",
                border: `1px solid ${sel ? "#ff2244" : "#1a1a1a"}`,
                color: sel ? "#ff2244" : "#444",
                fontSize: 10, letterSpacing: 2, fontFamily: "inherit", cursor: "pointer",
                transition: "all 0.15s", fontWeight: sel ? 900 : "normal",
              }}>
                {sel ? "✓ " : ""}{s}
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div style={{ padding: "16px", background: "rgba(255,34,68,0.04)", borderLeft: "3px solid #ff2244", marginBottom: 24, animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: 10, color: "#ff2244", letterSpacing: 2, lineHeight: 1.8 }}>
              ⚠ YOU'VE CLAIMED {selected.length} SKILL{selected.length > 1 ? "S" : ""}.<br />
              THE ARENA WILL TEST EVERY SINGLE ONE. NO TUTORIALS. NO HINTS UNTIL YOU EARN THEM.
            </div>
          </div>
        )}

        <button onClick={() => selected.length > 0 && onEnter(selected)}
          disabled={selected.length === 0}
          style={{
            width: "100%", padding: "18px",
            background: selected.length === 0 ? "#0c0c0c" : "#ff2244",
            color: selected.length === 0 ? "#333" : "#fff",
            border: "none", fontSize: 12, letterSpacing: 4,
            fontWeight: 900, fontFamily: "inherit",
            cursor: selected.length === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}>
          {selected.length === 0 ? "SELECT AT LEAST ONE SKILL" : `ENTER THE ARENA WITH ${selected.length} SKILL${selected.length > 1 ? "S" : ""} →`}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ArenaPage() {
  const [phase, setPhase] = useState("gate"); // gate | arena
  const [skills, setSkills] = useState([]);
  const [activeSkill, setActiveSkill] = useState(null);
  const [submitted, setSubmitted] = useState({});
  const [completedCount, setCompletedCount] = useState(0);

  const handleEnter = selected => {
    setSkills(selected);
    setActiveSkill(selected[0]);
    setPhase("arena");
  };

  const handleSubmit = skill => {
    setSubmitted(s => ({ ...s, [skill]: true }));
    setCompletedCount(c => c + 1);
  };

  const activeProblem = activeSkill ? PROBLEMS[activeSkill] : null;

  return (
    <div style={{ background: "#080808", minHeight: "100vh", fontFamily: "'Courier New', monospace", color: "#e8e8e8" }}>
      <Noise />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ padding: "32px 40px 24px", borderBottom: "1px solid #0f0f0f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2244", boxShadow: "0 0 8px #ff2244", animation: "pulse 1.5s infinite" }} />
              ⚔️ ANTI-TUTORIAL ARENA
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", letterSpacing: -2, margin: 0 }}>
              PROVE IT.<br />
              <span style={{ color: "transparent", WebkitTextStroke: "1px #222" }}>OR ADMIT YOU CAN'T.</span>
            </h1>
          </div>
          {phase === "arena" && (
            <div style={{ display: "flex", gap: 2 }}>
              <div style={{ padding: "20px 24px", background: "#0c0c0c", borderTop: "2px solid #00ff88", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#00ff88" }}>{completedCount}</div>
                <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginTop: 4 }}>SOLVED</div>
              </div>
              <div style={{ padding: "20px 24px", background: "#0c0c0c", borderTop: "2px solid #444", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#444" }}>{skills.length - completedCount}</div>
                <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginTop: 4 }}>REMAINING</div>
              </div>
              <div style={{ padding: "20px 24px", background: "#0c0c0c", borderTop: "2px solid #f5c518", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#f5c518" }}>
                  {Object.values(submitted).filter(Boolean).length * 380}
                </div>
                <div style={{ fontSize: 8, color: "#333", letterSpacing: 3, marginTop: 4 }}>XP EARNED</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {phase === "gate" ? (
          <div style={{ padding: "0 40px" }}>
            <SkillGate onEnter={handleEnter} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 340px", height: "calc(100vh - 130px)" }}>

            {/* Problem list */}
            <div style={{ borderRight: "1px solid #0f0f0f", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, padding: "16px" }}>
              <div style={{ fontSize: 9, color: "#333", letterSpacing: 4, padding: "8px 8px 16px" }}>YOUR PROBLEMS</div>
              {skills.map(skill => (
                <div key={skill} style={{ position: "relative" }}>
                  {submitted[skill] && (
                    <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, fontSize: 10, color: "#00ff88" }}>✓</div>
                  )}
                  <ProblemCard
                    skill={skill}
                    problem={PROBLEMS[skill] || PROBLEMS.Node}
                    active={activeSkill === skill}
                    onSelect={setActiveSkill}
                  />
                </div>
              ))}

              {/* Arena rules */}
              <div style={{ marginTop: "auto", padding: "16px", background: "#0a0a0a", borderTop: "2px solid #1a1a1a" }}>
                <div style={{ fontSize: 9, color: "#333", letterSpacing: 3, marginBottom: 12 }}>ARENA RULES</div>
                {["No Googling solutions", "No asking AI to write code", "AI mentor asks — never answers", "Peers grade your submission", "Fail = start over, no shortcuts"].map((r, i) => (
                  <div key={i} style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 1, lineHeight: 2 }}>
                    {i + 1}. {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Problem detail */}
            <div style={{ borderRight: "1px solid #0f0f0f", overflowY: "auto" }}>
              {activeProblem ? (
                <ProblemDetail
                  skill={activeSkill}
                  problem={PROBLEMS[activeSkill] || PROBLEMS.Node}
                  onSubmit={() => handleSubmit(activeSkill)}
                  submitted={!!submitted[activeSkill]}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "#111", letterSpacing: -2 }}>SELECT A PROBLEM</div>
                    <div style={{ fontSize: 12, color: "#2a2a2a", marginTop: 12 }}>Pick a skill from the left panel.</div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Mentor */}
            <MentorPanel problem={activeProblem} skill={activeSkill} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
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
