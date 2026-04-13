import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   DESIGN SYSTEM  (matches existing site palette)
   Deep navy + electric cyan + warm amber accent
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
  --text: #e2e8f0;
  --text2: #94a3b8;
  --text3: #64748b;
  --border: rgba(0,212,255,0.15);
  --border2: rgba(0,212,255,0.08);
  --glow: 0 0 20px rgba(0,212,255,0.25);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.w8-root {
  font-family: 'IBM Plex Sans KR', sans-serif;
  background: var(--navy);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
}

/* ── Header ── */
.w8-header {
  background: linear-gradient(135deg, var(--navy2) 0%, var(--navy3) 100%);
  border-bottom: 1px solid var(--border);
  padding: 2rem 2rem 1.5rem;
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(12px);
}
.w8-header-top {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;
}
.w8-week-badge {
  background: linear-gradient(135deg, var(--cyan3), var(--cyan2));
  color: white; font-weight: 700; font-size: 0.7rem; letter-spacing: 0.1em;
  padding: 0.3rem 0.7rem; border-radius: 4px; text-transform: uppercase;
}
.w8-header h1 {
  font-size: 1.25rem; font-weight: 700; color: var(--text);
}
.w8-header p { color: var(--text2); font-size: 0.85rem; }

/* ── Tab navigation ── */
.w8-tabs {
  display: flex; gap: 0.25rem; padding: 0 2rem;
  border-bottom: 1px solid var(--border2);
  background: var(--navy2);
  overflow-x: auto;
}
.w8-tab {
  padding: 0.75rem 1.25rem; font-size: 0.82rem; font-weight: 500;
  color: var(--text3); border: none; background: none; cursor: pointer;
  border-bottom: 2px solid transparent; transition: all 0.2s;
  white-space: nowrap; font-family: 'IBM Plex Sans KR', sans-serif;
}
.w8-tab:hover { color: var(--text2); }
.w8-tab.active { color: var(--cyan); border-bottom-color: var(--cyan); }

/* ── Main content ── */
.w8-content { padding: 2rem; max-width: 1100px; margin: 0 auto; }

/* ── Section card ── */
.w8-card {
  background: var(--navy2); border: 1px solid var(--border2);
  border-radius: 12px; padding: 1.75rem; margin-bottom: 1.5rem;
}
.w8-card-title {
  font-size: 1rem; font-weight: 700; color: var(--cyan);
  margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.6rem;
  padding-bottom: 0.75rem; border-bottom: 1px solid var(--border2);
}
.w8-card-title .icon {
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
.concept-box.amber { border-left-color: var(--amber); }
.concept-box.green { border-left-color: var(--green); }
.concept-box.red { border-left-color: var(--red); }
.concept-box h4 {
  font-size: 0.82rem; font-weight: 600; color: var(--cyan);
  margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.06em;
}
.concept-box.amber h4 { color: var(--amber); }
.concept-box.green h4 { color: var(--green); }
.concept-box.red h4 { color: var(--red); }
.concept-box p { font-size: 0.88rem; color: var(--text2); line-height: 1.7; }

/* ── Math display ── */
.math-block {
  background: var(--navy); border: 1px solid var(--border);
  border-radius: 8px; padding: 1rem 1.5rem; margin: 0.75rem 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.88rem; color: var(--cyan2);
  overflow-x: auto;
}
.math-block .comment { color: var(--text3); font-style: italic; }
.math-block .highlight { color: var(--amber); font-weight: 600; }
.math-block .green { color: var(--green); }
.math-block .red { color: var(--red); }

/* ── Equation label ── */
.eq-label {
  display: inline-block; background: rgba(0,212,255,0.1);
  border: 1px solid rgba(0,212,255,0.3); border-radius: 4px;
  padding: 0.15rem 0.5rem; font-size: 0.72rem; font-weight: 600;
  color: var(--cyan); margin-right: 0.5rem; letter-spacing: 0.05em;
}

/* ── Canvas container ── */
.canvas-wrap {
  background: var(--navy); border: 1px solid var(--border);
  border-radius: 10px; overflow: hidden; position: relative;
}
.canvas-wrap canvas { display: block; }
.canvas-label {
  position: absolute; top: 10px; left: 12px;
  font-size: 0.72rem; color: var(--text3); font-family: 'IBM Plex Mono';
}

/* ── Control row ── */
.ctrl-row {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  margin-top: 1rem;
}
.ctrl-group { display: flex; align-items: center; gap: 0.5rem; }
.ctrl-group label { font-size: 0.78rem; color: var(--text2); white-space: nowrap; }
.ctrl-group input[type=range] {
  accent-color: var(--cyan); cursor: pointer;
}
.ctrl-group span { font-family: 'IBM Plex Mono'; font-size: 0.78rem; color: var(--cyan); min-width: 3ch; }

/* ── Buttons ── */
.btn {
  padding: 0.45rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; border: none; transition: all 0.15s;
  font-family: 'IBM Plex Sans KR', sans-serif;
}
.btn-cyan { background: rgba(0,212,255,0.15); color: var(--cyan); border: 1px solid rgba(0,212,255,0.3); }
.btn-cyan:hover { background: rgba(0,212,255,0.25); }
.btn-amber { background: rgba(245,158,11,0.15); color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }
.btn-amber:hover { background: rgba(245,158,11,0.25); }
.btn-green { background: rgba(16,185,129,0.15); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }

/* ── Stress tensor grid ── */
.tensor-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
  max-width: 380px; margin: 1rem auto;
}
.tensor-cell {
  background: var(--navy3); border: 1px solid var(--border2);
  border-radius: 6px; padding: 0.6rem 0.5rem; text-align: center;
  cursor: pointer; transition: all 0.2s; position: relative;
}
.tensor-cell:hover { border-color: var(--cyan); background: rgba(0,212,255,0.08); }
.tensor-cell.normal { border-color: rgba(245,158,11,0.4); }
.tensor-cell.shear { border-color: rgba(0,212,255,0.4); }
.tensor-cell.selected { background: rgba(0,212,255,0.15); border-color: var(--cyan); box-shadow: var(--glow); }
.tensor-cell .sym { font-size: 0.78rem; color: var(--text3); margin-bottom: 0.2rem; }
.tensor-cell .val { font-family: 'IBM Plex Mono'; font-size: 0.8rem; color: var(--text2); }
.tensor-cell.normal .val { color: var(--amber); }
.tensor-cell.shear .val { color: var(--cyan2); }

