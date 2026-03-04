import { useState, useEffect, useRef, useCallback } from "react";

const T = {
  bg: "#070b14", card: "#0d1320", cardAlt: "#111a2d",
  accent: "#2563eb", accentGlow: "#3b82f6", accentSoft: "rgba(37,99,235,0.12)",
  teal: "#0d9488", tealSoft: "rgba(13,148,136,0.12)",
  amber: "#d97706", amberSoft: "rgba(217,119,6,0.10)",
  rose: "#e11d48", roseSoft: "rgba(225,29,72,0.10)",
  emerald: "#059669", emeraldSoft: "rgba(5,150,105,0.10)",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  border: "#1a2235", borderLight: "#263354",
  white: "#f1f5f9",
};

const mono = "'JetBrains Mono', 'Fira Code', monospace";
const sans = "'DM Sans', 'Noto Sans KR', -apple-system, sans-serif";
const display = "'Space Grotesk', 'DM Sans', sans-serif";

const tabs = [
  { id: "home", label: "Home", icon: "⚡" },
  { id: "concepts", label: "Concepts", icon: "📐" },
  { id: "sim-tank", label: "Tank Evacuation", icon: "🫙" },
  { id: "sim-bernoulli", label: "Bernoulli Eq.", icon: "🌀" },
  { id: "sim-drain", label: "Tank Draining", icon: "💧" },
  { id: "sim-orifice", label: "Orifice Meter", icon: "📏" },
  { id: "quiz", label: "Quiz", icon: "✏️" },
];

/* ───── Shared UI Components ───── */
function Card({ children, style, glow }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: 22, position: "relative", overflow: "hidden",
      ...(glow ? { boxShadow: `0 0 40px -12px ${glow}` } : {}),
      ...style,
    }}>{children}</div>
  );
}

function Slider({ label, value, onChange, min, max, step, unit, color }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: T.textMuted, fontSize: 12, fontFamily: sans }}>{label}</span>
        <span style={{ color: color || T.accentGlow, fontSize: 13, fontWeight: 700, fontFamily: mono }}>
          {typeof value === "number" ? (Number.isInteger(step) ? value : value.toFixed(step < 0.01 ? 4 : step < 1 ? 2 : 1)) : value}{unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: color || T.accent, height: 5 }} />
    </label>
  );
}

