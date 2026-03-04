import { useState } from "react";
import Week1App from "./Week1App.jsx";
import Week2App from "./Week2App.jsx";

const weeks = [
  {
    id: 1,
    title: "Week 01",
    subtitle: "Introduction to Fluid Mechanics",
    topics: ["Viscosity & Newtonian fluids", "Pressure & Pascal's law", "Surface tension & capillarity", "Continuity equation"],
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.06))",
  },
  {
    id: 2,
    title: "Week 02",
    subtitle: "Mass, Energy & Momentum Balances",
    topics: ["Conservation laws (static & dynamic)", "Energy balance & Bernoulli equation", "Fluid head & Torricelli's theorem", "Orifice & Pitot tube flow meters"],
    color: "#0d9488",
    gradient: "linear-gradient(135deg, rgba(13,148,136,0.12), rgba(37,99,235,0.06))",
  },
];

function LandingPage({ onSelect }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#070b14",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "'DM Sans', 'Noto Sans KR', -apple-system, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: "fixed", top: "-20%", left: "30%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", right: "20%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(13,148,136,0.05), transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeIn 0.6s ease", position: "relative" }}>
        <div style={{
          fontSize: 13, letterSpacing: 5, color: "#2dd4bf", marginBottom: 12,
          fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
        }}>
          Sungkyunkwan University · School of Chemical Engineering
        </div>
        <h1 style={{
          fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 12,
          fontFamily: "'Space Grotesk', sans-serif",
          background: "linear-gradient(135deg, #ffffff 20%, #60a5fa 50%, #2dd4bf 80%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Fluid Mechanics<br />for Chemical Engineering
        </h1>
        <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
          Interactive Study Companion<br />
          Prof. S. Joon Kwon · 2025 Spring Semester
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${weeks.length}, minmax(300px, 380px))`,
        gap: 20, maxWidth: 820, width: "100%",
        position: "relative",
      }}>
        {weeks.map((w, i) => (
          <button
            key={w.id}
            onClick={() => onSelect(w.id)}
            style={{
              background: "#0d1320",
              border: `1px solid #1a2235`,
              borderRadius: 18,
              padding: "32px 28px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              animation: `fadeSlideUp 0.5s ease ${i * 0.1}s both`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = w.color;
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 12px 40px -10px ${w.color}30`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#1a2235";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Top gradient bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${w.color}, transparent)`,
            }} />

            <div style={{
              fontSize: 12, fontWeight: 700, color: w.color, letterSpacing: 2,
              fontFamily: "'JetBrains Mono', monospace", marginBottom: 12, textTransform: "uppercase",
            }}>
              {w.title}
            </div>

            <h2 style={{
              fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 16,
              fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.3,
            }}>
              {w.subtitle}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {w.topics.map((topic, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, color: "#94a3b8", lineHeight: 1.4,
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: w.color, opacity: 0.6, flexShrink: 0,
                  }} />
                  {topic}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 20, display: "flex", alignItems: "center", gap: 6,
              color: w.color, fontSize: 13, fontWeight: 600,
            }}>
              Open Study Companion
              <span style={{ fontSize: 16 }}>→</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{
        marginTop: 48, color: "#334155", fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace", textAlign: "center",
      }}>
        More weeks will be added as the semester progresses
      </div>
    </div>
  );
}

export default function App() {
  const [week, setWeek] = useState(null);

  // Register global back callback for child apps
  window.__backToHome = () => setWeek(null);

  if (week === 1) return <Week1App />;
  if (week === 2) return <Week2App />;

  return <LandingPage onSelect={setWeek} />;
}
