import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ─────────────────────────────────────────────
   Week 09 — Problems on the Viscous Flow
   Same design language as Week 08 (deep navy + cyan + amber)
   Topics:
     • Poiseuille / Couette / Mixed flows
     • Polymer-processing operations (extrusion, spinning, molding,
       calendering, blow-molding, coating, spin-coating)
     • Injection molding: rectangular-duct Poiseuille flow (RCCS)
     • Inclined film on moving substrate (RCCS, Example 6.3)
     • Annular-die Poiseuille flow (CCS)
     • Cone-and-plate rheometer / Weissenberg (SCS)
     • Self-assessment quiz
   ───────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');

:root {
  --navy: #0a0e1a;
  --navy2: #111827;
  --navy3: #1e2a3d;
  --navy4: #243248;
  --cyan: #00d4ff;
  --cyan2: #00a8cc;
  --cyan3: #0066aa;
  --amber: #f59e0b;
  --amber2: #d97706;
  --green: #10b981;
  --red: #ef4444;
  --purple: #a78bfa;
  --text: #e2e8f0;
  --text2: #94a3b8;
  --text3: #64748b;
  --border: rgba(0,212,255,0.15);
  --border2: rgba(0,212,255,0.08);
  --glow: 0 0 20px rgba(0,212,255,0.25);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.w9-root {
  font-family: 'IBM Plex Sans KR', sans-serif;
  background: var(--navy);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
}

/* ── Header ── */
.w9-header {
  background: linear-gradient(135deg, var(--navy2) 0%, var(--navy3) 100%);
  border-bottom: 1px solid var(--border);
  padding: 2rem 2rem 1.5rem;
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(12px);
}
.w9-header-top {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;
}
.w9-week-badge {
  background: linear-gradient(135deg, var(--cyan3), var(--cyan2));
  color: white; font-weight: 700; font-size: 0.7rem; letter-spacing: 0.1em;
  padding: 0.3rem 0.7rem; border-radius: 4px; text-transform: uppercase;
}
.w9-header h1 {
  font-size: 1.25rem; font-weight: 700; color: var(--text);
}
.w9-header p { color: var(--text2); font-size: 0.85rem; }

/* ── Tab navigation ── */
.w9-tabs {
  display: flex; gap: 0.25rem; padding: 0 2rem;
  border-bottom: 1px solid var(--border2);
  background: var(--navy2);
  overflow-x: auto;
}
.w9-tab {
  padding: 0.75rem 1.25rem; font-size: 0.82rem; font-weight: 500;
  color: var(--text3); border: none; background: none; cursor: pointer;
  border-bottom: 2px solid transparent; transition: all 0.2s;
  white-space: nowrap; font-family: 'IBM Plex Sans KR', sans-serif;
}
.w9-tab:hover { color: var(--text2); }
.w9-tab.active { color: var(--cyan); border-bottom-color: var(--cyan); }

/* ── Main content ── */
.w9-content { padding: 2rem; max-width: 1100px; margin: 0 auto; }

/* ── Section card ── */
.w9-card {
  background: var(--navy2); border: 1px solid var(--border2);
  border-radius: 12px; padding: 1.75rem; margin-bottom: 1.5rem;
}
.w9-card-title {
  font-size: 1rem; font-weight: 700; color: var(--cyan);
  margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.6rem;
  padding-bottom: 0.75rem; border-bottom: 1px solid var(--border2);
}
.w9-card-title .icon {
  width: 28px; height: 28px; background: rgba(0,212,255,0.12);
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem;
}

/* ── Concept box ── */
.concept-box {
  background: var(--navy3); border-left: 3px solid var(--cyan);
  border-radius: 0 8px 8px 0; padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}
.concept-box h4 {
  font-size: 0.92rem; font-weight: 600; color: var(--cyan);
  margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;
}
.concept-box p {
  font-size: 0.86rem; color: var(--text2);
}
.concept-box.amber { border-left-color: var(--amber); }
.concept-box.amber h4 { color: var(--amber); }
.concept-box.green { border-left-color: var(--green); }
.concept-box.green h4 { color: var(--green); }
.concept-box.red { border-left-color: var(--red); }
.concept-box.red h4 { color: var(--red); }
.concept-box.purple { border-left-color: var(--purple); }
.concept-box.purple h4 { color: var(--purple); }

/* ── Math display ── */
.math-block {
  font-family: 'Crimson Pro', 'IBM Plex Mono', serif;
  font-size: 1.05rem; font-style: italic;
  background: rgba(0,0,0,0.35); border: 1px solid var(--border2);
  border-radius: 6px; padding: 0.85rem 1rem; margin: 0.6rem 0;
  text-align: center; color: var(--text); line-height: 1.9;
  overflow-x: auto;
}
.math-block .highlight { color: var(--amber); font-weight: 600; font-style: normal; }
.math-block .green { color: var(--green); font-weight: 600; font-style: normal; }
.math-block .cyan { color: var(--cyan); font-weight: 600; font-style: normal; }
.math-block .red { color: var(--red); font-weight: 600; font-style: normal; }
.math-block .purple { color: var(--purple); font-weight: 600; font-style: normal; }
.math-inline {
  font-family: 'Crimson Pro', serif; font-style: italic;
  color: var(--cyan); font-size: 1.02em;
}

/* ── Equation label ── */
.eq-label {
  display: inline-block; font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem; padding: 0.15rem 0.5rem;
  background: rgba(0,212,255,0.1); color: var(--cyan);
  border-radius: 3px; margin-right: 0.4rem;
}

/* ── Canvas container ── */
.w9-canvas-wrap {
  background: rgba(0,0,0,0.4); border: 1px solid var(--border2);
  border-radius: 8px; padding: 1rem; margin: 1rem 0;
  display: flex; justify-content: center;
}
.w9-canvas-wrap canvas {
  display: block; max-width: 100%; height: auto;
  background: #050810; border-radius: 4px;
}

/* ── Control row ── */
.ctrl-row {
  display: flex; flex-wrap: wrap; gap: 1rem 1.25rem; align-items: center;
  margin: 0.8rem 0; padding: 0.85rem 1rem;
  background: var(--navy3); border-radius: 6px;
}
.ctrl-row label {
  display: flex; flex-direction: column; gap: 0.3rem;
  font-size: 0.78rem; color: var(--text2); min-width: 130px;
}
.ctrl-row label .val {
  font-family: 'IBM Plex Mono', monospace; color: var(--cyan); font-weight: 600;
}
.ctrl-row input[type="range"] { width: 100%; accent-color: var(--cyan); }
.ctrl-row select, .ctrl-row input[type="number"] {
  background: var(--navy4); color: var(--text); border: 1px solid var(--border);
  border-radius: 4px; padding: 0.3rem 0.5rem; font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
}

/* ── Buttons ── */
.btn {
  padding: 0.5rem 1rem; font-size: 0.83rem; font-weight: 500;
  border: 1px solid var(--border); background: var(--navy3); color: var(--text);
  border-radius: 6px; cursor: pointer; transition: all 0.2s;
  font-family: 'IBM Plex Sans KR', sans-serif;
}
.btn:hover { background: var(--navy4); border-color: var(--cyan2); }
.btn.primary {
  background: linear-gradient(135deg, var(--cyan3), var(--cyan2));
  border-color: var(--cyan2); color: white;
}
.btn.primary:hover { background: linear-gradient(135deg, var(--cyan2), var(--cyan)); }
.btn.amber {
  background: linear-gradient(135deg, var(--amber2), var(--amber));
  border-color: var(--amber); color: var(--navy);
}

/* ── Coord system tabs ── */
.coord-tabs {
  display: inline-flex; gap: 0.25rem; padding: 0.25rem;
  background: var(--navy3); border-radius: 6px; margin-bottom: 1rem;
}
.coord-tab {
  padding: 0.4rem 0.85rem; font-size: 0.78rem; font-weight: 500;
  background: transparent; border: none; cursor: pointer;
  border-radius: 4px; color: var(--text2); transition: all 0.2s;
}
.coord-tab.active { background: var(--cyan2); color: white; }

/* ── Step-by-step derivation ── */
.deriv-steps {
  display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0;
}
.deriv-step {
  display: flex; gap: 0.85rem; align-items: flex-start;
  padding: 0.7rem 1rem; background: rgba(0,212,255,0.04);
  border-left: 2px solid var(--border); border-radius: 0 6px 6px 0;
  transition: all 0.2s; cursor: pointer;
}
.deriv-step.active {
  background: rgba(0,212,255,0.1); border-left-color: var(--cyan);
}
.deriv-step .step-num {
  background: var(--navy4); color: var(--cyan); width: 24px; height: 24px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  font-family: 'IBM Plex Mono', monospace;
}
.deriv-step.active .step-num {
  background: var(--cyan); color: var(--navy);
}
.deriv-step .step-content {
  flex: 1; font-size: 0.86rem; color: var(--text2);
}
.deriv-step.active .step-content { color: var(--text); }
.deriv-step .step-eq {
  font-family: 'Crimson Pro', serif; font-style: italic;
  font-size: 1rem; color: var(--text); margin-top: 0.35rem;
}

/* ── Quiz ── */
.quiz-q {
  font-size: 1rem; color: var(--text); margin-bottom: 1.25rem; font-weight: 500;
}
.quiz-opt {
  display: block; width: 100%; padding: 0.85rem 1rem; margin-bottom: 0.5rem;
  background: var(--navy3); border: 1px solid var(--border2); color: var(--text);
  border-radius: 6px; cursor: pointer; transition: all 0.2s; text-align: left;
  font-family: 'IBM Plex Sans KR', sans-serif; font-size: 0.88rem;
}
.quiz-opt:hover { background: var(--navy4); border-color: var(--cyan); }
.quiz-opt.correct { background: rgba(16,185,129,0.15); border-color: var(--green); color: var(--green); }
.quiz-opt.wrong { background: rgba(239,68,68,0.15); border-color: var(--red); color: var(--red); }
.quiz-opt.disabled { cursor: default; opacity: 0.7; }

.quiz-progress {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}
.quiz-progress .pct {
  font-family: 'IBM Plex Mono', monospace; color: var(--cyan); font-size: 0.85rem;
}
.quiz-bar {
  height: 4px; background: var(--navy3); border-radius: 2px; overflow: hidden;
  margin-bottom: 1.5rem;
}
.quiz-bar-fill {
  height: 100%; background: linear-gradient(90deg, var(--cyan2), var(--cyan));
  transition: width 0.3s;
}

/* ── Divider ── */
.w9-div {
  height: 1px; background: var(--border2); margin: 1.25rem 0;
}

/* ── Tag ── */
.tag {
  display: inline-block; font-size: 0.72rem; padding: 0.15rem 0.55rem;
  background: rgba(0,212,255,0.1); color: var(--cyan);
  border: 1px solid var(--border); border-radius: 999px;
  margin-right: 0.35rem; font-family: 'IBM Plex Mono', monospace;
}
.tag.amber { background: rgba(245,158,11,0.1); color: var(--amber); border-color: rgba(245,158,11,0.25); }
.tag.green { background: rgba(16,185,129,0.1); color: var(--green); border-color: rgba(16,185,129,0.25); }
.tag.purple { background: rgba(167,139,250,0.1); color: var(--purple); border-color: rgba(167,139,250,0.25); }

/* ── Two-col grid ── */
.grid-2 {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
}
@media (max-width: 768px) {
  .grid-2 { grid-template-columns: 1fr; }
}

/* ── Process gallery ── */
.proc-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem; margin: 1rem 0;
}
.proc-card {
  background: var(--navy3); border: 1px solid var(--border2);
  border-radius: 8px; padding: 0.85rem; text-align: center;
  transition: all 0.2s; cursor: default;
}
.proc-card:hover {
  border-color: var(--cyan); transform: translateY(-2px);
  box-shadow: 0 6px 20px -6px rgba(0,212,255,0.25);
}
.proc-card .ic { font-size: 1.6rem; margin-bottom: 0.4rem; display: block; }
.proc-card .nm { font-size: 0.82rem; font-weight: 600; color: var(--text); }
.proc-card .ds { font-size: 0.72rem; color: var(--text3); margin-top: 0.25rem; }

