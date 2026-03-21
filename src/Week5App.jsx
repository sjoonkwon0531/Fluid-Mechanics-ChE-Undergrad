/**
 * Week5App.jsx
 * 화공유체역학 Week 5: Fluid Friction & Drag
 * SKKU School of Chemical Engineering — SPMDL — Prof. S. Joon Kwon
 *
 * 4 tabs:
 *   1. 시뮬레이션: C_D vs Re, terminal velocity, Ergun ΔP
 *   2. 수치 시뮬레이터: PBR flow field, sedimentation PDE, distillation tray
 *   3. 연습문제: 4 auto-graded problems
 *   4. 산업 응용: 5 ChemE application cards
 */
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
//  LANG & HELPERS
// ══════════════════════════════════════════════════════════════
function tx(ko, en, lang) { return lang === "ko" ? ko : en; }

// ══════════════════════════════════════════════════════════════
//  PHYSICS
// ══════════════════════════════════════════════════════════════
const G = 9.81;

function dragCoeffSphere(Re) {
  if (Re <= 0) return 1e4;
  return (24 / Re) * (1 + 0.173 * Math.pow(Re, 0.657)) + 0.413 / (1 + 16300 * Math.pow(Re, -1.09));
}

function terminalVelocity(D, rhoS, rhoF, mu) {
  let ut = 0.01, CD;
  for (let i = 0; i < 200; i++) {
    CD = dragCoeffSphere((rhoF * ut * D) / mu);
    const un = Math.sqrt((4 * G * D * Math.abs(rhoS - rhoF)) / (3 * rhoF * CD));
    if (Math.abs(un - ut) < 1e-9) break;
    ut = 0.5 * ut + 0.5 * un;
  }
  CD = dragCoeffSphere((rhoF * ut * D) / mu);
  return { ut, CD, Re: (rhoF * ut * D) / mu };
}

function ergunDP(u0, L, Dp, eps, rho, mu) {
  const Re = (rho * u0 * Dp) / (mu * (1 - eps));
  const visc = (150 * mu * u0 * L * (1 - eps) ** 2) / (Dp * Dp * eps ** 3);
  const inert = (1.75 * rho * u0 * u0 * L * (1 - eps)) / (Dp * eps ** 3);
  return { dP: visc + inert, Re, visc, inert };
}

function darcyPerm(Dp, eps) { return (Dp * Dp * eps ** 3) / (150 * (1 - eps) ** 2); }

function archimedes(D, rhoS, rhoF, mu) { return (G * rhoF * D ** 3 * Math.abs(rhoS - rhoF)) / (mu * mu); }

function rzN(Re) {
  if (Re < 0.2) return 4.65;
  if (Re < 1) return 4.35 * Math.pow(Re, -0.03);
  if (Re < 500) return 4.45 * Math.pow(Re, -0.1);
  return 2.39;
}

// ══════════════════════════════════════════════════════════════
//  UI PRIMITIVES
// ══════════════════════════════════════════════════════════════
const CARD = { background: "var(--color-background-primary,#fff)", border: "0.5px solid var(--color-border-tertiary,#ddd)", borderRadius: "var(--border-radius-lg,12px)", padding: "1.25rem", marginBottom: "1rem" };
const MBOX = { background: "var(--color-background-secondary,#f5f5f5)", borderRadius: "var(--border-radius-md,8px)", padding: "0.6rem 0.85rem", minWidth: 0 };

function M({ label, value, unit }) {
  return (<div style={MBOX}><div style={{ fontSize: 12, color: "var(--color-text-secondary,#666)", marginBottom: 2 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>{value}{unit && <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-text-secondary,#666)", marginLeft: 3 }}>{unit}</span>}</div></div>);
}

function Sl({ label, min, max, step, value, onChange, unit, logScale }) {
  const fmt = v => { if (typeof v !== "number") return v; if (v < 0.001) return v.toExponential(2); if (v < 1) return v.toFixed(step < 0.001 ? 4 : step < 0.01 ? 3 : 2); if (v < 100) return v.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0); return Math.round(v).toLocaleString(); };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.6rem" }}>
      <label style={{ fontSize: 13, color: "var(--color-text-secondary,#666)", minWidth: 90, flexShrink: 0 }}>{label}</label>
      <input type="range" min={logScale ? Math.log10(min) : min} max={logScale ? Math.log10(max) : max} step={logScale ? 0.02 : step} value={logScale ? Math.log10(value) : value} onChange={e => onChange(logScale ? Math.pow(10, parseFloat(e.target.value)) : parseFloat(e.target.value))} style={{ flex: 1 }} />
      <span style={{ fontSize: 13, fontWeight: 500, minWidth: 72, textAlign: "right" }}>{fmt(value)}{unit ? ` ${unit}` : ""}</span>
    </div>
  );
}

function Grid({ cols = "repeat(auto-fit,minmax(120px,1fr))", gap = 8, mt = "0.6rem", children }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap, marginTop: mt }}>{children}</div>;
}

// ══════════════════════════════════════════════════════════════
//  TAB 1: SIMULATIONS
// ══════════════════════════════════════════════════════════════

