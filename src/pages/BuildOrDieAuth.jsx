import { useState, useEffect } from "react";
import { login, register } from '../services/auth';

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function NoiseOverlay() {
  return (
    <>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />
    </>
  );
}

function Logo({ onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "#ff2244", boxShadow: "0 0 10px #ff2244",
        animation: "pulse 1.5s infinite",
      }} />
      <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 4, color: "#fff", fontFamily: "'Courier New', monospace" }}>
        BUILD<span style={{ color: "#ff2244" }}>OR</span>DIE
      </span>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", fontSize: 10, letterSpacing: 3,
        color: focused ? "#ff2244" : "#444", marginBottom: 8,
        transition: "color 0.2s", fontFamily: "'Courier New', monospace",
      }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: "#0c0c0c",
          border: `1px solid ${error ? "#ff2244" : focused ? "#ff2244" : "#1e1e1e"}`,
          borderLeft: `3px solid ${error ? "#ff2244" : focused ? "#ff2244" : "#1e1e1e"}`,
          color: "#fff", padding: "14px 18px",
          fontSize: 14, fontFamily: "'Courier New', monospace",
          outline: "none", transition: "border 0.2s",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <div style={{ fontSize: 10, color: "#ff2244", marginTop: 6, letterSpacing: 2 }}>
          ✗ {error}
        </div>
      )}
    </div>
  );
}

function SubmitButton({ children, loading, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "16px",
        background: loading ? "#1a0008" : hovered ? "#fff" : "#ff2244",
        color: loading ? "#ff2244" : hovered ? "#ff2244" : "#fff",
        border: `1px solid ${loading ? "#ff2244" : "#ff2244"}`,
        fontSize: 12, letterSpacing: 4, fontWeight: 900,
        fontFamily: "'Courier New', monospace", cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s", marginTop: 8,
      }}
    >
      {loading ? "PROCESSING..." : children}
    </button>
  );
}

// ─── SIDE PANEL ──────────────────────────────────────────────────────────────

const LIVE_COMMITS = [
  { user: "aisha_dev", action: "just shipped", project: "ML Dashboard v2", time: "2m ago", color: "#00ff88" },
  { user: "brian_254", action: "committed to", project: "Auth Microservice", time: "5m ago", color: "#f5c518" },
  { user: "tunde_codes", action: "FAILED to ship", project: "E-Commerce API", time: "12m ago", color: "#ff2244" },
  { user: "mercy_ux", action: "just shipped", project: "Design System", time: "18m ago", color: "#00ff88" },
  { user: "dev_nancy", action: "committed to", project: "Portfolio v3", time: "31m ago", color: "#f5c518" },
  { user: "k_ops177", action: "just shipped", project: "BuildOrDie MVP", time: "1h ago", color: "#00ff88" },
];