/* ── KPI / readout ── */
.kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem; margin: 1rem 0;
}
.kpi {
  background: var(--navy3); border: 1px solid var(--border2);
  border-radius: 8px; padding: 0.75rem 0.9rem;
}
.kpi .lbl { font-size: 0.7rem; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }
.kpi .val {
  font-family: 'IBM Plex Mono', monospace; color: var(--cyan);
  font-size: 1.05rem; font-weight: 600; margin-top: 0.2rem;
}
.kpi.amber .val { color: var(--amber); }
.kpi.green .val { color: var(--green); }
`;

/* ═════════════════════════════════════════════════════════
   SHARED HELPERS
   ═════════════════════════════════════════════════════════ */
function fmt(x, n = 3) {
  if (!isFinite(x)) return "—";
  if (Math.abs(x) >= 1e4 || (Math.abs(x) < 1e-3 && x !== 0))
    return x.toExponential(2);
  return x.toFixed(n);
}

/* ═════════════════════════════════════════════════════════
   SPIN-COATING THINNING ANIMATION (used in Overview)
   Emslie–Bonner–Peck:
     ∂h/∂t = −2ρω²h³/(3η)  →  h(t) = h₀ / sqrt(1 + 4ρω²h₀² t /(3η))
   ═════════════════════════════════════════════════════════ */
function SpinCoatCanvas() {
  const canvasRef = useRef(null);
  const [rpm, setRpm] = useState(2000);
  const [eta, setEta] = useState(0.05);   // Pa·s
  const [h0, setH0] = useState(150);      // nm
  const [t, setT] = useState(0);          // s
  const [running, setRunning] = useState(true);
  const rho = 1000;                       // kg/m³ (water-like)

  // physics: h(t) [nm]
  const omega = (2 * Math.PI * rpm) / 60;
  const h0_m = h0 * 1e-9;
  const k = (4 * rho * omega * omega * h0_m * h0_m) / (3 * eta); // 1/s
  const hOf = useCallback(
    (tt) => h0 / Math.sqrt(1 + k * tt),
    [h0, k]
  );

  useEffect(() => {
    if (!running) return;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((tt) => (tt > 60 ? 60 : tt + dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // background
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    // axes (h vs t)
    const PADL = 60, PADR = 20, PADT = 30, PADB = 40;
    const PW = W - PADL - PADR, PH = H - PADT - PADB;
    ctx.strokeStyle = "rgba(0,212,255,0.2)"; ctx.lineWidth = 1;
    ctx.strokeRect(PADL, PADT, PW, PH);

    // grid
    ctx.strokeStyle = "rgba(0,212,255,0.06)";
    for (let i = 1; i < 6; i++) {
      const x = PADL + (PW * i) / 6;
      ctx.beginPath(); ctx.moveTo(x, PADT); ctx.lineTo(x, PADT + PH); ctx.stroke();
    }
    for (let i = 1; i < 5; i++) {
      const y = PADT + (PH * i) / 5;
      ctx.beginPath(); ctx.moveTo(PADL, y); ctx.lineTo(PADL + PW, y); ctx.stroke();
    }

    // labels
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("t (s)", PADL + PW / 2 - 12, H - 8);
    ctx.save();
    ctx.translate(14, PADT + PH / 2 + 18); ctx.rotate(-Math.PI / 2);
    ctx.fillText("h (nm)", 0, 0);
    ctx.restore();

    // x-tick labels
    for (let i = 0; i <= 6; i++) {
      const x = PADL + (PW * i) / 6;
      ctx.fillStyle = "#64748b";
      ctx.fillText((i * 10).toString(), x - 6, H - PADB + 14);
    }
    // y-tick labels
    for (let i = 0; i <= 5; i++) {
      const y = PADT + PH - (PH * i) / 5;
      const v = (h0 * i) / 5;
      ctx.fillStyle = "#64748b";
      ctx.fillText(v.toFixed(0), 30, y + 4);
    }

    // h(t) curve
    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const tt = (i / 200) * 60;
      const hh = hOf(tt);
      const x = PADL + (tt / 60) * PW;
      const y = PADT + PH - (Math.min(hh, h0) / h0) * PH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // current point
    const xC = PADL + (t / 60) * PW;
    const yC = PADT + PH - (Math.min(hOf(t), h0) / h0) * PH;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.arc(xC, yC, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(245,158,11,0.4)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADL, yC); ctx.lineTo(xC, yC);
    ctx.moveTo(xC, PADT + PH); ctx.lineTo(xC, yC);
    ctx.stroke();

    // film cartoon (right side)
    const cx = PADL + PW * 0.7, cy = PADT + 20;
    const filmH = (Math.min(hOf(t), h0) / h0) * 60;
    ctx.fillStyle = "rgba(167,139,250,0.4)";
    ctx.fillRect(cx, cy + 60 - filmH, 120, filmH);
    ctx.strokeStyle = "rgba(167,139,250,0.8)"; ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy + 60 - filmH, 120, filmH);
    ctx.fillStyle = "#1e2a3d"; ctx.fillRect(cx, cy + 60, 120, 6);
    ctx.fillStyle = "#94a3b8"; ctx.font = "10px 'IBM Plex Mono'";
    ctx.fillText("substrate", cx + 35, cy + 78);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`h = ${hOf(t).toFixed(1)} nm`, cx + 18, cy + 60 - filmH - 6);
  }, [t, h0, hOf]);

  const reset = () => setT(0);

  return (
    <div>
      <div className="w9-canvas-wrap">
        <canvas ref={canvasRef} width={680} height={300} />
      </div>
      <div className="ctrl-row">
        <label>
          ω (RPM): <span className="val">{rpm}</span>
          <input type="range" min="200" max="6000" step="100"
            value={rpm} onChange={(e) => setRpm(+e.target.value)} />
        </label>
        <label>
          η (Pa·s): <span className="val">{eta.toFixed(3)}</span>
          <input type="range" min="0.005" max="0.5" step="0.005"
            value={eta} onChange={(e) => setEta(+e.target.value)} />
        </label>
        <label>
          h₀ (nm): <span className="val">{h0}</span>
          <input type="range" min="50" max="500" step="10"
            value={h0} onChange={(e) => setH0(+e.target.value)} />
        </label>
        <button className="btn" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ pause" : "▶ play"}
        </button>
        <button className="btn" onClick={reset}>↺ reset</button>
      </div>
      <div className="kpi-grid">
        <div className="kpi"><div className="lbl">time</div><div className="val">{t.toFixed(2)} s</div></div>
        <div className="kpi amber"><div className="lbl">h(t)</div><div className="val">{hOf(t).toFixed(1)} nm</div></div>
        <div className="kpi green"><div className="lbl">τ ≡ 1/k</div><div className="val">{(1 / k).toFixed(2)} s</div></div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
   ═════════════════════════════════════════════════════════ */
function TabOverview() {
  return (
    <div>
      {/* Viscous-flow definition */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">η</span>점성 유동이란? Viscous Flow</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>📌 정의 — Viscous &gt; Inertial</h4>
            <p>점성 효과가 관성 효과를 압도하는 유동 (Re ≪ 1, 또는 점도가 매우 큰 fluid).<br/>
            전형적으로 <span className="math-inline">층류 (laminar flow)</span>로 발달하며, 속도 분포가 매끄러워 해석적으로 풀리는 경우가 많습니다.</p>
          </div>
          <div className="concept-box amber">
            <h4>⚖ 세 가지 구동력 분류</h4>
            <p style={{marginBottom:"0.4rem"}}><span className="tag">P</span>Poiseuille — 압력 차이로 구동</p>
            <p style={{marginBottom:"0.4rem"}}><span className="tag amber">C</span>Couette — 인접 표면의 드래그로 구동</p>
            <p><span className="tag green">M</span>Mixed — 압력 + 드래그 결합</p>
          </div>
        </div>
        <div className="math-block">
          <span className="cyan">Re</span> = ρUL/η &lt;&lt; 1
          &nbsp;&nbsp;⇒&nbsp;&nbsp;
          관성항 <span className="highlight">ρ(v·∇)v</span> 무시 가능
          &nbsp;⇒&nbsp; 선형 N-S, 해석해 가능
        </div>
      </div>

      {/* Polymer-processing gallery */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">🏭</span>고분자 가공 — Where Viscous Flow Lives</div>
        <p style={{ fontSize: "0.87rem", color: "var(--text2)", marginBottom: "0.8rem" }}>
          폴리머 멜트는 점도가 10²~10⁶ Pa·s로 물(10⁻³)의 백만 배. 본질적으로 점성지배·층류 영역.
        </p>
        <div className="proc-grid">
          {[
            ["⚙", "Extrusion", "압출 — 다이를 통한 가압 수송"],
            ["🧵", "Drawing/Spinning", "방사 — 응고욕 + 드로잉"],
            ["💉", "Injection Molding", "사출 성형 — 금형 충전"],
            ["📜", "Calendering", "캘린더링 — 롤 사이 압연"],
            ["🍾", "Blow Molding", "블로우 성형 — 공기 주입"],
            ["🎨", "Coating", "Dip / Spin / Slot 코팅"],
          ].map(([ic, nm, ds]) => (
            <div key={nm} className="proc-card">
              <span className="ic">{ic}</span>
              <div className="nm">{nm}</div>
              <div className="ds">{ds}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spin coating live model */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">⊙</span>Spin-Coating — Emslie-Bonner-Peck Thinning</div>
        <div className="concept-box">
          <h4>📐 박막 두께의 시간 진화</h4>
          <p>회전 원심력과 점성저항의 균형으로 균일 박막이 얇아집니다. 반도체 PR, OLED HIL, perovskite 박막 모두 같은 식.</p>
        </div>
        <div className="math-block">
          ∂h/∂t = −2ρω²h³/(3η)
          &nbsp;&nbsp;⇒&nbsp;&nbsp;
          <span className="highlight">h(t) = h₀ / √(1 + 4ρω²h₀²t/3η)</span>
        </div>
        <SpinCoatCanvas />
        <p style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: "0.75rem", textAlign: "center" }}>
          A. G. Emslie, F. T. Bonner, L. G. Peck, "Flow of a viscous liquid on a rotating disk", J. Appl. Phys. 29(5), 858 (1958)
        </p>
      </div>

      {/* This week's roadmap */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">🗺</span>이번 주 학습 로드맵</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🟦 Tab 2 — Injection Molding (RCCS)</h4>
            <p>직사각 덕트, 두 평판 사이 압력구동 Poiseuille flow. PDE → ODE → BC → 포물선 속도 분포.</p>
          </div>
          <div className="concept-box amber">
            <h4>🟧 Tab 3 — Inclined Film (RCCS)</h4>
            <p>경사면을 따라 끌려 올라가는 photographic film. 중력↓ vs 드래그↑. 역류/순류 공존.</p>
          </div>
          <div className="concept-box green">
            <h4>🟩 Tab 4 — Annular Die (CCS)</h4>
            <p>동심원 환형 단면, 압력구동. log항이 등장하는 속도 분포.</p>
          </div>
          <div className="concept-box purple">
            <h4>🟪 Tab 5 — Cone-Plate Rheometer (SCS)</h4>
            <p>Weissenberg rheogoniometer. 토크 측정 → 점도 산출 원리.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   TAB 2 — INJECTION MOLDING (RCCS Poiseuille between plates)
   Step-by-step derivation + interactive parabolic profile
   ═════════════════════════════════════════════════════════ */
function PoiseuilleProfileCanvas({ dp, eta, d, L }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    const PADL = 70, PADR = 40, PADT = 30, PADB = 50;
    const PW = W - PADL - PADR, PH = H - PADT - PADB;

    // walls (shaded)
    ctx.fillStyle = "rgba(100,116,139,0.22)";
    ctx.fillRect(PADL, PADT - 8, PW, 8);
    ctx.fillRect(PADL, PADT + PH, PW, 8);
    // wall hatching
    ctx.strokeStyle = "rgba(148,163,184,0.5)"; ctx.lineWidth = 1;
    for (let x = PADL; x < PADL + PW; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, PADT - 8); ctx.lineTo(x + 6, PADT - 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, PADT + PH + 8); ctx.lineTo(x + 6, PADT + PH + 2); ctx.stroke();
    }

    // axes
    ctx.strokeStyle = "rgba(0,212,255,0.18)"; ctx.lineWidth = 1;
    ctx.strokeRect(PADL, PADT, PW, PH);
    // y=0 center line
    ctx.strokeStyle = "rgba(245,158,11,0.4)"; ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PADL, PADT + PH / 2); ctx.lineTo(PADL + PW, PADT + PH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Profile: v_x(y) = (Δp/2ηL)(d² − y²); plot v_x vs y, with y on vertical axis
    // dp = p1 - p2 [Pa], d [m], eta [Pa·s], L [m]
    const dpdx = -dp / L; // ∂p/∂x
    const vmax = (-dpdx) * d * d / (2 * eta); // = Δp d² / (2 η L)
    const vmean = vmax * (2 / 3);

    // velocity vectors / arrows along y
    const Narrow = 13;
    ctx.fillStyle = "rgba(0,212,255,0.85)";
    ctx.strokeStyle = "rgba(0,212,255,0.85)"; ctx.lineWidth = 1.5;
    for (let i = 0; i <= Narrow; i++) {
      const y = -d + (2 * d * i) / Narrow;             // m
      const v = (vmax / (d * d)) * (d * d - y * y);    // m/s
      const py = PADT + PH * (0.5 + y / (2 * d));
      const arrowLen = (v / vmax) * (PW * 0.55);
      const xStart = PADL + 5;
      ctx.beginPath();
      ctx.moveTo(xStart, py); ctx.lineTo(xStart + arrowLen, py); ctx.stroke();
      // arrowhead
      if (arrowLen > 6) {
        ctx.beginPath();
        ctx.moveTo(xStart + arrowLen, py);
        ctx.lineTo(xStart + arrowLen - 6, py - 4);
        ctx.lineTo(xStart + arrowLen - 6, py + 4);
        ctx.closePath(); ctx.fill();
      }
    }

    // smooth parabolic envelope
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const y = -d + (2 * d * i) / 100;
      const v = (vmax / (d * d)) * (d * d - y * y);
      const py = PADT + PH * (0.5 + y / (2 * d));
      const px = PADL + 5 + (v / vmax) * (PW * 0.55);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // labels
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("y = +d", PADL - 50, PADT + 4);
    ctx.fillText("y = 0", PADL - 45, PADT + PH / 2 + 3);
    ctx.fillText("y = −d", PADL - 50, PADT + PH + 3);
    ctx.fillText("v_x →", PADL + 5, PADT + PH + 28);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`v_max = ${fmt(vmax, 3)} m/s`, PADL + PW * 0.55 + 14, PADT + PH / 2 + 4);
    ctx.fillStyle = "#10b981";
    ctx.fillText(`v_mean = ${fmt(vmean, 3)} m/s`, PADL + PW * 0.55 + 14, PADT + PH / 2 + 22);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Δp = ${fmt(dp, 0)} Pa,  L = ${L.toFixed(2)} m`, PADL, PADT - 14);
  }, [dp, eta, d, L]);

  return (
    <div className="w9-canvas-wrap">
      <canvas ref={ref} width={680} height={310} />
    </div>
  );
}