// ── 1a. C_D vs Re chart ──
function SimDrag({ lang }) {
  const ref = useRef(null);
  const [psi, setPsi] = useState(1.0);
  const [hRe, setHRe] = useState(100);
  const CDat = useMemo(() => dragCoeffSphere(hRe), [hRe]);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), W = c.width, H = c.height;
    const p = { l: 60, r: 20, t: 20, b: 50 };
    const dk = window.matchMedia("(prefers-color-scheme:dark)").matches;
    const tc = dk ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)";
    const gc = dk ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    ctx.clearRect(0, 0, W, H);
    const lrMin = -2, lrMax = 7, lcMin = -1.5, lcMax = 5;
    const xP = lr => p.l + ((lr - lrMin) / (lrMax - lrMin)) * (W - p.l - p.r);
    const yP = lc => p.t + ((lcMax - lc) / (lcMax - lcMin)) * (H - p.t - p.b);

    ctx.strokeStyle = gc; ctx.lineWidth = 0.5;
    for (let lr = -2; lr <= 7; lr++) { ctx.beginPath(); ctx.moveTo(xP(lr), p.t); ctx.lineTo(xP(lr), H - p.b); ctx.stroke(); }
    for (let lc = -1; lc <= 5; lc++) { ctx.beginPath(); ctx.moveTo(p.l, yP(lc)); ctx.lineTo(W - p.r, yP(lc)); ctx.stroke(); }

    ctx.fillStyle = tc; ctx.font = "12px system-ui"; ctx.textAlign = "center";
    for (let lr = -1; lr <= 7; lr += 2) ctx.fillText(`10^${lr}`, xP(lr), H - p.b + 18);
    ctx.fillText("Re", W / 2, H - 5);
    ctx.textAlign = "right";
    for (let lc = 0; lc <= 4; lc++) ctx.fillText(`10^${lc}`, p.l - 8, yP(lc) + 4);
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("C_D", 0, 0); ctx.restore();

    // sphere curve
    ctx.beginPath(); ctx.strokeStyle = "#378ADD"; ctx.lineWidth = 2.5;
    for (let i = 0; i <= 500; i++) { const lr = lrMin + (i / 500) * (lrMax - lrMin); const CD = dragCoeffSphere(Math.pow(10, lr)); if (CD < 0.01) continue; const lc = Math.log10(CD); if (lc < lcMin || lc > lcMax) continue; i === 0 ? ctx.moveTo(xP(lr), yP(lc)) : ctx.lineTo(xP(lr), yP(lc)); }
    ctx.stroke();
    ctx.fillStyle = "#378ADD"; ctx.font = "bold 12px system-ui"; ctx.textAlign = "left";
    ctx.fillText("ψ=1 (sphere)", xP(4.2), yP(Math.log10(dragCoeffSphere(1e4))) - 12);

    if (psi < 0.99) {
      const f = 1 / (psi * psi);
      ctx.beginPath(); ctx.strokeStyle = "#1D9E75"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      for (let i = 0; i <= 500; i++) { const lr = lrMin + (i / 500) * (lrMax - lrMin); const CD = dragCoeffSphere(Math.pow(10, lr)) * f; if (CD < 0.01) continue; const lc = Math.log10(CD); if (lc < lcMin || lc > lcMax) continue; i === 0 ? ctx.moveTo(xP(lr), yP(lc)) : ctx.lineTo(xP(lr), yP(lc)); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#1D9E75"; ctx.fillText(`ψ=${psi.toFixed(2)}`, xP(4.2), yP(Math.log10(dragCoeffSphere(1e4) * f)) - 12);
    }

    // Stokes line
    ctx.beginPath(); ctx.strokeStyle = dk ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    for (let i = 0; i <= 200; i++) { const lr = lrMin + (i / 200) * 3; const lc = Math.log10(24) - lr; if (lc > lcMax) continue; i === 0 ? ctx.moveTo(xP(lr), yP(lc)) : ctx.lineTo(xP(lr), yP(lc)); }
    ctx.stroke(); ctx.setLineDash([]);

    // highlight
    const hCD = dragCoeffSphere(hRe) * (psi < 0.99 ? 1 / (psi * psi) : 1);
    const lhCD = Math.log10(hCD);
    if (lhCD >= lcMin && lhCD <= lcMax) {
      ctx.beginPath(); ctx.arc(xP(Math.log10(hRe)), yP(lhCD), 6, 0, Math.PI * 2); ctx.fillStyle = "#D85A30"; ctx.fill();
      ctx.font = "bold 12px system-ui"; ctx.textAlign = "left";
      ctx.fillText(`C_D=${hCD < 1 ? hCD.toFixed(3) : hCD.toFixed(2)}`, xP(Math.log10(hRe)) + 10, yP(lhCD) - 8);
    }

    ctx.font = "11px system-ui"; ctx.fillStyle = dk ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"; ctx.textAlign = "center";
    ctx.fillText("Stokes", xP(-1), p.t + 14); ctx.fillText("Transition", xP(1.5), p.t + 14); ctx.fillText("Newton", xP(4), p.t + 14);
  }, [psi, hRe]);

  return (
    <div style={CARD}>
      <h3 style={{ margin: "0 0 0.75rem", fontSize: 16, fontWeight: 500 }}>{tx("항력 계수 vs Reynolds 수", "Drag coefficient vs Reynolds number", lang)}</h3>
      <canvas ref={ref} width={700} height={380} style={{ width: "100%", height: "auto" }} />
      <div style={{ marginTop: "1rem" }}>
        <Sl label="Re" min={0.01} max={1e6} step={0.01} value={hRe} onChange={setHRe} logScale />
        <Sl label={tx("구형도 ψ", "Sphericity ψ", lang)} min={0.1} max={1.0} step={0.01} value={psi} onChange={setPsi} />
      </div>
      <Grid><M label="C_D" value={CDat < 1 ? CDat.toFixed(4) : CDat.toFixed(2)} /><M label="Re" value={hRe < 1 ? hRe.toFixed(3) : Math.round(hRe).toLocaleString()} /><M label={tx("유동 영역", "Regime", lang)} value={hRe < 1 ? "Stokes" : hRe < 1e3 ? "Transition" : hRe < 2e5 ? "Newton" : "BL sep."} /></Grid>
    </div>
  );
}