function SidePanel() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount(v => Math.min(v + 1, LIVE_COMMITS.length));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: "45%", background: "#060606",
      borderRight: "1px solid #111",
      display: "flex", flexDirection: "column",
      padding: "48px 40px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,34,68,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,34,68,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Ghost text */}
      <div style={{
        position: "absolute", bottom: -40, left: -20,
        fontSize: 180, fontWeight: 900, color: "transparent",
        WebkitTextStroke: "1px rgba(255,34,68,0.05)",
        letterSpacing: -10, lineHeight: 1,
        fontFamily: "'Courier New', monospace",
        userSelect: "none",
      }}>BOD</div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <Logo />

        <div style={{ marginTop: 80 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 24 }}>
            — LIVE ACTIVITY
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {LIVE_COMMITS.slice(0, visibleCount).map((c, i) => (
              <div key={i} style={{
                padding: "14px 16px",
                background: "rgba(12,12,12,0.8)",
                borderLeft: `2px solid ${c.color}`,
                animation: "slideIn 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>@{c.user}</span>
                    <span style={{ color: "#444", fontSize: 12 }}> {c.action} </span>
                    <span style={{ color: c.color, fontSize: 12 }}>{c.project}</span>
                  </div>
                  <span style={{ color: "#333", fontSize: 10, letterSpacing: 1, whiteSpace: "nowrap", marginLeft: 12 }}>
                    {c.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat */}
        <div style={{ marginTop: 48 }}>
          <div style={{
            padding: "24px", background: "rgba(255,34,68,0.04)",
            border: "1px solid rgba(255,34,68,0.1)",
          }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#ff2244", letterSpacing: -2 }}>
              2,847
            </div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#333", marginTop: 4 }}>
              PROJECTS SHIPPED THIS MONTH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function LoginPage({ onSwitch }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleSubmit = async () => {
  const e = validate();
  if (Object.keys(e).length) { setErrors(e); return; }
  setErrors({});
  setLoading(true);
  try {
    await login(form.email, form.password);
    setSuccess(true);
    setTimeout(() => window.location.href = '/dashboard', 1500);
  } catch (err) {
    setErrors({ email: err.response?.data?.message || 'Login failed' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "48px 56px" }}>
      {success ? (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <div style={{ color: "#00ff88", fontSize: 11, letterSpacing: 4, marginBottom: 16 }}>
            ✓ ACCESS GRANTED
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -2, marginBottom: 12 }}>
            WELCOME BACK.
          </h2>
          <p style={{ color: "#444", fontSize: 13, lineHeight: 1.8 }}>
            The wall is waiting.<br />Have you shipped today?
          </p>
          <div style={{
            marginTop: 32, padding: "20px 24px",
            background: "rgba(0,255,136,0.04)",
            borderLeft: "3px solid #00ff88",
          }}>
            <div style={{ color: "#00ff88", fontSize: 10, letterSpacing: 3 }}>REDIRECTING TO DASHBOARD...</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 16 }}>
              — RETURN TO THE WALL
            </div>
            <h1 style={{
              fontSize: 40, fontWeight: 900, color: "#fff",
              letterSpacing: -2, lineHeight: 1, marginBottom: 12,
            }}>
              LOG BACK IN.<br />
              <span style={{ color: "#333" }}>KEEP SHIPPING.</span>
            </h1>
            <p style={{ color: "#444", fontSize: 13, lineHeight: 1.8 }}>
              Your streak is waiting. Don't break it.
            </p>
          </div>

          <Input
            label="EMAIL ADDRESS"
            type="email"
            placeholder="you@buildordie.dev"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="PASSWORD"
            type="password"
            placeholder="••••••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24, marginTop: -8 }}>
            <span style={{ fontSize: 10, color: "#333", letterSpacing: 2, cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#ff2244"}
              onMouseLeave={e => e.target.style.color = "#333"}>
              FORGOT PASSWORD?
            </span>
          </div>

          <SubmitButton loading={loading} onClick={handleSubmit}>
            ACCESS THE WALL →
          </SubmitButton>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#111" }} />
            <span style={{ fontSize: 10, color: "#333", letterSpacing: 3 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#111" }} />
          </div>

          {/* GitHub login */}
          <button style={{
            width: "100%", padding: "14px",
            background: "transparent", color: "#666",
            border: "1px solid #1e1e1e",
            fontSize: 11, letterSpacing: 3, fontWeight: "bold",
            fontFamily: "'Courier New', monospace", cursor: "pointer",
            transition: "all 0.2s", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#666"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            CONTINUE WITH GITHUB
          </button>

          <p style={{ textAlign: "center", marginTop: 32, fontSize: 11, color: "#333" }}>
            No account?{" "}
            <span onClick={onSwitch} style={{
              color: "#ff2244", cursor: "pointer", letterSpacing: 2,
              textDecoration: "none", fontWeight: "bold",
            }}>
              COMMIT NOW →
            </span>
          </p>
        </>
      )}
    </div>
  );
}

// ─── SIGNUP PAGE ──────────────────────────────────────────────────────────────

const SKILLS = ["React", "Node", "Python", "Laravel", "Vue", "Django", "Flutter", "DevOps", "AWS", "MongoDB", "PostgreSQL", "Docker"];

function SignupPage({ onSwitch }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", email: "", password: "", skills: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const validateStep1 = () => {
    const e = {};
    if (form.username.length < 3) e.username = "Min 3 characters";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
  if (form.skills.length === 0) return;
  setLoading(true);
  try {
    await register(form.username, form.email, form.password, form.skills);
    setSuccess(true);
    setTimeout(() => window.location.href = '/dashboard', 1500);
  } catch (err) {
    setErrors({ username: err.response?.data?.message || 'Registration failed' });
    setStep(1);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "48px 56px" }}>
      {success ? (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <div style={{ color: "#00ff88", fontSize: 11, letterSpacing: 4, marginBottom: 16 }}>
            ✓ YOU'RE IN
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -2, marginBottom: 12 }}>
            WELCOME TO<br />
            <span style={{ color: "#ff2244" }}>BUILDORDIE.</span>
          </h2>
          <p style={{ color: "#444", fontSize: 13, lineHeight: 1.8, marginBottom: 32 }}>
            Your first commitment is waiting.<br />
            What are you building?
          </p>
          <div style={{
            padding: "20px 24px",
            background: "rgba(0,255,136,0.04)",
            borderLeft: "3px solid #00ff88",
          }}>
            <div style={{ color: "#00ff88", fontSize: 10, letterSpacing: 3 }}>
              REDIRECTING TO COMMITMENT WALL...
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 40 }}>
            {/* Step indicator */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[1, 2].map(s => (
                <div key={s} style={{
                  height: 2, flex: 1,
                  background: s <= step ? "#ff2244" : "#1e1e1e",
                  transition: "background 0.4s",
                }} />
              ))}
            </div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#ff2244", marginBottom: 16 }}>
              — STEP {step} OF 2 — {step === 1 ? "YOUR IDENTITY" : "YOUR ARSENAL"}
            </div>
            <h1 style={{
              fontSize: 36, fontWeight: 900, color: "#fff",
              letterSpacing: -2, lineHeight: 1.1, marginBottom: 12,
            }}>
              {step === 1 ? (
                <>JOIN THE<br /><span style={{ color: "#333" }}>WALL.</span></>
              ) : (
                <>WHAT DO<br /><span style={{ color: "#333" }}>YOU KNOW?</span></>
              )}
            </h1>
            <p style={{ color: "#444", fontSize: 13, lineHeight: 1.8 }}>
              {step === 1
                ? "No tourists. Builders only. Commit or leave."
                : "Select your skills. The Arena will test every single one."}
            </p>
          </div>

          {step === 1 ? (
            <>
              <Input
                label="USERNAME"
                placeholder="how the wall knows you"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                error={errors.username}
              />
              <Input
                label="EMAIL ADDRESS"
                type="email"
                placeholder="you@buildordie.dev"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Input
                label="PASSWORD"
                type="password"
                placeholder="make it brutal (min 8 chars)"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />

              <SubmitButton onClick={handleNext}>
                NEXT: DECLARE YOUR SKILLS →
              </SubmitButton>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#111" }} />
                <span style={{ fontSize: 10, color: "#333", letterSpacing: 3 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "#111" }} />
              </div>

              <button style={{
                width: "100%", padding: "14px",
                background: "transparent", color: "#666",
                border: "1px solid #1e1e1e",
                fontSize: 11, letterSpacing: 3, fontWeight: "bold",
                fontFamily: "'Courier New', monospace", cursor: "pointer",
                transition: "all 0.2s", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 12,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#666"; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                SIGN UP WITH GITHUB
              </button>
            </>
          ) : (
            <>
              {/* Skill selector */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 16 }}>
                  SELECT YOUR SKILLS — {form.skills.length} SELECTED
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SKILLS.map(skill => {
                    const selected = form.skills.includes(skill);
                    return (
                      <button key={skill} onClick={() => toggleSkill(skill)} style={{
                        padding: "8px 16px",
                        background: selected ? "rgba(255,34,68,0.1)" : "transparent",
                        border: `1px solid ${selected ? "#ff2244" : "#1e1e1e"}`,
                        color: selected ? "#ff2244" : "#444",
                        fontSize: 10, letterSpacing: 2,
                        fontFamily: "'Courier New', monospace", cursor: "pointer",
                        transition: "all 0.2s",
                      }}>
                        {selected ? "✓ " : ""}{skill}
                      </button>
                    );
                  })}
                </div>
                {form.skills.length === 0 && (
                  <div style={{ fontSize: 10, color: "#ff2244", marginTop: 12, letterSpacing: 2 }}>
                    ✗ Select at least one skill
                  </div>
                )}
              </div>

              {/* Warning */}
              <div style={{
                padding: "16px", margin: "24px 0",
                background: "rgba(255,34,68,0.04)",
                borderLeft: "3px solid #ff2244",
              }}>
                <div style={{ fontSize: 10, color: "#ff2244", letterSpacing: 2, lineHeight: 1.8 }}>
                  ⚠ THE ARENA WILL THROW REAL PROBLEMS AT THESE SKILLS.<br />
                  DON'T LIE. THE WALL DOESN'T FORGIVE LIARS.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStep(1)} style={{
                  flex: "0 0 auto", padding: "16px 20px",
                  background: "transparent", color: "#444",
                  border: "1px solid #1e1e1e", fontSize: 11, letterSpacing: 2,
                  fontFamily: "'Courier New', monospace", cursor: "pointer",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#444"; }}>
                  ← BACK
                </button>
                <SubmitButton loading={loading} onClick={handleSubmit}>
                  ENTER THE WALL →
                </SubmitButton>
              </div>
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 32, fontSize: 11, color: "#333" }}>
            Already committed?{" "}
            <span onClick={onSwitch} style={{
              color: "#ff2244", cursor: "pointer", letterSpacing: 2, fontWeight: "bold",
            }}>
              LOG IN →
            </span>
          </p>
        </>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function BuildOrDieAuth() {
  const [page, setPage] = useState("login");

  return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      fontFamily: "'Courier New', monospace",
      color: "#e8e8e8", display: "flex",
    }}>
      <NoiseOverlay />

      {/* Side panel */}
      <SidePanel />

      {/* Auth panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        position: "relative", zIndex: 2,
        animation: "fadeIn 0.4s ease",
      }}>
        {/* Top bar */}
        <div style={{
          padding: "24px 56px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid #0f0f0f",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#222" }}>
            {page === "login" ? "RETURNING BUILDER" : "NEW BUILDER"}
          </div>
          <button onClick={() => setPage(page === "login" ? "signup" : "login")} style={{
            background: "transparent", color: "#333",
            border: "1px solid #1a1a1a", padding: "8px 20px",
            fontSize: 10, letterSpacing: 3,
            fontFamily: "'Courier New', monospace", cursor: "pointer",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff2244"; e.currentTarget.style.borderColor = "#ff2244"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#1a1a1a"; }}>
            {page === "login" ? "SIGN UP →" : "LOG IN →"}
          </button>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: "flex", overflow: "auto" }}>
          {page === "login"
            ? <LoginPage onSwitch={() => setPage("signup")} />
            : <SignupPage onSwitch={() => setPage("login")} />
          }
        </div>

        {/* Bottom bar */}
        <div style={{
          padding: "20px 56px",
          borderTop: "1px solid #0f0f0f",
          display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 10, color: "#222", letterSpacing: 2 }}>
            NO TUTORIALS. NO EXCUSES.
          </span>
          <span style={{ fontSize: 10, color: "#222", letterSpacing: 2 }}>
            BUILDORDIE © 2026
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#080808}
        ::-webkit-scrollbar-thumb{background:#ff2244}
        input::placeholder{color:#2a2a2a}
      `}</style>
    </div>
  );
}