/* ── Coord system tabs ── */
.coord-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.coord-tab {
  padding: 0.4rem 0.9rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600;
  cursor: pointer; border: 1px solid var(--border); background: transparent;
  color: var(--text3); transition: all 0.15s; font-family: 'IBM Plex Sans KR';
}
.coord-tab.active { background: rgba(0,212,255,0.15); color: var(--cyan); border-color: rgba(0,212,255,0.4); }

/* ── Info tooltip ── */
.info-popup {
  background: var(--navy3); border: 1px solid var(--border);
  border-radius: 8px; padding: 1rem; margin-top: 0.75rem;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

/* ── Step-by-step derivation ── */
.deriv-step {
  display: flex; gap: 1rem; padding: 0.75rem 0;
  border-bottom: 1px solid var(--border2);
  animation: fadeIn 0.3s ease;
}
.deriv-step:last-child { border-bottom: none; }
.step-num {
  width: 28px; height: 28px; min-width: 28px;
  background: rgba(0,212,255,0.12); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; color: var(--cyan);
}
.step-content p { font-size: 0.85rem; color: var(--text2); margin-bottom: 0.4rem; }
.step-content .step-eq { font-family: 'IBM Plex Mono'; font-size: 0.82rem; color: var(--cyan2); }

/* ── Quiz ── */
.quiz-q { font-size: 0.92rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.6; }
.quiz-opts { display: flex; flex-direction: column; gap: 0.5rem; }
.quiz-opt {
  padding: 0.7rem 1rem; border-radius: 8px; border: 1px solid var(--border);
  background: var(--navy3); cursor: pointer; font-size: 0.85rem;
  transition: all 0.15s; text-align: left; color: var(--text2);
  font-family: 'IBM Plex Sans KR';
}
.quiz-opt:hover { border-color: var(--cyan2); color: var(--text); }
.quiz-opt.correct { border-color: var(--green); background: rgba(16,185,129,0.1); color: var(--green); }
.quiz-opt.wrong { border-color: var(--red); background: rgba(239,68,68,0.1); color: var(--red); }
.quiz-feedback { margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; }
.quiz-feedback.correct { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: var(--green); }
.quiz-feedback.wrong { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; }
.quiz-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
.quiz-progress { font-size: 0.78rem; color: var(--text3); }

/* ── NS equation display ── */
.ns-eq { padding: 0.4rem 0; }
.ns-term { 
  display: inline-block; padding: 0.15rem 0.4rem; margin: 0.15rem;
  border-radius: 4px; font-family: 'IBM Plex Mono'; font-size: 0.82rem;
  transition: all 0.2s; cursor: pointer;
}
.ns-term.inertia { background: rgba(0,212,255,0.12); color: var(--cyan2); }
.ns-term.pressure { background: rgba(245,158,11,0.12); color: var(--amber); }
.ns-term.viscous { background: rgba(16,185,129,0.12); color: var(--green); }
.ns-term.gravity { background: rgba(139,92,246,0.12); color: #a78bfa; }
.ns-term.selected { transform: scale(1.05); box-shadow: 0 0 10px currentColor; }
.term-legend { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.75rem; }
.legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--text2); }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; }

/* ── Divider ── */
.section-divider { height: 1px; background: var(--border2); margin: 1.5rem 0; }

/* ── Tag ── */
.tag {
  display: inline-block; padding: 0.2rem 0.6rem;
  border-radius: 999px; font-size: 0.72rem; font-weight: 600;
  background: rgba(0,212,255,0.1); color: var(--cyan2);
  border: 1px solid rgba(0,212,255,0.2);
}
.tag.amber { background: rgba(245,158,11,0.1); color: var(--amber2); border-color: rgba(245,158,11,0.2); }

