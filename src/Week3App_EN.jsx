import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const Sub = ({ children }) => <sub className="text-xs">{children}</sub>;
const Sup = ({ children }) => <sup className="text-xs">{children}</sup>;

const C = {
  bg: "#0a0f1e", card: "#111827", accent: "#22d3ee", accentDim: "#0e7490",
  warm: "#f59e0b", warmDim: "#b45309", danger: "#ef4444", success: "#10b981", purple: "#a78bfa",
  text: "#e2e8f0", textDim: "#94a3b8", border: "#1e293b", hi: "#312e81",
};

const TABS = [
  { id: "overview",   label: "\uD83D\uDCCB Overview",        short: "Intro"  },
  { id: "momentum",   label: "\uD83D\uDE80 Momentum",        short: "Mom."   },
  { id: "reynolds",   label: "\uD83C\uDF0A Reynolds No.",     short: "Re"     },
  { id: "laminar",    label: "\uD83D\uDD2C Laminar Flow",     short: "Lam."   },
  { id: "friction",   label: "\u26A1 Dissipation",            short: "Fric."  },
  { id: "simulation", label: "\uD83C\uDFAE Simulation",       short: "Sim"    },
  { id: "cfd",        label: "\uD83E\uDDEA Wedge CFD",        short: "CFD"    },
  { id: "practice",   label: "\u270F\uFE0F Practice",         short: "Quiz"   },
  { id: "industry",   label: "\uD83C\uDFED Applications",     short: "Apps"   },
];

// ═══════════════ OVERVIEW ═══════════════
function OverviewTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: C.accent }}>Week 3 — Momentum Balance & Fluid Friction in Pipes</h2>
        <p style={{ color: C.text, lineHeight: 1.8 }}>
          This week covers <strong style={{ color: C.warm }}>momentum conservation</strong> and
          <strong style={{ color: C.accent }}> fluid friction in pipes</strong>.
          We study momentum transfer by forces and convection, angular momentum, then move to the
          generalized Bernoulli equation for analyzing frictional dissipation.
          The Reynolds number classifies flow regimes, and the Hagen-Poiseuille law describes laminar pipe flow.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: "\uD83D\uDE80", title: "Part 1: Momentum Balance", desc: "Force & convective momentum transfer, orifice analysis, angular momentum & centrifugal pump", color: C.purple },
          { icon: "\uD83C\uDF0A", title: "Part 2: Fluid Friction", desc: "Generalized Bernoulli, \u0394P\u221DQ\u207F relation, Reynolds experiment, Re derivation", color: C.accent },
          { icon: "\uD83D\uDD2C", title: "Part 3: Laminar Flow", desc: "Poiseuille velocity profile, Hagen-Poiseuille law, frictional dissipation \u2131, lumped K.E.", color: C.warm },
          { icon: "\uD83E\uDDEA", title: "Bonus: Wedge CFD", desc: "LBM D2Q9 simulation \u2014 wedge flow, water vs oil comparison, vorticity & pressure visualization", color: C.success },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-bold mb-1" style={{ color: item.color }}>{item.title}</h3>
            <p className="text-sm" style={{ color: C.textDim }}>{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>Key Equations — Quick Reference</h3>
        <div className="space-y-2 text-sm font-mono">
          {[
            { eq: "F = dM/dt = d(Mu)/dt", label: "Momentum-force relation", c: C.purple },
            { eq: "\u03C4_w = D(p\u2081\u2212p\u2082)/(4L)", label: "Wall shear stress (pipe)", c: C.purple },
            { eq: "Re = \u03C1u_mD/\u03B7", label: "Reynolds number", c: C.accent },
            { eq: "\u0394(u\u00B2/2)+g\u0394z+\u0394p/\u03C1+w+\u2131=0", label: "Generalized Bernoulli", c: C.accent },
            { eq: "u(r)=(\u2212\u0394p/4\u03B7L)(a\u00B2\u2212r\u00B2)", label: "Laminar velocity profile", c: C.warm },
            { eq: "Q = \u03C0a\u2074(p\u2081\u2212p\u2082)/(8\u03B7L)", label: "Hagen-Poiseuille law", c: C.warm },
            { eq: "\u2131 = 8\u03B7u_mL/(\u03C1a\u00B2)", label: "Frictional dissipation (horiz. laminar)", c: C.danger },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: `${r.c}10` }}>
              <span className="w-64 flex-shrink-0" style={{ color: r.c }}>{r.eq}</span>
              <span style={{ color: C.textDim }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ MOMENTUM ═══════════════
function MomentumTab() {
  const [jetV, setJetV] = useState(100);
  const [jetQ, setJetQ] = useState(1);
  const [rhoJet, setRhoJet] = useState(62.4);
  const jetForce = rhoJet * jetQ * jetV;
  const [r1, setR1] = useState(0.05);
  const [r2, setR2] = useState(0.15);
  const [omega, setOmega] = useState(100);
  const [massFlow, setMassFlow] = useState(5);
  const torque = massFlow * omega * (r2 * r2 - r1 * r1);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.purple }}>Part 1: Momentum Balance</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Momentum M = Mu, Force = dM/dt = rate of change of momentum</p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>\u2460 Momentum Transfer by Forces</h3>
        <div className="space-y-3 text-sm" style={{ color: C.text }}>
          <div className="p-3 rounded-lg" style={{ background: C.bg }}>
            <p className="mb-2"><strong style={{ color: C.accent }}>Key relation:</strong> Force = Ma = M(du/dt) = d(Mu)/dt = dM/dt</p>
            <p>Types of forces:</p>
            <p className="ml-3">\u2022 <strong style={{ color: C.warm }}>Contact (surface) forces:</strong> pressure, shear stress \u2014 short-range</p>
            <p className="ml-3">\u2022 <strong style={{ color: C.purple }}>Body forces:</strong> gravity, E-field, H-field \u2014 long-range</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: C.bg }}>
            <p><strong style={{ color: C.accent }}>Steady pipe flow \u2014 wall shear stress:</strong></p>
            <p className="font-mono mt-1 text-center" style={{ color: C.warm }}>\u03C4<Sub>w</Sub> = D(p\u2081 \u2212 p\u2082) / (4L)</p>
            <p className="text-xs mt-2" style={{ color: C.textDim }}>Forward force = p\u2081\u00B7\u03C0D\u00B2/4, backward force = p\u2082\u00B7\u03C0D\u00B2/4 + \u03C4_w\u00B7\u03C0DL, at steady state dM/dt = 0</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>\u2461 Convective Momentum Transfer \u2014 Jet Impingement Calculator</h3>
        <p className="text-sm mb-3" style={{ color: C.textDim }}>Jet hitting a shield: M\u0307_in = mu, M\u0307_out = 0 (radial dispersion) \u2192 F = \u03C1Qu</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[{ label: "Velocity u (ft/s)", val: jetV, set: setJetV, step: 1 },
            { label: "Flow rate Q (ft\u00B3/s)", val: jetQ, set: setJetQ, step: 0.1 },
            { label: "Density \u03C1 (lb/ft\u00B3)", val: rhoJet, set: setRhoJet, step: 0.1 },
          ].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step} onChange={e => p.set(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-sm" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>
          ))}
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
          <span className="text-sm" style={{ color: C.textDim }}>F = \u03C1Qu = </span>
          <span className="text-2xl font-bold" style={{ color: C.accent }}>{jetForce.toFixed(1)}</span>
          <span className="text-sm" style={{ color: C.textDim }}> lb<Sub>f</Sub> (before g_c correction)</span>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.danger }}>\u2462 Orifice Plate Analysis (Bernoulli + Momentum Balance)</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm" style={{ color: C.text }}>
          <div className="p-3 rounded-lg" style={{ background: `${C.success}15` }}>
            <h4 className="font-bold mb-1" style={{ color: C.success }}>Upstream (\u2460\u2192\u2461): Bernoulli applies \u2713</h4>
            <p>Converging flow, nearly frictionless</p>
            <p className="font-mono text-xs mt-1" style={{ color: C.accent }}>(p\u2081\u2212p\u2082)/\u03C1 = (u\u2081\u00B2/2)(A\u2081\u00B2/A\u2082\u00B2 \u2212 1)</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `${C.danger}15` }}>
            <h4 className="font-bold mb-1" style={{ color: C.danger }}>Downstream (\u2461\u2192\u2462): Momentum balance needed \u2717</h4>
            <p>Expanding flow, intense turbulence & eddies</p>
            <p className="font-mono text-xs mt-1" style={{ color: C.accent }}>mu\u2082 \u2212 mu\u2083 + (p\u2082\u2212p\u2083)A\u2081 = 0</p>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg" style={{ background: `${C.warm}15` }}>
          <h4 className="font-bold mb-1 text-sm" style={{ color: C.warm }}>Frictional dissipation (combined):</h4>
          <p className="font-mono text-center text-sm" style={{ color: C.danger }}>(p\u2081\u2212p\u2083)/\u03C1 = (u\u2081\u00B2/2)(A\u2081/A\u2082 \u2212 1)\u00B2 > 0 (always positive!)</p>
          <p className="text-xs mt-1" style={{ color: C.textDim }}>Eddies from contraction\u2192expansion irreversibly dissipate energy.</p>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.purple }}>\u2463 Angular Momentum & Centrifugal Pump Torque Calculator</h3>
        <p className="text-sm mb-2" style={{ color: C.textDim }}>Impeller torque: T = m\u0307[(ru)\u2082 \u2212 (ru)\u2081] = m\u0307\u03C9(r\u2082\u00B2 \u2212 r\u2081\u00B2)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[{ label: "r\u2081 (m)", val: r1, set: setR1, step: 0.01 }, { label: "r\u2082 (m)", val: r2, set: setR2, step: 0.01 },
            { label: "\u03C9 (rad/s)", val: omega, set: setOmega, step: 1 }, { label: "m\u0307 (kg/s)", val: massFlow, set: setMassFlow, step: 0.1 },
          ].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step} onChange={e => p.set(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-sm" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>
          ))}
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
          <span className="text-sm" style={{ color: C.textDim }}>T = m\u0307\u03C9(r\u2082\u00B2\u2212r\u2081\u00B2) = </span>
          <span className="text-2xl font-bold" style={{ color: C.purple }}>{torque.toFixed(3)}</span>
          <span className="text-sm" style={{ color: C.textDim }}> N\u00B7m</span>
        </div>
        <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: C.bg, color: C.textDim }}>
          <strong style={{ color: C.warm }}>Moment of inertia reference:</strong> Solid cylinder: I = MR\u00B2/2 | Solid sphere: I = 2MR\u00B2/5 | Thin rod: I = ML\u00B2/12
        </div>
      </div>
    </div>
  );
}