// ── 1b. Terminal velocity ──
function SimTermVel({ lang }) {
  const [D, setD] = useState(0.005); const [rS, setRS] = useState(2500); const [rF, setRF] = useState(1000); const [mu, setMu] = useState(0.001);
  const r = useMemo(() => terminalVelocity(D, rS, rF, mu), [D, rS, rF, mu]);
  const Ar = useMemo(() => archimedes(D, rS, rF, mu), [D, rS, rF, mu]);
  return (
    <div style={CARD}>
      <h3 style={{ margin: "0 0 0.75rem", fontSize: 16, fontWeight: 500 }}>{tx("종단 속도 계산기", "Terminal velocity calculator", lang)}</h3>
      <Sl label={tx("입자 직경 D", "Particle D", lang)} min={0.0001} max={0.05} step={0.0001} value={D} onChange={setD} unit="m" />
      <Sl label="ρ_s" min={500} max={10000} step={10} value={rS} onChange={setRS} unit="kg/m³" />
      <Sl label="ρ_f" min={0.5} max={2000} step={1} value={rF} onChange={setRF} unit="kg/m³" />
      <Sl label="μ" min={1e-5} max={1} step={0.00001} value={mu} onChange={setMu} unit="Pa·s" logScale />
      <Grid><M label="u_t" value={r.ut < 0.01 ? r.ut.toExponential(3) : r.ut.toFixed(4)} unit="m/s" /><M label="C_D" value={r.CD < 1 ? r.CD.toFixed(4) : r.CD.toFixed(2)} /><M label="Re" value={r.Re < 1 ? r.Re.toFixed(4) : Math.round(r.Re).toLocaleString()} /><M label="Ar" value={Ar < 100 ? Ar.toFixed(2) : Math.round(Ar).toLocaleString()} /></Grid>
    </div>
  );
}