/* ── Two-col grid ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 680px) { .grid-2 { grid-template-columns: 1fr; } }

/* ── Continuity viz ── */
.flux-box {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--navy); border: 1px solid var(--border);
  border-radius: 10px; padding: 1rem 1.5rem; gap: 1rem;
  font-size: 0.82rem; font-family: 'IBM Plex Mono';
}
.flux-arrow { color: var(--cyan); font-size: 1.5rem; }
.flux-in { color: var(--green); }
.flux-out { color: var(--amber); }
`;

/* ═══════════════════════════════════════════════
   LORENZ ATTRACTOR CANVAS
═══════════════════════════════════════════════ */
function LorenzCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(2.67);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({ x: 1, y: 1, z: 1, pts: [], running: true });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const st = stateRef.current;
    const dt = 0.005;

    // integrate
    const { x, y, z } = st;
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    st.x += dx; st.y += dy; st.z += dz;

    // project: use x-z plane
    const cx = W / 2, cy = H / 2 + 30;
    const scale = 7;
    const px = cx + st.x * scale;
    const py = cy - (st.z - 25) * scale;

    st.pts.push([px, py]);
    if (st.pts.length > 3000) st.pts.shift();

    // fade trail
    ctx.fillStyle = "rgba(10,14,26,0.04)";
    ctx.fillRect(0, 0, W, H);

    // draw trail
    if (st.pts.length > 2) {
      for (let i = Math.max(0, st.pts.length - 200); i < st.pts.length - 1; i++) {
        const alpha = (i - (st.pts.length - 200)) / 200;
        const hue = 180 + st.pts[i][0] / W * 60;
        ctx.strokeStyle = `hsla(${hue},90%,60%,${alpha * 0.9})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(st.pts[i][0], st.pts[i][1]);
        ctx.lineTo(st.pts[i + 1][0], st.pts[i + 1][1]);
        ctx.stroke();
      }
    }

    if (st.running) animRef.current = requestAnimationFrame(draw);
  }, [sigma, rho, beta]);

  useEffect(() => {
    stateRef.current.running = running;
    if (running) { animRef.current = requestAnimationFrame(draw); }
    else { cancelAnimationFrame(animRef.current); }
    return () => cancelAnimationFrame(animRef.current);
  }, [running, draw]);

  const reset = () => {
    stateRef.current = { x: 0.1 + Math.random() * 2, y: 0.1, z: 1, pts: [], running };
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(10,14,26,1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div>
      <div className="canvas-wrap">
        <span className="canvas-label">Lorenz Attractor — x-z projection</span>
        <canvas ref={canvasRef} width={560} height={360} style={{ width: "100%", background: "#0a0e1a" }} />
      </div>
      <div className="ctrl-row">
        <div className="ctrl-group">
          <label>σ (Prandtl)</label>
          <input type="range" min="5" max="20" step="0.5" value={sigma}
            onChange={e => { setSigma(+e.target.value); reset(); }} />
          <span>{sigma}</span>
        </div>
        <div className="ctrl-group">
          <label>r (Rayleigh)</label>
          <input type="range" min="20" max="40" step="0.5" value={rho}
            onChange={e => { setRho(+e.target.value); reset(); }} />
          <span>{rho}</span>
        </div>
        <div className="ctrl-group">
          <label>b (aspect)</label>
          <input type="range" min="1" max="5" step="0.1" value={beta}
            onChange={e => { setBeta(+e.target.value); reset(); }} />
          <span>{beta}</span>
        </div>
        <button className="btn btn-cyan" onClick={() => setRunning(r => !r)}>
          {running ? "⏸ Pause" : "▶ Resume"}
        </button>
        <button className="btn btn-amber" onClick={reset}>↺ Reset</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1 — OVERVIEW & GOVERNING EQUATIONS
═══════════════════════════════════════════════ */
function TabOverview() {
  const [showAll, setShowAll] = useState(false);
  return (
    <div>
      {/* Governing equations */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">∂</span>유체역학의 지배방정식 Governing Equations</div>
        <p style={{ fontSize: "0.87rem", color: "var(--text2)", marginBottom: "1rem" }}>
          유체의 운동을 기술하는 세 가지 핵심 방정식 — 이들의 결합은 날씨 예측부터 반도체 공정까지 모든 유체 문제를 지배합니다.
        </p>
        <div className="grid-2">
          <div>
            <div className="concept-box">
              <h4>⚡ Navier-Stokes Equation</h4>
              <div className="math-block">
                ρ(<span className="highlight">∂u/∂t</span> + u·∇u) =<br />
                −∇p + μΔu + ρg
              </div>
              <p>운동량 보존 (Newton 2nd Law in fluid)</p>
            </div>
            <div className="concept-box amber">
              <h4>📦 Continuity Equation</h4>
              <div className="math-block">
                <span className="highlight">∂ρ/∂t</span> + ∇·(ρu) = 0
              </div>
              <p>질량 보존. 비압축성 유체: ∇·u = 0</p>
            </div>
            <div className="concept-box green">
              <h4>🌡 Heat Equation</h4>
              <div className="math-block">
                <span className="green">∂T/∂t</span> + u·∇T = κΔT
              </div>
              <p>에너지 보존 (온도장 대류-확산)</p>
            </div>
          </div>
          <div>
            <div className="concept-box red">
              <h4>🏆 Millennium Problem</h4>
              <p>Navier-Stokes 방정식은 Clay Mathematics Institute의 7대 밀레니엄 문제 중 하나입니다. 일반해의 존재 여부조차 아직 증명되지 않았습니다.</p>
            </div>
            <div className="concept-box">
              <h4>💻 CFD Solution</h4>
              <p>수치해석(CFD)을 통해 근사해를 구합니다. Disney의 애니메이션 눈/물 시뮬레이션, 날씨 예보, 반도체 공정 모두 같은 방정식을 사용합니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chaos & Lorenz */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">🦋</span>Chaos & Lorenz Attractor</div>
        <div className="concept-box">
          <h4>왜 내일 날씨 예측이 어려운가?</h4>
          <p>기후 시스템은 비선형 결합 카오스 시스템입니다. 초기 조건의 미세한 차이가 시간이 지남에 따라 지수적으로 증폭됩니다 (나비 효과).</p>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <span className="eq-label">σ</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>Prandtl number (점성 × 온도 정보)</span>
            <span className="eq-label" style={{ marginLeft: "1rem" }}>r</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>Rayleigh number = Pr × Gr (부력/관성)</span>
            <span className="eq-label" style={{ marginLeft: "1rem" }}>b</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>종횡비 (aspect ratio)</span>
          </div>
          <div className="math-block">
            ẋ = σ(y − x)<br />
            ẏ = <span className="highlight">r</span>x − y − xz<br />
            ż = xy − <span className="highlight">b</span>z,   σ, r, b &gt; 0
          </div>
        </div>
        <LorenzCanvas />
        <p style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: "0.75rem", textAlign: "center" }}>
          E. N. Lorenz, "Deterministic nonperiodic flow", J. Atmos. Sci. 20(2), 130–141 (1963)
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2 — CONTINUITY EQUATION DERIVATION
═══════════════════════════════════════════════ */
function TabContinuity() {
  const [step, setStep] = useState(0);
  const [animVal, setAnimVal] = useState(0.5);

  useEffect(() => {
    let frame;
    let t = 0;
    const animate = () => {
      t += 0.03;
      setAnimVal(0.5 + 0.3 * Math.sin(t));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const steps = [
    {
      title: "미소 검사체적 (Infinitesimal Control Volume)",
      desc: "크기 dx·dy·dz인 미소 직육면체를 설정합니다. 이 검사체적을 통해 질량이 들어오고 나갑니다.",
      eq: "dV = dx · dy · dz",
    },
    {
      title: "x-방향 질량 유속 (Mass Flux in x-direction)",
      desc: "x 면에서 들어오는 질량 유속과 나가는 질량 유속의 차이를 계산합니다.",
      eq: "Net flux (x) = ∂(ρvₓ)/∂x · dxdydz",
    },
    {
      title: "3방향 전체 순 유출 (Total Net Outflow)",
      desc: "x, y, z 방향을 모두 합산하면 발산 연산자(∇·)를 이용해 표현됩니다.",
      eq: "Total = ∇·(ρv) · dV",
    },
    {
      title: "질량 균형 적용 (Mass Balance)",
      desc: "검사체적 내 질량 감소율 = 순 유출 질량률",
      eq: "−∇·(ρv)dV = ∂(ρdV)/∂t = dV·∂ρ/∂t",
    },
    {
      title: "연속방정식 완성 (Continuity Equation)",
      desc: "정리하면 연속방정식을 얻습니다.",
      eq: "∂ρ/∂t + ∇·(ρv) = 0   ← General\nDρ/Dt + ρ∇·v = 0   ← Convective form",
    },
    {
      title: "비압축성 유체 특수형 (Incompressible Fluid)",
      desc: "밀도가 일정하면 Dρ/Dt = 0이 되어 속도의 발산이 0이 됩니다.",
      eq: "∇·v = 0   (incompressible)",
    },
  ];

  return (
    <div>
      {/* Animated flux visualization */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">📦</span>질량 유속 시각화 (Mass Flux Visualization)</div>
        <div className="flux-box">
          <div className="flux-in">
            ρvₓ · dydz<br />
            <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>in-flux (x-face)</span><br />
            <span style={{ fontSize: "1.1rem" }}>{(animVal * 5).toFixed(2)} kg/s</span>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div className="flux-arrow">→ [dV] →</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text3)" }}>dx·dy·dz</div>
            <div style={{ fontSize: "0.8rem", color: "var(--cyan2)", marginTop: "0.3rem" }}>
              Δflux = {((animVal * 5 * 1.15 - animVal * 5) * 1).toFixed(3)} kg/s
            </div>
          </div>
          <div className="flux-out" style={{ textAlign: "right" }}>
            (ρvₓ + ∂(ρvₓ)/∂x·dx)·dydz<br />
            <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>out-flux (x-face)</span><br />
            <span style={{ fontSize: "1.1rem" }}>{(animVal * 5 * 1.15).toFixed(2)} kg/s</span>
          </div>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: "0.6rem", textAlign: "center" }}>
          ← 실시간 애니메이션: 유속 변화에 따른 순 유출 질량 →
        </p>
      </div>

      {/* Step-by-step derivation */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">📐</span>연속방정식 단계별 유도 Step-by-Step Derivation</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {steps.map((s, i) => (
            <button key={i}
              className={`btn ${i === step ? "btn-cyan" : "btn-amber"}`}
              style={{ opacity: i <= step ? 1 : 0.4 }}
              onClick={() => setStep(i)}>
              Step {i + 1}
            </button>
          ))}
        </div>
        <div className="deriv-step">
          <div className="step-num">{step + 1}</div>
          <div className="step-content">
            <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
              {steps[step].title}
            </p>
            <p>{steps[step].desc}</p>
            <div className="math-block step-eq" style={{ marginTop: "0.5rem" }}>
              {steps[step].eq}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
          <button className="btn btn-cyan" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Prev</button>
          <span style={{ fontSize: "0.8rem", color: "var(--text3)" }}>{step + 1} / {steps.length}</span>
          <button className="btn btn-cyan" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>Next →</button>
        </div>
      </div>

      {/* Summary */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">📋</span>연속방정식 요약</div>
        <div className="grid-2">
          <div>
            <div className="concept-box">
              <h4>전파형 (General Form)</h4>
              <div className="math-block">∂ρ/∂t + ∇·(ρ<span className="highlight">v</span>) = 0</div>
              <p>압축성 유체 포함. 밀도 ρ는 위치 및 시간의 함수</p>
            </div>
            <div className="concept-box amber">
              <h4>대류 미분형 (Convective Form)</h4>
              <div className="math-block">Dρ/Dt + ρ∇·<span className="highlight">v</span> = 0</div>
              <p>D/Dt = ∂/∂t + v·∇ (Lagrangian vs Eulerian)</p>
            </div>
          </div>
          <div>
            <div className="concept-box green">
              <h4>비압축성 (Incompressible)</h4>
              <div className="math-block">∇·<span className="green">v</span> = 0<br />
                즉: ∂vₓ/∂x + ∂vy/∂y + ∂vz/∂z = 0</div>
              <p>액체, 저속 기체 등에 적용. 속도장의 발산이 0</p>
            </div>
            <div className="concept-box">
              <h4>물리적 의미</h4>
              <p>검사체적에서 나가는 질량 = 검사체적 내 질량 감소율. 질량은 생성되거나 소멸하지 않는다는 질량 보존 법칙의 미분 표현.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3 — STRESS TENSOR & N-S EQUATION
═══════════════════════════════════════════════ */
function TabMomentum() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [coord, setCoord] = useState("rectangular");
  const [selectedTerm, setSelectedTerm] = useState(null);

  const tensorInfo = {
    "σxx": { type: "normal", label: "σxx", expr: "−p + 2μ(∂vₓ/∂x) − (2/3)μ∇·v", desc: "x-면 법선 응력. 수압 + 점성 기여. 비압축성 → −p + 2μ(∂vₓ/∂x)" },
    "τxy": { type: "shear", label: "τxy = τyx", expr: "μ(∂vₓ/∂y + ∂vy/∂x)", desc: "x-면에 y-방향으로 작용하는 전단응력. 속도 기울기의 합으로 표현됨" },
    "τxz": { type: "shear", label: "τxz = τzx", expr: "μ(∂vₓ/∂z + ∂vz/∂x)", desc: "x-면에 z-방향으로 작용하는 전단응력" },
    "τyx": { type: "shear", label: "τyx = τxy", expr: "μ(∂vy/∂x + ∂vₓ/∂y)", desc: "y-면에 x-방향으로 작용하는 전단응력. τxy = τyx (대칭 텐서)" },
    "σyy": { type: "normal", label: "σyy", expr: "−p + 2μ(∂vy/∂y) − (2/3)μ∇·v", desc: "y-면 법선 응력" },
    "τyz": { type: "shear", label: "τyz = τzy", expr: "μ(∂vy/∂z + ∂vz/∂y)", desc: "y-면에 z-방향으로 작용하는 전단응력" },
    "τzx": { type: "shear", label: "τzx = τxz", expr: "μ(∂vz/∂x + ∂vₓ/∂z)", desc: "z-면에 x-방향으로 작용하는 전단응력" },
    "τzy": { type: "shear", label: "τzy = τyz", expr: "μ(∂vz/∂y + ∂vy/∂z)", desc: "z-면에 y-방향으로 작용하는 전단응력" },
    "σzz": { type: "normal", label: "σzz", expr: "−p + 2μ(∂vz/∂z) − (2/3)μ∇·v", desc: "z-면 법선 응력" },
  };

  const tensorKeys = ["σxx", "τxy", "τxz", "τyx", "σyy", "τyz", "τzx", "τzy", "σzz"];

  const nsTerms = {
    rectangular: [
      { id: "inertia", text: "ρ(∂vₓ/∂t + vₓ∂vₓ/∂x + ...)", class: "inertia", label: "관성력 (Inertia)" },
      { id: "pressure", text: "−∂p/∂x", class: "pressure", label: "압력 기울기 (Pressure Gradient)" },
      { id: "viscous", text: "μ∇²vₓ", class: "viscous", label: "점성력 (Viscous Force)" },
      { id: "gravity", text: "ρgₓ", class: "gravity", label: "중력 (Gravity)" },
    ],
  };

  const coordNS = {
    rectangular: {
      name: "직교 좌표 (RCCS)",
      eqs: [
        "x: ρ(Dvₓ/Dt) = −∂p/∂x + μ∇²vₓ + ρgₓ",
        "y: ρ(Dvy/Dt) = −∂p/∂y + μ∇²vy + ρgy",
        "z: ρ(Dvz/Dt) = −∂p/∂z + μ∇²vz + ρgz",
      ],
    },
    cylindrical: {
      name: "원통 좌표 (CCS)",
      eqs: [
        "r: ρ(∂vᵣ/∂t + vᵣ∂vᵣ/∂r + vθ/r·∂vᵣ/∂θ − vθ²/r + vz∂vᵣ/∂z) = −∂p/∂r + μ[...]+ ρgᵣ",
        "θ: ρ(∂vθ/∂t + vᵣ∂vθ/∂r + vθ/r·∂vθ/∂θ + vᵣvθ/r + vz∂vθ/∂z) = −1/r·∂p/∂θ + μ[...] + ρgθ",
        "z: ρ(∂vz/∂t + vᵣ∂vz/∂r + vθ/r·∂vz/∂θ + vz∂vz/∂z) = −∂p/∂z + μ[1/r·∂/∂r(r∂vz/∂r) + ...] + ρgz",
      ],
    },
    spherical: {
      name: "구면 좌표 (SCS)",
      eqs: [
        "r: ρ(∂vᵣ/∂t + vᵣ∂vᵣ/∂r + ... − (vθ²+vφ²)/r) = −∂p/∂r + μ[...] + ρgᵣ",
        "θ: ρ(∂vθ/∂t + ... + vᵣvθ/r − vφ²cotθ/r) = −1/r·∂p/∂θ + μ[...] + ρgθ",
        "φ: ρ(∂vφ/∂t + ... + vφvᵣ/r + vθvφcotθ/r) = −1/(r sinθ)·∂p/∂φ + μ[...] + ρgφ",
      ],
    },
  };

  return (
    <div>
      {/* Stress tensor */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">⚡</span>응력 텐서 Interactive Stress Tensor</div>
        <p style={{ fontSize: "0.87rem", color: "var(--text2)", marginBottom: "1rem" }}>
          아래 텐서 요소를 클릭하면 해당 응력의 식과 물리적 의미를 확인할 수 있습니다.
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--text2)" }}>
                <div style={{ width: 12, height: 12, background: "rgba(245,158,11,0.3)", border: "1px solid rgba(245,158,11,0.6)", borderRadius: 3 }} />
                법선응력 (Normal)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--text2)" }}>
                <div style={{ width: 12, height: 12, background: "rgba(0,212,255,0.2)", border: "1px solid rgba(0,212,255,0.4)", borderRadius: 3 }} />
                전단응력 (Shear)
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text3)", marginBottom: "0.3rem" }}>τ =</div>
            <div className="tensor-grid">
              {tensorKeys.map(key => {
                const info = tensorInfo[key];
                return (
                  <div key={key}
                    className={`tensor-cell ${info.type} ${selectedCell === key ? "selected" : ""}`}
                    onClick={() => setSelectedCell(selectedCell === key ? null : key)}>
                    <div className="sym">{info.label.split("=")[0].trim()}</div>
                    <div className="val">{info.type === "normal" ? "σ" : "τ"}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            {selectedCell ? (
              <div className="info-popup">
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--cyan)", marginBottom: "0.5rem" }}>
                  {tensorInfo[selectedCell].label}
                </div>
                <div className="math-block" style={{ marginBottom: "0.6rem" }}>
                  {tensorInfo[selectedCell].expr}
                </div>
                <p style={{ fontSize: "0.83rem", color: "var(--text2)" }}>{tensorInfo[selectedCell].desc}</p>
                {tensorInfo[selectedCell].type === "normal" && (
                  <p style={{ fontSize: "0.78rem", color: "var(--amber)", marginTop: "0.5rem" }}>
                    💡 비압축성 유체: σᵢᵢ = −p + 2μ(∂vᵢ/∂xᵢ)
                  </p>
                )}
              </div>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem", background: "var(--navy3)", borderRadius: 8 }}>
                텐서 요소를 클릭하면<br />상세 정보가 나타납니다
              </div>
            )}
            <div className="concept-box" style={{ marginTop: "0.75rem" }}>
              <h4>대칭 텐서 (Symmetric Tensor)</h4>
              <p>τᵢⱼ = τⱼᵢ — 응력 텐서는 대칭입니다. 즉 τxy = τyx, τyz = τzy, τzx = τxz. 독립 성분은 9개가 아닌 6개입니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* NS equation by coordinate */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">🔄</span>좌표계별 Navier-Stokes 방정식</div>
        <div className="coord-tabs">
          {Object.entries(coordNS).map(([key, val]) => (
            <button key={key} className={`coord-tab ${coord === key ? "active" : ""}`}
              onClick={() => setCoord(key)}>{val.name}</button>
          ))}
        </div>
        <div>
          {coordNS[coord].eqs.map((eq, i) => (
            <div key={i} className="math-block" style={{ marginBottom: "0.5rem", fontSize: "0.78rem" }}>
              {eq}
            </div>
          ))}
        </div>

        {coord === "rectangular" && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: "0.75rem" }}>항별 물리적 의미를 클릭하여 확인:</p>
            <div className="ns-eq">
              {[
                { cls: "inertia", text: "ρ·Dv/Dt", label: "관성력" },
                { cls: "pressure", text: "= −∇p", label: "압력 기울기" },
                { cls: "viscous", text: "+ μ∇²v", label: "점성 확산" },
                { cls: "gravity", text: "+ ρg", label: "중력" },
              ].map(t => (
                <span key={t.label}
                  className={`ns-term ${t.cls} ${selectedTerm === t.label ? "selected" : ""}`}
                  onClick={() => setSelectedTerm(selectedTerm === t.label ? null : t.label)}>
                  {t.text}
                </span>
              ))}
            </div>
            {selectedTerm && (
              <div className="info-popup">
                {selectedTerm === "관성력" && <p style={{ fontSize: "0.85rem", color: "var(--text2)" }}>유체 입자의 운동량 변화율. 로컬 가속(∂v/∂t)과 대류 가속(v·∇v)으로 구성. 비선형성의 원천.</p>}
                {selectedTerm === "압력 기울기" && <p style={{ fontSize: "0.85rem", color: "var(--text2)" }}>압력 차이에 의한 힘. 유동을 유발하는 주요 원동력.</p>}
                {selectedTerm === "점성 확산" && <p style={{ fontSize: "0.85rem", color: "var(--text2)" }}>점성에 의한 운동량 확산. μ∇²v = μ(∂²v/∂x² + ∂²v/∂y² + ∂²v/∂z²). 라플라시안 연산자.</p>}
                {selectedTerm === "중력" && <p style={{ fontSize: "0.85rem", color: "var(--text2)" }}>중력에 의한 체적력. 밀도 성층화, 자연 대류의 원인.</p>}
              </div>
            )}
            <div className="term-legend">
              {[
                { cls: "inertia", label: "관성" },
                { cls: "pressure", label: "압력" },
                { cls: "viscous", label: "점성" },
                { cls: "gravity", label: "중력" },
              ].map(t => (
                <div key={t.label} className="legend-item">
                  <div className="legend-dot" style={{
                    background: t.cls === "inertia" ? "rgba(0,212,255,0.4)" :
                      t.cls === "pressure" ? "rgba(245,158,11,0.4)" :
                        t.cls === "viscous" ? "rgba(16,185,129,0.4)" : "rgba(139,92,246,0.4)"
                  }} />
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Derivation summary */}
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">🔗</span>운동량 균형 유도 요약</div>
        <div className="grid-2">
          <div>
            <div className="concept-box">
              <h4>Newton 2nd Law (for fluid)</h4>
              <div className="math-block">d(mass) · Dv/Dt<br />= Surface forces + Body forces</div>
              <p>질량 × 가속도 = 표면력 + 체적력</p>
            </div>
            <div className="concept-box amber">
              <h4>Newtonian Fluid Constitutive Relation</h4>
              <div className="math-block">τᵢⱼ = μ(∂vᵢ/∂xⱼ + ∂vⱼ/∂xᵢ)</div>
              <p>전단응력 ∝ 변형률 속도 (Strain rate). μ: 동점성 계수 [Pa·s]</p>
            </div>
          </div>
          <div>
            <div className="concept-box green">
              <h4>Incompressible N-S (Final Form)</h4>
              <div className="math-block">ρ<span className="green">Dv/Dt</span> = −∇p + μ∇²<span className="green">v</span> + ρg</div>
              <p>비압축성 ∇·v = 0 조건 적용 시. 연속방정식과 함께 4개 미지수(vₓ, vy, vz, p) 결정</p>
            </div>
            <div className="concept-box">
              <h4>Hooke's Law vs Newton's Law</h4>
              <p>고체: σ = Eε (응력 ∝ 변형)</p>
              <p>유체: τ = μ(dε/dt) (응력 ∝ 변형률 속도)</p>
              <p style={{ marginTop: "0.3rem", fontSize: "0.78rem", color: "var(--text3)" }}>→ 비례상수의 단위: [Pa·s] = 점성계수 η</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 4 — DERIVATIVES (Total vs Partial vs Material)
═══════════════════════════════════════════════ */
function TabDerivatives() {
  const [activeExample, setActiveExample] = useState(0);

  const examples = [
    {
      title: "전미분 (Total Derivative)",
      korean: "함수 f(x,y,z,t)의 모든 독립변수에 대한 완전한 변화",
      math: "df = (∂f/∂x)dx + (∂f/∂y)dy + (∂f/∂z)dz + (∂f/∂t)dt",
      color: "var(--cyan)",
    },
    {
      title: "편미분 (Partial Derivative)",
      korean: "다른 변수를 고정하고 하나의 변수에 대해서만 미분",
      math: "∂f/∂x : y, z, t 고정 상태에서 x에 대한 변화율",
      color: "var(--amber)",
    },
    {
      title: "대류 미분 (Material/Convective Derivative)",
      korean: "유체 입자를 따라가며 측정하는 변화율 (Lagrangian viewpoint)",
      math: "Df/Dt ≡ df/dt = ∂f/∂t + v·∇f\n= ∂f/∂t + vₓ∂f/∂x + vy∂f/∂y + vz∂f/∂z",
      color: "var(--green)",
    },
  ];

  return (
    <div>
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">∂</span>미분 연산자 Differential Operators</div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {examples.map((e, i) => (
            <button key={i} className={`btn ${i === activeExample ? "btn-cyan" : ""}`}
              style={{ opacity: i === activeExample ? 1 : 0.6, borderColor: e.color, color: i === activeExample ? e.color : "var(--text3)", background: i === activeExample ? `color-mix(in srgb, ${e.color} 15%, transparent)` : "transparent", border: `1px solid` }}
              onClick={() => setActiveExample(i)}>
              {e.title}
            </button>
          ))}
        </div>

        <div className="concept-box" style={{ borderLeftColor: examples[activeExample].color }}>
          <h4 style={{ color: examples[activeExample].color }}>{examples[activeExample].title}</h4>
          <p>{examples[activeExample].korean}</p>
          <div className="math-block" style={{ marginTop: "0.75rem" }}>
            {examples[activeExample].math}
          </div>
        </div>

        <div className="section-divider" />

        <div className="concept-box amber">
          <h4>∇ 연산자 (Nabla / Del operator)</h4>
          <div className="math-block">
            ∇ = ∂/∂x <span className="highlight">eₓ</span> + ∂/∂y <span className="highlight">ey</span> + ∂/∂z <span className="highlight">ez</span><br /><br />
            ∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)    [gradient - scalar → vector]<br />
            ∇·v = ∂vₓ/∂x + ∂vy/∂y + ∂vz/∂z  [divergence - vector → scalar]<br />
            ∇²f = ∂²f/∂x² + ∂²f/∂y² + ∂²f/∂z²  [Laplacian]
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: "1rem" }}>
          <div className="concept-box">
            <h4>Eulerian vs Lagrangian</h4>
            <p><strong style={{ color: "var(--cyan)" }}>Eulerian:</strong> 고정된 공간 위치에서 측정 (∂/∂t)</p>
            <p style={{ marginTop: "0.3rem" }}><strong style={{ color: "var(--amber)" }}>Lagrangian:</strong> 유체 입자를 따라가며 측정 (D/Dt)</p>
            <p style={{ marginTop: "0.3rem", fontSize: "0.78rem", color: "var(--text3)" }}>D/Dt = ∂/∂t + v·∇ (두 관점의 연결)</p>
          </div>
          <div className="concept-box green">
            <h4>비압축성 결론</h4>
            <div className="math-block" style={{ fontSize: "0.78rem" }}>
              Dρ/Dt = 0 (incompressible)<br />
              → ∂ρ/∂t = −v·∇ρ<br />
              → ∇·v = 0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAB 5 — QUIZ
═══════════════════════════════════════════════ */
const quizData = [
  {
    q: "비압축성 유체에서 연속방정식은 어떻게 단순화되는가?",
    opts: ["∂ρ/∂t = 0", "∇·v = 0", "Dρ/Dt = 0", "∇p = 0"],
    ans: 1,
    exp: "비압축성 유체에서는 Dρ/Dt = 0이므로, 연속방정식 Dρ/Dt + ρ∇·v = 0에서 ρ∇·v = 0이 됩니다. ρ ≠ 0이므로 ∇·v = 0입니다. 이는 속도장의 발산이 0임을 의미합니다.",
  },
  {
    q: "Navier-Stokes 방정식에서 비선형성의 원인이 되는 항은?",
    opts: ["압력 기울기 항 −∇p", "점성 항 μ∇²v", "대류 가속 항 v·∇v", "중력 항 ρg"],
    ans: 2,
    exp: "v·∇v 항은 속도 v에 대해 2차(quadratic)이므로 비선형성을 유발합니다. 이 항이 카오스, 난류 등 복잡한 유동 현상의 수학적 근원입니다. Lorenz 방정식의 xz, xy 항도 이로부터 유도됩니다.",
  },
  {
    q: "대류 미분 D/Dt의 올바른 표현은?",
    opts: ["∂/∂t", "∂/∂t − v·∇", "∂/∂t + v·∇", "v·∇"],
    ans: 2,
    exp: "D/Dt = ∂/∂t + v·∇입니다. ∂/∂t는 Eulerian 시간 변화율(공간 고정), v·∇은 대류에 의한 변화율입니다. 합산하면 유체 입자를 따라가는 Lagrangian 변화율이 됩니다.",
  },
  {
    q: "Newton 유체(Newtonian fluid)에서 전단응력 τxy의 올바른 식은?",
    opts: [
      "τxy = μ(∂vₓ/∂y)",
      "τxy = μ(∂vₓ/∂y + ∂vy/∂x)",
      "τxy = μ(∂vₓ/∂y − ∂vy/∂x)",
      "τxy = E(∂vₓ/∂y)",
    ],
    ans: 1,
    exp: "Newton 유체에서 τxy = τyx = μ(∂vₓ/∂y + ∂vy/∂x)입니다. 이는 x-면에서 y-방향 속도 기울기와 y-면에서 x-방향 속도 기울기의 합으로 표현됩니다. 응력 텐서가 대칭임을 보여줍니다.",
  },
  {
    q: "Lorenz 방정식에서 r(Rayleigh number)의 물리적 의미는?",
    opts: ["점성과 온도 정보", "Prandtl × Grashof (부력/관성)", "종횡비", "마찰계수"],
    ans: 1,
    exp: "Rayleigh number r = Prandtl number × Grashof number입니다. 부력과 관성력의 비를 나타내며, r > 24.74일 때 혼돈(chaos)적 거동이 나타납니다. 유명한 r = 28 값이 Lorenz 어트랙터를 만들어냅니다.",
  },
  {
    q: "응력 텐서의 법선 응력 σxx의 올바른 식(비압축성 유체)은?",
    opts: [
      "σxx = −p",
      "σxx = −p + μ(∂vₓ/∂y + ∂vy/∂x)",
      "σxx = −p + 2μ(∂vₓ/∂x)",
      "σxx = 2μ(∂vₓ/∂x)",
    ],
    ans: 2,
    exp: "일반형: σxx = −p + 2μ(∂vₓ/∂x) − (2/3)μ∇·v. 비압축성 유체에서 ∇·v = 0이므로 σxx = −p + 2μ(∂vₓ/∂x)가 됩니다. −p는 정수압(hydrostatic pressure), 나머지는 점성에 의한 동적 기여입니다.",
  },
];

function TabQuiz() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState({});

  const q = quizData[idx];
  const answered = selected !== null;

  const choose = (i) => {
    if (answers[idx] !== undefined) return;
    setSelected(i);
    const newAnswers = { ...answers, [idx]: i };
    setAnswers(newAnswers);
    if (i === q.ans) setScore(s => s + 1);
    if (Object.keys(newAnswers).length === quizData.length) setDone(true);
  };

  const reset = () => {
    setIdx(0); setSelected(null); setScore(0); setDone(false); setAnswers({});
  };

  const goTo = (i) => {
    setIdx(i);
    setSelected(answers[i] !== undefined ? answers[i] : null);
  };

  return (
    <div>
      <div className="w8-card">
        <div className="w8-card-title"><span className="icon">✏️</span>8주차 개념 확인 퀴즈</div>

        {done && (
          <div style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 10, padding: "1.25rem", marginBottom: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--cyan)", marginBottom: "0.5rem" }}>
              {score} / {quizData.length}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text2)" }}>
              {score === quizData.length ? "🎉 완벽합니다!" : score >= quizData.length * 0.7 ? "👍 잘 이해했습니다!" : "📚 다시 한 번 복습해봐요."}
            </div>
            <button className="btn btn-cyan" style={{ marginTop: "0.75rem" }} onClick={reset}>↺ 다시 풀기</button>
          </div>
        )}

        {/* Q navigator */}
        <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {quizData.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="btn"
              style={{
                width: 32, height: 32, padding: 0, fontSize: "0.78rem",
                background: answers[i] !== undefined ? (answers[i] === quizData[i].ans ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : "var(--navy3)",
                color: answers[i] !== undefined ? (answers[i] === quizData[i].ans ? "var(--green)" : "var(--red)") : (i === idx ? "var(--cyan)" : "var(--text3)"),
                border: `1px solid ${i === idx ? "var(--cyan)" : "var(--border)"}`,
              }}>
              {i + 1}
            </button>
          ))}
        </div>

        <div className="quiz-q">Q{idx + 1}. {q.q}</div>
        <div className="quiz-opts">
          {q.opts.map((o, i) => {
            const myAns = answers[idx];
            let cls = "";
            if (myAns !== undefined) {
              if (i === q.ans) cls = "correct";
              else if (i === myAns) cls = "wrong";
            }
            return (
              <button key={i} className={`quiz-opt ${cls}`} onClick={() => choose(i)}>
                <span style={{ fontFamily: "IBM Plex Mono", marginRight: "0.5rem", opacity: 0.6 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {o}
              </button>
            );
          })}
        </div>

        {answers[idx] !== undefined && (
          <div className={`quiz-feedback ${answers[idx] === q.ans ? "correct" : "wrong"}`}>
            <strong>{answers[idx] === q.ans ? "✅ 정답!" : "❌ 오답."}</strong> {q.exp}
          </div>
        )}

        <div className="quiz-nav">
          <button className="btn btn-cyan" onClick={() => goTo(Math.max(0, idx - 1))} disabled={idx === 0}>← 이전</button>
          <span className="quiz-progress">{idx + 1} / {quizData.length}</span>
          <button className="btn btn-cyan" onClick={() => goTo(Math.min(quizData.length - 1, idx + 1))} disabled={idx === quizData.length - 1}>다음 →</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
const TABS = [
  { id: "overview", label: "개요 Overview" },
  { id: "continuity", label: "연속방정식" },
  { id: "momentum", label: "운동량 균형" },
  { id: "derivatives", label: "미분 연산자" },
  { id: "quiz", label: "퀴즈 Quiz" },
];

export default function Week8App() {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <style>{css}</style>
      <div className="w8-root">
        <div className="w8-header">
          <div className="w8-header-top">
            <span className="w8-week-badge">Week 08</span>
            <h1>Differential Equations of Fluid Mechanics</h1>
          </div>
          <p>유체역학 미분방정식 · 연속방정식 · Navier-Stokes 방정식 유도 · 응력 텐서</p>
        </div>

        <div className="w8-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`w8-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="w8-content">
          {tab === "overview" && <TabOverview />}
          {tab === "continuity" && <TabContinuity />}
          {tab === "momentum" && <TabMomentum />}
          {tab === "derivatives" && <TabDerivatives />}
          {tab === "quiz" && <TabQuiz />}
        </div>
      </div>
    </>
  );
}
