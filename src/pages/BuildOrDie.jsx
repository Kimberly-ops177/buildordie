import { useState, useEffect, useRef } from "react";

const COMMITMENTS = [
  { user: "dev_nancy", project: "Portfolio v3", deadline: "3 days", stack: ["React", "Node"], status: "shipping" },
  { user: "k_ops177", project: "ShipOrDie MVP", deadline: "6 days", stack: ["MERN", "Redis"], status: "building" },
  { user: "brian_254", project: "Auth Microservice", deadline: "1 day", stack: ["Express", "JWT"], status: "danger" },
  { user: "aisha_dev", project: "ML Dashboard", deadline: "5 days", stack: ["Python", "React"], status: "shipping" },
  { user: "tunde_codes", project: "E-Commerce API", deadline: "OVERDUE", stack: ["Laravel"], status: "dead" },
  { user: "mercy_ux", project: "Design System", deadline: "8 days", stack: ["Figma", "CSS"], status: "building" },
];

const STATS = [
  { label: "Projects Shipped", value: "2,847" },
  { label: "Builders Active", value: "1,203" },
  { label: "Streaks Alive", value: "891" },
  { label: "Excuses Rejected", value: "∞" },
];

const STATUS_CONFIG = {
  shipping: { color: "#00ff88", label: "SHIPPING" },
  building: { color: "#f5c518", label: "BUILDING" },
  danger: { color: "#ff6b35", label: "DANGER" },
  dead: { color: "#ff2244", label: "FAILED" },
};

const TAGLINES = [
  "Stop learning. Start shipping.",
  "Your tutorial streak means nothing.",
  "The world needs builders, not watchers.",
  "Ship it or it never existed.",
  "Competence is built, not studied.",
];