function Stat({ label, value, sub, color }) {
  return (
    <div style={{
      background: T.cardAlt, borderRadius: 10, padding: "10px 14px",
      border: `1px solid ${T.border}`,
    }}>
      <div style={{ color: T.textDim, fontSize: 11, fontFamily: sans, marginBottom: 2 }}>{label}</div>
      <div style={{ color: color || T.white, fontSize: 16, fontWeight: 800, fontFamily: mono }}>{value}</div>
      {sub && <div style={{ color: T.textDim, fontSize: 10, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function ModeButton({ active, onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
      fontFamily: sans, transition: "all 0.2s",
      background: active ? (color || T.accent) : "transparent",
      color: active ? "#fff" : T.textMuted,
      border: `1px solid ${active ? (color || T.accent) : T.border}`,
    }}>{children}</button>
  );
}

function Eq({ children }) {
  return (
    <div style={{
      background: T.accentSoft, borderRadius: 10, padding: "14px 18px",
      fontFamily: mono, fontSize: 15, color: T.accentGlow,
      margin: "10px 0", borderLeft: `3px solid ${T.accent}`,
    }}>{children}</div>
  );
}

/* ───── HOME ───── */
function HomePage({ setTab }) {
  const topics = [
    { tab: "concepts", title: "Key Concepts", desc: "Conservation laws, energy balance framework, Bernoulli derivation", color: T.accent },
    { tab: "sim-tank", title: "Tank Evacuation", desc: "Dynamic mass balance — pressure decay via vacuum pump", color: T.teal },
    { tab: "sim-bernoulli", title: "Bernoulli Equation", desc: "Generalized & simplified Bernoulli — head conservation", color: "#8b5cf6" },
    { tab: "sim-drain", title: "Tank Draining", desc: "Torricelli's theorem — orifice discharge simulation", color: T.amber },
    { tab: "sim-orifice", title: "Orifice Flow Meter", desc: "Differential pressure flow measurement with discharge coefficient", color: T.emerald },
    { tab: "quiz", title: "Practice Quiz", desc: "10 problems on mass balance, energy balance & Bernoulli", color: T.rose },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{
        textAlign: "center", padding: "52px 24px 36px",
        background: `linear-gradient(160deg, rgba(37,99,235,0.07), rgba(13,148,136,0.05), rgba(139,92,246,0.04))`,
        borderRadius: 18, marginBottom: 36, border: `1px solid ${T.border}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 200, height: 200,
          background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{ fontSize: 13, letterSpacing: 4, color: T.teal, marginBottom: 8, fontFamily: mono, textTransform: "uppercase" }}>
          SKKU · Fluid Mechanics · 2025 Spring
        </div>
        <h1 style={{
          fontSize: 40, fontWeight: 900, color: T.white, margin: "8px 0",
          fontFamily: display, lineHeight: 1.15,
          background: "linear-gradient(135deg, #fff 30%, #60a5fa 70%, #2dd4bf)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Week 02 Study Companion
        </h1>
        <p style={{ color: T.textMuted, fontSize: 15, maxWidth: 620, margin: "14px auto 0", lineHeight: 1.7, fontFamily: sans }}>
          Mass, Energy & Momentum Balances — from conservation laws to the Bernoulli equation and its engineering applications.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
        {topics.map((t, i) => (
          <button key={t.tab} onClick={() => setTab(t.tab)} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "26px 22px", textAlign: "left", cursor: "pointer",
            transition: "all 0.25s", position: "relative", overflow: "hidden",
            animation: `fadeSlideUp 0.4s ease ${i * 0.06}s both`,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 30px -10px ${t.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ width: 36, height: 3, borderRadius: 2, background: t.color, marginBottom: 16 }} />
            <h3 style={{ color: T.white, fontSize: 17, fontWeight: 700, margin: "0 0 6px", fontFamily: display }}>{t.title}</h3>
            <p style={{ color: T.textMuted, fontSize: 13, margin: 0, lineHeight: 1.5, fontFamily: sans }}>{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───── CONCEPTS ───── */
function ConceptsPage() {
  const [open, setOpen] = useState(0);
  const sections = [
    {
      title: "Conservation Laws (Static & Dynamic)",
      body: (
        <div>
          <p><strong>Static form:</strong> For a physical quantity X (mass, energy, momentum) without reaction:</p>
          <Eq>X_in − X_out = ΔX_system</Eq>
          <p>With chemical reaction (species i):</p>
          <Eq>X_in^i − X_out^i + X_created^i − X_destroyed^i = ΔX_system^i</Eq>
          <h4 style={{ color: T.teal, marginTop: 18 }}>Dynamic Form (Rate)</h4>
          <Eq>ẋ_in − ẋ_out = dx_system / dt</Eq>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <div style={{ padding: 12, background: T.emeraldSoft, borderRadius: 8, borderLeft: `3px solid ${T.emerald}` }}>
              <strong style={{ color: T.emerald }}>Steady state:</strong> <span style={{ fontFamily: mono }}>dx/dt = 0</span><br />
              <span style={{ color: T.textMuted, fontSize: 13 }}>No accumulation → ẋ_in = ẋ_out</span>
            </div>
            <div style={{ padding: 12, background: T.amberSoft, borderRadius: 8, borderLeft: `3px solid ${T.amber}` }}>
              <strong style={{ color: T.amber }}>Unsteady (transient):</strong> <span style={{ fontFamily: mono }}>dx/dt ≠ 0</span><br />
              <span style={{ color: T.textMuted, fontSize: 13 }}>System properties change with time</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Energy Balance & Generalized Bernoulli Equation",
      body: (
        <div>
          <p>Energy of a flowing fluid consists of: internal energy (e), pressure energy (p/ρ), kinetic energy (u²/2), and potential energy (gz).</p>
          <h4 style={{ color: T.accentGlow, marginTop: 16 }}>Energy Flow Rate</h4>
          <Eq>ṁ · (e + p/ρ + u²/2 + gz)</Eq>
          <h4 style={{ color: T.accentGlow, marginTop: 16 }}>Generalized Bernoulli Equation (incompressible, steady state)</h4>
          <Eq>Δ(u²/2) + gΔz + Δp/ρ + w + F = 0</Eq>
          <div style={{ marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Δ(u²/2)", "Change in kinetic energy per unit mass", "[m²/s²]"],
                  ["gΔz", "Change in potential energy per unit mass", "[m²/s²]"],
                  ["Δp/ρ", "Change in pressure energy per unit mass", "[m²/s²]"],
                  ["w", "External work per unit mass (pump/turbine)", "[m²/s²]"],
                  ["F", "Frictional loss per unit mass", "[m²/s²]"],
                ].map(([a, b, c], i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "6px 10px", fontFamily: mono, color: T.accentGlow, fontSize: 13, fontWeight: 700 }}>{a}</td>
                    <td style={{ padding: "6px 10px", color: T.text, fontSize: 13 }}>{b}</td>
                    <td style={{ padding: "6px 10px", color: T.textDim, fontSize: 12, fontFamily: mono }}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 14, padding: 12, background: T.roseSoft, borderRadius: 8, borderLeft: `3px solid ${T.rose}` }}>
            <strong style={{ color: T.rose }}>Sign convention for w:</strong> w {"<"} 0 when work is done ON the fluid (pump), w {">"} 0 when work is done BY the fluid (turbine).
          </div>
        </div>
      ),
    },
    {
      title: "Simplified Bernoulli & Fluid Head",
      body: (
        <div>
          <p>When there is no friction (F=0), no external work (w=0), no internal energy change, and no heat transfer:</p>
          <Eq>u₁²/2 + gz₁ + p₁/ρ = u₂²/2 + gz₂ + p₂/ρ</Eq>
          <h4 style={{ color: T.teal, marginTop: 16 }}>Head Form (divide by g)</h4>
          <Eq>u₁²/(2g) + z₁ + p₁/(ρg) = u₂²/(2g) + z₂ + p₂/(ρg) = H</Eq>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            {[
              ["Velocity head", "u²/(2g)", T.accent],
              ["Static head", "z", T.teal],
              ["Pressure head", "p/(ρg)", T.amber],
            ].map(([name, eq, color]) => (
              <div key={name} style={{ padding: 12, background: `${color}15`, borderRadius: 8, textAlign: "center", border: `1px solid ${color}30` }}>
                <div style={{ fontFamily: mono, color, fontSize: 14, fontWeight: 700 }}>{eq}</div>
                <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>{name}</div>
              </div>
            ))}
          </div>
          <h4 style={{ color: T.teal, marginTop: 18 }}>Torricelli's Theorem (Tank Draining)</h4>
          <Eq>u = √(2gh) &nbsp;→&nbsp; Q = C_c · A · √(2gh) &nbsp; (C_c ≈ 0.63)</Eq>
        </div>
      ),
    },
    {
      title: "Flow Measurement — Orifice & Pitot Tube",
      body: (
        <div>
          <h4 style={{ color: T.accentGlow }}>Orifice Flow Meter</h4>
          <p>Uses Bernoulli equation across a restriction. Measures pressure drop to determine flow rate.</p>
          <Eq>Q = C_D · A₁ · √( 2(p₁−p₂) / (ρ · (A₁²/A₀² − 1)) )</Eq>
          <p style={{ color: T.textMuted, fontSize: 13 }}>C_D = discharge coefficient (accounts for vena contracta & friction, depends on Re and β = d₀/D).</p>
          <h4 style={{ color: T.accentGlow, marginTop: 18 }}>Pitot Tube</h4>
          <p>Measures velocity at stagnation point where kinetic energy converts to pressure head:</p>
          <Eq>u = √(2gh) &nbsp; where h = height difference in manometer</Eq>
          <h4 style={{ color: T.accentGlow, marginTop: 18 }}>Reynolds Number</h4>
          <Eq>Re = ρVD / μ</Eq>
          <p style={{ color: T.textMuted, fontSize: 13 }}>Dimensionless ratio of inertial forces to viscous forces. Determines flow regime and affects discharge coefficient.</p>
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: T.white, marginBottom: 24, fontFamily: display }}>📐 Key Concepts</h2>
      {sections.map((s, i) => (
        <div key={i} style={{
          background: T.card, border: `1px solid ${open === i ? T.accent : T.border}`,
          borderRadius: 14, marginBottom: 12, overflow: "hidden", transition: "border-color 0.3s",
        }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} style={{
            width: "100%", padding: "16px 22px", background: "transparent", border: "none",
            color: T.white, fontSize: 16, fontWeight: 700, textAlign: "left", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: display,
          }}>
            {s.title}
            <span style={{ transform: open === i ? "rotate(180deg)" : "", transition: "transform 0.3s", fontSize: 11, color: T.textDim }}>▼</span>
          </button>
          {open === i && (
            <div style={{ padding: "0 22px 22px", color: T.text, fontSize: 14, lineHeight: 1.8, fontFamily: sans }}>
              {s.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───── TANK EVACUATION SIMULATION ───── */
function TankEvacSim() {
  const [V0, setV0] = useState(1);
  const [Q, setQ] = useState(0.001);
  const [p0, setP0] = useState(1);
  const [pTarget, setPTarget] = useState(0.0001);
  const canvasRef = useRef(null);

  const tFinal = -(V0 / Q) * Math.log(pTarget / p0);

  const getP = (t) => p0 * Math.exp(-(Q / V0) * t);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, W, H);

    // axes
    ctx.strokeStyle = T.borderLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 10); ctx.lineTo(50, H - 30); ctx.lineTo(W - 10, H - 30);
    ctx.stroke();

    // labels
    ctx.fillStyle = T.textDim;
    ctx.font = `11px ${mono}`;
    ctx.fillText("p (bar)", 4, 20);
    ctx.fillText("t (s)", W - 40, H - 8);

    // plot curve
    const plotW = W - 70, plotH = H - 50;
    const tMax = tFinal * 1.2;
    ctx.beginPath();
    ctx.strokeStyle = T.accentGlow;
    ctx.lineWidth = 2.5;

    for (let px = 0; px <= plotW; px++) {
      const t = (px / plotW) * tMax;
      const p = getP(t);
      const y = (H - 30) - (p / p0) * plotH;
      if (px === 0) ctx.moveTo(50 + px, y);
      else ctx.lineTo(50 + px, y);
    }
    ctx.stroke();

    // target line
    const yTarget = (H - 30) - (pTarget / p0) * plotH;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = T.rose;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, yTarget); ctx.lineTo(W - 10, yTarget);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = T.rose;
    ctx.font = `10px ${mono}`;
    ctx.fillText(`p_f = ${pTarget} bar`, W - 110, yTarget - 5);

    // t_final marker
    const xFinal = 50 + (tFinal / tMax) * plotW;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = T.teal;
    ctx.beginPath();
    ctx.moveTo(xFinal, 10); ctx.lineTo(xFinal, H - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = T.teal;
    ctx.fillText(`t = ${tFinal.toFixed(0)}s`, xFinal + 4, 24);

    // p0 label
    ctx.fillStyle = T.textMuted;
    ctx.fillText(`${p0}`, 20, (H - 30) - plotH + 4);
    ctx.fillText("0", 34, H - 32);

  }, [V0, Q, p0, pTarget, tFinal]);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: T.white, marginBottom: 6, fontFamily: display }}>🫙 Tank Evacuation — Dynamic Mass Balance</h2>
      <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20, fontFamily: sans }}>
        A vacuum pump removes air from a fixed-volume tank at constant volumetric rate Q. The pressure decays exponentially: p(t) = p₀ · exp(−Qt/V₀).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card>
          <h3 style={{ color: T.white, fontSize: 15, marginBottom: 16, fontFamily: display }}>Parameters</h3>
          <Slider label="Tank volume V₀" value={V0} onChange={setV0} min={0.1} max={10} step={0.1} unit="m³" />
          <Slider label="Pump rate Q" value={Q} onChange={setQ} min={0.0001} max={0.01} step={0.0001} unit="m³/s" color={T.teal} />
          <Slider label="Initial pressure p₀" value={p0} onChange={setP0} min={0.5} max={5} step={0.1} unit="bar" color={T.amber} />
          <Slider label="Target pressure p_f" value={pTarget} onChange={setPTarget} min={0.00001} max={0.1} step={0.00001} unit="bar" color={T.rose} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <Stat label="Time to reach p_f" value={tFinal.toFixed(1) + " s"} sub={(tFinal / 60).toFixed(1) + " min"} color={T.teal} />
            <Stat label="Time constant V₀/Q" value={(V0 / Q).toFixed(0) + " s"} color={T.amber} />
            <Stat label="p at t = 60s" value={getP(60).toFixed(4) + " bar"} />
            <Stat label="p at t = 300s" value={getP(300).toFixed(6) + " bar"} />
          </div>
        </Card>

        <Card>
          <h3 style={{ color: T.white, fontSize: 15, marginBottom: 10, fontFamily: display }}>Pressure Decay p(t)</h3>
          <canvas ref={canvasRef} width={440} height={280} style={{ width: "100%", borderRadius: 10 }} />
          <div style={{ marginTop: 10, padding: 10, background: T.accentSoft, borderRadius: 8, fontSize: 12, color: T.textMuted, fontFamily: sans }}>
            💡 <strong>Key insight:</strong> dp/dt = −(Q/V₀)p → first-order ODE → exponential decay. Larger tank or smaller pump rate → slower evacuation.
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ───── BERNOULLI EQUATION SIMULATOR ───── */
function BernoulliSim() {
  const [u1, setU1] = useState(2);
  const [z1, setZ1] = useState(0);
  const [p1, setP1] = useState(200);
  const [rho, setRho] = useState(1000);
  const [z2, setZ2] = useState(5);
  const [A1, setA1] = useState(50);
  const [A2, setA2] = useState(25);

  const g = 9.81;
  const A1_m2 = A1 / 10000;
  const A2_m2 = A2 / 10000;
  const u2 = u1 * (A1_m2 / A2_m2);
  const p2 = p1 * 1000 + rho * (u1 * u1 - u2 * u2) / 2 + rho * g * (z1 - z2);
  const p2_kPa = p2 / 1000;

  const H1 = u1 * u1 / (2 * g) + z1 + (p1 * 1000) / (rho * g);
  const H2 = u2 * u2 / (2 * g) + z2 + p2 / (rho * g);

  const velHead1 = u1 * u1 / (2 * g);
  const presHead1 = (p1 * 1000) / (rho * g);
  const velHead2 = u2 * u2 / (2 * g);
  const presHead2 = p2 / (rho * g);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: T.white, marginBottom: 6, fontFamily: display }}>🌀 Bernoulli Equation Simulator</h2>
      <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20, fontFamily: sans }}>
        Simplified Bernoulli (no friction, no work): u²/2 + gz + p/ρ = const. Adjust conditions at point 1 and pipe geometry to see point 2.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card glow="rgba(37,99,235,0.08)">
          <h3 style={{ color: T.white, fontSize: 15, marginBottom: 14, fontFamily: display }}>Inlet (Point 1) & Pipe Geometry</h3>
          <Slider label="Velocity u₁" value={u1} onChange={setU1} min={0.1} max={20} step={0.1} unit="m/s" />
          <Slider label="Elevation z₁" value={z1} onChange={setZ1} min={0} max={50} step={0.5} unit="m" color={T.teal} />
          <Slider label="Pressure p₁" value={p1} onChange={setP1} min={50} max={1000} step={5} unit="kPa" color={T.amber} />
          <Slider label="Density ρ" value={rho} onChange={setRho} min={500} max={13600} step={100} unit="kg/m³" color={T.rose} />
          <Slider label="Elevation z₂" value={z2} onChange={setZ2} min={0} max={50} step={0.5} unit="m" color={T.teal} />
          <Slider label="Area A₁" value={A1} onChange={setA1} min={5} max={200} step={1} unit="cm²" />
          <Slider label="Area A₂" value={A2} onChange={setA2} min={5} max={200} step={1} unit="cm²" />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ color: T.white, fontSize: 15, marginBottom: 12, fontFamily: display }}>Outlet (Point 2) — Computed</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Stat label="Velocity u₂" value={u2.toFixed(2) + " m/s"} color={T.accentGlow} />
              <Stat label="Pressure p₂" value={p2_kPa.toFixed(2) + " kPa"} color={p2_kPa >= 0 ? T.amber : T.rose} />
              <Stat label="Area ratio A₁/A₂" value={(A1_m2 / A2_m2).toFixed(2) + "×"} />
              <Stat label="Velocity ratio u₂/u₁" value={(u2 / u1).toFixed(2) + "×"} />
            </div>
            {p2 < 0 && (
              <div style={{ marginTop: 10, padding: 10, background: T.roseSoft, borderRadius: 8, borderLeft: `3px solid ${T.rose}`, fontSize: 12, color: T.text }}>
                ⚠️ Negative absolute pressure — physically impossible. This indicates cavitation or the flow conditions are unrealistic.
              </div>
            )}
          </Card>

          <Card>
            <h3 style={{ color: T.white, fontSize: 15, marginBottom: 12, fontFamily: display }}>Head Breakdown (m)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div style={{ color: T.textDim, fontSize: 12, marginBottom: 8, fontFamily: sans }}>Point 1</div>
                {[
                  ["Velocity head", velHead1, T.accent],
                  ["Static head", z1, T.teal],
                  ["Pressure head", presHead1, T.amber],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                    <span style={{ color: T.textMuted }}>{l}</span>
                    <span style={{ color: c, fontFamily: mono, fontWeight: 700 }}>{v.toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, fontWeight: 800 }}>
                  <span style={{ color: T.white }}>Total H</span>
                  <span style={{ color: T.white, fontFamily: mono }}>{H1.toFixed(2)} m</span>
                </div>
              </div>
              <div>
                <div style={{ color: T.textDim, fontSize: 12, marginBottom: 8, fontFamily: sans }}>Point 2</div>
                {[
                  ["Velocity head", velHead2, T.accent],
                  ["Static head", z2, T.teal],
                  ["Pressure head", presHead2, T.amber],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                    <span style={{ color: T.textMuted }}>{l}</span>
                    <span style={{ color: c, fontFamily: mono, fontWeight: 700 }}>{v.toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, fontWeight: 800 }}>
                  <span style={{ color: T.white }}>Total H</span>
                  <span style={{ color: T.white, fontFamily: mono }}>{H2.toFixed(2)} m</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: 8, background: T.emeraldSoft, borderRadius: 6, fontSize: 12, color: T.textMuted }}>
              ✅ H₁ ≈ H₂ = {H1.toFixed(3)} m — total head is conserved (simplified Bernoulli).
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ───── TANK DRAINING (TORRICELLI) ───── */
function TankDrainSim() {
  const [tankH, setTankH] = useState(3);
  const [tankD, setTankD] = useState(1);
  const [orifD, setOrifD] = useState(0.05);
  const [Cc, setCc] = useState(0.63);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const g = 9.81;
  const Atank = Math.PI * (tankD / 2) ** 2;
  const Aorif = Math.PI * (orifD / 2) ** 2;
  const a = Cc * Aorif;

  // Time to drain: h(t) = (√h₀ - a√(2g)t/(2A))² → t_drain = 2A√h₀/(a√(2g))
  const tDrain = 2 * Atank * Math.sqrt(tankH) / (a * Math.sqrt(2 * g));

  const getH = (t) => {
    const sqrtH = Math.sqrt(tankH) - (a * Math.sqrt(2 * g) * t) / (2 * Atank);
    return Math.max(0, sqrtH * sqrtH);
  };

  const currentH = getH(elapsed);
  const currentU = Math.sqrt(2 * g * currentH);
  const currentQ = a * currentU;

  useEffect(() => {
    if (!running) { cancelAnimationFrame(animRef.current); return; }
    startRef.current = performance.now() - elapsed * 1000;
    const animate = (ts) => {
      const t = (ts - startRef.current) / 1000;
      if (t >= tDrain) { setElapsed(tDrain); setRunning(false); return; }
      setElapsed(t);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: T.white, marginBottom: 6, fontFamily: display }}>💧 Tank Draining — Torricelli's Theorem</h2>
      <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20, fontFamily: sans }}>
        u = √(2gh) — exit velocity equals that of free fall from height h. Watch the water level drop in real-time.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card>
          <h3 style={{ color: T.white, fontSize: 15, marginBottom: 14, fontFamily: display }}>Tank Parameters</h3>
          <Slider label="Initial water height h₀" value={tankH} onChange={v => { setTankH(v); setElapsed(0); setRunning(false); }} min={0.5} max={10} step={0.1} unit="m" />
          <Slider label="Tank diameter D" value={tankD} onChange={v => { setTankD(v); setElapsed(0); setRunning(false); }} min={0.2} max={5} step={0.1} unit="m" color={T.teal} />
          <Slider label="Orifice diameter d" value={orifD} onChange={v => { setOrifD(v); setElapsed(0); setRunning(false); }} min={0.01} max={0.3} step={0.005} unit="m" color={T.amber} />
          <Slider label="Contraction coeff. Cc" value={Cc} onChange={v => { setCc(v); setElapsed(0); setRunning(false); }} min={0.4} max={1.0} step={0.01} color={T.rose} />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setRunning(!running)} style={{
              flex: 1, padding: 10, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontFamily: sans,
              background: running ? T.rose : T.accent, color: "#fff", border: "none", fontSize: 14,
            }}>{running ? "⏸ Pause" : "▶ Start Drain"}</button>
            <button onClick={() => { setElapsed(0); setRunning(false); }} style={{
              padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontFamily: sans,
              background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, fontSize: 14,
            }}>↺ Reset</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <Stat label="Current height h(t)" value={currentH.toFixed(3) + " m"} color={T.accentGlow} />
            <Stat label="Exit velocity u" value={currentU.toFixed(2) + " m/s"} color={T.teal} />
            <Stat label="Flow rate Q" value={(currentQ * 1000).toFixed(2) + " L/s"} color={T.amber} />
            <Stat label="Time elapsed" value={elapsed.toFixed(1) + " s"} sub={`of ${tDrain.toFixed(1)} s total`} color={T.rose} />
          </div>
        </Card>

        <Card>
          <h3 style={{ color: T.white, fontSize: 15, marginBottom: 10, fontFamily: display }}>Tank Visualization</h3>
          <div style={{ position: "relative", width: "100%", height: 300, background: T.bg, borderRadius: 10, overflow: "hidden" }}>
            {/* Tank walls */}
            <div style={{ position: "absolute", bottom: 20, left: "20%", right: "20%", height: 240, border: `2px solid ${T.borderLight}`, borderBottom: `2px solid ${T.borderLight}`, borderRadius: "0 0 4px 4px" }}>
              {/* Water fill */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: `${(currentH / tankH) * 100}%`,
                background: `linear-gradient(to bottom, rgba(37,99,235,0.3), rgba(37,99,235,0.6))`,
                transition: running ? "none" : "height 0.3s",
                borderRadius: "0 0 2px 2px",
              }} />
              {/* Water level line */}
              <div style={{
                position: "absolute", bottom: `${(currentH / tankH) * 100}%`, left: 0, right: 0,
                height: 2, background: T.accentGlow,
              }} />
            </div>
            {/* Orifice */}
            <div style={{
              position: "absolute", bottom: 16, left: "calc(50% - 8px)", width: 16, height: 8,
              background: currentH > 0.01 ? T.teal : T.border, borderRadius: "0 0 4px 4px",
            }} />
            {/* Stream */}
            {currentH > 0.01 && (
              <div style={{
                position: "absolute", bottom: 2, left: "calc(50% - 2px)", width: 4, height: 14,
                background: `linear-gradient(to bottom, ${T.teal}, transparent)`,
              }} />
            )}
            {/* Labels */}
            <div style={{ position: "absolute", top: 8, left: 8, color: T.textDim, fontSize: 11, fontFamily: mono }}>
              h = {currentH.toFixed(2)} m
            </div>
            <div style={{ position: "absolute", bottom: 4, right: 8, color: T.textDim, fontSize: 11, fontFamily: mono }}>
              {(elapsed / tDrain * 100).toFixed(0)}% drained
            </div>
            {/* Progress bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${(elapsed / tDrain) * 100}%`, background: T.accent, transition: running ? "none" : "width 0.3s" }} />
          </div>
          <div style={{ marginTop: 12, padding: 10, background: T.tealSoft, borderRadius: 8, fontSize: 12, color: T.textMuted }}>
            💡 <strong>Key physics:</strong> As h decreases → u decreases → Q decreases. The drain rate slows over time. Total drain time scales as A_tank/A_orifice × √h₀.
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ───── ORIFICE FLOW METER ───── */
function OrificeFlowSim() {
  const [D, setD] = useState(100);
  const [d0, setD0] = useState(50);
  const [dp, setDp] = useState(20);
  const [rho, setRho] = useState(1000);
  const [Cd, setCd] = useState(0.62);

  const A1 = Math.PI * (D / 2000) ** 2;
  const A0 = Math.PI * (d0 / 2000) ** 2;
  const beta = d0 / D;
  const dpPa = dp * 1000;

  const u1 = Cd * Math.sqrt(2 * dpPa / (rho * ((A1 / A0) ** 2 - 1)));
  const Q = u1 * A1;
  const u2 = u1 * (A1 / (Cd * A0));

  const Re = rho * u1 * (D / 1000) / 0.001;

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: T.white, marginBottom: 6, fontFamily: display }}>📏 Orifice Flow Meter</h2>
      <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20, fontFamily: sans }}>
        Measure flow rate from the pressure drop across an orifice plate using Bernoulli's equation.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card>
          <h3 style={{ color: T.white, fontSize: 15, marginBottom: 14, fontFamily: display }}>Meter Configuration</h3>
          <Slider label="Pipe diameter D" value={D} onChange={setD} min={20} max={500} step={1} unit="mm" />
          <Slider label="Orifice diameter d₀" value={d0} onChange={setD0} min={10} max={D - 1} step={1} unit="mm" color={T.teal} />
          <Slider label="Pressure drop Δp" value={dp} onChange={setDp} min={0.5} max={200} step={0.5} unit="kPa" color={T.amber} />
          <Slider label="Fluid density ρ" value={rho} onChange={setRho} min={500} max={13600} step={100} unit="kg/m³" color={T.rose} />
          <Slider label="Discharge coeff. C_D" value={Cd} onChange={setCd} min={0.4} max={0.95} step={0.01} color={T.emerald} />
        </Card>

        <Card>
          <h3 style={{ color: T.white, fontSize: 15, marginBottom: 14, fontFamily: display }}>Flow Results</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Stat label="β = d₀/D" value={beta.toFixed(3)} color={T.teal} />
            <Stat label="Area ratio A₁/A₀" value={(A1 / A0).toFixed(2) + "×"} />
            <Stat label="Upstream velocity u₁" value={isNaN(u1) ? "—" : u1.toFixed(3) + " m/s"} color={T.accentGlow} />
            <Stat label="Orifice velocity u₂" value={isNaN(u2) ? "—" : u2.toFixed(2) + " m/s"} color={T.amber} />
            <Stat label="Volume flow Q" value={isNaN(Q) ? "—" : (Q * 1000).toFixed(3) + " L/s"} sub={isNaN(Q) ? "" : (Q * 3600).toFixed(2) + " m³/hr"} color={T.emerald} />
            <Stat label="Reynolds number" value={isNaN(Re) ? "—" : Re.toFixed(0)} sub={Re > 4000 ? "Turbulent" : Re > 2300 ? "Transitional" : "Laminar"} color={T.rose} />
          </div>

          {/* Visualization */}
          <div style={{ marginTop: 16, position: "relative", height: 80, background: T.bg, borderRadius: 10, overflow: "hidden" }}>
            {/* Pipe */}
            <div style={{ position: "absolute", top: 10, bottom: 10, left: 0, right: 0, background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 6 }}>
              {/* Orifice plate */}
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 4, background: T.textDim, transform: "translateX(-2px)" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, height: `${((1 - beta) / 2) * 100}%`, width: 4, background: T.amber, transform: "translateX(-2px)" }} />
              <div style={{ position: "absolute", left: "50%", bottom: 0, height: `${((1 - beta) / 2) * 100}%`, width: 4, background: T.amber, transform: "translateX(-2px)" }} />
              {/* Flow arrows */}
              <div style={{ position: "absolute", left: "15%", top: "45%", color: T.accentGlow, fontSize: 14 }}>→→</div>
              <div style={{ position: "absolute", left: "55%", top: "42%", color: T.teal, fontSize: 18, fontWeight: 700 }}>→→→</div>
              <div style={{ position: "absolute", left: "80%", top: "45%", color: T.accentGlow, fontSize: 14 }}>→→</div>
            </div>
            <div style={{ position: "absolute", top: 0, left: "25%", color: T.textDim, fontSize: 10, fontFamily: mono }}>p₁</div>
            <div style={{ position: "absolute", top: 0, right: "25%", color: T.textDim, fontSize: 10, fontFamily: mono }}>p₂</div>
          </div>

          <div style={{ marginTop: 10, padding: 10, background: T.amberSoft, borderRadius: 8, fontSize: 12, color: T.textMuted }}>
            💡 As β (d₀/D) decreases → greater restriction → larger Δp for same flow rate. C_D typically 0.6–0.65 for sharp-edged orifice at high Re.
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ───── QUIZ ───── */
const quizData = [
  { q: "In the dynamic conservation law ẋ_in − ẋ_out = dx/dt, what does steady state mean?", opts: ["dx/dt = 0 (no accumulation)", "ẋ_in = 0 (no inflow)", "ẋ_out > ẋ_in always", "dx/dt → ∞"], ans: 0, hint: "Steady state: properties don't change with time → accumulation rate = 0 → ẋ_in = ẋ_out." },
  { q: "A tank (V = 1 m³) is evacuated at Q = 0.001 m³/s from p₀ = 1 bar. What is p(t)?", opts: ["p₀ · exp(−Qt/V)", "p₀ − Qt/V", "p₀ / (1 + Qt/V)", "p₀ · (1 − Qt/V)"], ans: 0, hint: "From dp/dt = −(Q/V)p → 1st order ODE → exponential decay: p(t) = p₀ · exp(−Qt/V)." },
  { q: "In the generalized Bernoulli equation, what does the term 'w' represent?", opts: ["Frictional loss per unit mass", "External work per unit mass (pump/turbine)", "Internal energy change", "Heat transfer rate"], ans: 1, hint: "w = external work done per unit mass. w < 0 for pump (work on fluid), w > 0 for turbine (work by fluid)." },
  { q: "For an incompressible fluid in a horizontal pipe with constant diameter and no pump, the Bernoulli equation reduces to:", opts: ["p₁ = p₂ (no friction case)", "u₁ = u₂ and p₁ − p₂ = ρF", "Δ(u²/2) + Δp/ρ + gΔz = 0", "p₁ + ρu₁² = p₂ + ρu₂²"], ans: 0, hint: "Same diameter → same velocity. Horizontal → same z. No pump → w = 0. No friction → F = 0. Therefore p₁ = p₂." },
  { q: "What is the physical meaning of the 'pressure head' p/(ρg)?", opts: ["Height of fluid column producing pressure p", "Pressure at the bottom of a fluid column", "Velocity equivalent of pressure", "Power per unit flow rate"], ans: 0, hint: "p = ρgh → h = p/(ρg). The pressure head is the equivalent height of a fluid column that would produce pressure p." },
  { q: "According to Torricelli's theorem, the exit velocity of fluid draining from a tank through an orifice at depth h is:", opts: ["u = √(gh)", "u = √(2gh)", "u = 2gh", "u = gh²/2"], ans: 1, hint: "Bernoulli: gh = u²/2 → u = √(2gh). Same as velocity of an object falling from height h." },
  { q: "In the simplified Bernoulli equation, if velocity increases at a constriction, what happens to pressure?", opts: ["Pressure increases", "Pressure decreases", "Pressure stays the same", "Cannot be determined"], ans: 1, hint: "Total head H is constant. If velocity head increases, pressure head must decrease (assuming same elevation)." },
  { q: "What does the discharge coefficient C_D account for in an orifice flow meter?", opts: ["Gravity effects", "Temperature variation", "Vena contracta and frictional losses", "Pipe roughness only"], ans: 2, hint: "C_D corrects for the vena contracta (jet contraction downstream of orifice) and energy losses due to turbulence." },
  { q: "A pump does work on the fluid. In the generalized Bernoulli equation, the work term w is:", opts: ["Positive (w > 0)", "Negative (w < 0)", "Zero", "Undefined"], ans: 1, hint: "Convention: w < 0 when external work is done FOR the system (pump adds energy). w > 0 when the system does work externally (turbine)." },
  { q: "A Pitot tube measures fluid velocity by converting kinetic energy to:", opts: ["Heat energy", "Pressure energy (stagnation pressure)", "Potential energy", "Internal energy"], ans: 1, hint: "At the stagnation point, fluid velocity = 0. All kinetic energy converts to pressure. u = √(2gh) from the manometer reading." },
];