// ── 1c. Ergun equation ──
function SimErgun({ lang }) {
  const [u0, sU] = useState(0.05); const [L, sL] = useState(1); const [Dp, sD] = useState(0.005); const [eps, sE] = useState(0.4); const [rho, sR] = useState(1000); const [mu, sM] = useState(0.001);
  const r = useMemo(() => ergunDP(u0, L, Dp, eps, rho, mu), [u0, L, Dp, eps, rho, mu]);
  const bk = r.dP > 0 ? r.visc / r.dP * 100 : 0;
  return (
    <div style={CARD}>
      <h3 style={{ margin: "0 0 0.75rem", fontSize: 16, fontWeight: 500 }}>{tx("Ergun 방정식 — 충전층 ΔP", "Ergun equation — packed bed ΔP", lang)}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
        <Sl label="u₀" min={0.001} max={1} step={0.001} value={u0} onChange={sU} unit="m/s" />
        <Sl label="L" min={0.1} max={10} step={0.1} value={L} onChange={sL} unit="m" />
        <Sl label="D_p" min={0.0005} max={0.05} step={0.0005} value={Dp} onChange={sD} unit="m" />
        <Sl label="ε" min={0.2} max={0.8} step={0.01} value={eps} onChange={sE} />
        <Sl label="ρ" min={1} max={2000} step={1} value={rho} onChange={sR} unit="kg/m³" />
        <Sl label="μ" min={1e-5} max={1} step={0.00001} value={mu} onChange={sM} unit="Pa·s" logScale />
      </div>
      <Grid cols="repeat(auto-fit,minmax(140px,1fr))"><M label="-ΔP" value={r.dP < 1000 ? r.dP.toFixed(1) : (r.dP / 1000).toFixed(2)} unit={r.dP < 1000 ? "Pa" : "kPa"} /><M label="Re_p" value={r.Re < 1 ? r.Re.toFixed(3) : r.Re.toFixed(1)} /><M label={tx("점성", "Viscous", lang)} value={bk.toFixed(1)} unit="%" /><M label={tx("관성", "Inertial", lang)} value={(100 - bk).toFixed(1)} unit="%" /></Grid>
      <div style={{ marginTop: "0.6rem", height: 22, display: "flex", borderRadius: 6, overflow: "hidden", border: "0.5px solid var(--color-border-tertiary,#ddd)" }}>
        <div style={{ width: `${bk}%`, background: "#378ADD", transition: "width 0.3s" }} />
        <div style={{ flex: 1, background: "#D85A30" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 3, color: "var(--color-text-secondary,#888)" }}><span>Blake–Kozeny</span><span>Burke–Plummer</span></div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB 2: NUMERICAL SIMULATORS
// ══════════════════════════════════════════════════════════════

// ── 2a. PBR flow field ──
function SimPBR({ lang }) {
  const ref = useRef(null);
  const [Dp, sD] = useState(0.005); const [eps, sE] = useState(0.4); const [psi, sP] = useState(1.0);
  const [mu, sM] = useState(0.001); const [rho, sR] = useState(1000); const [dPa, sDP] = useState(5000); const [bL, sBL] = useState(1.0);

  const res = useMemo(() => {
    const De = Dp * psi, k = darcyPerm(De, eps), u0 = (k / mu) * (dPa / bL);
    return { k, u0, um: u0 / eps, De: 4 * eps / ((1 - eps) * (6 / De)), erg: ergunDP(u0, bL, De, eps, rho, mu) };
  }, [Dp, eps, psi, mu, rho, dPa, bL]);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), W = c.width, H = c.height;
    const dk = window.matchMedia("(prefers-color-scheme:dark)").matches;
    ctx.clearRect(0, 0, W, H);
    const NX = 40, NY = 20, cW = W / NX, cH = H / NY;
    const seed = Math.floor(Dp * 1e4 + eps * 100 + psi * 10);
    const sr = i => { let x = Math.sin(seed * 9301 + i * 49297 + 233280) * 49297; return x - Math.floor(x); };

    const eF = []; for (let j = 0; j < NY; j++) { eF[j] = []; for (let i = 0; i < NX; i++) { const n = (sr(j * NX + i) - 0.5) * 0.15; const w = Math.min(j, NY - 1 - j) / (NY / 2); eF[j][i] = Math.max(0.15, Math.min(0.85, eps + n + (1 - w) * 0.08)); } }
    const uF = []; let uMax = 0;
    for (let j = 0; j < NY; j++) { uF[j] = []; for (let i = 0; i < NX; i++) { uF[j][i] = (darcyPerm(Dp * psi, eF[j][i]) / mu) * (dPa / bL); if (uF[j][i] > uMax) uMax = uF[j][i]; } }
    if (!uMax) uMax = 1;

    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const pN = 1 - i / (NX - 1); ctx.fillStyle = `rgba(${Math.round(55 + 200 * pN)},${Math.round(90 + 80 * (1 - pN))},${Math.round(220 - 180 * pN)},${dk ? 0.55 : 0.35})`; ctx.fillRect(i * cW, j * cH, cW + .5, cH + .5); }

    const pR = Math.max(2, Math.min(8, cW * (1 - eps) * 0.5));
    ctx.fillStyle = dk ? "rgba(255,255,255,0.5)" : "rgba(80,80,80,0.45)";
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const np = Math.round((1 - eF[j][i]) * 3); for (let p = 0; p < np; p++) { ctx.beginPath(); ctx.arc(i * cW + sr(j * NX * 3 + i * 3 + p) * cW, j * cH + sr(j * NX * 3 + i * 3 + p + 1000) * cH, pR * (psi < 0.9 ? 0.7 + 0.3 * sr(p * i + j) : 1), 0, Math.PI * 2); ctx.fill(); } }

    for (let j = 1; j < NY - 1; j += 2) for (let i = 1; i < NX - 1; i += 3) {
      const uN = uF[j][i] / uMax, len = uN * cW * 2.5;
      const cx = i * cW + cW / 2, cy = j * cH + cH / 2;
      const ang = (eF[Math.min(j + 1, NY - 1)][i] - eF[Math.max(j - 1, 0)][i]) * 2;
      const ex = cx + len * Math.cos(ang), ey = cy + len * Math.sin(ang);
      ctx.strokeStyle = `hsla(${Math.round(220 - 180 * uN)},${80 + 20 * uN}%,50%,${dk ? .85 : .75})`; ctx.lineWidth = 1 + uN * 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
      const hl = 3 + uN * 3, ha = Math.atan2(ey - cy, ex - cx);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ha - .4), ey - hl * Math.sin(ha - .4)); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ha + .4), ey - hl * Math.sin(ha + .4)); ctx.stroke();
    }

    ctx.fillStyle = dk ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"; ctx.font = "11px system-ui"; ctx.textAlign = "center";
    ctx.fillText(tx("유입 →", "Inlet →", lang), 35, H - 5); ctx.fillText(tx("→ 유출", "→ Outlet", lang), W - 50, H - 5);
  }, [Dp, eps, psi, mu, rho, dPa, bL, lang]);

  return (
    <div style={CARD}>
      <h3 style={{ margin: "0 0 .75rem", fontSize: 16, fontWeight: 500 }}>{tx("PBR 유동장 — Darcy's law", "PBR flow field — Darcy's law", lang)}</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 .75rem", lineHeight: 1.6 }}>{tx("벡터 = 국소 Darcy 유속, 배경 = 압력장. Wall effect 반영.", "Arrows = local Darcy velocity, bg = pressure. Wall effect included.", lang)}</p>
      <canvas ref={ref} width={700} height={300} style={{ width: "100%", height: "auto", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary,#ddd)" }} />
      <div style={{ marginTop: ".75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.25rem" }}>
        <Sl label="D_p" min={.0005} max={.03} step={.0005} value={Dp} onChange={sD} unit="m" />
        <Sl label="ε" min={.2} max={.75} step={.01} value={eps} onChange={sE} />
        <Sl label={tx("구형도 ψ", "Sphericity ψ", lang)} min={.3} max={1} step={.01} value={psi} onChange={sP} />
        <Sl label="−ΔP" min={100} max={50000} step={100} value={dPa} onChange={sDP} unit="Pa" />
        <Sl label="μ" min={1e-5} max={.1} step={.00001} value={mu} onChange={sM} unit="Pa·s" logScale />
        <Sl label="L" min={.1} max={5} step={.1} value={bL} onChange={sBL} unit="m" />
      </div>
      <Grid cols="repeat(auto-fit,minmax(110px,1fr))" gap={6}><M label="u₀" value={res.u0 < .01 ? res.u0.toExponential(2) : res.u0.toFixed(4)} unit="m/s" /><M label="u_m" value={res.um < .01 ? res.um.toExponential(2) : res.um.toFixed(4)} unit="m/s" /><M label="κ" value={res.k.toExponential(2)} unit="m²" /><M label="Re_p" value={res.erg.Re < 1 ? res.erg.Re.toFixed(3) : res.erg.Re.toFixed(1)} /></Grid>
    </div>
  );
}

// ── 2b. Sedimentation PDE ──
function SimSed({ lang }) {
  const ref = useRef(null);
  const [Dp, sD] = useState(.001); const [rS, sRS] = useState(2500); const [rF, sRF] = useState(1000); const [mu, sM] = useState(.001); const [e0, sE0] = useState(.7);
  const [time, setTime] = useState(0); const [playing, setPlaying] = useState(false);
  const animRef = useRef(null); const profRef = useRef(null);

  const { ut, Re: ReP } = useMemo(() => terminalVelocity(Dp, rS, rF, mu), [Dp, rS, rF, mu]);
  const nRZ = useMemo(() => rzN(ReP), [ReP]);
  const NZ = 200, zMax = .5, dz = zMax / NZ;

  const solve = useCallback(tT => {
    const e = new Float64Array(NZ + 1); for (let i = 0; i <= NZ; i++) e[i] = e0;
    const dt = Math.min(.5 * dz / (ut * Math.pow(.99, nRZ - 1) * Math.max(nRZ, 1) + 1e-12), .001);
    const nS = Math.round(tT / dt);
    for (let s = 0; s < nS; s++) {
      const en = new Float64Array(NZ + 1); en[0] = 1; en[NZ] = Math.min(e[NZ], 1);
      for (let i = 1; i < NZ; i++) { const ei = Math.max(.01, Math.min(.999, e[i])); const ws = ut * Math.pow(ei, nRZ - 1) * (nRZ - (nRZ + 1) * ei); const dd = ws >= 0 ? (e[i] - e[i - 1]) / dz : (e[i + 1] - e[i]) / dz; en[i] = Math.max(.01, Math.min(.999, e[i] - dt * ws * dd)); }
      const bs = (1 - e[NZ]) + dt * ut * Math.pow(Math.max(.01, e[NZ - 1]), nRZ) * (1 - e[NZ - 1]) / dz;
      en[NZ] = Math.max(.01, 1 - Math.min(.95, bs));
      for (let i = 0; i <= NZ; i++) e[i] = en[i];
    }
    return e;
  }, [ut, nRZ, e0, NZ, dz]);

  useEffect(() => {
    const tM = Math.max(1, zMax / (ut * Math.pow(e0, nRZ) + 1e-12));
    const pr = []; for (let f = 0; f <= 60; f++) pr.push({ t: (f / 60) * Math.min(tM, 300), eps: solve((f / 60) * Math.min(tM, 300)) });
    profRef.current = pr; setTime(0);
  }, [ut, nRZ, e0, solve]);

  useEffect(() => {
    const c = ref.current; if (!c || !profRef.current) return;
    const ctx = c.getContext("2d"), W = c.width, H = c.height;
    const dk = window.matchMedia("(prefers-color-scheme:dark)").matches;
    ctx.clearRect(0, 0, W, H);
    const pr = profRef.current, fi = Math.min(Math.round(time * (pr.length - 1)), pr.length - 1), p = pr[fi];

    const vX = 30, vW = 120, vY = 15, vH = H - 35, pX = 200, pW = W - 220, pY = 15, pH = H - 35;

    ctx.strokeStyle = dk ? "rgba(255,255,255,.4)" : "rgba(0,0,0,.3)"; ctx.lineWidth = 1.5; ctx.strokeRect(vX, vY, vW, vH);
    for (let i = 0; i <= NZ; i++) { const y = vY + (i / NZ) * vH; const sf = 1 - p.eps[i]; const I = Math.min(1, sf * 3); ctx.fillStyle = dk ? `rgba(180,200,230,${.05 + I * .8})` : `rgb(${Math.round(255 - I * 200)},${Math.round(245 - I * 200)},${Math.round(255 - I * 190)})`; ctx.fillRect(vX + 1, y, vW - 2, vH / NZ + .5); }

    ctx.fillStyle = dk ? "rgba(212,83,126,.7)" : "rgba(160,50,90,.5)";
    for (let i = 0; i < 80; i++) { const zF = Math.random(), zI = Math.floor(zF * NZ), sf = 1 - (p.eps[zI] || e0); if (Math.random() < sf * 2) { ctx.beginPath(); ctx.arc(vX + 5 + Math.random() * (vW - 10), vY + zF * vH, 1.5 + sf * 2, 0, Math.PI * 2); ctx.fill(); } }

    ctx.fillStyle = dk ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.4)"; ctx.font = "10px system-ui"; ctx.textAlign = "center";
    ctx.fillText(`t=${p.t.toFixed(1)}s`, vX + vW / 2, H - 2);

    ctx.strokeStyle = dk ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.2)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pX, pY); ctx.lineTo(pX, pY + pH); ctx.lineTo(pX + pW, pY + pH); ctx.stroke();
    ctx.fillStyle = dk ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.4)"; ctx.font = "10px system-ui"; ctx.textAlign = "center";
    for (let e = 0; e <= 1; e += .2) ctx.fillText(e.toFixed(1), pX + e * pW, pY + pH + 14);
    ctx.fillText("ε", pX + pW / 2, H - 2);

    ctx.beginPath(); ctx.strokeStyle = "#378ADD"; ctx.lineWidth = 2;
    for (let i = 0; i <= NZ; i++) { const x = pX + Math.max(0, Math.min(1, p.eps[i])) * pW, y = pY + (i / NZ) * pH; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();

    ctx.beginPath(); ctx.strokeStyle = dk ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.15)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    const x0 = pX + e0 * pW; ctx.moveTo(x0, pY); ctx.lineTo(x0, pY + pH); ctx.stroke(); ctx.setLineDash([]);
  }, [time, NZ, e0]);

  useEffect(() => {
    if (!playing) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    let last = performance.now();
    const tick = now => { setTime(prev => { const n = prev + (now - last) / 1000 * .4; last = now; if (n >= 1) { setPlaying(false); return 1; } return n; }); animRef.current = requestAnimationFrame(tick); };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing]);

  const tMax = profRef.current ? profRef.current[profRef.current.length - 1].t : 1;
  const reset = v => { if (typeof v === "function") v(); setTime(0); setPlaying(false); };

  return (
    <div style={CARD}>
      <h3 style={{ margin: "0 0 .75rem", fontSize: 16, fontWeight: 500 }}>{tx("침강 시뮬레이터 — Richardson-Zaki PDE", "Sedimentation — Richardson-Zaki PDE", lang)}</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 .75rem", lineHeight: 1.6 }}>{tx("upwind FDM으로 ε(z,t)를 풀어 애니메이션합니다.", "Solves ε(z,t) PDE via upwind FDM with animation.", lang)}</p>
      <canvas ref={ref} width={700} height={350} style={{ width: "100%", height: "auto", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary,#ddd)" }} />
      <div style={{ marginTop: ".75rem", display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setPlaying(!playing)}>{playing ? "⏸" : "▶"}</button>
        <button onClick={() => { setPlaying(false); setTime(0); }}>{tx("리셋", "Reset", lang)}</button>
        <input type="range" min={0} max={1} step={.005} value={time} onChange={e => { setPlaying(false); setTime(parseFloat(e.target.value)); }} style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 50 }}>{(time * tMax).toFixed(1)}s</span>
      </div>
      <div style={{ marginTop: ".75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.25rem" }}>
        <Sl label="D_p" min={.0001} max={.01} step={.0001} value={Dp} onChange={v => { sD(v); setTime(0); setPlaying(false); }} unit="m" />
        <Sl label="ε₀" min={.5} max={.95} step={.01} value={e0} onChange={v => { sE0(v); setTime(0); setPlaying(false); }} />
        <Sl label="ρ_s" min={1100} max={8000} step={10} value={rS} onChange={v => { sRS(v); setTime(0); setPlaying(false); }} unit="kg/m³" />
        <Sl label="μ" min={1e-4} max={.1} step={.0001} value={mu} onChange={v => { sM(v); setTime(0); setPlaying(false); }} unit="Pa·s" logScale />
      </div>
      <Grid cols="repeat(auto-fit,minmax(100px,1fr))" gap={6}><M label="u_t" value={ut < .01 ? ut.toExponential(2) : ut.toFixed(4)} unit="m/s" /><M label="Re" value={ReP < 1 ? ReP.toFixed(3) : ReP.toFixed(1)} /><M label="n" value={nRZ.toFixed(2)} /><M label={tx("영역", "Regime", lang)} value={ReP < .2 ? "Stokes" : ReP < 500 ? "Trans." : "Newton"} /></Grid>
    </div>
  );
}

