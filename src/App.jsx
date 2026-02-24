import { useState, useEffect, useRef } from "react";

const theme = {
  bg: "#0a0e1a",
  card: "#111827",
  cardHover: "#1a2236",
  accent: "#3b82f6",
  accentLight: "#60a5fa",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  border: "#1e293b",
  borderLight: "#334155",
};

const tabs = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "concepts", label: "Key Concepts", icon: "📖" },
  { id: "sim-viscosity", label: "Viscosity Sim", icon: "🧪" },
  { id: "sim-pressure", label: "Pressure Sim", icon: "🌊" },
  { id: "sim-surface", label: "Surface Tension", icon: "💧" },
  { id: "sim-pipe", label: "Pipe Flow", icon: "🔧" },
  { id: "quiz", label: "Practice Quiz", icon: "✏️" },
];

// ─── HOME PAGE ───
function HomePage({ setActiveTab }) {
  const topics = [
    { tab: "concepts", title: "Key Concepts Review", desc: "Fundamentals of viscosity, pressure, & surface tension", color: "#3b82f6" },
    { tab: "sim-viscosity", title: "Viscosity Simulation", desc: "Shear stress–strain rate for Newtonian & non-Newtonian fluids", color: "#8b5cf6" },
    { tab: "sim-pressure", title: "Pressure Simulation", desc: "Hydrostatic pressure, Pascal's law, & atmospheric pressure", color: "#06b6d4" },
    { tab: "sim-surface", title: "Surface Tension Lab", desc: "Young-Laplace equation & contact angle", color: "#10b981" },
    { tab: "sim-pipe", title: "Pipe Flow Calculator", desc: "Mass conservation & continuity equation", color: "#f59e0b" },
    { tab: "quiz", title: "Practice Quiz", desc: "Test your understanding of Week 1 material", color: "#ef4444" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{
        textAlign: "center", padding: "48px 24px 32px",
        background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))",
        borderRadius: 16, marginBottom: 32, border: `1px solid ${theme.border}`
      }}>
        <div style={{ fontSize: 14, letterSpacing: 3, color: theme.accentLight, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
          SKKU · Fluid Mechanics for Chemical Engineering · 2025 Spring
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 800, color: "#fff", margin: "8px 0",
          fontFamily: "'Outfit', 'Noto Sans KR', sans-serif",
          background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          Week 01 Study Companion
        </h1>
        <p style={{ color: theme.textMuted, fontSize: 16, maxWidth: 600, margin: "12px auto 0", lineHeight: 1.7 }}>
          Explore the fundamentals of fluid mechanics — Viscosity, Pressure, and Surface Tension —<br />
          through interactive simulations and practice problems.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {topics.map((t, i) => (
          <button key={t.tab} onClick={() => setActiveTab(t.tab)} style={{
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12,
            padding: "24px 20px", textAlign: "left", cursor: "pointer",
            transition: "all 0.25s ease", position: "relative", overflow: "hidden",
            animation: `fadeSlideUp 0.4s ease ${i * 0.07}s both`
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: t.color, marginBottom: 16 }} />
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>{t.title}</h3>
            <p style={{ color: theme.textMuted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── KEY CONCEPTS PAGE ───
function ConceptsPage() {
  const [openSection, setOpenSection] = useState(0);

  const sections = [
    {
      title: "Viscosity (μ)",
      content: (
        <div>
          <p><strong>Definition:</strong> A measure of a fluid's resistance to flow under an applied shear stress.</p>
          <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            τ = μ · (du/dy) = μ · γ̇
          </div>
          <p>where τ is shear stress [Pa], μ is dynamic viscosity [Pa·s], and du/dy is the velocity gradient (shear rate, γ̇) [1/s].</p>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Newtonian vs Non-Newtonian Fluids</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: theme.textMuted, fontSize: 13 }}>Property</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: theme.textMuted, fontSize: 13 }}>Newtonian</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: theme.textMuted, fontSize: 13 }}>Non-Newtonian</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Viscosity", "Constant", "Function of shear rate"],
                ["τ vs γ̇", "Linear (through origin)", "Nonlinear or yield stress present"],
                ["Examples", "Water, air, gasoline", "Polymer solutions, paint, toothpaste"],
              ].map(([a, b, c], i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "8px 12px", color: theme.accentLight, fontSize: 13, fontWeight: 600 }}>{a}</td>
                  <td style={{ padding: "8px 12px", color: theme.text, fontSize: 13 }}>{b}</td>
                  <td style={{ padding: "8px 12px", color: theme.text, fontSize: 13 }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: 12, background: "rgba(245,158,11,0.08)", borderRadius: 8, borderLeft: `3px solid ${theme.warning}` }}>
            <strong style={{ color: theme.warning }}>Unit Conversion:</strong> 1 cP = 1 mPa·s = 10⁻³ Pa·s. Viscosity of water ≈ 1 cP at 20°C.
          </div>
          <div style={{ marginTop: 12, padding: 12, background: "rgba(59,130,246,0.08)", borderRadius: 8, borderLeft: `3px solid ${theme.accent}` }}>
            <strong style={{ color: theme.accentLight }}>Temperature Dependence:</strong> log μ = a + b·log T (typically b {"<"} 0 → viscosity decreases as temperature rises)
          </div>
        </div>
      ),
    },
    {
      title: "Pressure (P)",
      content: (
        <div>
          <p><strong>Definition:</strong> P ≡ F/A — force per unit area acting perpendicular to a surface. <span style={{ color: theme.warning, fontWeight: 700 }}>Pressure is a SCALAR, not a vector!</span></p>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Pressure in a Static Fluid</h4>
          <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            P = P₀ + ρgh &nbsp;&nbsp;⟹&nbsp;&nbsp; dP/dz = −ρg
          </div>
          <p>Pressure increases with depth. All points at the same depth in a static fluid have the same pressure (isotropic, perpendicular to any surface).</p>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Atmospheric Pressure (Ideal Gas Assumption)</h4>
          <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            p = p₀ · exp(−M_w · g · z / RT)
          </div>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Pascal's Law</h4>
          <p>A change in pressure applied to an enclosed fluid is transmitted undiminished to every point of the fluid and to the walls of the container.</p>
          <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: 8, padding: 12, margin: "8px 0", borderLeft: `3px solid ${theme.success}` }}>
            P₁ = P₂ → F₁/A₁ = F₂/A₂ &nbsp;(Principle behind hydraulic systems)
          </div>
        </div>
      ),
    },
    {
      title: "Surface Tension (σ)",
      content: (
        <div>
          <p><strong>Definition:</strong> The tendency of liquid surfaces to shrink to the minimum surface area possible. [Units: N/m or J/m²]</p>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Young-Laplace Equation</h4>
          <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            ΔP = P_in − P_out = σ · (1/R₁ + 1/R₂)
          </div>
          <p>Sphere: ΔP = 2σ/R &nbsp;|&nbsp; Cylinder: ΔP = σ/R</p>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Young's Contact Angle Equation</h4>
          <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            σ_gs = σ_ls + σ_gl · cos(θ_c)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                <th style={{ padding: "6px 10px", textAlign: "left", color: theme.textMuted, fontSize: 13 }}>Contact Angle</th>
                <th style={{ padding: "6px 10px", textAlign: "left", color: theme.textMuted, fontSize: 13 }}>Wetting Behavior</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["θ = 0°", "Complete wetting (Spreading)"],
                ["θ < 90°", "Hydrophilic (Good wetting)"],
                ["θ > 90°", "Hydrophobic (Poor wetting)"],
                ["θ ≈ 150°+", "Superhydrophobic (e.g. lotus leaf)"],
              ].map(([a, b], i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "6px 10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: theme.accentLight }}>{a}</td>
                  <td style={{ padding: "6px 10px", color: theme.text, fontSize: 13 }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Capillary Rise</h4>
          <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            σ = ρ · g · h · a / (2 · cos θ)
          </div>
        </div>
      ),
    },
    {
      title: "Mass Conservation & Continuity Equation",
      content: (
        <div>
          <p><strong>Mass Conservation:</strong> Without chemical reaction: X_in − X_out = ΔX_system</p>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Continuity Equation</h4>
          <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            ρ₁ u₁ A₁ = ρ₂ u₂ A₂
          </div>
          <p>For an incompressible fluid (ρ = const):</p>
          <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: 8, padding: 16, margin: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
            u₁ A₁ = u₂ A₂ &nbsp;→&nbsp; Q₁ = Q₂
          </div>
          <h4 style={{ color: theme.accentLight, marginTop: 16 }}>Flow Rate Summary</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <tbody>
              {[
                ["Volumetric flow rate Q", "u · A", "m³/s"],
                ["Mass flow rate ṁ", "ρ · u · A", "kg/s"],
                ["Momentum flow rate Ṁ", "ρ · u² · A", "N"],
              ].map(([a, b, c], i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "8px 12px", color: theme.accentLight, fontWeight: 600, fontSize: 13 }}>{a}</td>
                  <td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", color: theme.text, fontSize: 13 }}>{b}</td>
                  <td style={{ padding: "8px 12px", color: theme.textMuted, fontSize: 13 }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 24 }}>📖 Key Concepts Review</h2>
      {sections.map((sec, i) => (
        <div key={i} style={{
          background: theme.card, border: `1px solid ${openSection === i ? theme.accent : theme.border}`,
          borderRadius: 12, marginBottom: 12, overflow: "hidden",
          transition: "border-color 0.3s ease"
        }}>
          <button onClick={() => setOpenSection(openSection === i ? -1 : i)} style={{
            width: "100%", padding: "16px 20px", background: "transparent", border: "none",
            color: "#fff", fontSize: 16, fontWeight: 700, textAlign: "left", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            {sec.title}
            <span style={{ transform: openSection === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", fontSize: 12 }}>▼</span>
          </button>
          {openSection === i && (
            <div style={{ padding: "0 20px 20px", color: theme.text, fontSize: 14, lineHeight: 1.75 }}>
              {sec.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── VISCOSITY SIMULATION ───
function ViscositySim() {
  const [fluidType, setFluidType] = useState("newtonian");
  const [mu, setMu] = useState(1.0);
  const [plateSpeed, setPlateSpeed] = useState(2.0);
  const [gapH, setGapH] = useState(0.01);
  const [nIndex, setNIndex] = useState(0.5);
  const canvasRef = useRef(null);

  const shearRate = plateSpeed / gapH;
  let shearStress, apparentViscosity;

  if (fluidType === "newtonian") {
    shearStress = mu * shearRate;
    apparentViscosity = mu;
  } else if (fluidType === "shear-thinning") {
    shearStress = mu * Math.pow(shearRate, nIndex);
    apparentViscosity = mu * Math.pow(shearRate, nIndex - 1);
  } else {
    const n = 1.5;
    shearStress = mu * Math.pow(shearRate, n);
    apparentViscosity = mu * Math.pow(shearRate, n - 1);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#475569";
    ctx.fillRect(0, 0, W, 20);
    ctx.fillRect(0, H - 20, W, 20);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px JetBrains Mono, monospace";
    ctx.fillText("Moving plate → V = " + plateSpeed.toFixed(1) + " m/s", 10, 14);
    ctx.fillText("Fixed plate (no-slip: u = 0)", 10, H - 6);

    const drawH = H - 40;
    const startY = 20;
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;

    for (let py = 0; py <= drawH; py++) {
      const yFrac = 1 - py / drawH;
      let uFrac;
      if (fluidType === "newtonian") uFrac = yFrac;
      else if (fluidType === "shear-thinning") uFrac = Math.pow(yFrac, 1 / nIndex);
      else uFrac = Math.pow(yFrac, 1 / 1.5);
      const x = 60 + uFrac * (W - 120);
      if (py === 0) ctx.moveTo(x, startY + py);
      else ctx.lineTo(x, startY + py);
    }
    ctx.stroke();

    for (let i = 0; i <= 8; i++) {
      const py = (drawH / 8) * i;
      const yFrac = 1 - py / drawH;
      let uFrac;
      if (fluidType === "newtonian") uFrac = yFrac;
      else if (fluidType === "shear-thinning") uFrac = Math.pow(yFrac, 1 / nIndex);
      else uFrac = Math.pow(yFrac, 1 / 1.5);

      const x = 60 + uFrac * (W - 120);
      const y = startY + py;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(96,165,250,0.4)";
      ctx.lineWidth = 1;
      ctx.moveTo(60, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (uFrac > 0.05) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(96,165,250,0.6)";
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6, y - 3);
        ctx.lineTo(x - 6, y + 3);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("y", 0, 0);
    ctx.restore();

    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.fillText("u(y) →", W / 2 - 20, H / 2 - 10);

  }, [fluidType, mu, plateSpeed, gapH, nIndex]);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>🧪 Viscosity Simulation</h2>
      <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 24 }}>
        Couette flow between parallel plates. The top plate moves at velocity V while the bottom plate is fixed (no-slip condition).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
          <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Parameters</h3>

          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Fluid Type</span>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              {[["newtonian", "Newtonian"], ["shear-thinning", "Shear-thinning"], ["shear-thickening", "Shear-thickening"]].map(([v, l]) => (
                <button key={v} onClick={() => setFluidType(v)} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: fluidType === v ? theme.accent : "transparent",
                  color: fluidType === v ? "#fff" : theme.textMuted,
                  border: `1px solid ${fluidType === v ? theme.accent : theme.borderLight}`
                }}>{l}</button>
              ))}
            </div>
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>
              {fluidType === "newtonian" ? "Viscosity μ" : "Consistency index K"}: {mu.toFixed(2)} Pa·s{fluidType !== "newtonian" ? "ⁿ" : ""}
            </span>
            <input type="range" min="0.01" max="5" step="0.01" value={mu}
              onChange={e => setMu(+e.target.value)}
              style={{ width: "100%", marginTop: 4, accentColor: theme.accent }} />
          </label>

          {fluidType === "shear-thinning" && (
            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Power-law index n: {nIndex.toFixed(2)} (n{"<"}1)</span>
              <input type="range" min="0.1" max="0.99" step="0.01" value={nIndex}
                onChange={e => setNIndex(+e.target.value)}
                style={{ width: "100%", marginTop: 4, accentColor: theme.accent }} />
            </label>
          )}

          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Plate speed V: {plateSpeed.toFixed(1)} m/s</span>
            <input type="range" min="0.1" max="10" step="0.1" value={plateSpeed}
              onChange={e => setPlateSpeed(+e.target.value)}
              style={{ width: "100%", marginTop: 4, accentColor: theme.accent }} />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Gap h: {(gapH * 1000).toFixed(1)} mm</span>
            <input type="range" min="0.001" max="0.05" step="0.001" value={gapH}
              onChange={e => setGapH(+e.target.value)}
              style={{ width: "100%", marginTop: 4, accentColor: theme.accent }} />
          </label>

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Shear rate γ̇", shearRate.toFixed(1) + " s⁻¹"],
              ["Shear stress τ", shearStress.toFixed(2) + " Pa"],
              ["Apparent viscosity", apparentViscosity.toFixed(4) + " Pa·s"],
              ["Re (ref.)", (1000 * plateSpeed * gapH / apparentViscosity).toFixed(1)],
            ].map(([label, val], i) => (
              <div key={i} style={{
                background: "rgba(59,130,246,0.06)", borderRadius: 8, padding: "10px 12px",
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 2 }}>{label}</div>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
          <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 12 }}>Velocity Profile u(y)</h3>
          <canvas ref={canvasRef} width={400} height={300} style={{ width: "100%", borderRadius: 8 }} />
          <p style={{ color: theme.textDim, fontSize: 12, marginTop: 8 }}>
            {fluidType === "newtonian"
              ? "Newtonian fluid: Linear velocity profile u(y) = (y/h)·V"
              : fluidType === "shear-thinning"
                ? "Shear-thinning: Near the wall, high shear rate → low viscosity → velocity increases rapidly"
                : "Shear-thickening: Near the wall, high shear rate → high viscosity → velocity increase is suppressed"
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── PRESSURE SIMULATION ───
function PressureSim() {
  const [mode, setMode] = useState("depth");
  const [depth, setDepth] = useState(5);
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [r1, setR1] = useState(0.05);
  const [r2, setR2] = useState(0.15);
  const [f1, setF1] = useState(500);
  const [altitude, setAltitude] = useState(0);

  const g = 9.81;
  const P0 = 101325;

  const Pdepth = P0 + fluidDensity * g * depth;
  const A1 = Math.PI * r1 * r1;
  const A2 = Math.PI * r2 * r2;
  const P_pascal = f1 / A1;
  const F2 = P_pascal * A2;
  const Mw = 0.029;
  const R_gas = 8.314;
  const T = 288;
  const P_atm = P0 * Math.exp(-Mw * g * altitude / (R_gas * T));

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>🌊 Pressure Simulation</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["depth", "Hydrostatic"], ["pascal", "Pascal's Law"], ["atm", "Atmospheric"]].map(([v, l]) => (
          <button key={v} onClick={() => setMode(v)} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: mode === v ? theme.accent : theme.card,
            color: mode === v ? "#fff" : theme.textMuted,
            border: `1px solid ${mode === v ? theme.accent : theme.border}`
          }}>{l}</button>
        ))}
      </div>

      {mode === "depth" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>P = P₀ + ρgh</h3>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Depth h: {depth.toFixed(1)} m</span>
              <input type="range" min="0" max="100" step="0.5" value={depth} onChange={e => setDepth(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Fluid density ρ: {fluidDensity} kg/m³</span>
              <input type="range" min="500" max="13600" step="100" value={fluidDensity} onChange={e => setFluidDensity(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[[1000, "Water"], [1025, "Seawater"], [13600, "Mercury"], [800, "Oil"]].map(([v, l]) => (
                  <button key={v} onClick={() => setFluidDensity(v)} style={{
                    padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                    background: fluidDensity === v ? "rgba(59,130,246,0.2)" : "transparent",
                    color: theme.textMuted, border: `1px solid ${theme.border}`
                  }}>{l}</button>
                ))}
              </div>
            </label>
          </div>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Results</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Atmospheric P₀", (P0 / 1000).toFixed(2) + " kPa"],
                ["Hydrostatic ρgh", ((fluidDensity * g * depth) / 1000).toFixed(2) + " kPa"],
                ["Total pressure P", (Pdepth / 1000).toFixed(2) + " kPa"],
                ["In atm", (Pdepth / P0).toFixed(3) + " atm"],
                ["Gauge pressure", ((Pdepth - P0) / 1000).toFixed(2) + " kPa"],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(59,130,246,0.06)", borderRadius: 6 }}>
                  <span style={{ color: theme.textMuted, fontSize: 13 }}>{l}</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, height: 120, background: "linear-gradient(to bottom, #bfdbfe, #1e40af)", borderRadius: 8, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: `${Math.min(depth / 100, 1) * 100}%`, left: 0, right: 0, height: 2, background: "#ef4444" }} />
              <div style={{ position: "absolute", top: `${Math.max(0, Math.min(depth / 100, 1) * 100 - 4)}%`, left: 8, color: "#fff", fontSize: 11, fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                h = {depth.toFixed(1)} m
              </div>
              <div style={{ position: "absolute", top: 4, left: 8, color: "rgba(0,0,0,0.6)", fontSize: 10 }}>Surface</div>
            </div>
          </div>
        </div>
      )}

      {mode === "pascal" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Hydraulic Jack</h3>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Small piston radius r₁: {(r1 * 100).toFixed(1)} cm</span>
              <input type="range" min="0.01" max="0.1" step="0.005" value={r1} onChange={e => setR1(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Large piston radius r₂: {(r2 * 100).toFixed(1)} cm</span>
              <input type="range" min="0.05" max="0.5" step="0.005" value={r2} onChange={e => setR2(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Input force F₁: {f1.toFixed(0)} N</span>
              <input type="range" min="10" max="5000" step="10" value={f1} onChange={e => setF1(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
          </div>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>P₁ = P₂ → F₁/A₁ = F₂/A₂</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Area ratio A₂/A₁", (A2 / A1).toFixed(1) + "×"],
                ["System pressure", (P_pascal / 1000).toFixed(2) + " kPa"],
                ["Output force F₂", F2.toFixed(0) + " N"],
                ["Force amplification", (F2 / f1).toFixed(1) + "×"],
                ["Liftable mass", (F2 / g).toFixed(1) + " kg"],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(59,130,246,0.06)", borderRadius: 6 }}>
                  <span style={{ color: theme.textMuted, fontSize: 13 }}>{l}</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === "atm" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>p = p₀ · exp(−M_w·g·z / RT)</h3>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Altitude z: {altitude.toFixed(0)} m</span>
              <input type="range" min="0" max="20000" step="100" value={altitude} onChange={e => setAltitude(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[[0, "Sea level"], [2500, "High plateau"], [3776, "Mt. Fuji"], [8849, "Mt. Everest"], [12000, "Cruising alt."]].map(([v, l]) => (
                <button key={v} onClick={() => setAltitude(v)} style={{
                  padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                  background: altitude === v ? "rgba(59,130,246,0.2)" : "transparent",
                  color: theme.textMuted, border: `1px solid ${theme.border}`
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Results</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Pressure p(z)", (P_atm / 1000).toFixed(2) + " kPa"],
                ["In atm", (P_atm / P0).toFixed(4) + " atm"],
                ["% of sea level", ((P_atm / P0) * 100).toFixed(1) + "%"],
                ["Air density ρ(z)", (P_atm * Mw / (R_gas * T)).toFixed(4) + " kg/m³"],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(59,130,246,0.06)", borderRadius: 6 }}>
                  <span style={{ color: theme.textMuted, fontSize: 13 }}>{l}</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SURFACE TENSION SIMULATION ───
function SurfaceTensionSim() {
  const [mode, setMode] = useState("laplace");
  const [sigma, setSigma] = useState(0.072);
  const [radius, setRadius] = useState(0.001);
  const [shape, setShape] = useState("sphere");
  const [sigmaGS, setSigmaGS] = useState(0.05);
  const [sigmaLS, setSigmaLS] = useState(0.03);
  const [sigmaGL, setSigmaGL] = useState(0.072);
  const [capRadius, setCapRadius] = useState(0.5);
  const [capTheta, setCapTheta] = useState(0);

  const dP = shape === "sphere" ? 2 * sigma / radius : sigma / radius;

  const cosTheta = Math.min(1, Math.max(-1, (sigmaGS - sigmaLS) / sigmaGL));
  const contactAngle = Math.acos(cosTheta) * (180 / Math.PI);

  const capR = capRadius / 1000;
  const capThetaRad = capTheta * Math.PI / 180;
  const capH = 2 * sigma * Math.cos(capThetaRad) / (1000 * 9.81 * capR);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>💧 Surface Tension Simulation</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["laplace", "Young-Laplace"], ["contact", "Contact Angle"], ["capillary", "Capillary Rise"]].map(([v, l]) => (
          <button key={v} onClick={() => setMode(v)} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: mode === v ? theme.accent : theme.card,
            color: mode === v ? "#fff" : theme.textMuted,
            border: `1px solid ${mode === v ? theme.accent : theme.border}`
          }}>{l}</button>
        ))}
      </div>

      {mode === "laplace" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>ΔP = σ(1/R₁ + 1/R₂)</h3>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Surface tension σ: {(sigma * 1000).toFixed(1)} mN/m</span>
              <input type="range" min="0.01" max="0.5" step="0.001" value={sigma} onChange={e => setSigma(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[[0.072, "Water"], [0.022, "Ethanol"], [0.063, "Glycerol"], [0.465, "Mercury"]].map(([v, l]) => (
                  <button key={v} onClick={() => setSigma(v)} style={{
                    padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                    background: sigma === v ? "rgba(59,130,246,0.2)" : "transparent",
                    color: theme.textMuted, border: `1px solid ${theme.border}`
                  }}>{l}</button>
                ))}
              </div>
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Radius R: {(radius * 1000).toFixed(3)} mm</span>
              <input type="range" min="0.00001" max="0.01" step="0.00001" value={radius} onChange={e => setRadius(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[["sphere", "Sphere (2σ/R)"], ["cylinder", "Cylinder (σ/R)"]].map(([v, l]) => (
                <button key={v} onClick={() => setShape(v)} style={{
                  flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: shape === v ? theme.accent : "transparent",
                  color: shape === v ? "#fff" : theme.textMuted,
                  border: `1px solid ${shape === v ? theme.accent : theme.borderLight}`
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Laplace Pressure</h3>
            <div style={{ textAlign: "center", padding: 24, background: "rgba(59,130,246,0.06)", borderRadius: 12, marginBottom: 16 }}>
              <div style={{ color: theme.textMuted, fontSize: 13 }}>ΔP = P_in − P_out</div>
              <div style={{ color: "#fff", fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", margin: "8px 0" }}>
                {dP > 1000 ? (dP / 1000).toFixed(2) + " kPa" : dP.toFixed(2) + " Pa"}
              </div>
              <div style={{ color: theme.textMuted, fontSize: 12 }}>{(dP / 101325).toFixed(4)} atm</div>
            </div>
            <p style={{ color: theme.textDim, fontSize: 12, lineHeight: 1.6 }}>
              💡 The smaller the radius, the higher the internal pressure. This is why small soap bubbles have higher internal pressure than large ones.
            </p>
          </div>
        </div>
      )}

      {mode === "contact" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>σ_gs = σ_ls + σ_gl · cos θ</h3>
            {[
              ["σ_gs (gas–solid)", sigmaGS, setSigmaGS],
              ["σ_ls (liquid–solid)", sigmaLS, setSigmaLS],
              ["σ_gl (gas–liquid)", sigmaGL, setSigmaGL],
            ].map(([label, val, setter]) => (
              <label key={label} style={{ display: "block", marginBottom: 14 }}>
                <span style={{ color: theme.textMuted, fontSize: 13 }}>{label}: {(val * 1000).toFixed(1)} mN/m</span>
                <input type="range" min="0.001" max="0.2" step="0.001" value={val} onChange={e => setter(+e.target.value)}
                  style={{ width: "100%", accentColor: theme.accent }} />
              </label>
            ))}
          </div>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Contact Angle Result</h3>
            <div style={{ textAlign: "center", padding: 20, background: "rgba(59,130,246,0.06)", borderRadius: 12, marginBottom: 16 }}>
              <div style={{ color: "#fff", fontSize: 36, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                θ = {contactAngle.toFixed(1)}°
              </div>
              <div style={{
                marginTop: 8, fontSize: 14, fontWeight: 600,
                color: contactAngle < 90 ? theme.success : theme.warning
              }}>
                {contactAngle < 10 ? "Complete wetting (Spreading)" :
                  contactAngle < 90 ? "Hydrophilic" :
                    contactAngle < 150 ? "Hydrophobic" : "Superhydrophobic"}
              </div>
            </div>
            <svg viewBox="0 0 200 100" style={{ width: "100%", height: 80 }}>
              <rect x="0" y="70" width="200" height="30" fill="#334155" />
              <ellipse cx="100" cy="70"
                rx={40 - contactAngle * 0.15}
                ry={Math.max(5, contactAngle * 0.35)}
                fill="rgba(59,130,246,0.4)" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="100" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">{contactAngle.toFixed(0)}°</text>
            </svg>
          </div>
        </div>
      )}

      {mode === "capillary" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>σ = ρgha / (2 cos θ)</h3>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Capillary radius a: {capRadius.toFixed(2)} mm</span>
              <input type="range" min="0.1" max="5" step="0.05" value={capRadius} onChange={e => setCapRadius(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Contact angle θ: {capTheta}°</span>
              <input type="range" min="0" max="89" step="1" value={capTheta} onChange={e => setCapTheta(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Surface tension σ: {(sigma * 1000).toFixed(1)} mN/m</span>
              <input type="range" min="0.01" max="0.5" step="0.001" value={sigma} onChange={e => setSigma(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
          </div>
          <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Capillary Rise Height</h3>
            <div style={{ textAlign: "center", padding: 20, background: "rgba(59,130,246,0.06)", borderRadius: 12, marginBottom: 16 }}>
              <div style={{ color: "#fff", fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                h = {(capH * 1000).toFixed(2)} mm
              </div>
              <div style={{ color: theme.textMuted, fontSize: 12 }}>{(capH * 100).toFixed(3)} cm</div>
            </div>
            <p style={{ color: theme.textDim, fontSize: 12, lineHeight: 1.6 }}>
              💡 Smaller tube radius and smaller contact angle (hydrophilic) lead to greater capillary rise.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PIPE FLOW SIMULATION ───
function PipeFlowSim() {
  const [inletD, setInletD] = useState(50);
  const [exitD, setExitD] = useState(30);
  const [inletV, setInletV] = useState(2.5);
  const [numExits, setNumExits] = useState(1);
  const [exitD2, setExitD2] = useState(20);

  const Ai = Math.PI * (inletD / 2000) ** 2;
  const Ae1 = Math.PI * (exitD / 2000) ** 2;
  const Ae2 = Math.PI * (exitD2 / 2000) ** 2;
  const Qi = inletV * Ai;

  let exitV1, exitV2, Qe1, Qe2;
  if (numExits === 1) {
    exitV1 = inletV * (Ai / Ae1);
    Qe1 = Qi;
    exitV2 = 0;
    Qe2 = 0;
  } else {
    const totalExitA = Ae1 + Ae2;
    Qe1 = Qi * (Ae1 / totalExitA);
    Qe2 = Qi * (Ae2 / totalExitA);
    exitV1 = Qe1 / Ae1;
    exitV2 = Qe2 / Ae2;
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>🔧 Pipe Flow Calculator</h2>
      <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 24 }}>
        Continuity equation for incompressible fluid: u₁A₁ = u₂A₂ (+ u₃A₃)
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
          <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Input Conditions</h3>
          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Inlet diameter D₁: {inletD} mm</span>
            <input type="range" min="10" max="200" step="1" value={inletD} onChange={e => setInletD(+e.target.value)}
              style={{ width: "100%", accentColor: theme.accent }} />
          </label>
          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Inlet velocity u₁: {inletV.toFixed(1)} m/s</span>
            <input type="range" min="0.1" max="20" step="0.1" value={inletV} onChange={e => setInletV(+e.target.value)}
              style={{ width: "100%", accentColor: theme.accent }} />
          </label>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[1, 2].map(n => (
              <button key={n} onClick={() => setNumExits(n)} style={{
                flex: 1, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: numExits === n ? theme.accent : "transparent",
                color: numExits === n ? "#fff" : theme.textMuted,
                border: `1px solid ${numExits === n ? theme.accent : theme.borderLight}`
              }}>{n} exit{n > 1 ? "s" : ""}</button>
            ))}
          </div>
          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Exit 1 diameter D₂: {exitD} mm</span>
            <input type="range" min="5" max="200" step="1" value={exitD} onChange={e => setExitD(+e.target.value)}
              style={{ width: "100%", accentColor: theme.accent }} />
          </label>
          {numExits === 2 && (
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>Exit 2 diameter D₃: {exitD2} mm</span>
              <input type="range" min="5" max="200" step="1" value={exitD2} onChange={e => setExitD2(+e.target.value)}
                style={{ width: "100%", accentColor: theme.accent }} />
            </label>
          )}
        </div>
        <div style={{ background: theme.card, borderRadius: 12, padding: 20, border: `1px solid ${theme.border}` }}>
          <h3 style={{ color: "#fff", fontSize: 15, marginBottom: 16 }}>Results</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              ["Inlet area A₁", (Ai * 1e6).toFixed(1) + " mm²"],
              ["Inlet flow rate Q₁", (Qi * 1e6).toFixed(2) + " L/s"],
              ["Exit 1 velocity u₂", exitV1.toFixed(2) + " m/s"],
              ["Exit 1 flow rate Q₂", (Qe1 * 1e6).toFixed(2) + " L/s"],
              ...(numExits === 2 ? [
                ["Exit 2 velocity u₃", exitV2.toFixed(2) + " m/s"],
                ["Exit 2 flow rate Q₃", (Qe2 * 1e6).toFixed(2) + " L/s"],
              ] : []),
              ["Velocity ratio u₂/u₁", (exitV1 / inletV).toFixed(2) + "×"],
              ["Area ratio (D₁/D₂)²", ((inletD / exitD) ** 2).toFixed(2)],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(59,130,246,0.06)", borderRadius: 6, alignItems: "center" }}>
                <span style={{ color: theme.textMuted, fontSize: 13 }}>{l}</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(16,185,129,0.08)", borderRadius: 8, borderLeft: `3px solid ${theme.success}` }}>
            <strong style={{ color: theme.success, fontSize: 13 }}>Verification:</strong>
            <span style={{ color: theme.text, fontSize: 13 }}> Q_in = {(Qi * 1e6).toFixed(2)}, Q_out = {((Qe1 + Qe2) * 1e6).toFixed(2)} → {Math.abs(Qi - Qe1 - Qe2) < 1e-10 ? "✅ Mass conserved" : "⚠️ Check"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QUIZ ───
const quizData = [
  {
    q: "What is the relationship between shear stress (τ) and shear rate (γ̇) for a Newtonian fluid?",
    opts: ["τ = μ · γ̇ (linear)", "τ = μ · γ̇² (quadratic)", "τ = μ / γ̇ (inverse)", "τ = μ · ln(γ̇)"],
    ans: 0,
    hint: "By definition, a Newtonian fluid has constant viscosity: τ = μ · (du/dy), a linear relationship."
  },
  {
    q: "The viscosity of water is approximately 1 cP. What is this in SI units?",
    opts: ["1 Pa·s", "0.001 Pa·s", "0.1 Pa·s", "100 Pa·s"],
    ans: 1,
    hint: "1 cP = 1 mPa·s = 10⁻³ Pa·s"
  },
  {
    q: "Which statement about pressure in a static fluid is correct?",
    opts: [
      "Pressure is a vector quantity",
      "Pressure varies at the same depth depending on horizontal position",
      "Pressure is the same in all directions (isotropic) and acts perpendicular to any surface",
      "Pressure is independent of depth"
    ],
    ans: 2,
    hint: "Pressure is a SCALAR! It is isotropic and perpendicular to any surface in a static fluid."
  },
  {
    q: "A reducing pipe has an inlet diameter of 50 mm and exit diameter of 30 mm. If the inlet velocity is 2.5 m/s (incompressible fluid), what is the exit velocity?",
    opts: ["≈ 4.2 m/s", "≈ 6.9 m/s", "≈ 1.5 m/s", "≈ 2.5 m/s"],
    ans: 1,
    hint: "u_e = u_i × (D_i/D_e)² = 2.5 × (50/30)² ≈ 6.94 m/s"
  },
  {
    q: "According to the Young-Laplace equation, what is the pressure difference across a spherical droplet?",
    opts: ["ΔP = σ/R", "ΔP = 2σ/R", "ΔP = 4σ/R", "ΔP = σ · R"],
    ans: 1,
    hint: "For a sphere: R₁ = R₂ = R → ΔP = σ(1/R + 1/R) = 2σ/R"
  },
  {
    q: "A surface with a contact angle of 120° is classified as:",
    opts: ["Hydrophilic", "Hydrophobic", "Complete wetting (Spreading)", "Non-Newtonian"],
    ans: 1,
    hint: "θ > 90° → Hydrophobic, θ < 90° → Hydrophilic"
  },
  {
    q: "Using Pascal's law, if a force of 500 N is applied to a small piston (r = 5 cm), what is the force on the large piston (r = 15 cm)?",
    opts: ["1,500 N", "4,500 N", "500 N", "166.7 N"],
    ans: 1,
    hint: "F₂ = F₁ × (A₂/A₁) = 500 × (r₂/r₁)² = 500 × (15/5)² = 500 × 9 = 4,500 N"
  },
  {
    q: "How does the viscosity of a liquid generally change as temperature increases?",
    opts: ["Increases", "Decreases", "Remains constant", "Oscillates"],
    ans: 1,
    hint: "log μ = a + b·log T, where b < 0 → viscosity decreases with increasing temperature."
  },
];

function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(new Array(quizData.length).fill(null));
  const [done, setDone] = useState(false);

  const q = quizData[current];
  const isCorrect = selected === q.ans;

  function handleSelect(i) {
    if (answered[current] !== null) return;
    setSelected(i);
    const newAnswered = [...answered];
    newAnswered[current] = i;
    setAnswered(newAnswered);
    if (i === q.ans) setScore(s => s + 1);
  }

  function handleNext() {
    if (current < quizData.length - 1) {
      setCurrent(c => c + 1);
      setSelected(answered[current + 1]);
      setShowHint(false);
    } else {
      setDone(true);
    }
  }

  function handleReset() {
    setCurrent(0);
    setSelected(null);
    setShowHint(false);
    setScore(0);
    setAnswered(new Array(quizData.length).fill(null));
    setDone(false);
  }

  if (done) {
    const pct = (score / quizData.length) * 100;
    return (
      <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
        <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Quiz Complete!</h2>
        <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 80 ? theme.success : pct >= 50 ? theme.warning : theme.error, fontFamily: "'JetBrains Mono', monospace" }}>
          {score} / {quizData.length}
        </div>
        <p style={{ color: theme.textMuted, margin: "16px 0 32px" }}>
          {pct >= 80 ? "Excellent! You have a strong grasp of the Week 1 material." :
            pct >= 50 ? "Good start! Review the questions you missed and try again." :
              "Review the key concepts and give it another shot!"}
        </p>
        <button onClick={handleReset} style={{
          padding: "12px 32px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer",
          background: theme.accent, color: "#fff", border: "none"
        }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>✏️ Practice Quiz</h2>
        <div style={{ color: theme.textMuted, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
          {current + 1} / {quizData.length} &nbsp;|&nbsp; Score: {score}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {quizData.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: answered[i] !== null
              ? (answered[i] === quizData[i].ans ? theme.success : theme.error)
              : i === current ? theme.accent : theme.border,
            cursor: answered[i] !== null ? "pointer" : "default",
            transition: "background 0.3s"
          }}
            onClick={() => { if (answered[i] !== null) { setCurrent(i); setSelected(answered[i]); setShowHint(false); } }}
          />
        ))}
      </div>

      <div style={{ background: theme.card, borderRadius: 12, padding: 24, border: `1px solid ${theme.border}` }}>
        <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 20, lineHeight: 1.6 }}>
          Q{current + 1}. {q.q}
        </h3>
        <div style={{ display: "grid", gap: 10 }}>
          {q.opts.map((opt, i) => {
            const isChosen = selected === i;
            const isAnswer = i === q.ans;
            const revealed = answered[current] !== null;
            let bg = theme.cardHover;
            let borderColor = theme.border;
            if (revealed && isAnswer) { bg = "rgba(16,185,129,0.1)"; borderColor = theme.success; }
            else if (revealed && isChosen && !isAnswer) { bg = "rgba(239,68,68,0.1)"; borderColor = theme.error; }

            return (
              <button key={i} onClick={() => handleSelect(i)} style={{
                padding: "14px 16px", borderRadius: 8, textAlign: "left", cursor: revealed ? "default" : "pointer",
                background: bg, border: `1px solid ${borderColor}`, color: "#fff", fontSize: 14,
                transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: 12
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: revealed && isAnswer ? theme.success : revealed && isChosen ? theme.error : "rgba(59,130,246,0.15)",
                  color: "#fff"
                }}>
                  {revealed && isAnswer ? "✓" : revealed && isChosen ? "✗" : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered[current] !== null && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: isCorrect ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", borderLeft: `3px solid ${isCorrect ? theme.success : theme.error}` }}>
            <strong style={{ color: isCorrect ? theme.success : theme.error }}>
              {isCorrect ? "Correct! ✅" : "Incorrect ❌"}
            </strong>
            {showHint && <p style={{ color: theme.text, fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>💡 {q.hint}</p>}
            {!showHint && <button onClick={() => setShowHint(true)} style={{
              marginLeft: 12, padding: "4px 10px", borderRadius: 4, fontSize: 12, cursor: "pointer",
              background: "transparent", color: theme.accentLight, border: `1px solid ${theme.borderLight}`
            }}>Show Explanation</button>}
          </div>
        )}

        {answered[current] !== null && (
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <button onClick={handleNext} style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: theme.accent, color: "#fff", border: "none"
            }}>
              {current < quizData.length - 1 ? "Next Question →" : "View Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.text,
      fontFamily: "'Outfit', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        input[type="range"] { height: 6px; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${theme.bg}; } ::-webkit-scrollbar-thumb { background: ${theme.borderLight}; border-radius: 3px; }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,14,26,0.85)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme.border}`, padding: "0 16px",
        overflowX: "auto", whiteSpace: "nowrap"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 2 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "14px 14px", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, cursor: "pointer",
              background: "transparent", border: "none",
              color: activeTab === t.id ? "#fff" : theme.textDim,
              borderBottom: `2px solid ${activeTab === t.id ? theme.accent : "transparent"}`,
              transition: "all 0.2s ease", whiteSpace: "nowrap"
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 60px" }}>
        {activeTab === "home" && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === "concepts" && <ConceptsPage />}
        {activeTab === "sim-viscosity" && <ViscositySim />}
        {activeTab === "sim-pressure" && <PressureSim />}
        {activeTab === "sim-surface" && <SurfaceTensionSim />}
        {activeTab === "sim-pipe" && <PipeFlowSim />}
        {activeTab === "quiz" && <QuizPage />}
      </main>

      <footer style={{
        textAlign: "center", padding: "20px 16px", borderTop: `1px solid ${theme.border}`,
        color: theme.textDim, fontSize: 12
      }}>
        SKKU · Fluid Mechanics for Chemical Engineering · Week 01 Study Companion · Prof. S. Joon Kwon · 2025 Spring
      </footer>
    </div>
  );
}