export default function BuildOrDie() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [commitInput, setCommitInput] = useState("");
  const [committed, setCommitted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const current = TAGLINES[taglineIndex];
    let i = 0;
    setTyped("");
    const interval = setInterval(() => {
      if (i < current.length) {
        setTyped(current.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
        }, 2500);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [taglineIndex]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Scroll parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCommit = () => {
    if (commitInput.trim().length > 3) setCommitted(true);
  };

  const filtered = activeTab === "all" ? COMMITMENTS : COMMITMENTS.filter(c => c.status === activeTab);

  return (
    <div style={{
      background: "#080808",
      minHeight: "100vh",
      fontFamily: "'Courier New', monospace",
      color: "#e8e8e8",
      overflowX: "hidden",
    }}>

      {/* Noise overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      {/* Scanline */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "20px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #1a1a1a",
        background: "rgba(8,8,8,0.92)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#ff2244",
            boxShadow: "0 0 12px #ff2244",
            animation: "pulse 1.5s infinite",
          }} />
          <span style={{ fontSize: 18, fontWeight: "bold", letterSpacing: 4, color: "#fff" }}>
            BUILD<span style={{ color: "#ff2244" }}>OR</span>DIE
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 12, letterSpacing: 2, color: "#666" }}>
          {["WALL", "SPRINTS", "ARENA", "LEADERBOARD"].map(item => (
            <span key={item} style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#ff2244"}
              onMouseLeave={e => e.target.style.color = "#666"}>
              {item}
            </span>
          ))}
        </div>
        <button style={{
          background: "#ff2244", color: "#fff", border: "none",
          padding: "10px 24px", fontSize: 11, letterSpacing: 3,
          cursor: "pointer", fontFamily: "inherit", fontWeight: "bold",
        }}>
          COMMIT →
        </button>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "flex-start",
        padding: "0 48px",
        position: "relative",
        paddingTop: 80,
      }}>
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(255,34,68,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,34,68,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          transform: `translateY(${scrollY * 0.1}px)`,
        }} />

        {/* Big number */}
        <div style={{
          position: "absolute", right: -20, top: "50%",
          transform: "translateY(-50%)",
          fontSize: "clamp(200px, 30vw, 400px)",
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,34,68,0.08)",
          letterSpacing: -20,
          userSelect: "none",
          lineHeight: 1,
        }}>BOD</div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 800 }}>
          <div style={{
            fontSize: 11, letterSpacing: 6, color: "#ff2244",
            marginBottom: 24, display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ display: "inline-block", width: 40, height: 1, background: "#ff2244" }} />
            FOR DEVELOPERS WHO ARE DONE WATCHING
          </div>

          <h1 style={{
            fontSize: "clamp(52px, 8vw, 110px)",
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: -3,
            margin: "0 0 32px",
            color: "#fff",
            fontFamily: "'Courier New', monospace",
          }}>
            BUILD<br />
            <span style={{ color: "#ff2244", WebkitTextStroke: "2px #ff2244", WebkitTextFillColor: "transparent" }}>
              OR
            </span>
            <br />
            DIE.
          </h1>

          {/* Typewriter */}
          <div style={{
            fontSize: 18, color: "#888", marginBottom: 48,
            minHeight: 28, letterSpacing: 1,
          }}>
            {typed}<span style={{ opacity: cursorVisible ? 1 : 0, color: "#ff2244" }}>█</span>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button style={{
              background: "#ff2244", color: "#fff", border: "none",
              padding: "18px 40px", fontSize: 13, letterSpacing: 3,
              cursor: "pointer", fontFamily: "inherit", fontWeight: "bold",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.background = "#fff"; e.target.style.color = "#ff2244"; }}
              onMouseLeave={e => { e.target.style.background = "#ff2244"; e.target.style.color = "#fff"; }}>
              MAKE YOUR COMMITMENT →
            </button>
            <button style={{
              background: "transparent", color: "#666",
              border: "1px solid #222", padding: "18px 40px",
              fontSize: 13, letterSpacing: 3, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = "#ff2244"; e.target.style.color = "#ff2244"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#222"; e.target.style.color = "#666"; }}>
              SEE THE WALL
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 40, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          color: "#333", fontSize: 10, letterSpacing: 3,
        }}>
          SCROLL
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #ff2244, transparent)", animation: "pulse 2s infinite" }} />
        </div>
      </section>

      {/* STATS */}
      <section style={{
        padding: "60px 48px",
        borderTop: "1px solid #111",
        borderBottom: "1px solid #111",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        background: "#0a0a0a",
      }}>
        {STATS.map((stat, i) => (
          <div key={i} style={{
            padding: "40px 32px",
            borderRight: i < 3 ? "1px solid #111" : "none",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 900, color: "#ff2244",
              letterSpacing: -2, marginBottom: 8,
            }}>{stat.value}</div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#444" }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* COMMITMENT WALL */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#ff2244", marginBottom: 16 }}>
            — LIVE COMMITMENT WALL
          </div>
          <h2 style={{ fontSize: 48, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -2 }}>
            WHO'S BUILDING.<br />
            <span style={{ color: "#333" }}>WHO'S FAILING.</span>
          </h2>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
          {["all", "shipping", "building", "danger", "dead"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "#ff2244" : "transparent",
              color: activeTab === tab ? "#fff" : "#444",
              border: `1px solid ${activeTab === tab ? "#ff2244" : "#222"}`,
              padding: "8px 20px", fontSize: 10, letterSpacing: 3,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Commitment rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((c, i) => {
            const cfg = STATUS_CONFIG[c.status];
            return (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr auto auto auto",
                alignItems: "center",
                gap: 24,
                padding: "20px 24px",
                background: "#0c0c0c",
                borderLeft: `3px solid ${cfg.color}`,
                transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#111"}
                onMouseLeave={e => e.currentTarget.style.background = "#0c0c0c"}>
                <span style={{ color: "#555", fontSize: 12, letterSpacing: 1 }}>@{c.user}</span>
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{c.project}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {c.stack.map(s => (
                    <span key={s} style={{
                      background: "#161616", color: "#555",
                      padding: "3px 10px", fontSize: 10, letterSpacing: 2,
                    }}>{s}</span>
                  ))}
                </div>
                <span style={{ color: c.status === "dead" ? "#ff2244" : "#555", fontSize: 12 }}>
                  {c.deadline}
                </span>
                <span style={{
                  color: cfg.color, fontSize: 10, letterSpacing: 3,
                  fontWeight: "bold",
                  textShadow: `0 0 8px ${cfg.color}40`,
                }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMMIT NOW */}
      <section style={{
        padding: "100px 48px",
        background: "#0a0a0a",
        borderTop: "1px solid #111",
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#ff2244", marginBottom: 16 }}>
            — YOUR TURN
          </div>
          <h2 style={{ fontSize: 48, fontWeight: 900, color: "#fff", marginBottom: 8, letterSpacing: -2 }}>
            DECLARE YOUR PROJECT.
          </h2>
          <p style={{ color: "#444", marginBottom: 40, fontSize: 14, lineHeight: 1.8 }}>
            No tutorials. No excuses. Just a public commitment and a deadline.<br />
            The wall is watching. So is everyone else.
          </p>

          {!committed ? (
            <div style={{ display: "flex", gap: 0 }}>
              <input
                value={commitInput}
                onChange={e => setCommitInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCommit()}
                placeholder="What are you building? (be specific)"
                style={{
                  flex: 1, background: "#0f0f0f", border: "1px solid #222",
                  borderRight: "none", color: "#fff", padding: "18px 24px",
                  fontSize: 14, fontFamily: "inherit", outline: "none",
                }}
              />
              <button onClick={handleCommit} style={{
                background: "#ff2244", color: "#fff", border: "none",
                padding: "18px 32px", fontSize: 12, letterSpacing: 3,
                cursor: "pointer", fontFamily: "inherit", fontWeight: "bold",
                whiteSpace: "nowrap",
              }}>
                COMMIT →
              </button>
            </div>
          ) : (
            <div style={{
              padding: "32px", border: "1px solid #ff2244",
              background: "rgba(255,34,68,0.05)",
            }}>
              <div style={{ color: "#ff2244", fontSize: 11, letterSpacing: 4, marginBottom: 12 }}>
                ✓ COMMITTED PUBLICLY
              </div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
                "{commitInput}"
              </div>
              <div style={{ color: "#444", fontSize: 12 }}>
                The wall is watching. Ship it or it never happened.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* THREE ENGINES */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#ff2244", marginBottom: 16 }}>
          — HOW IT WORKS
        </div>
        <h2 style={{ fontSize: 48, fontWeight: 900, color: "#fff", marginBottom: 64, letterSpacing: -2 }}>
          THREE ENGINES.<br />
          <span style={{ color: "#333" }}>ONE MISSION.</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {[
            {
              num: "01",
              title: "DECLARE & COMMIT",
              desc: "State your project publicly. Set a deadline. Stake your reputation. The community witnesses. No escape. No tomorrow.",
              color: "#ff2244",
            },
            {
              num: "02",
              title: "48HR SPRINTS",
              desc: "Weekly micro-hackathons. Tiny scope. Hard deadline. Ship something every week until shipping becomes instinct, not event.",
              color: "#f5c518",
            },
            {
              num: "03",
              title: "ANTI-TUTORIAL ARENA",
              desc: "Declare your skills. Get a real problem. No hand-holding. An AI mentor that asks questions instead of giving answers.",
              color: "#00ff88",
            },
          ].map((engine, i) => (
            <div key={i} style={{
              padding: "48px 40px",
              background: "#0c0c0c",
              borderTop: `3px solid ${engine.color}`,
              transition: "background 0.3s",
              cursor: "default",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#111"}
              onMouseLeave={e => e.currentTarget.style.background = "#0c0c0c"}>
              <div style={{
                fontSize: 72, fontWeight: 900, color: "#161616",
                lineHeight: 1, marginBottom: 24, letterSpacing: -4,
              }}>{engine.num}</div>
              <h3 style={{
                fontSize: 18, fontWeight: 900, color: engine.color,
                letterSpacing: 3, marginBottom: 20,
              }}>{engine.title}</h3>
              <p style={{ color: "#555", fontSize: 13, lineHeight: 1.9, margin: 0 }}>
                {engine.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "48px",
        borderTop: "1px solid #111",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: 4, color: "#222" }}>
          BUILD<span style={{ color: "#ff2244" }}>OR</span>DIE
        </span>
        <span style={{ fontSize: 10, letterSpacing: 3, color: "#333" }}>
          NO TUTORIALS. NO EXCUSES. JUST SHIP.
        </span>
        <span style={{ fontSize: 10, color: "#222", letterSpacing: 2 }}>© 2026</span>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #ff2244; }
      `}</style>
    </div>
  );
}