function QuizPage() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(new Array(quizData.length).fill(null));
  const [done, setDone] = useState(false);

  const q = quizData[cur];
  const isCorrect = sel === q.ans;

  function pick(i) {
    if (answered[cur] !== null) return;
    setSel(i);
    const a = [...answered]; a[cur] = i; setAnswered(a);
    if (i === q.ans) setScore(s => s + 1);
  }

  function next() {
    if (cur < quizData.length - 1) { setCur(c => c + 1); setSel(answered[cur + 1]); setShowHint(false); }
    else setDone(true);
  }

  function reset() { setCur(0); setSel(null); setShowHint(false); setScore(0); setAnswered(new Array(quizData.length).fill(null)); setDone(false); }

  if (done) {
    const pct = score / quizData.length * 100;
    return (
      <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
        <h2 style={{ color: T.white, fontSize: 30, fontWeight: 900, marginBottom: 8, fontFamily: display }}>Quiz Complete!</h2>
        <div style={{ fontSize: 52, fontWeight: 900, color: pct >= 80 ? T.emerald : pct >= 50 ? T.amber : T.rose, fontFamily: mono }}>
          {score} / {quizData.length}
        </div>
        <p style={{ color: T.textMuted, margin: "16px 0 32px", fontFamily: sans }}>
          {pct >= 80 ? "Excellent command of Week 2 material!" : pct >= 50 ? "Solid foundation — review the questions you missed." : "Go back to the Concepts tab and review, then try again!"}
        </p>
        <button onClick={reset} style={{ padding: "12px 36px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", background: T.accent, color: "#fff", border: "none", fontFamily: sans }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: T.white, margin: 0, fontFamily: display }}>✏️ Practice Quiz</h2>
        <div style={{ color: T.textMuted, fontSize: 14, fontFamily: mono }}>{cur + 1}/{quizData.length} · Score: {score}</div>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
        {quizData.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2, cursor: answered[i] !== null ? "pointer" : "default",
            background: answered[i] !== null ? (answered[i] === quizData[i].ans ? T.emerald : T.rose) : i === cur ? T.accent : T.border,
            transition: "background 0.3s",
          }} onClick={() => { if (answered[i] !== null) { setCur(i); setSel(answered[i]); setShowHint(false); } }} />
        ))}
      </div>

      <Card>
        <h3 style={{ color: T.white, fontSize: 17, fontWeight: 700, marginBottom: 18, lineHeight: 1.6, fontFamily: sans }}>
          Q{cur + 1}. {q.q}
        </h3>
        <div style={{ display: "grid", gap: 10 }}>
          {q.opts.map((opt, i) => {
            const chosen = sel === i;
            const isAns = i === q.ans;
            const revealed = answered[cur] !== null;
            let bg = T.cardAlt, bc = T.border;
            if (revealed && isAns) { bg = T.emeraldSoft; bc = T.emerald; }
            else if (revealed && chosen && !isAns) { bg = T.roseSoft; bc = T.rose; }

            return (
              <button key={i} onClick={() => pick(i)} style={{
                padding: "14px 16px", borderRadius: 10, textAlign: "left", cursor: revealed ? "default" : "pointer",
                background: bg, border: `1px solid ${bc}`, color: T.white, fontSize: 14, fontFamily: sans,
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: revealed && isAns ? T.emerald : revealed && chosen ? T.rose : T.accentSoft, color: "#fff",
                }}>{revealed && isAns ? "✓" : revealed && chosen ? "✗" : String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered[cur] !== null && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: isCorrect ? T.emeraldSoft : T.roseSoft, borderLeft: `3px solid ${isCorrect ? T.emerald : T.rose}` }}>
            <strong style={{ color: isCorrect ? T.emerald : T.rose }}>{isCorrect ? "Correct! ✅" : "Incorrect ❌"}</strong>
            {showHint && <p style={{ color: T.text, fontSize: 13, marginTop: 8, lineHeight: 1.6, fontFamily: sans }}>💡 {q.hint}</p>}
            {!showHint && <button onClick={() => setShowHint(true)} style={{
              marginLeft: 12, padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              background: "transparent", color: T.accentGlow, border: `1px solid ${T.borderLight}`, fontFamily: sans,
            }}>Show Explanation</button>}
          </div>
        )}

        {answered[cur] !== null && (
          <div style={{ marginTop: 14, textAlign: "right" }}>
            <button onClick={next} style={{
              padding: "10px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: T.accent, color: "#fff", border: "none", fontFamily: sans,
            }}>{cur < quizData.length - 1 ? "Next →" : "View Results"}</button>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ───── MAIN APP ───── */
export default function Week2App() {
  const [tab, setTab] = useState("home");

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        input[type="range"] { height: 5px; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.borderLight}; border-radius: 3px; }
        button { font-family: inherit; }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(7,11,20,0.88)",
        backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.border}`,
        padding: "0 16px", overflowX: "auto", whiteSpace: "nowrap",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", gap: 1, alignItems: "center" }}>
          <button onClick={() => window.__backToHome && window.__backToHome()} style={{
            padding: "10px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: "transparent", border: "none", color: T.accentGlow, fontFamily: sans,
            whiteSpace: "nowrap", marginRight: 8,
          }}>← All Weeks</button>
          <div style={{ width: 1, height: 20, background: T.border, marginRight: 4 }} />
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "14px 15px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer",
              background: "transparent", border: "none", fontFamily: sans,
              color: tab === t.id ? T.white : T.textDim,
              borderBottom: `2px solid ${tab === t.id ? T.accent : "transparent"}`,
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 16px 60px" }}>
        {tab === "home" && <HomePage setTab={setTab} />}
        {tab === "concepts" && <ConceptsPage />}
        {tab === "sim-tank" && <TankEvacSim />}
        {tab === "sim-bernoulli" && <BernoulliSim />}
        {tab === "sim-drain" && <TankDrainSim />}
        {tab === "sim-orifice" && <OrificeFlowSim />}
        {tab === "quiz" && <QuizPage />}
      </main>

      <footer style={{
        textAlign: "center", padding: "20px 16px", borderTop: `1px solid ${T.border}`,
        color: T.textDim, fontSize: 12, fontFamily: sans,
      }}>
        SKKU · Fluid Mechanics for Chemical Engineering · Week 02 Study Companion · Prof. S. Joon Kwon · 2025 Spring
      </footer>
    </div>
  );
}