// ── 2c. Distillation tray ──
function SimDist({ lang }) {
  const ref = useRef(null);
  const [Lf, sLf] = useState(.005); const [Ww, sWw] = useState(.5); const [Dw, sDw] = useState(.05); const [dl, sDl] = useState(.025); const [cd, sCd] = useState(.62); const [rL, sRL] = useState(800);

  const r = useMemo(() => {
    const d = Math.pow((9 * Lf * Lf) / (8 * G * cd * cd * Ww * Ww), 1 / 3);
    const vD = Lf / (Ww * dl), hV = vD * vD / (2 * G), h = d + Dw + hV;
    return { d: d * 1e3, h: h * 1e3, H: Math.max(h + d + Dw, 2 * (d + Dw) + hV) * 1e3, hV: hV * 1e3, vD, dPt: rL * G * (d + Dw) };
  }, [Lf, Ww, Dw, dl, cd, rL]);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), W = c.width, H = c.height;
    const dk = window.matchMedia("(prefers-color-scheme:dark)").matches;
    ctx.clearRect(0, 0, W, H);
    const lc = dk ? "rgba(255,255,255,.4)" : "rgba(0,0,0,.35)";
    const liq = dk ? "rgba(55,138,221,.35)" : "rgba(55,138,221,.2)";
    const vap = dk ? "rgba(216,90,48,.5)" : "rgba(216,90,48,.3)";
    const cL = 80, cR = 420, tY1 = 120, tY2 = 260, dcW = 60;

    ctx.strokeStyle = lc; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cL, 20); ctx.lineTo(cL, H - 20); ctx.moveTo(cR, 20); ctx.lineTo(cR, H - 20); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = dk ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.5)";
    ctx.beginPath(); ctx.moveTo(cL, tY1); ctx.lineTo(cR - dcW, tY1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cL + dcW, tY2); ctx.lineTo(cR, tY2); ctx.stroke();
    ctx.strokeStyle = lc; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cR - dcW, tY1); ctx.lineTo(cR - dcW, tY2 + 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cL + dcW, 20); ctx.lineTo(cL + dcW, tY1 + 20); ctx.stroke();

    const wH = Math.min(35, Dw * 600);
    ctx.strokeStyle = "#D85A30"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cR - dcW - 5, tY1); ctx.lineTo(cR - dcW - 5, tY1 - wH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cL + dcW + 5, tY2); ctx.lineTo(cL + dcW + 5, tY2 - wH); ctx.stroke();

    const lH = wH + Math.min(20, r.d * .6);
    ctx.fillStyle = liq;
    ctx.fillRect(cL + 1, tY1 - lH, cR - dcW - 6 - cL, lH);
    ctx.fillRect(cL + dcW + 6, tY2 - lH, cR - cL - dcW - 7, lH);
    const dcLH = Math.min(tY2 - tY1 - 5, r.h * .8);
    ctx.fillStyle = dk ? "rgba(55,138,221,.5)" : "rgba(55,138,221,.35)";
    ctx.fillRect(cR - dcW + 1, tY1, dcW - 2, dcLH);

    ctx.fillStyle = vap;
    for (let bx = cL + 30; bx < cR - dcW - 10; bx += 25) for (let by = tY1 - lH + 5; by < tY1 - 3; by += 12) { ctx.beginPath(); ctx.arc(bx + (Math.random() - .5) * 8, by, 3 + Math.random() * 3, 0, Math.PI * 2); ctx.fill(); }
    for (let bx = cL + dcW + 30; bx < cR - 10; bx += 25) for (let by = tY2 - lH + 5; by < tY2 - 3; by += 12) { ctx.beginPath(); ctx.arc(bx + (Math.random() - .5) * 8, by, 3 + Math.random() * 3, 0, Math.PI * 2); ctx.fill(); }

    const tc = dk ? "rgba(255,255,255,.75)" : "rgba(0,0,0,.65)"; ctx.fillStyle = tc; ctx.font = "11px system-ui"; ctx.textAlign = "left";
    ctx.fillText(`H=${r.H.toFixed(1)}mm`, cR + 25, (tY1 + tY2) / 2 + 4);
    ctx.fillStyle = "#D85A30"; ctx.fillText(`d=${r.d.toFixed(1)}mm`, cR - dcW - 55, tY1 - wH - 8);
    ctx.fillStyle = "#378ADD"; ctx.fillText(`h=${r.h.toFixed(1)}mm`, cR - dcW + 5, tY1 + dcLH / 2);

    ctx.fillStyle = vap; ctx.font = "bold 12px system-ui"; ctx.textAlign = "center";
    ctx.fillText(tx("증기 ↑", "Vapor ↑", lang), (cL + cR - dcW) / 2, tY1 + 60);
    ctx.fillStyle = "#378ADD"; ctx.fillText(tx("액체 ↓", "Liquid ↓", lang), cR - dcW / 2, tY2 + 15);
  }, [r, Dw, lang]);

  return (
    <div style={CARD}>
      <h3 style={{ margin: "0 0 .75rem", fontSize: 16, fontWeight: 500 }}>{tx("증류탑 트레이 수력학", "Distillation tray hydraulics", lang)}</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 .75rem", lineHeight: 1.6 }}>{tx("Francis weir formula로 weir 위 깊이 d와 트레이 간격 H를 결정합니다.", "Francis weir formula determines crest depth d and tray spacing H.", lang)}</p>
      <canvas ref={ref} width={700} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary,#ddd)" }} />
      <div style={{ marginTop: ".75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.25rem" }}>
        <Sl label={tx("유량 L", "Flow L", lang)} min={.001} max={.05} step={.001} value={Lf} onChange={sLf} unit="m³/s" />
        <Sl label={tx("Weir 폭", "Weir W", lang)} min={.1} max={2} step={.01} value={Ww} onChange={sWw} unit="m" />
        <Sl label={tx("Weir 높이 D", "Weir D", lang)} min={.01} max={.1} step={.005} value={Dw} onChange={sDw} unit="m" />
        <Sl label="DC gap δ" min={.005} max={.08} step={.001} value={dl} onChange={sDl} unit="m" />
        <Sl label="C_D" min={.3} max={.9} step={.01} value={cd} onChange={sCd} />
        <Sl label="ρ_L" min={500} max={1200} step={10} value={rL} onChange={sRL} unit="kg/m³" />
      </div>
      <Grid cols="repeat(auto-fit,minmax(110px,1fr))" gap={6}><M label={tx("깊이 d", "Crest d", lang)} value={r.d.toFixed(1)} unit="mm" /><M label="DC head h" value={r.h.toFixed(1)} unit="mm" /><M label={tx("간격 H", "Spacing H", lang)} value={r.H.toFixed(1)} unit="mm" /><M label="v_DC" value={r.vD.toFixed(3)} unit="m/s" /><M label="ΔP/tray" value={(r.dPt / 1e3).toFixed(2)} unit="kPa" /></Grid>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB 3: PRACTICE PROBLEMS
// ══════════════════════════════════════════════════════════════
const PROBS = [
  { id: 1, q: { ko: "D=2mm, ρ_s=7800 강구 → 물(ρ_f=1000, μ=0.001) 종단속도 u_t (m/s, 소수점 둘째 자리)", en: "D=2mm, ρ_s=7800 steel sphere in water(ρ_f=1000, μ=0.001). Find u_t (m/s, 2 dec.)" }, hint: { ko: "반복법: u_t=√(4gD|ρ_s−ρ_f|/3ρ_fC_D)", en: "Iterate: u_t=√(4gD|ρ_s−ρ_f|/3ρ_fC_D)" }, ans: () => terminalVelocity(.002, 7800, 1000, .001).ut, tol: .02, u: "m/s" },
  { id: 2, q: { ko: "PBR: D_p=3mm, ε=0.4, L=2m, 물(ρ=998, μ=0.001), u₀=0.02m/s → −ΔP (kPa)", en: "PBR: D_p=3mm, ε=0.4, L=2m, water(ρ=998, μ=0.001), u₀=0.02. −ΔP (kPa, 1 dec.)" }, hint: { ko: "Ergun: 150/Re + 1.75", en: "Ergun: 150/Re + 1.75" }, ans: () => ergunDP(.02, 2, .003, .4, 998, .001).dP / 1e3, tol: .5, u: "kPa" },
  { id: 3, q: { ko: "D=10mm, ρ_s=2650 → 물 중 Archimedes 수 (정수)", en: "D=10mm, ρ_s=2650 in water. Archimedes number (integer)" }, hint: { ko: "Ar = gρ_fD³|ρ_s−ρ_f|/μ²", en: "Ar = gρ_fD³|ρ_s−ρ_f|/μ²" }, ans: () => archimedes(.01, 2650, 1000, .001), tol: 5000, u: "" },
  { id: 4, q: { ko: "Shot tower: D=1mm 강구(7800), 공기(1.2, 1.8e-5) → u_t (m/s)", en: "Shot tower: D=1mm steel(7800) in air(1.2, 1.8e-5). u_t (m/s, 1 dec.)" }, hint: { ko: "ρ_s >> ρ_f, 같은 반복법", en: "ρ_s >> ρ_f, same iteration" }, ans: () => terminalVelocity(.001, 7800, 1.2, 1.8e-5).ut, tol: .5, u: "m/s" },
];

function Prob({ p, lang }) {
  const [inp, setInp] = useState(""); const [hint, setHint] = useState(false); const [res, setRes] = useState(null);
  const chk = () => { const v = parseFloat(inp); setRes(isNaN(v) ? "x" : Math.abs(v - p.ans()) <= p.tol ? "o" : "x"); };
  return (
    <div style={{ ...CARD, borderLeft: res === "o" ? "3px solid #1D9E75" : res === "x" ? "3px solid #E24B4A" : "3px solid var(--color-border-tertiary,#ddd)" }}>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>{tx(`문제 ${p.id}`, `Problem ${p.id}`, lang)}</div>
      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: ".75rem" }}>{lang === "ko" ? p.q.ko : p.q.en}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input type="number" step="any" placeholder={tx("답", "Answer", lang)} value={inp} onChange={e => { setInp(e.target.value); setRes(null); }} onKeyDown={e => e.key === "Enter" && chk()} style={{ width: 140 }} />
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{p.u}</span>
        <button onClick={chk}>{tx("제출", "Submit", lang)}</button>
        <button onClick={() => setHint(!hint)} style={{ opacity: .7 }}>{tx("힌트", "Hint", lang)}</button>
      </div>
      {hint && <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--color-background-info,#e6f1fb)", borderRadius: 6, fontSize: 13 }}>{lang === "ko" ? p.hint.ko : p.hint.en}</div>}
      {res === "o" && <div style={{ marginTop: 8, fontSize: 14, color: "#1D9E75", fontWeight: 500 }}>{tx("정답!", "Correct!", lang)} ({p.ans() < 100 ? p.ans().toFixed(2) : Math.round(p.ans()).toLocaleString()} {p.u})</div>}
      {res === "x" && <div style={{ marginTop: 8, fontSize: 14, color: "#E24B4A" }}>{tx("다시 시도해보세요", "Try again", lang)} (±{p.tol})</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB 4: APPLICATIONS
// ══════════════════════════════════════════════════════════════
const APPS = [
  { i: "🏭", t: { ko: "Shot Tower / Prilling", en: "Shot Tower / Prilling" }, p: { ko: "체류시간 ≈ H/u_t", en: "Residence ≈ H/u_t" }, c: { ko: "요소, 유황, 금속 펠릿 대량 생산. 탑(20–60m)에서 용융 액적 낙하, 냉각·고화. u(t)=b(exp(at)−1)/(exp(at)+1).", en: "Mass production of urea, sulfur, metal pellets. Molten droplets fall from tower, solidifying in free-fall." } },
  { i: "⚗️", t: { ko: "충전층 반응기 (PBR)", en: "Packed Bed Reactor" }, p: { ko: "전환율 vs ΔP trade-off", en: "Conversion vs ΔP" }, c: { ko: "SMR, DeNOx 핵심 반응기. Ergun으로 ΔP 예측. Darcy: κ=D_p²ε³/150(1−ε)².", en: "Key in SMR, DeNOx. Ergun predicts ΔP. Darcy: κ=D_p²ε³/150(1−ε)²." } },
  { i: "🔬", t: { ko: "증류탑 수력학", en: "Distillation Hydraulics" }, p: { ko: "트레이 간격 → flooding 방지", en: "Tray spacing prevents flooding" }, c: { ko: "Francis weir: d=(9L²/8gC_D²W²)^{1/3}. 원유 분리: butane ~ residue.", en: "Francis weir formula. Crude refining: butane to residue." } },
  { i: "🧪", t: { ko: "여과 공정", en: "Filtration" }, p: { ko: "V ∝ √t", en: "V ∝ √t" }, c: { ko: "케이크 성장 L(t)∝√t. CMP 슬러리, 의약품, 폐수 처리.", en: "Cake growth L∝√t. CMP slurry, pharma, wastewater." } },
  { i: "🌊", t: { ko: "침강 / 유동층", en: "Sedimentation / Fluidization" }, p: { ko: "n: 4.65 (Stokes) ~ 2.39 (Newton)", en: "n: 4.65–2.39" }, c: { ko: "Richardson–Zaki: u=u_tεⁿ. FCC, 석탄 연소, 코팅. PDE로 ε(z,t) 해석.", en: "Richardson–Zaki: u=u_tεⁿ. FCC, coal combustion, coating." } },
];

function AppCard({ a, lang }) {
  const [o, setO] = useState(false);
  return (
    <div style={{ ...CARD, cursor: "pointer" }} onClick={() => setO(!o)}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{a.i}</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500 }}>{lang === "ko" ? a.t.ko : a.t.en}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{lang === "ko" ? a.p.ko : a.p.en}</div></div>
        <span style={{ fontSize: 16, color: "var(--color-text-secondary)", transform: o ? "rotate(180deg)" : "", transition: "transform .2s" }}>▾</span>
      </div>
      {o && <div style={{ marginTop: ".75rem", fontSize: 14, lineHeight: 1.8, borderTop: "0.5px solid var(--color-border-tertiary,#ddd)", paddingTop: ".75rem" }}>{lang === "ko" ? a.c.ko : a.c.en}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
const TABS = [
  { k: "sim", ko: "시뮬레이션", en: "Simulations" },
  { k: "num", ko: "수치 시뮬레이터", en: "Numerical Sims" },
  { k: "prob", ko: "연습문제", en: "Practice" },
  { k: "app", ko: "산업 응용", en: "Applications" },
];

export default function Week5App() {
  const [lang, setLang] = useState("ko");
  const [tab, setTab] = useState("sim");

  return (
    <div style={{ fontFamily: "var(--font-sans,system-ui,sans-serif)", maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{tx("Week 5: 유체 마찰과 항력", "Week 5: Fluid Friction & Drag", lang)}</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-text-secondary,#666)" }}>{tx("화공유체역학 — SKKU 화학공학부 · SPMDL · 권석준 교수", "Fluid Mechanics for ChemE — SKKU · SPMDL · Prof. S.J. Kwon", lang)}</p>
          </div>
          <button onClick={() => setLang(lang === "ko" ? "en" : "ko")} style={{ padding: "6px 14px", fontSize: 13, cursor: "pointer", border: "1px solid var(--color-border-tertiary,#ccc)", borderRadius: 6, background: "transparent" }}>{lang === "ko" ? "English" : "한국어"}</button>
        </div>
      </header>

      <nav style={{ display: "flex", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-border-tertiary,#ddd)", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ background: "transparent", border: "none", borderBottom: tab === t.k ? "2px solid var(--color-text-primary,#000)" : "2px solid transparent", padding: "10px 16px", fontSize: 14, cursor: "pointer", fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? "var(--color-text-primary,#000)" : "var(--color-text-secondary,#888)", whiteSpace: "nowrap" }}>
            {lang === "ko" ? t.ko : t.en}
          </button>
        ))}
      </nav>

      {tab === "sim" && <><SimDrag lang={lang} /><SimTermVel lang={lang} /><SimErgun lang={lang} /></>}
      {tab === "num" && <><SimPBR lang={lang} /><SimSed lang={lang} /><SimDist lang={lang} /></>}
      {tab === "prob" && <><p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: "1rem" }}>{tx("문제를 풀고 시뮬레이션 탭에서 검증하세요.", "Solve and verify with simulations.", lang)}</p>{PROBS.map(p => <Prob key={p.id} p={p} lang={lang} />)}</>}
      {tab === "app" && <><p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: "1rem" }}>{tx("5주차 개념의 화공 산업 적용 사례입니다.", "Week 5 concepts in real ChemE processes.", lang)}</p>{APPS.map((a, i) => <AppCard key={i} a={a} lang={lang} />)}</>}

      <footer style={{ marginTop: "2.5rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border-tertiary,#ddd)", fontSize: 12, color: "var(--color-text-tertiary,#999)", textAlign: "center" }}>© 2026 SKKU Chemical Engineering — SPMDL — Prof. S. Joon Kwon</footer>
    </div>
  );
}