function TabInjection() {
  const [step, setStep] = useState(0);
  const [dp, setDp] = useState(50000);   // Pa
  const [eta, setEta] = useState(100);   // Pa·s (polymer melt)
  const [d, setD] = useState(0.005);     // half-gap [m] → 2d = 10 mm
  const [L, setL] = useState(0.5);       // length [m]

  const vmax = useMemo(() => (dp * d * d) / (2 * eta * L), [dp, d, eta, L]);
  const vmean = (2 / 3) * vmax;
  const Q = (2 * d ** 3 * dp) / (3 * eta * L); // per unit width
  const Re = (1000 * vmean * 2 * d) / eta;     // approx. for ρ ~ 1000

  const STEPS = [
    {
      title: "1. 가정 정리 (Assumptions)",
      desc: "층류 · 비압축 Newtonian · fully-developed · 정상상태 · 두 평판 사이 거리 2d ≪ width · no-slip BC",
      eq: "v = vₓ(y) ê_x   (∂vₓ/∂t = ∂vₓ/∂x = ∂vₓ/∂z = 0)",
    },
    {
      title: "2. 연속방정식 → vₓ(y)만 남음",
      desc: "ρ = const, v_y = v_z = 0, ∂ρ/∂t = 0 → ∂vₓ/∂x = 0 → vₓ는 y의 함수만 됨.",
      eq: "∂vₓ/∂x = 0   ⇒   vₓ(x, y, z, t) = vₓ(y)",
    },
    {
      title: "3. NS-방정식 단순화",
      desc: "x: 압력 + 점성 / y: 정수압 / z: 0. 중력은 −y방향.",
      eq: "0 = −∂p/∂x + η(∂²vₓ/∂y²),    0 = −∂p/∂y − ρg,    0 = −∂p/∂z",
    },
    {
      title: "4. p(x, y) 구조 분석",
      desc: "y-방정식 적분: p = f(x) − ρgy. x-방정식에 대입하면 LHS는 x만의, RHS는 y만의 함수 → 양변 = const = K₁.",
      eq: "∂f(x)/∂x = η ∂²vₓ/∂y² = K₁  ⇒  K₁ = −(p₁−p₂)/L",
    },
    {
      title: "5. ODE 적분 (속도 분포)",
      desc: "η vₓ″ = K₁ → 두 번 적분 + BC 두 개 (no-slip @ y=±d, 대칭 @ y=0).",
      eq: "vₓ(y) = (Δp / 2ηL)(d² − y²)",
    },
    {
      title: "6. 결과: 포물선 분포",
      desc: "최대 속도는 중심에서, 평균 속도는 최대의 2/3. 단위 폭 당 부피유량 Q = 2d³ Δp / 3ηL.",
      eq: "vₓ(y) = (3/2) v_mean [1 − (y/d)²],   v_max = (3/2) v_mean",
    },
  ];

  return (
    <div>
      {/* Schematic & motivation */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">💉</span>Injection Molding — 직사각 덕트 압력유동</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🎯 산업 맥락</h4>
            <p>고분자 멜트가 사출 노즐을 거쳐 좁은 금형 (2d ≪ W) 안으로 밀려 들어갑니다. 지배 물리는 압력구동 Poiseuille flow.</p>
          </div>
          <div className="concept-box amber">
            <h4>📐 좌표계 약속</h4>
            <p>x: 유동 방향 (inlet→exit), y: 두 평판 사이 (대칭축 = y=0), z: 너비 방향. 두 벽은 y = ±d.</p>
          </div>
        </div>
      </div>

      {/* Step-by-step derivation */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">∂</span>Step-by-Step PDE → ODE → BC → Solution</div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.8rem" }}>
          단계를 클릭하여 흐름을 따라가세요.
        </p>
        <div className="deriv-steps">
          {STEPS.map((s, i) => (
            <div key={i}
              className={`deriv-step ${step === i ? "active" : ""}`}
              onClick={() => setStep(i)}>
              <div className="step-num">{i + 1}</div>
              <div className="step-content">
                <div style={{ fontWeight: 600, color: step === i ? "var(--cyan)" : "var(--text2)" }}>
                  {s.title}
                </div>
                <div style={{ marginTop: "0.2rem" }}>{s.desc}</div>
                <div className="step-eq">{s.eq}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive profile */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">📊</span>Interactive Velocity Profile</div>
        <PoiseuilleProfileCanvas dp={dp} eta={eta} d={d} L={L} />
        <div className="ctrl-row">
          <label>
            Δp (Pa): <span className="val">{dp.toLocaleString()}</span>
            <input type="range" min="1000" max="500000" step="1000"
              value={dp} onChange={(e) => setDp(+e.target.value)} />
          </label>
          <label>
            η (Pa·s): <span className="val">{eta}</span>
            <input type="range" min="1" max="1000" step="1"
              value={eta} onChange={(e) => setEta(+e.target.value)} />
          </label>
          <label>
            half-gap d (mm): <span className="val">{(d * 1000).toFixed(1)}</span>
            <input type="range" min="0.5" max="20" step="0.5"
              value={d * 1000} onChange={(e) => setD(+e.target.value / 1000)} />
          </label>
          <label>
            length L (m): <span className="val">{L.toFixed(2)}</span>
            <input type="range" min="0.05" max="2" step="0.05"
              value={L} onChange={(e) => setL(+e.target.value)} />
          </label>
        </div>
        <div className="kpi-grid">
          <div className="kpi"><div className="lbl">v_max</div><div className="val">{fmt(vmax, 4)} m/s</div></div>
          <div className="kpi amber"><div className="lbl">v_mean = (2/3) v_max</div><div className="val">{fmt(vmean, 4)} m/s</div></div>
          <div className="kpi green"><div className="lbl">Q / W (per unit width)</div><div className="val">{fmt(Q, 4)} m²/s</div></div>
          <div className="kpi"><div className="lbl">Re ≈ ρ v̄ (2d) / η</div><div className="val" style={{ color: Re > 1 ? "var(--amber)" : "var(--green)" }}>{fmt(Re, 3)}</div></div>
        </div>
        <div className="concept-box green">
          <h4>✓ Sanity check</h4>
          <p>Re &lt;&lt; 1 인지 확인하세요. 그래야 점성 가정이 유효합니다. 멜트 (η~100 Pa·s)에서는 Δp를 크게 키워도 Re는 작게 유지됩니다.</p>
        </div>
      </div>

      {/* Force-balance derivation note */}
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">⚖</span>대안 유도법 — 미소체적 힘 평형</div>
        <p style={{ fontSize: "0.86rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          NS 풀 필요 없이, dx·dy·dz 미소체적에서 직접 힘 평형을 세워도 같은 결과가 나옵니다.
        </p>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🔄 Convective force</h4>
            <p>vₓ가 x에 무관 (∂vₓ/∂x = 0) → ρvₓ²(x)dydz − ρvₓ²(x+dx)dydz = 0</p>
          </div>
          <div className="concept-box amber">
            <h4>📥 Pressure force</h4>
            <p>p·dydz − (p + ∂p/∂x dx)·dydz = −∂p/∂x · dx dy dz</p>
          </div>
          <div className="concept-box purple">
            <h4>🔁 Shear force</h4>
            <p>(τ_yx + ∂τ_yx/∂y dy)·dxdz − τ_yx·dxdz = ∂τ_yx/∂y · dx dy dz, τ_yx = η ∂vₓ/∂y</p>
          </div>
          <div className="concept-box green">
            <h4>⚡ 결합</h4>
            <p>∂τ_yx/∂y = ∂p/∂x → η ∂²vₓ/∂y² = ∂p/∂x. NS 결과와 동일.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   TAB 3 — INCLINED FILM ON A MOVING SUBSTRATE (Example 6.3)
   v_x(y) = ρg sinθ (y²/2 − δy)/η + U
   Q = U δ − ρg sinθ δ³ /(3η);  no-net-flow ⇒ δ = √(3ηU / ρg sinθ)
   ═════════════════════════════════════════════════════════ */
function InclinedFilmCanvas({ U, theta, eta, delta, rho, g }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const angle = theta;                       // rad
    const SCALE = 200;                         // pixels per "unit"

    // Coordinate frame on inclined plane: x along plane (up the slope), y perpendicular
    // Convert local (x_loc, y_loc) to canvas (x, y)
    const loc2can = (xL, yL) => {
      const X = cx + xL * Math.cos(angle) - yL * Math.sin(angle);
      const Y = cy - xL * Math.sin(angle) - yL * Math.cos(angle);
      return [X, Y];
    };

    // Substrate (inclined slab)
    ctx.fillStyle = "rgba(100,116,139,0.4)";
    const slabPts = [
      loc2can(-1.8 * SCALE, 0),
      loc2can(1.8 * SCALE, 0),
      loc2can(1.8 * SCALE, -0.18 * SCALE),
      loc2can(-1.8 * SCALE, -0.18 * SCALE),
    ];
    ctx.beginPath();
    ctx.moveTo(slabPts[0][0], slabPts[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(slabPts[i][0], slabPts[i][1]);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1;
    ctx.stroke();
    // hatching on substrate
    ctx.strokeStyle = "rgba(148,163,184,0.5)";
    for (let s = -1.7; s < 1.7; s += 0.15) {
      const [x1, y1] = loc2can(s * SCALE, 0);
      const [x2, y2] = loc2can((s + 0.06) * SCALE, -0.18 * SCALE);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // Liquid coating (filled polygon)
    const deltaPx = delta * SCALE * 1.5;
    ctx.fillStyle = "rgba(96,165,250,0.18)";
    const filmPts = [
      loc2can(-1.6 * SCALE, 0),
      loc2can(1.6 * SCALE, 0),
      loc2can(1.6 * SCALE, deltaPx),
      loc2can(-1.6 * SCALE, deltaPx),
    ];
    ctx.beginPath();
    ctx.moveTo(filmPts[0][0], filmPts[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(filmPts[i][0], filmPts[i][1]);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(96,165,250,0.6)"; ctx.lineWidth = 1.2;
    ctx.stroke();

    // Velocity profile arrows
    const sinTh = Math.sin(theta);
    // physical v_x(y) [m/s]:
    const vAt = (y) => (rho * g * sinTh * (y * y / 2 - delta * y)) / eta + U;
    // compute scale: maxAbsV
    let maxAbs = Math.abs(U);
    for (let i = 0; i <= 20; i++) {
      const y = (delta * i) / 20;
      const v = Math.abs(vAt(y));
      if (v > maxAbs) maxAbs = v;
    }
    if (maxAbs < 1e-6) maxAbs = 1e-6;

    // draw arrows along y (from substrate y=0 outward to free surface y=delta)
    const Narrow = 12;
    for (let i = 0; i <= Narrow; i++) {
      const y = (delta * i) / Narrow;
      const v = vAt(y);
      const yPx = y * SCALE * 1.5;
      // arrow base on substrate at varying x along plane (use a column at x_loc=0.6)
      const baseLoc = [-0.4 * SCALE, yPx];
      const tipLoc = [-0.4 * SCALE + (v / maxAbs) * 0.9 * SCALE, yPx];
      const [bx, by] = loc2can(...baseLoc);
      const [tx, ty] = loc2can(...tipLoc);
      // color: positive = cyan, negative = red
      const col = v >= 0 ? "rgba(0,212,255,0.85)" : "rgba(239,68,68,0.85)";
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
      // arrowhead
      const dx = tx - bx, dy = ty - by;
      const len = Math.hypot(dx, dy);
      if (len > 5) {
        const ux = dx / len, uy = dy / len;
        const nx = -uy, ny = ux;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 7 * ux + 4 * nx, ty - 7 * uy + 4 * ny);
        ctx.lineTo(tx - 7 * ux - 4 * nx, ty - 7 * uy - 4 * ny);
        ctx.closePath(); ctx.fill();
      }
    }

    // Substrate motion arrow (U)
    const [ux1, uy1] = loc2can(0.8 * SCALE, 0);
    const [ux2, uy2] = loc2can(1.4 * SCALE, 0);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ux1, uy1); ctx.lineTo(ux2, uy2); ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    const dxa = ux2 - ux1, dya = uy2 - uy1;
    const la = Math.hypot(dxa, dya);
    const uxa = dxa / la, uya = dya / la;
    const nxa = -uya, nya = uxa;
    ctx.beginPath();
    ctx.moveTo(ux2, uy2);
    ctx.lineTo(ux2 - 10 * uxa + 6 * nxa, uy2 - 10 * uya + 6 * nya);
    ctx.lineTo(ux2 - 10 * uxa - 6 * nxa, uy2 - 10 * uya - 6 * nya);
    ctx.closePath(); ctx.fill();
    ctx.font = "12px 'IBM Plex Mono'";
    ctx.fillText("U", ux2 + 8, uy2 - 4);

    // Gravity arrow (down in canvas)
    ctx.strokeStyle = "rgba(167,139,250,0.85)";
    ctx.fillStyle = "rgba(167,139,250,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W - 60, 30); ctx.lineTo(W - 60, 80);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W - 60, 80); ctx.lineTo(W - 65, 73); ctx.lineTo(W - 55, 73);
    ctx.closePath(); ctx.fill();
    ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("g", W - 56, 90);

    // Angle label
    ctx.strokeStyle = "rgba(245,158,11,0.6)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, H - 30); ctx.lineTo(W - 40, H - 30); ctx.stroke();
    ctx.beginPath();
    ctx.arc(50, H - 30, 26, -theta, 0);
    ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`θ = ${(theta * 180 / Math.PI).toFixed(0)}°`, 80, H - 24);

    // Free surface label
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
    const [fx, fy] = loc2can(1.65 * SCALE, deltaPx);
    ctx.fillText(`y = δ (free surface, τ=0)`, fx + 8, fy + 4);
    const [sx, sy] = loc2can(-1.65 * SCALE, 0);
    ctx.fillText(`y = 0  v = U`, sx - 78, sy + 4);
  }, [U, theta, eta, delta, rho, g]);

  return (
    <div className="w9-canvas-wrap">
      <canvas ref={ref} width={680} height={360} />
    </div>
  );
}

function TabInclined() {
  const [U, setU] = useState(0.05);              // m/s
  const [thetaDeg, setThetaDeg] = useState(45);  // °
  const [eta, setEta] = useState(0.5);           // Pa·s
  const [deltaMm, setDeltaMm] = useState(2);     // mm
  const rho = 1000;                              // kg/m³
  const g = 9.81;
  const theta = (thetaDeg * Math.PI) / 180;
  const delta = deltaMm / 1000;                  // m

  // No-net-flow δ for current (U, θ, η):
  const deltaCrit = Math.sqrt((3 * eta * U) / (rho * g * Math.sin(theta)));
  const deltaCritMm = deltaCrit * 1000;

  // Q per unit width with current δ:
  const Q = U * delta - (rho * g * Math.sin(theta) * delta ** 3) / (3 * eta);

  // Where does v_x = 0 (sign change inside film)? Solve quadratic:
  //  (ρg sinθ)/η · y²/2 − (ρg sinθ δ)/η · y + U = 0
  const a = (rho * g * Math.sin(theta)) / (2 * eta);
  const b = -(rho * g * Math.sin(theta) * delta) / eta;
  const cQ = U;
  const disc = b * b - 4 * a * cQ;
  let yZero1 = null, yZero2 = null;
  if (disc >= 0 && a !== 0) {
    yZero1 = (-b - Math.sqrt(disc)) / (2 * a);
    yZero2 = (-b + Math.sqrt(disc)) / (2 * a);
    if (yZero1 < 0 || yZero1 > delta) yZero1 = null;
    if (yZero2 < 0 || yZero2 > delta) yZero2 = null;
  }

  return (
    <div>
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">📷</span>Example 6.3 — Film on a Moving Substrate</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🎬 시나리오</h4>
            <p>Photographic film이 처리욕(processing bath)에서 롤러에 의해 속도 U, 경사각 θ로 끌어 올려집니다. Film이 액체를 entrain → 두께 δ의 코팅 형성. 정상 상태에서 <span className="math-inline">net flow = 0</span> (끌려 올라가는 양 = 중력으로 다시 떨어지는 양).</p>
          </div>
          <div className="concept-box amber">
            <h4>⚙ 좌표계</h4>
            <p>경사면 위, x: 경사면 위쪽 (필름 진행 방향), y: 경사면에 수직(필름 → 자유표면).<br/>g_x = −g sinθ, g_y = −g cosθ.</p>
          </div>
        </div>
      </div>

      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">∂</span>지배방정식과 BC</div>
        <div className="math-block">
          0 = −∂p/∂x + η ∂²vₓ/∂y² − ρg sinθ
          <br/>
          0 = −∂p/∂y − ρg cosθ
          <br/>
          BC₁: vₓ = U @ y = 0 (no-slip on moving film)
          <br/>
          BC₂: τ_yx = η ∂vₓ/∂y = 0 @ y = δ (free surface)
        </div>
        <div className="concept-box green">
          <h4>📤 적분 결과 (속도 분포)</h4>
          <div className="math-block">
            <span className="highlight">vₓ(y) = (ρg sinθ / η)(y² / 2 − δ y) + U</span>
          </div>
          <p>중력은 −방향 (downstream으로 끌어내림), 드래그 U는 +방향. 두 효과의 균형으로 reverse flow가 위쪽에서 발생.</p>
        </div>
        <div className="concept-box amber">
          <h4>🚫 No-net-flow 조건</h4>
          <div className="math-block">
            Q = U δ − (ρg sinθ δ³)/(3η) = 0
            &nbsp;&nbsp;⇒&nbsp;&nbsp;
            <span className="highlight">δ = √(3 η U / ρg sinθ)</span>
          </div>
        </div>
      </div>

      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">📊</span>Interactive — 경사면 박막 유동</div>
        <InclinedFilmCanvas U={U} theta={theta} eta={eta} delta={delta} rho={rho} g={g} />
        <p style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: "0.4rem", textAlign: "center" }}>
          <span style={{color:"#00d4ff"}}>■</span> upward (forward, drag-driven)&nbsp;&nbsp;
          <span style={{color:"#ef4444"}}>■</span> downward (reverse, gravity-driven)
        </p>
        <div className="ctrl-row">
          <label>
            U (m/s): <span className="val">{U.toFixed(3)}</span>
            <input type="range" min="0.005" max="0.5" step="0.005"
              value={U} onChange={(e) => setU(+e.target.value)} />
          </label>
          <label>
            θ (deg): <span className="val">{thetaDeg}</span>
            <input type="range" min="5" max="85" step="1"
              value={thetaDeg} onChange={(e) => setThetaDeg(+e.target.value)} />
          </label>
          <label>
            η (Pa·s): <span className="val">{eta.toFixed(2)}</span>
            <input type="range" min="0.01" max="5" step="0.01"
              value={eta} onChange={(e) => setEta(+e.target.value)} />
          </label>
          <label>
            δ (mm): <span className="val">{deltaMm.toFixed(2)}</span>
            <input type="range" min="0.1" max="10" step="0.1"
              value={deltaMm} onChange={(e) => setDeltaMm(+e.target.value)} />
          </label>
        </div>
        <div className="kpi-grid">
          <div className="kpi"><div className="lbl">Q / W (m²/s)</div><div className="val" style={{color: Math.abs(Q) < 1e-6 ? "var(--green)" : "var(--cyan)"}}>{fmt(Q, 5)}</div></div>
          <div className="kpi amber"><div className="lbl">δ_critical (no-net-flow)</div><div className="val">{deltaCritMm.toFixed(3)} mm</div></div>
          <div className="kpi green"><div className="lbl">v_x(y=0)</div><div className="val">{fmt(U, 4)} m/s</div></div>
          <div className="kpi"><div className="lbl">v_x(y=δ)</div><div className="val">{fmt((rho*g*Math.sin(theta)*(delta*delta/2 - delta*delta))/eta + U, 4)} m/s</div></div>
        </div>

        <div className="concept-box purple">
          <h4>🎯 도전 과제</h4>
          <p>슬라이더를 조정하여 <strong>δ를 δ_critical에 맞춰 보세요.</strong> Q ≈ 0 이 되어야 합니다 (그래프에서 cyan/red 화살표 면적이 같아짐). 이 두께가 정상 코팅을 위해 필요한 최소 net upward flow의 임계점.</p>
        </div>

        {(yZero1 !== null || yZero2 !== null) && (
          <div className="concept-box red">
            <h4>↩ 역류 영역 발견</h4>
            <p>v_x = 0 위치: {yZero1 !== null && `y₁ = ${(yZero1 * 1000).toFixed(3)} mm`}{yZero1 !== null && yZero2 !== null && ", "}{yZero2 !== null && `y₂ = ${(yZero2 * 1000).toFixed(3)} mm`}.<br/>이 위치 위쪽 (자유표면 가까이)에서 액체는 중력에 의해 아래로 흘러내립니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   TAB 4 — ANNULAR DIE (CCS Poiseuille)
   v_z(r) = (1/4η)(−dp/dz)[ log(r/r₂)/log(r₁/r₂) (r₂² − r₁²) + (r₂² − r²) ]
   Q = π(r₂² − r₁²)/8η · (−dp/dz) · [ r₂² + r₁² − (r₂² − r₁²)/log(r₂/r₁) ]
   ═════════════════════════════════════════════════════════ */
function AnnularProfileCanvas({ r1, r2, dpdz, eta }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    // Two side-by-side panels: left = cross-section (annulus), right = velocity profile
    const PADL = 30, PADT = 30;
    const leftSize = 280;
    const cx = PADL + leftSize / 2, cy = PADT + leftSize / 2;
    const Rmax = leftSize / 2 - 20;

    // velocity profile function (Wilkes standard form — satisfies v(r1)=v(r2)=0)
    const v = (r) => {
      const t1 = r2 * r2 - r * r;
      const t2 = ((r2 * r2 - r1 * r1) / Math.log(r2 / r1)) * Math.log(r2 / r);
      return (1 / (4 * eta)) * (-dpdz) * (t1 - t2);
    };

    // sample max velocity
    let vmax = 0;
    for (let i = 0; i <= 100; i++) {
      const r = r1 + (i / 100) * (r2 - r1);
      const vv = v(r);
      if (vv > vmax) vmax = vv;
    }

    // Draw cross-section: annulus colored by velocity magnitude
    const r1px = (r1 / r2) * Rmax;
    const r2px = Rmax;
    // background
    ctx.fillStyle = "#0a0e1a";
    ctx.beginPath(); ctx.arc(cx, cy, Rmax + 10, 0, Math.PI * 2); ctx.fill();
    // velocity color rings
    for (let i = 0; i < 100; i++) {
      const rp = r1px + ((r2px - r1px) * i) / 100;
      const r = r1 + ((r2 - r1) * i) / 100;
      const vv = v(r);
      const t = vv / vmax;
      const R = Math.round(t * 0 + (1 - t) * 30);
      const G = Math.round(t * 200 + (1 - t) * 100);
      const B = Math.round(t * 255 + (1 - t) * 130);
      ctx.strokeStyle = `rgb(${R},${G},${B})`;
      ctx.lineWidth = (r2px - r1px) / 100 + 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rp, 0, Math.PI * 2);
      ctx.stroke();
    }
    // borders
    ctx.strokeStyle = "rgba(0,212,255,0.7)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r1px, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r2px, 0, Math.PI * 2); ctx.stroke();
    // Inner cylinder shading
    ctx.fillStyle = "rgba(100,116,139,0.5)";
    ctx.beginPath(); ctx.arc(cx, cy, r1px, 0, Math.PI * 2); ctx.fill();

    // Labels
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("inner wall r₁", cx - 35, cy + 4);
    ctx.fillText("outer wall r₂", cx + r2px + 6, cy + 4);
    ctx.fillStyle = "#f59e0b"; ctx.font = "10px 'IBM Plex Mono'";
    ctx.fillText("cross-section (color = v_z)", cx - 70, PADT + 8);

    // Right panel: velocity profile v_z(r)
    const PADL2 = leftSize + 80, PADR2 = 30;
    const PW2 = W - PADL2 - PADR2, PH2 = leftSize - 30;
    const PT2 = PADT + 5;
    ctx.strokeStyle = "rgba(0,212,255,0.18)"; ctx.lineWidth = 1;
    ctx.strokeRect(PADL2, PT2, PW2, PH2);
    // axis labels
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("r", PADL2 + PW2 + 5, PT2 + PH2);
    ctx.fillText("v_z(r)", PADL2 - 6, PT2 - 8);
    ctx.fillStyle = "#64748b";
    ctx.fillText("r₁", PADL2 - 4, PT2 + PH2 + 14);
    ctx.fillText("r₂", PADL2 + PW2 - 8, PT2 + PH2 + 14);

    // curve
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2;
    ctx.beginPath();
    let rmaxLoc = 0, vrmax = 0;
    for (let i = 0; i <= 200; i++) {
      const r = r1 + ((r2 - r1) * i) / 200;
      const vv = v(r);
      if (vv > vrmax) { vrmax = vv; rmaxLoc = r; }
      const x = PADL2 + (i / 200) * PW2;
      const y = PT2 + PH2 - (vv / Math.max(vmax, 1e-12)) * PH2 * 0.92;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // mark r where v=max
    const rmax_x = PADL2 + ((rmaxLoc - r1) / (r2 - r1)) * PW2;
    const vmax_y = PT2 + PH2 - (vrmax / Math.max(vmax, 1e-12)) * PH2 * 0.92;
    ctx.fillStyle = "#10b981";
    ctx.beginPath(); ctx.arc(rmax_x, vmax_y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = "10px 'IBM Plex Mono'";
    ctx.fillText(`r* = ${(rmaxLoc * 1000).toFixed(2)} mm`, rmax_x - 22, vmax_y - 8);

    // baseline (v=0)
    ctx.strokeStyle = "rgba(245,158,11,0.3)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(PADL2, PT2 + PH2); ctx.lineTo(PADL2 + PW2, PT2 + PH2); ctx.stroke();
    ctx.setLineDash([]);
  }, [r1, r2, dpdz, eta]);

  return (
    <div className="w9-canvas-wrap">
      <canvas ref={ref} width={680} height={340} />
    </div>
  );
}

function TabAnnular() {
  const [r1Mm, setR1Mm] = useState(5);    // mm
  const [r2Mm, setR2Mm] = useState(15);   // mm
  const [dpPerL, setDpPerL] = useState(10000); // Pa/m  (= |dp/dz|)
  const [eta, setEta] = useState(50);     // Pa·s
  const r1 = r1Mm / 1000, r2 = r2Mm / 1000;
  const dpdz = -dpPerL;  // dp/dz negative = pressure drops downstream

  // Volumetric flow rate Q:
  const Q = useMemo(() => {
    if (r2 <= r1) return 0;
    const pre = (Math.PI * (r2 * r2 - r1 * r1)) / (8 * eta);
    const bracket =
      r2 * r2 + r1 * r1 - (r2 * r2 - r1 * r1) / Math.log(r2 / r1);
    return pre * (-dpdz) * bracket;
  }, [r1, r2, dpdz, eta]);

  // r* where v is max:  dv/dr = (1/4η)(-dp/dz)[−2r + (r2²−r1²)/(log(r2/r1)·r)] = 0
  //   ⇒  r*² = (r2² − r1²) / (2 log(r2/r1))
  const rStar = useMemo(() => {
    if (r2 <= r1) return r1;
    return Math.sqrt((r2 * r2 - r1 * r1) / (2 * Math.log(r2 / r1)));
  }, [r1, r2]);

  return (
    <div>
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">⊚</span>Annular Die — 동심 환형 단면 압력유동 (CCS)</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🎯 산업 맥락</h4>
            <p>Pipe extrusion (수도관·연료호스), 광섬유 cladding, 동축 케이블 절연체 — 모두 환형 다이를 통해 폴리머가 압출됩니다.</p>
          </div>
          <div className="concept-box amber">
            <h4>📐 좌표계</h4>
            <p>CCS (r, θ, z), 유동은 z방향, 축대칭. v_θ = v_r = 0, v_z = v_z(r).</p>
          </div>
        </div>
      </div>

      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">∂</span>NS-방정식 → log항 등장</div>
        <div className="math-block">
          η · (1/r) ∂/∂r [r ∂v_z/∂r] = ∂p/∂z = K₁  (압력은 z만의 함수)
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          두 번 적분 → v_z(r) = (K₁/4η) r² + K₂ log r + K₃. BC: v_z(r₁) = v_z(r₂) = 0.
        </p>
        <div className="math-block">
          <span className="highlight">{"v_z(r) = (1/4η)(−dp/dz) · [ (r₂² − r²) − ((r₂² − r₁²)/log(r₂/r₁)) · log(r₂/r) ]"}</span>
        </div>
        <div className="math-block">
          Q = π(r₂² − r₁²)/(8η) · (−dp/dz) · [ r₂² + r₁² − (r₂² − r₁²)/log(r₂/r₁) ]
        </div>
        <div className="concept-box amber">
          <h4>📝 수식 표기 주의</h4>
          <p>강의 슬라이드에는 동등한 다른 표기가 등장합니다. 표기의 핵심은 <strong>BC 두 개 (v(r₁)=v(r₂)=0)를 모두 만족하는 형태</strong>라는 점. log의 분모가 log(r₂/r₁)이든 log(r₁/r₂)이든, log 내부 인자(r/r₂ vs r₂/r)와 부호를 동시에 맞추면 결국 같은 v_z(r)가 됩니다. 위 Wilkes 형은 분모·분자 모두 양수라 부호 혼동이 적어 계산에 안전합니다.</p>
        </div>
        <div className="concept-box green">
          <h4>💡 비교: 직사각 평판 vs 환형</h4>
          <p>r₁ → 0 극한이면 통상의 원형관 Hagen–Poiseuille로 환원되지만 log항은 사라지지 않고 0/0 한계로 처리해야 합니다 (실제로는 r₁ → 0 시 안쪽 cylinder가 사라져 일반 pipe 결과가 됨).</p>
        </div>
      </div>

      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">📊</span>Interactive — Annular Velocity Profile</div>
        <AnnularProfileCanvas r1={r1} r2={r2} dpdz={dpdz} eta={eta} />
        <div className="ctrl-row">
          <label>
            r₁ (mm): <span className="val">{r1Mm}</span>
            <input type="range" min="1" max={Math.max(r2Mm - 1, 2)} step="0.5"
              value={r1Mm} onChange={(e) => setR1Mm(+e.target.value)} />
          </label>
          <label>
            r₂ (mm): <span className="val">{r2Mm}</span>
            <input type="range" min={r1Mm + 1} max="40" step="0.5"
              value={r2Mm} onChange={(e) => setR2Mm(+e.target.value)} />
          </label>
          <label>
            |dp/dz| (Pa/m): <span className="val">{dpPerL.toLocaleString()}</span>
            <input type="range" min="100" max="100000" step="100"
              value={dpPerL} onChange={(e) => setDpPerL(+e.target.value)} />
          </label>
          <label>
            η (Pa·s): <span className="val">{eta}</span>
            <input type="range" min="0.1" max="500" step="0.1"
              value={eta} onChange={(e) => setEta(+e.target.value)} />
          </label>
        </div>
        <div className="kpi-grid">
          <div className="kpi"><div className="lbl">Q (m³/s)</div><div className="val">{fmt(Q, 4)}</div></div>
          <div className="kpi amber"><div className="lbl">r* (max-v 위치)</div><div className="val">{(rStar * 1000).toFixed(2)} mm</div></div>
          <div className="kpi green"><div className="lbl">gap = r₂ − r₁</div><div className="val">{(r2Mm - r1Mm).toFixed(1)} mm</div></div>
          <div className="kpi"><div className="lbl">aspect r₁/r₂</div><div className="val">{(r1 / r2).toFixed(3)}</div></div>
        </div>
        <div className="concept-box purple">
          <h4>👀 관찰 포인트</h4>
          <p>• r* (최대 속도 위치)는 산술평균 (r₁+r₂)/2가 <strong>아닙니다</strong>. 기하평균에 가깝습니다.<br/>
          • r₁/r₂가 작아질수록 (즉 inner cylinder가 가늘어질수록) 프로파일은 일반 원형관 Poiseuille에 수렴.<br/>
          • r₁/r₂ → 1이면 두 평판 사이 슬릿(slit) 유동에 수렴.</p>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   TAB 5 — CONE-AND-PLATE RHEOMETER (SCS, Weissenberg)
   T = 4πηωR³ / { 3 sin²β [cot β + (sin β /2) log((1+cosβ)/(1−cosβ))] }
   For small β (typical): T ≈ 4πηωR³ / (3β)  →  η = 3βT / (4πωR³)
   ═════════════════════════════════════════════════════════ */
function ConePlateCanvas({ R, beta, omega, eta }) {
  const ref = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    let raf;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2 + 30;
      const Rpx = 160;

      // Plate (bottom)
      ctx.fillStyle = "rgba(100,116,139,0.5)";
      ctx.fillRect(cx - Rpx - 30, cy + 5, 2 * Rpx + 60, 18);
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1;
      ctx.strokeRect(cx - Rpx - 30, cy + 5, 2 * Rpx + 60, 18);
      // bottom shaft
      ctx.fillStyle = "rgba(100,116,139,0.5)";
      ctx.fillRect(cx - 10, cy + 23, 20, 50);

      // Liquid wedge (cone-plate gap, exaggerated angle for visibility)
      const visAngle = Math.max(beta * 4, 0.1);   // visualization scale
      const gapH = Rpx * Math.tan(visAngle);
      // Cone: triangle from (cx,cy − gapH) downward to (cx ± Rpx, cy)
      ctx.fillStyle = "rgba(96,165,250,0.18)";
      ctx.strokeStyle = "rgba(96,165,250,0.6)"; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - Rpx, cy + 5);
      ctx.lineTo(cx + Rpx, cy + 5);
      ctx.lineTo(cx, cy + 5 - gapH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cone (rigid blue)
      const coneTopY = cy - 60;
      ctx.fillStyle = "rgba(0,168,204,0.85)";
      ctx.beginPath();
      ctx.moveTo(cx - Rpx, cy + 5);
      ctx.lineTo(cx + Rpx, cy + 5);
      ctx.lineTo(cx + Rpx + 8, coneTopY);
      ctx.lineTo(cx - Rpx - 8, coneTopY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 1;
      ctx.stroke();

      // Top shaft + rotation indicator
      ctx.fillStyle = "rgba(0,168,204,0.85)";
      ctx.fillRect(cx - 10, coneTopY - 60, 20, 60);
      // rotating arrow on top
      phaseRef.current += omega * 0.015;
      ctx.save();
      ctx.translate(cx, coneTopY - 35);
      ctx.rotate(phaseRef.current);
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(0, 22);
      ctx.lineTo(-6, 16); ctx.lineTo(-6, 28);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      // Velocity field arrows in the gap (radial sample)
      const Nv = 8;
      for (let i = 1; i <= Nv; i++) {
        const r = (Rpx * i) / Nv;
        // physical surface speed at radius r is v = ω r ; show arrow length scaled
        const arrowLen = (omega * r) / (omega * Rpx + 1e-9) * 28;
        const yC = cy + 5 - (gapH * i) / Nv * 0.45;  // mid-height
        const xR = cx + r;
        ctx.strokeStyle = "rgba(245,158,11,0.85)"; ctx.fillStyle = "rgba(245,158,11,0.85)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(xR, yC); ctx.lineTo(xR, yC - arrowLen); ctx.stroke();
        if (arrowLen > 4) {
          ctx.beginPath();
          ctx.moveTo(xR, yC - arrowLen);
          ctx.lineTo(xR - 3, yC - arrowLen + 5);
          ctx.lineTo(xR + 3, yC - arrowLen + 5);
          ctx.closePath(); ctx.fill();
        }
        // mirror on left
        const xL = cx - r;
        ctx.beginPath();
        ctx.moveTo(xL, yC); ctx.lineTo(xL, yC + arrowLen); ctx.stroke();
        if (arrowLen > 4) {
          ctx.beginPath();
          ctx.moveTo(xL, yC + arrowLen);
          ctx.lineTo(xL - 3, yC + arrowLen - 5);
          ctx.lineTo(xL + 3, yC + arrowLen - 5);
          ctx.closePath(); ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
      ctx.fillText("R", cx + Rpx + 5, cy + 1);
      ctx.fillText("β", cx - Rpx + 18, cy);
      ctx.fillStyle = "#00d4ff";
      ctx.fillText("Cone (rotating)", cx - 50, coneTopY - 8);
      ctx.fillStyle = "#64748b";
      ctx.fillText("Plate (stationary)", cx - 55, cy + 40);
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(`ω = ${omega.toFixed(2)} rad/s`, 20, 30);
      ctx.fillText(`β = ${(beta * 180 / Math.PI).toFixed(2)}°`, 20, 48);
      ctx.fillText(`R = ${(R * 1000).toFixed(1)} mm`, 20, 66);
      ctx.fillText(`η = ${eta.toFixed(2)} Pa·s`, 20, 84);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [R, beta, omega, eta]);

  return (
    <div className="w9-canvas-wrap">
      <canvas ref={ref} width={680} height={340} />
    </div>
  );
}

function TabConePlate() {
  const [R_mm, setR_mm] = useState(25);            // mm
  const [betaDeg, setBetaDeg] = useState(2);       // ° (typical 1-4°)
  const [omega, setOmega] = useState(10);          // rad/s
  const [eta, setEta] = useState(1);               // Pa·s
  const [mode, setMode] = useState("torque");      // torque / viscosity
  const [Tmeasured, setTmeasured] = useState(0.001); // N·m (for inverse mode)

  const R = R_mm / 1000;
  const beta = (betaDeg * Math.PI) / 180;

  // Exact formula:  T = 4πηωR³ / [ 3 sin²β · ( cotβ + (sinβ/2) log((1+cosβ)/(1−cosβ)) ) ]
  const exactDenom = useMemo(() => {
    const cb = Math.cos(beta), sb = Math.sin(beta);
    const cot = cb / sb;
    const log_term = (sb / 2) * Math.log((1 + cb) / (1 - cb));
    return 3 * sb * sb * (cot + log_term);
  }, [beta]);

  const T_exact = (4 * Math.PI * eta * omega * R ** 3) / exactDenom;
  // Small-β approximation: T ≈ 2π η ω R³ / (3 β)
  // Small-β approximation: sin β → β, cot β → 1/β dominates the bracket
  //   T ≈ 4πηωR³·β / (3 sin²β) ≈ 4πηωR³ / (3β)
  const T_approx = (4 * Math.PI * eta * omega * R ** 3) / (3 * beta);
  const errPct = ((T_exact - T_approx) / T_exact) * 100;

  // Inverse: η from measured T
  const eta_inv = (Tmeasured * exactDenom) / (4 * Math.PI * omega * R ** 3);

  // Shear rate at the cone surface:
  // γ̇ = ω / β   (uniform over the entire gap — that's why CP is preferred)
  const shearRate = omega / beta;
  // Wall shear stress
  const tauWall = eta * shearRate;

  return (
    <div>
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">⚙</span>Cone-and-Plate Rheometer (Weissenberg)</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🎯 왜 Cone-Plate인가?</h4>
            <p>Gap이 r에 비례 (h = r tan β) → 전체 gap에서 shear rate γ̇ = ω/β가 <strong>균일</strong>합니다. 따라서 단일 측정으로 단일 γ̇에 대응하는 η를 얻을 수 있어 점도-전단속도 곡선 측정에 이상적.</p>
          </div>
          <div className="concept-box amber">
            <h4>📐 좌표계: Spherical (SCS)</h4>
            <p>(r, θ, φ). 회전 방향 = φ. 축대칭 + Δp = 0 + steady state → v_φ(r, θ) = ω r f(θ).</p>
          </div>
        </div>
      </div>

      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">∂</span>지배방정식 → 토크 공식</div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          NS-equation (φ-component, 모든 항이 0이 되어 결국):
        </p>
        <div className="math-block">
          ∂/∂r ( r² ∂v_φ/∂r ) + (1/sinθ) ∂/∂θ ( sinθ ∂v_φ/∂θ ) − v_φ/sin²θ = 0
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          v_φ = ωr·f(θ)로 separation, f를 풀고 BC 두 개 (cone surface θ=β: f=0; plate θ=π/2: f=1) 적용 → 토크:
        </p>
        <div className="math-block">
          <span className="highlight">{"T = 4πηωR³ / { 3 sin²β [ cot β + (sin β /2) log((1+cos β)/(1−cos β)) ] }"}</span>
        </div>
        <div className="math-block">
          소각 근사 (β &lt; ~5°):  T ≈ <span className="highlight">4π η ω R³ / (3β)</span>
        </div>
        <div className="concept-box green">
          <h4>📌 운영 원리</h4>
          <p>알려진 ω, β, R에서 토크 T를 측정하면 η를 역산: <span className="math-inline">η = 3βT / (4π ω R³)</span> (소각 근사).</p>
        </div>
      </div>

      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">📊</span>Interactive — Live Rheometer</div>
        <ConePlateCanvas R={R} beta={beta} omega={omega} eta={eta} />

        <div style={{ display: "inline-flex", gap: "0.25rem", padding: "0.25rem", background: "var(--navy3)", borderRadius: 6, marginBottom: "1rem" }}>
          <button className="coord-tab" onClick={() => setMode("torque")}
            style={{ background: mode === "torque" ? "var(--cyan2)" : "transparent", color: mode === "torque" ? "white" : "var(--text2)", border: "none", padding: "0.4rem 0.85rem", fontSize: "0.78rem", borderRadius: 4, cursor: "pointer" }}>
            Forward: η → T
          </button>
          <button className="coord-tab" onClick={() => setMode("viscosity")}
            style={{ background: mode === "viscosity" ? "var(--cyan2)" : "transparent", color: mode === "viscosity" ? "white" : "var(--text2)", border: "none", padding: "0.4rem 0.85rem", fontSize: "0.78rem", borderRadius: 4, cursor: "pointer" }}>
            Inverse: T → η
          </button>
        </div>

        <div className="ctrl-row">
          <label>
            R (mm): <span className="val">{R_mm}</span>
            <input type="range" min="5" max="60" step="1"
              value={R_mm} onChange={(e) => setR_mm(+e.target.value)} />
          </label>
          <label>
            β (deg): <span className="val">{betaDeg.toFixed(1)}</span>
            <input type="range" min="0.5" max="6" step="0.1"
              value={betaDeg} onChange={(e) => setBetaDeg(+e.target.value)} />
          </label>
          <label>
            ω (rad/s): <span className="val">{omega.toFixed(2)}</span>
            <input type="range" min="0.1" max="100" step="0.1"
              value={omega} onChange={(e) => setOmega(+e.target.value)} />
          </label>
          {mode === "torque" ? (
            <label>
              η (Pa·s): <span className="val">{eta.toFixed(2)}</span>
              <input type="range" min="0.001" max="100" step="0.001"
                value={eta} onChange={(e) => setEta(+e.target.value)} />
            </label>
          ) : (
            <label>
              T_measured (N·m): <span className="val">{Tmeasured.toExponential(2)}</span>
              <input type="range" min="0.00001" max="0.5" step="0.00001"
                value={Tmeasured} onChange={(e) => setTmeasured(+e.target.value)} />
            </label>
          )}
        </div>

        {mode === "torque" ? (
          <div className="kpi-grid">
            <div className="kpi"><div className="lbl">T (exact)</div><div className="val">{T_exact.toExponential(3)} N·m</div></div>
            <div className="kpi amber"><div className="lbl">T (small-β approx)</div><div className="val">{T_approx.toExponential(3)} N·m</div></div>
            <div className="kpi green"><div className="lbl">상대 오차</div><div className="val">{errPct.toFixed(2)} %</div></div>
            <div className="kpi"><div className="lbl">γ̇ = ω/β (uniform!)</div><div className="val">{shearRate.toFixed(1)} 1/s</div></div>
            <div className="kpi"><div className="lbl">τ_wall</div><div className="val">{tauWall.toFixed(2)} Pa</div></div>
          </div>
        ) : (
          <div className="kpi-grid">
            <div className="kpi green"><div className="lbl">η_inferred (역산)</div><div className="val">{eta_inv.toFixed(4)} Pa·s</div></div>
            <div className="kpi"><div className="lbl">γ̇ = ω/β</div><div className="val">{shearRate.toFixed(1)} 1/s</div></div>
            <div className="kpi amber"><div className="lbl">T_input</div><div className="val">{Tmeasured.toExponential(3)} N·m</div></div>
          </div>
        )}

        <div className="concept-box purple">
          <h4>🧪 실험 팁</h4>
          <p>• 일반적으로 β = 1°~4°. 너무 크면 균일 γ̇ 가정이 깨집니다.<br/>
          • R이 클수록 토크 분해능이 R³로 증가하지만, 시료가 더 많이 필요.<br/>
          • Newtonian 유체에서 ω를 sweep하면 T ∝ ω → η 일정. Non-Newtonian이면 곡선이 휘어집니다.</p>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   TAB 6 — QUIZ
   ═════════════════════════════════════════════════════════ */
const QUIZ = [
  {
    q: "두 평판 사이 압력구동 Poiseuille flow에서, 평균 속도 v_mean과 최대 속도 v_max의 관계는?",
    opts: ["v_mean = v_max", "v_mean = (1/2) v_max", "v_mean = (2/3) v_max", "v_mean = (3/4) v_max"],
    a: 2,
    why: "포물선 분포 vₓ(y) = v_max [1 − (y/d)²]를 −d~d 적분하여 (2d)로 나누면 (2/3) v_max.",
  },
  {
    q: "단위 폭당 부피유량 Q를 두 배로 늘리려면 (Δp, η, L 고정) 평판 간격 2d를 어떻게 바꿔야 하나?",
    opts: ["2배", "√2 ≈ 1.41배", "2^(1/3) ≈ 1.26배", "변화 불가"],
    a: 2,
    why: "Q = 2d³ Δp / (3ηL) 이므로 Q ∝ d³. Q 두 배 → d × 2^(1/3) ≈ 1.26.",
  },
  {
    q: "Inclined Film 문제에서 자유표면(y = δ)의 경계조건은?",
    opts: ["v_x = 0", "v_x = U", "τ_yx = η ∂v_x/∂y = 0", "p = ρgδ"],
    a: 2,
    why: "공기와 접하는 자유표면에서는 전단응력이 0 — 공기의 점성저항을 무시하기 때문.",
  },
  {
    q: "No-net-flow 조건 (Q = 0)에서의 임계 두께 δ는?",
    opts: ["δ = √(η U / ρg sinθ)", "δ = √(3η U / ρg sinθ)", "δ = (3η U / ρg sinθ)", "δ = ρg sinθ / 3η U"],
    a: 1,
    why: "Q = U δ − ρg sinθ δ³/(3η) = 0 → δ² = 3η U / (ρg sinθ).",
  },
  {
    q: "Annular die 유동에서 속도 분포에 log항이 등장하는 이유는?",
    opts: [
      "압력 분포가 비선형이기 때문",
      "원통좌표계의 div 연산자에 1/r 항이 있어 적분 시 log가 나오기 때문",
      "고분자가 비뉴턴이기 때문",
      "두 BC가 비대칭이기 때문",
    ],
    a: 1,
    why: "(1/r) d/dr(r dv_z/dr) = 일정 의 적분에서 v_z = (·) r² + (·) log r + (·)이 자연스럽게 나옵니다.",
  },
  {
    q: "Annular die에서 최대 속도 위치 r*는?",
    opts: ["산술평균 (r₁+r₂)/2", "기하평균 √(r₁r₂)", "√[(r₂² − r₁²) / (2 ln(r₂/r₁))]", "조화평균 2r₁r₂/(r₁+r₂)"],
    a: 2,
    why: "dv_z/dr = 0을 풀면 r*² = (r₂² − r₁²) / (2 ln(r₂/r₁)). 산술평균보다 작고 기하평균에 가깝습니다.",
  },
  {
    q: "Cone-and-plate rheometer가 viscosity 측정에 선호되는 핵심 이유는?",
    opts: [
      "측정 시료가 적게 필요해서",
      "전체 gap에 걸쳐 shear rate가 균일 (γ̇ = ω/β)하기 때문",
      "회전 속도가 빠르기 때문",
      "온도 제어가 쉬워서",
    ],
    a: 1,
    why: "Gap height h(r) = r tanβ가 r에 비례해 v_surface = ωr와 결합 → γ̇ = ωr/(r tanβ) ≈ ω/β. 균일.",
  },
  {
    q: "Cone-plate에서 소각 근사 토크 공식 T = 2πηωR³/(3β)에서, R을 두 배 늘리고 β를 절반으로 줄이면 T는?",
    opts: ["2배", "4배", "8배", "16배"],
    a: 3,
    why: "T ∝ R³/β. R³은 8배, 1/β는 2배 → 합쳐서 16배.",
  },
  {
    q: "Spin coating 박막 두께 시간진화 h(t) = h₀/√(1 + 4ρω²h₀²t/(3η))의 장기 점근 거동은?",
    opts: ["h ~ t^(−1)", "h ~ t^(−1/2)", "h ~ t^(−1/3)", "h ~ exp(−t)"],
    a: 1,
    why: "큰 t에서 분모 ~ √(t)이므로 h ~ t^(−1/2). 그래서 더 얇게 하려면 시간이 비효율적이고, ω를 키우는 게 효과적.",
  },
  {
    q: "점성 유동 (Re ≪ 1)에서 NS-방정식의 어느 항을 무시할 수 있나?",
    opts: [
      "압력 항 ∇p",
      "점성 항 η∇²v",
      "관성 항 ρ(v·∇)v",
      "중력 항 ρg",
    ],
    a: 2,
    why: "Re = ρUL/η는 inertia/viscous의 비. Re ≪ 1이면 inertia (관성) 항을 무시 → 선형 Stokes 방정식.",
  },
];

function TabQuiz() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState({});

  const cur = QUIZ[idx];
  const pct = ((idx + (selected !== null ? 1 : 0)) / QUIZ.length) * 100;

  const onPick = (i) => {
    if (selected !== null) return;
    setSelected(i);
    setAnswers((a) => ({ ...a, [idx]: i }));
    if (i === cur.a) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= QUIZ.length) { setDone(true); return; }
    setIdx((i) => i + 1);
    setSelected(null);
  };

  const reset = () => {
    setIdx(0); setSelected(null); setScore(0); setDone(false); setAnswers({});
  };

  if (done) {
    const ratio = score / QUIZ.length;
    return (
      <div className="w9-card">
        <div className="w9-card-title"><span className="icon">🎯</span>퀴즈 완료 — Quiz Complete</div>
        <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <div style={{ fontSize: "3rem", fontWeight: 700, color: ratio >= 0.8 ? "var(--green)" : ratio >= 0.5 ? "var(--amber)" : "var(--red)" }}>
            {score} / {QUIZ.length}
          </div>
          <div style={{ color: "var(--text2)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            {ratio >= 0.8 ? "🏆 훌륭합니다! Week 9 완전 정복!" :
             ratio >= 0.5 ? "👍 괜찮습니다. 틀린 문제를 다시 학습해 보세요." :
             "📖 강의자료를 다시 한 번 읽어보고 도전해보세요."}
          </div>
          <button className="btn primary" onClick={reset}>↺ 다시 풀기</button>
        </div>

        <div className="w9-div"></div>
        <h4 style={{ color: "var(--cyan)", marginBottom: "0.8rem" }}>응답 검토</h4>
        {QUIZ.map((q, i) => {
          const userPick = answers[i];
          const ok = userPick === q.a;
          return (
            <div key={i} className={`concept-box ${ok ? "green" : "red"}`}>
              <h4>Q{i + 1}. {ok ? "✓" : "✗"} {q.q}</h4>
              <p style={{ marginTop: "0.4rem" }}>
                <strong>당신의 답:</strong> {q.opts[userPick]}<br/>
                <strong>정답:</strong> {q.opts[q.a]}<br/>
                <em>{q.why}</em>
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w9-card">
      <div className="w9-card-title"><span className="icon">❓</span>자가평가 Quiz — Week 9</div>

      <div className="quiz-progress">
        <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>
          문항 {idx + 1} / {QUIZ.length}
        </span>
        <span className="pct">점수 {score} / {idx + (selected !== null ? 1 : 0)}</span>
      </div>
      <div className="quiz-bar">
        <div className="quiz-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="quiz-q">{cur.q}</div>
      {cur.opts.map((opt, i) => {
        const cls =
          selected === null
            ? "quiz-opt"
            : i === cur.a
            ? "quiz-opt correct disabled"
            : i === selected
            ? "quiz-opt wrong disabled"
            : "quiz-opt disabled";
        return (
          <button key={i} className={cls} onClick={() => onPick(i)}>
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        );
      })}

      {selected !== null && (
        <div className={`concept-box ${selected === cur.a ? "green" : "red"}`} style={{ marginTop: "1rem" }}>
          <h4>{selected === cur.a ? "✅ 정답!" : "❌ 오답"}</h4>
          <p>{cur.why}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", justifyContent: "flex-end" }}>
        {selected !== null && (
          <button className="btn primary" onClick={next}>
            {idx + 1 >= QUIZ.length ? "결과 보기 →" : "다음 →"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   ROOT
   ═════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview", label: "개요 Overview" },
  { id: "injection", label: "사출성형 (RCCS)" },
  { id: "inclined", label: "경사면 박막 (RCCS)" },
  { id: "annular", label: "환형 다이 (CCS)" },
  { id: "rheometer", label: "Cone-Plate (SCS)" },
  { id: "quiz", label: "퀴즈 Quiz" },
];

export default function Week9App() {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <style>{css}</style>
      <div className="w9-root">
        <div className="w9-header">
          <div className="w9-header-top">
            <span className="w9-week-badge">Week 09</span>
            <h1>Problems on the Viscous Flow</h1>
          </div>
          <p>점성유동 문제 풀이 · 직사각/환형/Cone-Plate 좌표계 · 폴리머 가공 응용 · Spin Coating</p>
        </div>

        <div className="w9-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`w9-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="w9-content">
          {tab === "overview" && <TabOverview />}
          {tab === "injection" && <TabInjection />}
          {tab === "inclined" && <TabInclined />}
          {tab === "annular" && <TabAnnular />}
          {tab === "rheometer" && <TabConePlate />}
          {tab === "quiz" && <TabQuiz />}
        </div>
      </div>
    </>
  );
}