// ═══════════════ REYNOLDS NUMBER ═══════════════
function ReynoldsTab() {
  const [rho, setRho] = useState(1000);
  const [u, setU] = useState(1.0);
  const [D, setD] = useState(0.05);
  const [eta, setEta] = useState(0.001);
  const Re = (rho * u * D) / eta;
  const regime = Re < 2000 ? "Laminar" : Re > 4000 ? "Turbulent" : "Transition";
  const regimeColor = Re < 2000 ? C.success : Re > 4000 ? C.danger : C.warm;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Reynolds Number Calculator</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Re = \u03C1u<Sub>m</Sub>D / \u03B7 \u2014 inertial effects (accelerator) vs viscous effects (brake)</p>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[{ label: "Density \u03C1 (kg/m\u00B3)", val: rho, set: setRho, step: 10 },
            { label: "Velocity u_m (m/s)", val: u, set: setU, step: 0.1 },
            { label: "Diameter D (m)", val: D, set: setD, step: 0.001 },
            { label: "Viscosity \u03B7 (Pa\u00B7s)", val: eta, set: setEta, step: 0.0001 },
          ].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step} onChange={e => p.set(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-sm" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl" style={{ background: C.bg }}>
          <div><span className="text-sm" style={{ color: C.textDim }}>Re = </span>
            <span className="text-3xl font-bold" style={{ color: regimeColor }}>{Re < 1e7 ? Re.toFixed(0) : Re.toExponential(2)}</span></div>
          <div className="px-4 py-2 rounded-full font-bold" style={{ background: `${regimeColor}30`, color: regimeColor }}>{regime}</div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>Physical Meaning of Re</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg" style={{ background: `${C.danger}15` }}>
            <h4 className="font-bold text-sm mb-1" style={{ color: C.danger }}>Inertial Effects</h4>
            <p className="text-sm" style={{ color: C.text }}>~ \u03C1u<Sub>m</Sub><Sup>2</Sup> [kg/(m\u00B7s\u00B2)]</p>
            <p className="text-xs" style={{ color: C.textDim }}>Fast but unstable (high fluctuations)</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `${C.accent}15` }}>
            <h4 className="font-bold text-sm mb-1" style={{ color: C.accent }}>Viscous Effects</h4>
            <p className="text-sm" style={{ color: C.text }}>~ \u03B7u<Sub>m</Sub>/D [kg/(m\u00B7s\u00B2)]</p>
            <p className="text-xs" style={{ color: C.textDim }}>Slow but stable (low fluctuations)</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.success }}>Presets (click to apply)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[{ name: "Capillary blood", rho: 1000, u: 0.1, D: 0.00002, eta: 0.001 },
            { name: "Water pipe", rho: 1000, u: 1.5, D: 0.02, eta: 0.001 },
            { name: "Polymer (Ex3.1)", rho: 900, u: 0.5, D: 0.02, eta: 0.01 },
            { name: "Large ship (30m)", rho: 1000, u: 10, D: 30, eta: 0.001 },
          ].map((ex, i) => (
            <button key={i} onClick={() => { setRho(ex.rho); setU(ex.u); setD(ex.D); setEta(ex.eta); }}
              className="p-2 rounded-lg text-left text-xs hover:scale-[1.03] transition-all" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
              <div className="font-bold" style={{ color: C.accent }}>{ex.name}</div>
              <div style={{ color: C.textDim }}>Re\u2248{((ex.rho * ex.u * ex.D) / ex.eta).toExponential(1)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>Flow Regime Classification</h3>
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>
            {["Re Range", "Flow Regime", "\u0394P Proportional to", "Characteristics"].map((h, i) => (<th key={i} className="text-left p-2" style={{ color: C.warm }}>{h}</th>))}
          </tr></thead>
          <tbody>{[
            ["< 2,000", "Laminar", "Q", "Stable, n=1"],
            ["2,000\u20134,000", "Transition", "Q\u207F (1<n<2)", "Unstable"],
            ["> 4,000", "Turbulent", "Q\u00B9\u00B7\u2078~Q\u00B2", "Fully developed, n\u22482"],
          ].map((row, i) => (<tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
            {row.map((cell, j) => (<td key={j} className="p-2" style={{ color: j === 0 ? [C.success, C.warm, C.danger][i] : C.text }}>{cell}</td>))}
          </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════ LAMINAR FLOW ═══════════════
function LaminarTab() {
  const canvasRef = useRef(null);
  const [dP, setDP] = useState(500);
  const [a, setA] = useState(0.01);
  const [L, setL] = useState(1.0);
  const [eta, setEta] = useState(0.001);
  const uMax = (dP * a * a) / (4 * eta * L);
  const uMean = uMax / 2;
  const Q = Math.PI * Math.pow(a, 4) * dP / (8 * eta * L);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width = 500, H = cv.height = 240;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const pT = 30, pB = H - 30, cY = (pT + pB) / 2, pH = pB - pT, lX = 80, rX = W - 40, mxA = (rX - lX) * 0.7;
    ctx.strokeStyle = C.textDim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lX, pT); ctx.lineTo(rX, pT); ctx.moveTo(lX, pB); ctx.lineTo(rX, pB); ctx.stroke();
    for (let i = 0; i <= 15; i++) { const f = i / 15, y = pT + f * pH, rN = (y - cY) / (pH / 2), uN = 1 - rN * rN, aL = uN * mxA;
      ctx.strokeStyle = `rgba(34,211,238,${0.3 + 0.7 * uN})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lX, y); ctx.lineTo(lX + aL, y); ctx.stroke();
      if (aL > 10) { ctx.beginPath(); ctx.moveTo(lX + aL, y); ctx.lineTo(lX + aL - 6, y - 3); ctx.moveTo(lX + aL, y); ctx.lineTo(lX + aL - 6, y + 3); ctx.stroke(); } }
    ctx.strokeStyle = C.warm; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath();
    for (let i = 0; i <= 50; i++) { const f = i / 50, y = pT + f * pH, rN = (y - cY) / (pH / 2), x = lX + (1 - rN * rN) * mxA; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.danger; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath();
    for (let i = 0; i <= 50; i++) { const f = i / 50, y = pT + f * pH, rN = (y - cY) / (pH / 2), x = lX - 10 - Math.abs(rN) * 40; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "11px monospace"; ctx.fillStyle = C.warm; ctx.fillText("u(r) parabolic", lX + mxA * 0.3, pT - 8);
    ctx.fillStyle = C.danger; ctx.fillText("\u03C4(r) linear", lX - 55, pT - 8);
    ctx.fillStyle = C.accent; ctx.fillText("u_M", lX + mxA + 5, cY + 4);
    ctx.fillStyle = C.textDim; ctx.fillText("r=0", lX - 25, cY + 4);
  }, [dP, a, L, eta]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Part 3: Laminar Flow Analysis</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Newtonian fluid: parabolic velocity + linear shear stress distribution</p>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>Velocity & Shear Stress Visualization</h3>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ maxWidth: 500, background: C.bg }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[{ label: "\u0394p (Pa)", val: dP, set: setDP, step: 10 }, { label: "Radius a (m)", val: a, set: setA, step: 0.001 },
            { label: "Length L (m)", val: L, set: setL, step: 0.1 }, { label: "Viscosity \u03B7 (Pa\u00B7s)", val: eta, set: setEta, step: 0.0001 },
          ].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step} onChange={e => p.set(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-sm" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[{ label: "u_M (max)", val: uMax, c: C.accent }, { label: "u_m (mean)", val: uMean, c: C.warm }, { label: "Q (flow rate)", val: Q, c: C.success }].map((v, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: `${v.c}15` }}>
              <div className="text-xs" style={{ color: C.textDim }}>{v.label}</div>
              <div className="font-bold text-sm" style={{ color: v.c }}>{v.val < 0.01 ? v.val.toExponential(3) : v.val.toFixed(4)}</div>
            </div>))}
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>Key Equations</h3>
        <div className="space-y-3">
          {[{ t: "Force balance", eq: "\u03C4 = (r/2)(\u2212dp/dz)", n: "Steady-state cylindrical fluid element" },
            { t: "Velocity profile", eq: "u(r) = (\u2212\u0394p/4\u03B7L)(a\u00B2\u2212r\u00B2) = u_M[1\u2212(r/a)\u00B2]", n: "Parabolic \u2014 max at center, zero at wall (no-slip)" },
            { t: "Shear stress", eq: "\u03C4(r) = \u2212r\u0394p/(2L)", n: "Linear \u2014 zero at center, max at wall (\u03C4_w)" },
            { t: "Hagen-Poiseuille", eq: "Q = \u03C0a\u2074(p\u2081\u2212p\u2082)/(8\u03B7L)", n: "Q \u221D \u0394p, Q \u221D a\u2074 (note the 4th power!)" },
            { t: "Mean vs max velocity", eq: "u_m = u_M/2", n: "For laminar flow, mean = exactly half of max" },
            { t: "Inclined pipe (uphill)", eq: "u(r) = \u2212(\u0394p+\u03C1gsin\u03B8L)/(4\u03B7L)\u00B7(a\u00B2\u2212r\u00B2)", n: "Gravity opposes flow" },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: C.bg }}>
              <span className="font-bold text-xs" style={{ color: C.warm }}>{item.t}: </span>
              <span className="font-mono text-xs" style={{ color: C.accent }}>{item.eq}</span>
              <div className="text-xs mt-1" style={{ color: C.textDim }}>{item.n}</div>
            </div>))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ FRICTIONAL DISSIPATION ═══════════════
function FrictionTab() {
  const [showLumped, setShowLumped] = useState(false);
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Frictional Dissipation \u2131 & Lumped Quantity</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>Generalized Bernoulli Equation</h3>
        <div className="p-3 rounded-lg text-center font-mono" style={{ background: C.bg, color: C.accent }}>\u0394(u\u00B2/2) + g\u0394z + \u0394p/\u03C1 + w + \u2131 = 0</div>
        <div className="mt-3 space-y-1 text-sm">
          {[{ t: "\u2131 = e\u2082 \u2212 e\u2081 \u2212 q \u2265 0", d: "Always positive (irreversible process)", c: C.danger },
            { t: "\u2131 > 0 \u2192 p\u2081 > p\u2082", d: "Causes pressure drop", c: C.warm },
            { t: "\u2131 > 0 \u2192 q < 0", d: "Heat loss (wall friction heat)", c: C.accent },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 p-2 rounded" style={{ background: `${r.c}10` }}>
              <span className="font-mono w-44 flex-shrink-0" style={{ color: r.c }}>{r.t}</span>
              <span style={{ color: C.text }}>{r.d}</span>
            </div>))}
        </div>
        <div className="mt-3 p-3 rounded-lg text-center" style={{ background: C.bg }}>
          <div className="text-xs" style={{ color: C.textDim }}>Horizontal pipe + constant velocity + no external work:</div>
          <div className="font-mono font-bold mt-1" style={{ color: C.accent }}>\u2131 = \u2212\u0394p/\u03C1 = (p\u2081\u2212p\u2082)/\u03C1 = 8\u03B7u<Sub>m</Sub>L/(\u03C1a\u00B2)</div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: C.success }}>
          Lumped Quantity (Flow-weighted Average)
          <button onClick={() => setShowLumped(!showLumped)} className="text-xs px-3 py-1 rounded-full" style={{ background: C.bg, color: C.accent, border: `1px solid ${C.accentDim}` }}>{showLumped ? "Collapse" : "Details"}</button>
        </h3>
        <div className="p-3 rounded-lg text-center font-mono text-sm" style={{ background: C.bg, color: C.accent }}>{"\u27E8\u03A8\u27E9 = \u222B\u2080\u1D43 2\u03C0rdr(\u03C1u\u03A8) / \u222B\u2080\u1D43 2\u03C0rdr(\u03C1u)"}</div>
        {showLumped && (
          <div className="mt-4 space-y-3 animate-fadeIn">
            <div className="p-3 rounded-lg text-sm" style={{ background: `${C.accent}10`, color: C.text }}>
              <p><strong style={{ color: C.accent }}>When \u03A8 = u\u00B2/2 (kinetic energy per unit mass):</strong></p>
              <p>\u2022 \u27E8u\u00B2\u27E9 = u<Sub>M</Sub>\u00B2/2 = (\u221A2\u00B7u<Sub>m</Sub>)\u00B2</p>
              <p>\u2022 \u27E8K.E.\u27E9 = \u03B1\u00B7u<Sub>m</Sub>\u00B2/2</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded text-center text-sm" style={{ background: C.bg }}>
                <div style={{ color: C.success }}>Laminar: \u03B1 = 2</div>
                <div className="text-xs" style={{ color: C.textDim }}>Large velocity variance</div>
              </div>
              <div className="p-2 rounded text-center text-sm" style={{ background: C.bg }}>
                <div style={{ color: C.danger }}>Turbulent: \u03B1 \u2248 1.07</div>
                <div className="text-xs" style={{ color: C.textDim }}>Flat profile</div>
              </div>
            </div>
            <p className="text-xs" style={{ color: C.danger }}>Warning: \u27E8K.E.\u27E9 = \u03B1\u00B7u<Sub>m</Sub>\u00B2/2 \u2260 u<Sub>m</Sub>\u00B2/2 (factor of 2 difference for laminar!)</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════ SIMULATION ═══════════════
function SimulationTab() {
  const canvasRef = useRef(null); const animRef = useRef(null);
  const [flowRate, setFlowRate] = useState(50); const [simType, setSimType] = useState("pipe");
  const particlesRef = useRef([]);
  useEffect(() => { const ps = []; for (let i = 0; i < 80; i++) { const rN = Math.random() * 2 - 1; ps.push({ x: Math.random() * 500, y: 130 + rN * 80, rNorm: rN, baseSpeed: flowRate / 50 }); } particlesRef.current = ps; }, [simType, flowRate]);
  useEffect(() => { const cv = canvasRef.current; if (!cv) return; const ctx = cv.getContext("2d"); const W = cv.width = 500, H = cv.height = 260; const isLam = flowRate < 40, isTurb = flowRate > 70;
    const draw = () => { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); const pT = 50, pB = 210, cY = 130, pH = pB - pT;
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, pT); ctx.lineTo(W, pT); ctx.moveTo(0, pB); ctx.lineTo(W, pB);
      if (simType === "orifice") { const ox = 200, oh = 25; ctx.moveTo(ox, pT); ctx.lineTo(ox, cY - oh); ctx.moveTo(ox, cY + oh); ctx.lineTo(ox, pB); } ctx.stroke();
      if (simType === "orifice") { ctx.setLineDash([4, 4]); ctx.strokeStyle = C.warm; ctx.beginPath(); ctx.moveTo(240, pT + 15); ctx.lineTo(240, pB - 15); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = "10px monospace"; ctx.fillStyle = C.textDim; ctx.fillText("\u2460", 100, pB + 18); ctx.fillText("\u2461", 235, pB + 18); ctx.fillText("\u2462", 420, pB + 18); }
      particlesRef.current.forEach(p => { const rA = Math.abs(p.rNorm); let spd;
        if (simType === "orifice") { const inO = p.x > 180 && p.x < 260, aftO = p.x > 260; spd = inO ? p.baseSpeed * 3 * (1 - rA * 0.5) : aftO ? p.baseSpeed * (1 - rA * rA) * 1.2 : p.baseSpeed * (1 - rA * rA); if (aftO && !isLam) p.y += (Math.random() - 0.5) * 2; }
        else { if (isLam) spd = p.baseSpeed * (1 - rA * rA); else if (isTurb) { spd = p.baseSpeed * (1 - Math.pow(rA, 1 / 7)) * 1.5; p.y += (Math.random() - 0.5) * 1.5; } else { spd = p.baseSpeed * (1 - rA * rA); if (Math.random() < 0.1) p.y += (Math.random() - 0.5) * 3; } }
        p.x += Math.max(spd * 1.5, 0.1); p.y = Math.max(pT + 3, Math.min(pB - 3, p.y)); if (p.x > W + 10) { p.x = -10; p.rNorm = Math.random() * 2 - 1; p.y = cY + p.rNorm * (pH / 2 - 5); }
        const al = 0.4 + 0.6 * (1 - rA); ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isTurb ? `rgba(239,68,68,${al})` : isLam ? `rgba(34,211,238,${al})` : `rgba(245,158,11,${al})`; ctx.fill(); });
      ctx.font = "12px monospace"; ctx.fillStyle = isLam ? C.accent : isTurb ? C.danger : C.warm; ctx.fillText(isLam ? "LAMINAR" : isTurb ? "TURBULENT" : "TRANSITION", 10, 25);
      animRef.current = requestAnimationFrame(draw); }; draw(); return () => cancelAnimationFrame(animRef.current);
  }, [flowRate, simType]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Interactive Flow Simulation</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex gap-2 mb-4">
          {[{ id: "pipe", l: "Straight Pipe" }, { id: "orifice", l: "Orifice Plate" }].map(t => (
            <button key={t.id} onClick={() => setSimType(t.id)} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: simType === t.id ? C.accent : C.bg, color: simType === t.id ? C.bg : C.text, border: `1px solid ${simType === t.id ? C.accent : C.border}` }}>{t.l}</button>
          ))}
        </div>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ maxWidth: 500 }} />
        <div className="mt-4">
          <label className="text-sm mb-1 block" style={{ color: C.textDim }}>Flow Rate Control</label>
          <input type="range" min="5" max="100" value={flowRate} onChange={e => setFlowRate(+e.target.value)} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, ${C.success}, ${C.warm}, ${C.danger})` }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: C.textDim }}><span>Laminar</span><span>Transition</span><span>Turbulent</span></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ CFD (placeholder — same LBM engine) ═══════════════
const FLUIDS = { water: { name: "Water (25\u00B0C)", nameKr: "Water", density: 998, kinViscosity: 8.9e-7, color: "#3b82f6" }, oil: { name: "Motor Oil (25\u00B0C)", nameKr: "Motor Oil", density: 880, kinViscosity: 1.0e-4, color: "#f59e0b" } };
const cxL=[0,1,0,-1,0,1,-1,-1,1],cyL=[0,0,1,0,-1,1,1,-1,-1],wL=[4/9,1/9,1/9,1/9,1/9,1/36,1/36,1/36,1/36],oppL=[0,3,4,1,2,7,8,5,6];
function createLBM(NX,NY,omega,uIn,solid){const N=NX*NY,f=new Float64Array(9*N),ft=new Float64Array(9*N),rho=new Float64Array(N),ux=new Float64Array(N),uy=new Float64Array(N),vort=new Float64Array(N);for(let i=0;i<N;i++){rho[i]=1;ux[i]=solid[i]?0:uIn;uy[i]=0;for(let k=0;k<9;k++){const cu=cxL[k]*ux[i]+cyL[k]*uy[i],u2=ux[i]*ux[i]+uy[i]*uy[i];f[k*N+i]=wL[k]*rho[i]*(1+3*cu+4.5*cu*cu-1.5*u2)}}function step(){for(let i=0;i<N;i++){if(solid[i])continue;let r=0;for(let k=0;k<9;k++)r+=f[k*N+i];let vx=0,vy=0;for(let k=0;k<9;k++){vx+=cxL[k]*f[k*N+i];vy+=cyL[k]*f[k*N+i]}vx/=r;vy/=r;rho[i]=r;ux[i]=vx;uy[i]=vy;for(let k=0;k<9;k++){const cu=cxL[k]*vx+cyL[k]*vy,u2=vx*vx+vy*vy,fe=wL[k]*r*(1+3*cu+4.5*cu*cu-1.5*u2);f[k*N+i]+=omega*(fe-f[k*N+i])}}for(let k=0;k<9;k++)for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){const nx=x-cxL[k],ny=y-cyL[k];if(nx>=0&&nx<NX&&ny>=0&&ny<NY)ft[k*N+y*NX+x]=f[k*N+ny*NX+nx]}for(let i=0;i<N;i++)if(solid[i]){for(let k=0;k<9;k++)ft[oppL[k]*N+i]=f[k*N+i];rho[i]=1;ux[i]=0;uy[i]=0}for(let i=0;i<f.length;i++)f[i]=ft[i];for(let y=1;y<NY-1;y++){const i=y*NX;if(solid[i])continue;const r=(f[0*N+i]+f[2*N+i]+f[4*N+i]+2*(f[3*N+i]+f[6*N+i]+f[7*N+i]))/(1-uIn);rho[i]=r;f[1*N+i]=f[3*N+i]+(2/3)*r*uIn;f[5*N+i]=f[7*N+i]+(1/6)*r*uIn-0.5*(f[2*N+i]-f[4*N+i]);f[8*N+i]=f[6*N+i]+(1/6)*r*uIn+0.5*(f[2*N+i]-f[4*N+i]);ux[i]=uIn;uy[i]=0}for(let y=1;y<NY-1;y++){const i=y*NX+(NX-1),s=y*NX+(NX-2);for(let k=0;k<9;k++)f[k*N+i]=f[k*N+s];rho[i]=rho[s];ux[i]=ux[s];uy[i]=uy[s]}for(let y=1;y<NY-1;y++)for(let x=1;x<NX-1;x++){const i=y*NX+x;vort[i]=(uy[y*NX+x+1]-uy[y*NX+x-1])*0.5-(ux[(y+1)*NX+x]-ux[(y-1)*NX+x])*0.5}}return{step,rho,ux,uy,vorticity:vort}}
function buildWedge(NX,NY,wX,wH,wHW,tR){const m=new Uint8Array(NX*NY),tY=NY-wH,bY=NY-1,rP=Math.max(tR,0.5);for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){const i=y*NX+x;if(y===0||y===NY-1){m[i]=1;continue}if(y>=tY&&y<=bY){const fr=(y-tY)/Math.max(wH,1);if(Math.abs(x-wX)<=wHW*fr)m[i]=1}if(y>=tY-rP&&y<tY+rP){const dx=x-wX,dy=y-tY;if(dy<=0&&dx*dx+dy*dy<=rP*rP)m[i]=1}}return m}
function velColor(v,mx){const t=Math.min(v/mx,1);let r,g,b;if(t<.25){r=0;g=Math.round(255*(t/.25));b=255}else if(t<.5){r=0;g=255;b=Math.round(255*(1-(t-.25)/.25))}else if(t<.75){r=Math.round(255*((t-.5)/.25));g=255;b=0}else{r=255;g=Math.round(255*(1-(t-.75)/.25));b=0}return`rgb(${r},${g},${b})`}
function vortColor(v,mx){const t=Math.max(-1,Math.min(1,v/mx));if(t>0)return`rgb(255,${Math.round(255*(1-t))},${Math.round(255*(1-t))})`;const s=-t;return`rgb(${Math.round(255*(1-s))},${Math.round(255*(1-s))},255)`}
function presColor(v,mn,mx){const t=Math.min(1,Math.max(0,(v-mn)/(mx-mn+1e-10)));return`rgb(${Math.round(68+t*185)},${Math.round(1+t*230)},${Math.round(84+(0.5-Math.abs(t-0.5))*2*66)})`}

function WedgeCFDTab(){
  const NX=200,NY=60,WX=Math.floor(NX*.35),WH=25,WHW=4;
  const[tipR,setTipR]=useState(2);const[uIn,setUIn]=useState(0.08);const[fl,setFl]=useState("water");const[vm,setVm]=useState("velocity");const[run,setRun]=useState(false);const[steps,setSteps]=useState(0);const[cmp,setCmp]=useState(false);
  const cvRef=useRef(null),cv2Ref=useRef(null),slvRef=useRef(null),slv2Ref=useRef(null),animR=useRef(null),stpR=useRef(0);
  const phys=useMemo(()=>{const L=.01,wh=(WH/NY)*L,fp=FLUIDS[fl],Re=.5*wh/fp.kinViscosity;return{Re:Re.toFixed(0)}},[fl,tipR]);
  const phys2=useMemo(()=>{if(!cmp)return null;const of2=fl==="water"?"oil":"water",L=.01,wh=(WH/NY)*L,fp=FLUIDS[of2],Re=.5*wh/fp.kinViscosity;return{Re:Re.toFixed(0)}},[cmp,fl,tipR]);
  const getOm=useCallback(fk=>1/(3*(fk==="water"?.02:.15)+.5),[]);
  const initS=useCallback(fk=>{const m=buildWedge(NX,NY,WX,WH,WHW,tipR);return createLBM(NX,NY,getOm(fk),uIn,m)},[tipR,uIn,getOm]);
  const reset=useCallback(()=>{setRun(false);if(animR.current)cancelAnimationFrame(animR.current);slvRef.current=initS(fl);if(cmp)slv2Ref.current=initS(fl==="water"?"oil":"water");stpR.current=0;setSteps(0)},[initS,fl,cmp]);
  useEffect(()=>{reset()},[tipR,uIn,fl,cmp]);
  const renderCV=useCallback((cv,slv)=>{if(!cv||!slv)return;const ctx=cv.getContext("2d"),img=ctx.createImageData(NX,NY);let mxV=0,mxW=0,mnP=1e9,mxP=-1e9;for(let i=0;i<NX*NY;i++){const v=Math.sqrt(slv.ux[i]**2+slv.uy[i]**2);if(v>mxV)mxV=v;const w=Math.abs(slv.vorticity[i]);if(w>mxW)mxW=w;const p=slv.rho[i]/3;if(p<mnP)mnP=p;if(p>mxP)mxP=p}if(mxV<1e-10)mxV=.1;if(mxW<1e-10)mxW=.01;const sm=buildWedge(NX,NY,WX,WH,WHW,tipR);for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){const i=y*NX+x,pi=i*4;if(sm[i]){img.data[pi]=40;img.data[pi+1]=40;img.data[pi+2]=50;img.data[pi+3]=255;continue}let cs;if(vm==="velocity")cs=velColor(Math.sqrt(slv.ux[i]**2+slv.uy[i]**2),mxV*.8);else if(vm==="vorticity")cs=vortColor(slv.vorticity[i],mxW*.5);else cs=presColor(slv.rho[i]/3,mnP,mxP);const mt=cs.match(/\d+/g);img.data[pi]=+mt[0];img.data[pi+1]=+mt[1];img.data[pi+2]=+mt[2];img.data[pi+3]=255}const tc=document.createElement("canvas");tc.width=NX;tc.height=NY;tc.getContext("2d").putImageData(img,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(tc,0,0,cv.width,cv.height)},[vm,tipR]);
  useEffect(()=>{if(!run)return;const loop=()=>{const s=slvRef.current,s2=slv2Ref.current;if(!s)return;for(let i=0;i<15;i++){s.step();if(cmp&&s2)s2.step()}stpR.current+=15;setSteps(stpR.current);renderCV(cvRef.current,s);if(cmp&&s2)renderCV(cv2Ref.current,s2);animR.current=requestAnimationFrame(loop)};animR.current=requestAnimationFrame(loop);return()=>{if(animR.current)cancelAnimationFrame(animR.current)}},[run,renderCV,cmp]);
  useEffect(()=>{if(slvRef.current&&cvRef.current)renderCV(cvRef.current,slvRef.current);if(cmp&&slv2Ref.current&&cv2Ref.current)renderCV(cv2Ref.current,slv2Ref.current)},[renderCV,cmp,steps]);
  const dp=useMemo(()=>{const s=slvRef.current;if(!s||steps<10)return{d1:0,d2:0};const m=buildWedge(NX,NY,WX,WH,WHW,tipR);let pI=0,pO=0,cI=0,cO=0;for(let y=1;y<NY-1;y++){if(!m[y*NX+5]){pI+=s.rho[y*NX+5]/3;cI++}if(!m[y*NX+NX-6]){pO+=s.rho[y*NX+NX-6]/3;cO++}}const d1=cI>0&&cO>0?pI/cI-pO/cO:0;let d2=0;if(cmp&&slv2Ref.current){const s2=slv2Ref.current;let p2I=0,p2O=0,c2I=0,c2O=0;for(let y=1;y<NY-1;y++){if(!m[y*NX+5]){p2I+=s2.rho[y*NX+5]/3;c2I++}if(!m[y*NX+NX-6]){p2O+=s2.rho[y*NX+NX-6]/3;c2O++}}d2=c2I>0&&c2O>0?p2I/c2I-p2O/c2O:0}return{d1,d2}},[steps,cmp,tipR]);
  const cW=800,cH=Math.round(cW*NY/NX),ofk=fl==="water"?"oil":"water";

  return(
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
        <h2 className="text-2xl font-bold mb-1" style={{color:C.accent}}>Wedge Flow CFD \u2014 Lattice-Boltzmann D2Q9</h2>
        <p className="text-sm" style={{color:C.textDim}}>In-pipe wedge obstacle flow \u00B7 velocity/vorticity/pressure visualization \u00B7 Water vs Oil</p>
      </div>
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="text-xs block mb-1" style={{color:C.textDim}}>Tip Radius</label><div className="flex items-center gap-2"><input type="range" min={0.5} max={8} step={0.5} value={tipR} onChange={e=>setTipR(+e.target.value)} className="flex-1" style={{accentColor:"#3b82f6"}}/><span className="text-sm font-bold" style={{color:C.accent,minWidth:50,textAlign:"right"}}>R={tipR}px</span></div></div>
          <div><label className="text-xs block mb-1" style={{color:C.textDim}}>Inlet Velocity (LBM)</label><div className="flex items-center gap-2"><input type="range" min={0.02} max={0.15} step={0.01} value={uIn} onChange={e=>setUIn(+e.target.value)} className="flex-1" style={{accentColor:"#3b82f6"}}/><span className="text-sm font-bold" style={{color:C.accent,minWidth:40,textAlign:"right"}}>{uIn.toFixed(2)}</span></div></div>
          <div><label className="text-xs block mb-1" style={{color:C.textDim}}>Primary Fluid</label><div className="flex gap-2 mt-1">{Object.entries(FLUIDS).map(([k,fp])=>(<button key={k} onClick={()=>setFl(k)} className="flex-1 py-1.5 rounded-lg text-xs font-bold" style={{background:fl===k?`${fp.color}22`:"transparent",color:fl===k?fp.color:C.textDim,border:`1px solid ${fl===k?fp.color:C.border}`}}>{fp.name}</button>))}</div></div>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex gap-1">{[{k:"velocity",l:"\u2192 Velocity"},{k:"vorticity",l:"\u21BB Vorticity"},{k:"pressure",l:"\u25C9 Pressure"}].map(m=>(<button key={m.k} onClick={()=>setVm(m.k)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{background:vm===m.k?C.accent:C.bg,color:vm===m.k?C.bg:C.textDim}}>{m.l}</button>))}</div>
          <div className="flex items-center gap-2">
            <label className="text-xs flex items-center gap-1" style={{color:C.textDim}}><input type="checkbox" checked={cmp} onChange={e=>setCmp(e.target.checked)} style={{accentColor:C.warm}}/>Compare mode</label>
            <button onClick={()=>setRun(!run)} className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{background:run?C.danger:C.success,color:"#fff"}}>{run?"\u25A0 STOP":"\u25B6 RUN"}</button>
            <button onClick={reset} className="px-3 py-1.5 rounded-lg text-xs" style={{background:"transparent",color:C.textDim,border:`1px solid ${C.border}`}}>\u21BA RESET</button>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden mb-2" style={{background:"#000",border:`1px solid ${FLUIDS[fl].color}33`}}><div className="relative"><canvas ref={cvRef} width={cW} height={cH} style={{display:"block",width:"100%",imageRendering:"pixelated"}}/><div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold" style={{background:"rgba(0,0,0,.7)",color:FLUIDS[fl].color}}>{FLUIDS[fl].name} \u00B7 Re \u2248 {phys.Re}</div><div className="absolute top-2 right-2 px-2 py-1 rounded text-xs" style={{background:"rgba(0,0,0,.7)",color:C.textDim}}>t = {steps}</div></div></div>
        {cmp&&(<div className="rounded-lg overflow-hidden mb-2" style={{background:"#000",border:`1px solid ${FLUIDS[ofk].color}33`}}><div className="relative"><canvas ref={cv2Ref} width={cW} height={cH} style={{display:"block",width:"100%",imageRendering:"pixelated"}}/><div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold" style={{background:"rgba(0,0,0,.7)",color:FLUIDS[ofk].color}}>{FLUIDS[ofk].name} \u00B7 Re \u2248 {phys2?.Re||"\u2014"}</div></div></div>)}
        <div className="flex items-center gap-2 my-3"><span className="text-xs" style={{color:C.textDim}}>LOW</span><div className="flex-1 h-2 rounded-full" style={{background:vm==="velocity"?"linear-gradient(90deg,#0000ff,#00ffff,#00ff00,#ffff00,#ff0000)":vm==="vorticity"?"linear-gradient(90deg,#0000ff,#ffffff,#ff0000)":"linear-gradient(90deg,#440154,#31688e,#35b779,#fde725)"}}/><span className="text-xs" style={{color:C.textDim}}>HIGH</span></div>
      </div>
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
        <h3 className="font-bold mb-3" style={{color:"#60a5fa"}}>Simulation Notes</h3>
        <div className="space-y-2 text-sm" style={{color:C.text,lineHeight:1.7}}>
          <p><strong style={{color:C.accent}}>Lattice-Boltzmann Method (D2Q9)</strong>: BGK collision operator + Zou-He inlet BC. Grid {NX}\u00D7{NY}.</p>
          <p><strong style={{color:C.warm}}>Tip Radius Effect</strong>: Smaller radius (sharper tip) \u2192 more abrupt flow separation \u2192 stronger downstream vortices + larger pressure loss. Extension of Part 1 orifice analysis!</p>
          <p><strong style={{color:C.success}}>Water vs Oil</strong>: Water (\u03BD\u22488.9\u00D710\u207B\u2077) \u2192 higher Re \u2192 faster turbulent transition. Oil (\u03BD\u22481\u00D710\u207B\u2074) \u2192 ~100\u00D7 lower Re \u2192 stays laminar, but viscous \u0394P can be higher.</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ PRACTICE ═══════════════
function PracticeTab() {
  const [cur, setCur] = useState(0); const [sel, setSel] = useState(null); const [show, setShow] = useState(false);
  const qs = [
    { q: "What is the correct relationship between force and momentum?", o: ["F = Mu", "F = dM/dt", "F = M/t", "F = Mu\u00B2"], a: 1, e: "F = d(Mu)/dt = dM/dt. Force is the time rate of change of momentum (Newton's 2nd law, general form)." },
    { q: "What is the wall shear stress \u03C4_w for steady pipe flow?", o: ["D(p\u2081\u2212p\u2082)/(4L)", "D(p\u2081\u2212p\u2082)/(2L)", "D\u00B2(p\u2081\u2212p\u2082)/(4L)", "(p\u2081\u2212p\u2082)/(DL)"], a: 0, e: "\u03C4_w = D(p\u2081\u2212p\u2082)/(4L). From force balance between pressure and shear on a cylindrical element." },
    { q: "What is the flow regime when Re = 900?", o: ["Laminar", "Transition", "Turbulent", "Cannot determine"], a: 0, e: "Re < 2,000 \u2192 Laminar. \u0394P \u221D Q (n=1)." },
    { q: "By Hagen-Poiseuille: if pipe radius doubles, flow rate changes by?", o: ["2\u00D7", "4\u00D7", "8\u00D7", "16\u00D7"], a: 3, e: "Q \u221D a\u2074 \u2192 2\u2074 = 16\u00D7. Pipe diameter has enormous influence!" },
    { q: "Relationship between u_m and u_M in laminar pipe flow?", o: ["u_m = u_M", "u_m = u_M/2", "u_m = u_M/4", "u_m = 2u_M"], a: 1, e: "Integration of parabolic profile gives u_m = u_M/2." },
    { q: "The sign of frictional dissipation \u2131 is always:", o: ["\u2265 0", "\u2264 0", "Depends on conditions", "Always 0"], a: 0, e: "\u2131 = e\u2082\u2212e\u2081\u2212q \u2265 0. Friction always dissipates energy (irreversible)." },
    { q: "Lumped K.E. correction factor \u03B1 for laminar flow is:", o: ["1", "1.07", "2", "4"], a: 2, e: "\u27E8K.E.\u27E9 = \u03B1\u00B7u_m\u00B2/2. Laminar \u03B1=2, turbulent \u03B1\u22481.07." },
    { q: "Centrifugal pump impeller torque expression:", o: ["m\u0307\u03C9(r\u2082\u00B2\u2212r\u2081\u00B2)", "m\u0307\u03C9(r\u2082\u2212r\u2081)", "m\u0307\u03C9\u00B2(r\u2082\u00B2\u2212r\u2081\u00B2)", "I\u03C9"], a: 0, e: "T = m\u0307[(ru)\u2082\u2212(ru)\u2081] = m\u0307\u03C9(r\u2082\u00B2\u2212r\u2081\u00B2) from angular momentum balance." },
    { q: "Orifice plate frictional dissipation (p\u2081\u2212p\u2083)/\u03C1 equals:", o: ["(u\u2081\u00B2/2)(A\u2081/A\u2082\u22121)\u00B2", "(u\u2081\u00B2/2)(A\u2082/A\u2081\u22121)\u00B2", "u\u2081\u00B2(A\u2081/A\u2082)", "0"], a: 0, e: "Combined Bernoulli (upstream) + momentum balance (downstream). Always positive." },
    { q: "Polymer: \u03C1=900, \u03B7=0.01, D=0.02, u_m=0.5. What is Re?", o: ["90", "450", "900", "9000"], a: 2, e: "Re = 900\u00D70.5\u00D70.02/0.01 = 900 (laminar). Same as Example 3.1." },
  ];
  const q = qs[cur];
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Practice Problems</h2>
        <div className="flex items-center gap-3"><span className="text-sm" style={{ color: C.textDim }}>{cur + 1}/{qs.length}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.bg }}><div className="h-full rounded-full transition-all" style={{ width: `${((cur + 1) / qs.length) * 100}%`, background: C.accent }} /></div></div>
      </div>
      <div className="p-5 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: C.text }}>{q.q}</h3>
        <div className="space-y-2">
          {q.o.map((opt, i) => { let bg = C.bg, bc = C.border;
            if (show) { if (i === q.a) { bg = `${C.success}20`; bc = C.success; } else if (i === sel) { bg = `${C.danger}20`; bc = C.danger; } }
            else if (i === sel) { bg = `${C.accent}20`; bc = C.accent; }
            return (<button key={i} onClick={() => !show && setSel(i)} className="w-full text-left p-3 rounded-lg text-sm" style={{ background: bg, border: `1px solid ${bc}`, color: C.text }}>
              <span className="font-mono mr-2" style={{ color: C.accent }}>{String.fromCharCode(65 + i)}.</span>{opt}</button>); })}
        </div>
        {show && (<div className="mt-4 p-4 rounded-lg animate-fadeIn" style={{ background: `${sel === q.a ? C.success : C.danger}15`, border: `1px solid ${sel === q.a ? C.success : C.danger}40` }}>
          <div className="font-bold mb-1" style={{ color: sel === q.a ? C.success : C.danger }}>{sel === q.a ? "\u2705 Correct!" : "\u274C Incorrect"}</div>
          <p className="text-sm" style={{ color: C.text }}>{q.e}</p></div>)}
        <div className="flex gap-3 mt-4">
          {!show ? (<button onClick={() => sel !== null && setShow(true)} disabled={sel === null} className="px-5 py-2 rounded-lg font-bold text-sm" style={{ background: sel !== null ? C.accent : C.border, color: sel !== null ? C.bg : C.textDim }}>Check Answer</button>)
            : (<button onClick={() => { setCur((cur + 1) % qs.length); setSel(null); setShow(false); }} className="px-5 py-2 rounded-lg font-bold text-sm" style={{ background: C.accent, color: C.bg }}>Next \u2192</button>)}
          <button onClick={() => { setCur(0); setSel(null); setShow(false); }} className="px-4 py-2 rounded-lg text-sm" style={{ background: C.bg, color: C.textDim, border: `1px solid ${C.border}` }}>Reset</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ INDUSTRY ═══════════════
function IndustryTab() {
  const [exp, setExp] = useState(null);
  const apps = [
    { icon: "\uD83D\uDC8A", title: "Pharma \u2014 High-Viscosity Slurry Transport", f: "Bio/Pharma", c: "Drug suspension slurries (100\u20131000+ cP) \u2192 Re \u226A 2000 \u2192 fully laminar. Hagen-Poiseuille enables precise flow control. Q \u221D a\u2074 means small diameter changes drastically affect flow.", r: "Q \u221D a\u2074, \u0394P \u221D Q" },
    { icon: "\u26FD", title: "Petrochemical \u2014 Pipeline Design", f: "Petrochemical", c: "Hundreds of km of crude oil transport. \u2131 = 8\u03B7u_mL/(\u03C1a\u00B2) with very large L makes friction dominant. Heating to reduce viscosity \u2192 lower \u2131 is a key strategy.", r: "\u2131 \u221D \u03B7L/a\u00B2" },
    { icon: "\uD83D\uDD2C", title: "Semiconductor CMP \u2014 Slurry Delivery", f: "Semiconductor", c: "Nanoparticle slurry must reach wafer uniformly. Re < 2000 maintained for predictable delivery. Wall shear stress \u03C4_w uniformity directly controls polishing uniformity.", r: "\u03C4_w = a\u0394p/(2L)" },
    { icon: "\uD83E\uDE78", title: "Biomedical \u2014 Hemodynamics", f: "Biomedical", c: "Aorta Re~4000 (possible turbulence), capillaries Re~0.001 (full creeping flow). Poiseuille flow applies in capillaries. Wall \u03C4_w predicts atherosclerosis locations.", r: "\u03C4_w \u2192 atherosclerosis prediction" },
    { icon: "\uD83C\uDFED", title: "Polymer Extrusion \u2014 Die Flow", f: "Polymer", c: "Polymer melts (\u03B7 ~ 100\u201310,000 Pa\u00B7s) \u2192 Re < 1. As in Ex 3.1, inclined pipes enable gravity-driven (pumpless) flow. Required slope: \u0394z/L = \u2212\u2131\u2080/(gL).", r: "Inclined pipe: no-pump condition" },
    { icon: "\uD83D\uDCA7", title: "Flow Measurement \u2014 Orifice & Rotameter", f: "Flow Measurement", c: "Orifice plate: Bernoulli + momentum balance \u2192 (p\u2081\u2212p\u2082) \u221D Q\u00B2. Discharge coefficient C_D corrects for real flow. Rotameter: Q \u2248 a\u221A(2Mg/\u03C1A).", r: "\u0394P \u221D Q\u00B2, C_D" },
    { icon: "\uD83D\uDD27", title: "Centrifugal Pumps \u2014 Impeller Design", f: "Pump Engineering", c: "Torque T = m\u0307\u03C9(r\u2082\u00B2\u2212r\u2081\u00B2): outlet radius r\u2082 dominates torque. Angular momentum balance is the foundation of turbomachinery design.", r: "T = m\u0307\u03C9(r\u2082\u00B2\u2212r\u2081\u00B2)" },
  ];
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Chemical Engineering Applications</h2>
      </div>
      <div className="space-y-3">
        {apps.map((a, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${exp === i ? C.accent : C.border}` }}>
            <button onClick={() => setExp(exp === i ? null : i)} className="w-full text-left p-4 flex items-center gap-3">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1"><div className="font-bold text-sm" style={{ color: C.text }}>{a.title}</div><div className="text-xs" style={{ color: C.textDim }}>{a.f}</div></div>
              <span style={{ color: C.accent, transform: exp === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>\u25BC</span>
            </button>
            {exp === i && (<div className="px-4 pb-4 animate-fadeIn">
              <p className="text-sm mb-2" style={{ color: C.text, lineHeight: 1.7 }}>{a.c}</p>
              <div className="p-2 rounded-lg" style={{ background: `${C.accent}10` }}>
                <span className="text-xs font-bold" style={{ color: C.accent }}>Key: </span>
                <span className="text-xs font-mono" style={{ color: C.warm }}>{a.r}</span></div></div>)}
          </div>))}
      </div>
    </div>
  );
}

// ═══════════════ MAIN EXPORT ═══════════════
export default function Week3App_EN() {
  const [tab, setTab] = useState("overview");
  const render = () => {
    switch (tab) {
      case "overview": return <OverviewTab />; case "momentum": return <MomentumTab />; case "reynolds": return <ReynoldsTab />;
      case "laminar": return <LaminarTab />; case "friction": return <FrictionTab />; case "simulation": return <SimulationTab />;
      case "cfd": return <WedgeCFDTab />; case "practice": return <PracticeTab />; case "industry": return <IndustryTab />;
      default: return <OverviewTab />;
    }
  };
  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;800&display=swap');
        *{font-family:'Outfit','Noto Sans KR',sans-serif;box-sizing:border-box}
        .font-mono{font-family:'JetBrains Mono',monospace}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .animate-fadeIn{animation:fadeIn 0.4s ease-out}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:white;cursor:pointer}
        input[type="number"]{-moz-appearance:textfield}input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
      `}</style>
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div><h1 className="text-lg font-bold" style={{ color: C.accent, fontFamily: "'Outfit',sans-serif" }}>Fluid Mechanics for ChE</h1>
              <p className="text-xs" style={{ color: C.textDim }}>Week 3 \u00B7 Momentum Balance & Fluid Friction \u00B7 SKKU SPMDL</p></div>
            <div className="text-right text-xs" style={{ color: C.textDim }}><div>Prof. S. Joon Kwon</div><div style={{ color: C.warm }}>Week 3 Study Companion</div></div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
              style={{ background: tab === t.id ? C.accent : "transparent", color: tab === t.id ? C.bg : C.textDim, border: `1px solid ${tab === t.id ? C.accent : "transparent"}` }}>
              <span className="hidden md:inline">{t.label}</span><span className="md:hidden">{t.short}</span></button>))}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{render()}</main>
      <footer className="text-center py-6 text-xs" style={{ color: C.textDim, borderTop: `1px solid ${C.border}` }}>
        <p>SKKU School of Chemical Engineering \u00B7 Smart Process & Materials Design Lab (SPMDL)</p>
        <p className="mt-1" style={{ color: C.accentDim }}>Fluid Mechanics Week 3 Study Companion \u00B7 2025 Spring</p>
      </footer>
    </div>
  );
}
