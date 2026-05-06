import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═════════════════════════════════════════════════════════════════
   Week 10 — Vorticity & Laplace Equation (Potential Flow)
   비점성 유체 → 와도 → 일반화 Bernoulli → Laplace 방정식
     Tab 1: Overview (inviscid fluid, NS → Euler, vorticity 정의)
     Tab 2: Vorticity 2D — Fig 7.2 미소요소 회전 애니메이션
     Tab 3: Forced vs Free vortex — 속도·압력 라이브 플롯
     Tab 4: Laplace equation — velocity potential & stream function
     Tab 5: Case studies — cylinder, stagnation, source/sink + superposition
     Tab 6: Quiz
   ═════════════════════════════════════════════════════════════════ */
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
  --purple2: #8b5cf6;
  --rose: #f472b6;
  --text: #e2e8f0;
  --text2: #94a3b8;
  --text3: #64748b;
  --border: rgba(167,139,250,0.18);
  --border2: rgba(167,139,250,0.09);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.w10-root {
  font-family: 'IBM Plex Sans KR', sans-serif;
  background: var(--navy);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
}

.w10-header {
  background: linear-gradient(135deg, var(--navy2) 0%, var(--navy3) 100%);
  border-bottom: 1px solid var(--border);
  padding: 2rem 2rem 1.5rem;
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(12px);
}
.w10-header-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.w10-week-badge {
  background: linear-gradient(135deg, var(--purple2), var(--purple));
  color: white; font-weight: 700; font-size: 0.7rem; letter-spacing: 0.1em;
  padding: 0.3rem 0.7rem; border-radius: 4px; text-transform: uppercase;
}
.w10-header h1 { font-size: 1.25rem; font-weight: 700; color: var(--text); }
.w10-header p { color: var(--text2); font-size: 0.85rem; }

.w10-tabs {
  display: flex; gap: 0.25rem; padding: 0 2rem;
  border-bottom: 1px solid var(--border2);
  background: var(--navy2);
  overflow-x: auto;
}
.w10-tab {
  padding: 0.75rem 1.25rem; font-size: 0.82rem; font-weight: 500;
  color: var(--text3); border: none; background: none; cursor: pointer;
  border-bottom: 2px solid transparent; transition: all 0.2s;
  white-space: nowrap; font-family: 'IBM Plex Sans KR', sans-serif;
}
.w10-tab:hover { color: var(--text2); }
.w10-tab.active { color: var(--purple); border-bottom-color: var(--purple); }

.w10-content { padding: 2rem; max-width: 1150px; margin: 0 auto; }

.w10-card {
  background: var(--navy2); border: 1px solid var(--border2);
  border-radius: 12px; padding: 1.75rem; margin-bottom: 1.5rem;
}
.w10-card-title {
  font-size: 1rem; font-weight: 700; color: var(--purple);
  margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.6rem;
  padding-bottom: 0.75rem; border-bottom: 1px solid var(--border2);
}
.w10-card-title .icon {
  width: 28px; height: 28px; background: rgba(167,139,250,0.15);
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem;
}

.concept-box {
  background: var(--navy3); border-left: 3px solid var(--cyan);
  border-radius: 0 8px 8px 0; padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}
.concept-box h4 {
  font-size: 0.92rem; font-weight: 600; color: var(--cyan);
  margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;
}
.concept-box p { font-size: 0.86rem; color: var(--text2); }
.concept-box.amber { border-left-color: var(--amber); }
.concept-box.amber h4 { color: var(--amber); }
.concept-box.green { border-left-color: var(--green); }
.concept-box.green h4 { color: var(--green); }
.concept-box.red { border-left-color: var(--red); }
.concept-box.red h4 { color: var(--red); }
.concept-box.purple { border-left-color: var(--purple); }
.concept-box.purple h4 { color: var(--purple); }
.concept-box.rose { border-left-color: var(--rose); }
.concept-box.rose h4 { color: var(--rose); }

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

.eq-label {
  display: inline-block; font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem; padding: 0.15rem 0.5rem;
  background: rgba(167,139,250,0.12); color: var(--purple);
  border-radius: 3px; margin-right: 0.4rem;
}

.w10-canvas-wrap {
  background: rgba(0,0,0,0.4); border: 1px solid var(--border2);
  border-radius: 8px; padding: 1rem; margin: 1rem 0;
  display: flex; justify-content: center;
}
.w10-canvas-wrap canvas {
  display: block; max-width: 100%; height: auto;
  background: #050810; border-radius: 4px;
}

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
  font-family: 'IBM Plex Mono', monospace; color: var(--purple); font-weight: 600;
}
.ctrl-row input[type="range"] { width: 100%; accent-color: var(--purple); }
.ctrl-row select, .ctrl-row input[type="number"] {
  background: var(--navy4); color: var(--text); border: 1px solid var(--border);
  border-radius: 4px; padding: 0.3rem 0.5rem; font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
}

.btn {
  padding: 0.5rem 1rem; font-size: 0.83rem; font-weight: 500;
  border: 1px solid var(--border); background: var(--navy3); color: var(--text);
  border-radius: 6px; cursor: pointer; transition: all 0.2s;
  font-family: 'IBM Plex Sans KR', sans-serif;
}
.btn:hover { background: var(--navy4); border-color: var(--purple); }
.btn.primary {
  background: linear-gradient(135deg, var(--purple2), var(--purple));
  border-color: var(--purple); color: white;
}
.btn.primary:hover { filter: brightness(1.15); }
.btn.active {
  background: var(--purple); color: white; border-color: var(--purple);
}

.deriv-steps { display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0; }
.deriv-step {
  display: flex; gap: 0.85rem; align-items: flex-start;
  padding: 0.7rem 1rem; background: rgba(167,139,250,0.04);
  border-left: 2px solid var(--border); border-radius: 0 6px 6px 0;
  transition: all 0.2s; cursor: pointer;
}
.deriv-step.active {
  background: rgba(167,139,250,0.12); border-left-color: var(--purple);
}
.deriv-step .step-num {
  background: var(--navy4); color: var(--purple); width: 26px; height: 26px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  font-family: 'IBM Plex Mono', monospace;
}
.deriv-step.active .step-num { background: var(--purple); color: white; }
.deriv-step .step-content { flex: 1; font-size: 0.86rem; color: var(--text2); }
.deriv-step.active .step-content { color: var(--text); }
.deriv-step .step-eq {
  font-family: 'Crimson Pro', serif; font-style: italic;
  font-size: 1rem; color: var(--text); margin-top: 0.4rem;
}
.deriv-step .step-tag {
  display: inline-block; margin-right: 0.4rem;
  font-size: 0.68rem; padding: 0.1rem 0.45rem;
  background: rgba(167,139,250,0.12); color: var(--purple);
  border-radius: 3px; font-family: 'IBM Plex Mono', monospace;
}

.quiz-q { font-size: 1rem; color: var(--text); margin-bottom: 1.25rem; font-weight: 500; }
.quiz-opt {
  display: block; width: 100%; padding: 0.85rem 1rem; margin-bottom: 0.5rem;
  background: var(--navy3); border: 1px solid var(--border2); color: var(--text);
  border-radius: 6px; cursor: pointer; transition: all 0.2s; text-align: left;
  font-family: 'IBM Plex Sans KR', sans-serif; font-size: 0.88rem;
}
.quiz-opt:hover { background: var(--navy4); border-color: var(--purple); }
.quiz-opt.correct { background: rgba(16,185,129,0.15); border-color: var(--green); color: var(--green); }
.quiz-opt.wrong { background: rgba(239,68,68,0.15); border-color: var(--red); color: var(--red); }
.quiz-opt.disabled { cursor: default; opacity: 0.7; }
.quiz-progress { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.quiz-progress .pct { font-family: 'IBM Plex Mono', monospace; color: var(--purple); font-size: 0.85rem; }
.quiz-bar { height: 4px; background: var(--navy3); border-radius: 2px; overflow: hidden; margin-bottom: 1.5rem; }
.quiz-bar-fill { height: 100%; background: linear-gradient(90deg, var(--purple2), var(--purple)); transition: width 0.3s; }

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
.kpi.purple .val { color: var(--purple); }
.kpi.rose .val { color: var(--rose); }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }

.tag {
  display: inline-block; font-size: 0.72rem; padding: 0.15rem 0.55rem;
  background: rgba(167,139,250,0.12); color: var(--purple);
  border: 1px solid var(--border); border-radius: 999px;
  margin-right: 0.35rem; font-family: 'IBM Plex Mono', monospace;
}
.tag.amber { background: rgba(245,158,11,0.1); color: var(--amber); border-color: rgba(245,158,11,0.25); }
.tag.green { background: rgba(16,185,129,0.1); color: var(--green); border-color: rgba(16,185,129,0.25); }
.tag.cyan { background: rgba(0,212,255,0.1); color: var(--cyan); border-color: rgba(0,212,255,0.25); }

.w10-div { height: 1px; background: var(--border2); margin: 1.25rem 0; }

.seg-tabs {
  display: inline-flex; gap: 0.25rem; padding: 0.25rem;
  background: var(--navy3); border-radius: 6px; margin: 0.5rem 0 1rem;
}
.seg-tab {
  padding: 0.4rem 0.95rem; font-size: 0.78rem; font-weight: 500;
  background: transparent; border: none; cursor: pointer;
  border-radius: 4px; color: var(--text2); transition: all 0.2s;
}
.seg-tab.active { background: var(--purple); color: white; }
`;

/* ═════════════════════════════════════════════════════════════════
   HELPERS
   ═════════════════════════════════════════════════════════════════ */
function fmt(x, n = 3) {
  if (!isFinite(x)) return "—";
  if (Math.abs(x) >= 1e4 || (Math.abs(x) < 1e-3 && x !== 0))
    return x.toExponential(2);
  return x.toFixed(n);
}

/* ═════════════════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
   ═════════════════════════════════════════════════════════════════ */
function TabOverview() {
  return (
    <div>
      {/* Inviscid fluid intro */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">η</span>비점성 유체 — Inviscid Fluid</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>📌 정의</h4>
            <p>점도가 거의 0으로 근사되는 유체 (<span className="math-inline">η ≈ 0</span>). 점성 효과가 다른 항들에 비해 무시할 만큼 작은 영역에서 유효한 근사.</p>
          </div>
          <div className="concept-box amber">
            <h4>⚠ 적용 조건</h4>
            <p>① 고체 경계에서 <strong>충분히 먼 영역</strong> (no-slip boundary의 영향 밖)<br/>② <strong>재순환 없는 유동</strong> — 난류, swirl, eddy가 없는 곳<br/>경계층 바깥의 주류 영역이 전형적인 대상.</p>
          </div>
        </div>
      </div>

      {/* NS → Euler */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">∂</span>N-S 방정식 → Euler 방정식</div>
        <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          Newtonian · 비압축 유체의 N-S에서 점성항 <span className="math-inline">η∇²v</span> 를 탈락시키면 <strong>Euler 방정식</strong>이 남습니다.
        </p>
        <div className="math-block">
          ρ Dv/Dt = −∇p <span style={{ color: "var(--red)", textDecoration: "line-through" }}>+ η∇²v</span> + ρg
          &nbsp;&nbsp;⇒&nbsp;&nbsp;
          <span className="highlight">Dv/Dt = −(1/ρ)∇p + F</span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--text3)", textAlign: "center", marginTop: "0.4rem" }}>
          여기서 F = −g ê_z 는 단위 질량당 체적력 (중력 포함).
        </p>
      </div>

      {/* Vorticity definition */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">ζ</span>와도 (Vorticity) — 유체의 국소 회전성</div>
        <div className="concept-box">
          <h4>🌀 정의</h4>
          <p>와도 ζ 는 속도장 v 의 curl. 유체 입자가 국소적으로 얼마나 회전하는지를 나타냅니다.</p>
        </div>
        <div className="math-block">
          <span className="highlight">ζ ≡ ∇ × v</span> = (∂v_z/∂y − ∂v_y/∂z) ê_x + (∂v_x/∂z − ∂v_z/∂x) ê_y + (∂v_y/∂x − ∂v_x/∂y) ê_z
        </div>
        <div className="grid-2">
          <div className="concept-box green">
            <h4>✓ ζ ≠ 0 : Forced vortex (회전 유동)</h4>
            <p>유체 입자 전체가 고체처럼 함께 회전. 각속도 ω 가 상수이며, 와도 <span className="math-inline">ζ = 2ω ê_z</span>. 예: 교반기로 저어지는 용액의 중앙 영역.</p>
          </div>
          <div className="concept-box amber">
            <h4>✗ ζ = 0 : Free vortex (비회전 유동, Irrotational)</h4>
            <p>유체가 전체적으로는 빙글 돌아도 각 입자는 자전하지 않음. 예: 목욕탕 배수구의 와류. 비점성 액체는 전형적으로 이쪽.</p>
          </div>
        </div>
      </div>

      {/* Vector identity that unlocks Bernoulli */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🔑</span>핵심 벡터 항등식 — Euler → Bernoulli 의 다리</div>
        <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          일반 벡터 항등식 <span className="math-inline">∇(A·B) = A×(∇×B) + B×(∇×A) + (A·∇)B + (B·∇)A</span> 에 A = B = v 를 대입하면:
        </p>
        <div className="math-block">
          (v·∇)v = <span className="purple">∇(v²/2)</span> + <span className="highlight">ζ × v</span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)" }}>
          이 분해 덕분에 Euler 방정식의 비선형 대류항 <span className="math-inline">(v·∇)v</span> 가 <strong>gradient 항 + 와도 항</strong> 으로 정리됩니다. 비회전 유동에서는 둘째 항이 사라져 Euler 방정식이 <strong>완전한 gradient 방정식</strong> 이 되고, 여기서 Bernoulli 적분이 가능해집니다.
        </p>
      </div>

      {/* Roadmap */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🗺</span>이번 주 학습 로드맵</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🟦 Tab 2 — Vorticity 2D 시각화</h4>
            <p>미소 유체 요소가 시간에 따라 회전·변형하는 모습을 애니메이션으로 보고, 각속도 ω = ½(∂v_y/∂x − ∂v_x/∂y) 가 어디서 나오는지 체감합니다.</p>
          </div>
          <div className="concept-box amber">
            <h4>🟧 Tab 3 — Forced vs Free Vortex</h4>
            <p>원통좌표계에서 두 vortex의 속도·압력 프로파일을 비교. 교반기 주변에서 두 영역이 연속적으로 연결되는 조건 (속도·압력 연속)을 확인.</p>
          </div>
          <div className="concept-box green">
            <h4>🟩 Tab 4 — Laplace 방정식</h4>
            <p>속도 퍼텐셜 φ 와 유선함수 ψ 를 정의하면 비회전·비압축 유동이 <strong>∇²φ = 0, ∇²ψ = 0</strong> 으로 환원. Sturm-Liouville 문제로 풀 수 있게 됨.</p>
          </div>
          <div className="concept-box purple">
            <h4>🟪 Tab 5 — Case Studies</h4>
            <p>실린더 주변 유동, stagnation flow, line source/sink. 그리고 Laplace 방정식의 <strong>선형성</strong> 이 주는 선물 — superposition!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   VORTICITY 2D CANVAS (Fig 7.2 style)
   미소 유체 요소 PQRS가 (∂v_x/∂y, ∂v_y/∂x) 에 의해 변형·회전하는 애니메이션
   Mode: pure rotation / pure shear / pure strain
   ═════════════════════════════════════════════════════════════════ */
function Vorticity2DCanvas({ dvxdy, dvydx, running, tScale }) {
  const ref = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    let raf;
    const draw = () => {
      const c = ref.current; if (!c) { raf = requestAnimationFrame(draw); return; }
      const ctx = c.getContext("2d");
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

      if (running) tRef.current += 0.016;
      const t = tRef.current;

      // The infinitesimal element is shown large on screen.
      // Original square PQRS of side d. At time t:
      //   P' = P (anchor)
      //   Q moves in +y by (dv_y/dx)·d·t  (below of P, side-length d)
      //   S moves in +x by (dv_x/dy)·d·t
      //   R = Q + (S - P) moves accordingly
      const d_screen = 180; // screen side length in pixels
      const cx = W * 0.42, cy = H * 0.62;

      // Original corners (with y pointing up on screen):
      const P0 = [cx, cy];
      const Q0 = [cx + d_screen, cy];
      const S0 = [cx, cy - d_screen];
      const R0 = [cx + d_screen, cy - d_screen];

      // Deformation. Interpreting PDF convention:
      //   PQ lies along +x; displacement of Q in +y direction is (dv_y/dx)·dx·dt
      //   PS lies along +y; displacement of S in +x direction is (dv_x/dy)·dy·dt
      // We use t*tScale as the "dt" accumulated.
      const tau = t * tScale;
      const Bdisp = dvydx * d_screen * tau;  // Q moves DOWN on screen (y_screen grows) when dvydx>0? No:
      //   dvydx > 0 means Q (originally at +x from P) moves in +y direction.
      //   On screen y_screen = -y_world, so +y_world = -y_screen.
      const Cdisp = dvxdy * d_screen * tau;  // S moves in +x by this amount

      const Pp = P0;
      const Qp = [Q0[0], Q0[1] - Bdisp];       // Q moves in world +y (screen up)
      const Sp = [S0[0] + Cdisp, S0[1]];
      const Rp = [Qp[0] + (Sp[0] - Pp[0]), Qp[1] + (Sp[1] - Pp[1])];

      // Draw original square (dashed gray)
      ctx.strokeStyle = "rgba(100,116,139,0.45)"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(...P0); ctx.lineTo(...Q0); ctx.lineTo(...R0); ctx.lineTo(...S0); ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw deformed quadrilateral (cyan, filled)
      ctx.fillStyle = "rgba(167,139,250,0.12)";
      ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(...Pp); ctx.lineTo(...Qp); ctx.lineTo(...Rp); ctx.lineTo(...Sp); ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Draw PQ and PS edges with angle labels
      // Angle α (S rotated CW from +y axis): tan α ≈ (Sp[0]-Pp[0]) / (P0[1]-S0[1]) = Cdisp/d
      // Angle β (Q rotated CCW from +x axis): tan β ≈ (P0[1]-Qp[1]) / (Q0[0]-P0[0]) = Bdisp/d
      const alpha = Math.atan2(Sp[0] - Pp[0], P0[1] - S0[1]);   // rad
      const beta = Math.atan2(P0[1] - Qp[1], Q0[0] - P0[0]);    // rad

      // Label corners
      ctx.fillStyle = "#94a3b8"; ctx.font = "12px 'IBM Plex Mono'";
      ctx.fillText("P", P0[0] - 12, P0[1] + 14);
      ctx.fillText("Q", Q0[0] + 6, Q0[1] + 14);
      ctx.fillText("S", S0[0] - 12, S0[1] - 4);
      ctx.fillText("R", R0[0] + 6, R0[1] - 4);
      ctx.fillStyle = "#a78bfa";
      ctx.fillText("P'", Pp[0] - 18, Pp[1] + 18);
      ctx.fillText("Q'", Qp[0] + 6, Qp[1] - 4);
      ctx.fillText("S'", Sp[0] - 14, Sp[1] - 10);
      ctx.fillText("R'", Rp[0] + 6, Rp[1] - 4);

      // Angle arcs at P'
      const arcR = 30;
      if (Math.abs(beta) > 0.001) {
        ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Pp[0], Pp[1], arcR, 0, -beta, beta < 0);
        ctx.stroke();
        ctx.fillStyle = "#00d4ff"; ctx.font = "12px 'IBM Plex Mono'";
        ctx.fillText("β", Pp[0] + arcR + 4, Pp[1] - beta * arcR / 2);
      }
      if (Math.abs(alpha) > 0.001) {
        ctx.strokeStyle = "#f472b6"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Pp[0], Pp[1], arcR, -Math.PI / 2, -Math.PI / 2 + alpha, alpha < 0);
        ctx.stroke();
        ctx.fillStyle = "#f472b6";
        ctx.fillText("α", Pp[0] + alpha * arcR / 2, Pp[1] - arcR - 4);
      }

      // Axes (bottom-left)
      const ox = 30, oy = H - 30;
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 40, oy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - 40); ctx.stroke();
      ctx.fillStyle = "#64748b"; ctx.font = "11px 'IBM Plex Mono'";
      ctx.fillText("x", ox + 44, oy + 4);
      ctx.fillText("y", ox - 4, oy - 44);

      // Legend / readout panel (right side)
      const px = W - 260, py = 22;
      ctx.fillStyle = "rgba(30,42,61,0.8)";
      ctx.fillRect(px - 12, py - 14, 255, 180);
      ctx.strokeStyle = "rgba(167,139,250,0.3)"; ctx.lineWidth = 1;
      ctx.strokeRect(px - 12, py - 14, 255, 180);

      ctx.fillStyle = "#a78bfa"; ctx.font = "bold 12px 'IBM Plex Mono'";
      ctx.fillText("Local deformation analysis", px, py);
      ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
      ctx.fillText(`∂v_x/∂y = ${dvxdy.toFixed(2)}`, px, py + 22);
      ctx.fillText(`∂v_y/∂x = ${dvydx.toFixed(2)}`, px, py + 40);
      ctx.fillStyle = "#00d4ff";
      ctx.fillText(`β (CCW) ≈ ${beta.toFixed(3)} rad`, px, py + 62);
      ctx.fillStyle = "#f472b6";
      ctx.fillText(`α (CW)  ≈ ${alpha.toFixed(3)} rad`, px, py + 80);

      // Net rotation = (β - α)/2? No: the PDF says net CCW rotation of the
      // diagonal bisector is (β - α)/2, and vorticity ζ_z = dvy/dx - dvx/dy
      // which is the rate of this rotation.
      const netRot = (beta - alpha) / 2;
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(`Net rotation = (β−α)/2`, px, py + 104);
      ctx.fillText(`             = ${netRot.toFixed(3)} rad`, px, py + 120);

      const shearRate = (beta + alpha) / 2;
      ctx.fillStyle = "#10b981";
      ctx.fillText(`Net shear    = (β+α)/2`, px, py + 140);
      ctx.fillText(`             = ${shearRate.toFixed(3)} rad`, px, py + 156);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [dvxdy, dvydx, running, tScale]);

  return (
    <div className="w10-canvas-wrap">
      <canvas ref={ref} width={720} height={440} />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   TAB 2 — VORTICITY 2D (Fig 7.2)
   ═════════════════════════════════════════════════════════════════ */
function TabVorticity() {
  const [preset, setPreset] = useState("rotation");
  const [dvxdy, setDvxdy] = useState(-0.4);
  const [dvydx, setDvydx] = useState(0.4);
  const [running, setRunning] = useState(true);
  const tScale = 1.0;

  const applyPreset = (name) => {
    setPreset(name);
    if (name === "rotation") { setDvxdy(-0.4); setDvydx(0.4); }     // pure rotation (β = -α)
    else if (name === "shear") { setDvxdy(0.4); setDvydx(0); }      // simple shear (only α)
    else if (name === "strain") { setDvxdy(0.4); setDvydx(0.4); }   // pure shear strain (α = β, no rot)
    else if (name === "mix") { setDvxdy(-0.2); setDvydx(0.5); }     // mixed
  };

  const omega_z = 0.5 * (dvydx - dvxdy);
  const zeta_z = dvydx - dvxdy;

  return (
    <div>
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🌀</span>Vorticity 2D — 미소 유체 요소의 회전·변형</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🎬 시나리오</h4>
            <p>시각 t 에 정사각형 PQRS 였던 미소 유체 요소가, 속도장의 공간 구배 때문에 시각 t+dt 에 P'Q'R'S' 로 변형됩니다. 변의 <strong>P→Q 방향은 +x</strong>, <strong>P→S 방향은 +y</strong>. Q 는 P 보다 +y 방향으로 <span className="math-inline">(∂v_y/∂x)dx·dt</span> 만큼, S 는 +x 방향으로 <span className="math-inline">(∂v_x/∂y)dy·dt</span> 만큼 이동.</p>
          </div>
          <div className="concept-box amber">
            <h4>📐 두 각도의 정의</h4>
            <p>β : P'Q' 가 원래 +x 축 대비 반시계 방향으로 돈 각도<br/>α : P'S' 가 원래 +y 축 대비 시계 방향으로 돈 각도<br/>미소각 근사로 <span className="math-inline">β ≈ (∂v_y/∂x)dt</span>, <span className="math-inline">α ≈ (∂v_x/∂y)dt</span>.</p>
          </div>
        </div>
      </div>

      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">📊</span>Interactive — 슬라이더로 속도구배 조정</div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          <strong style={{ color: "#a78bfa" }}>보라 사각형</strong>이 변형된 요소 P'Q'R'S', <strong style={{ color: "#64748b" }}>회색 점선</strong>이 원래 PQRS. 프리셋을 눌러 네 가지 전형적인 유동을 체험해 보세요.
        </p>
        <div className="seg-tabs">
          <button className={`seg-tab ${preset === "rotation" ? "active" : ""}`} onClick={() => applyPreset("rotation")}>① Pure rotation (Forced vortex)</button>
          <button className={`seg-tab ${preset === "shear" ? "active" : ""}`} onClick={() => applyPreset("shear")}>② Simple shear</button>
          <button className={`seg-tab ${preset === "strain" ? "active" : ""}`} onClick={() => applyPreset("strain")}>③ Pure strain</button>
          <button className={`seg-tab ${preset === "mix" ? "active" : ""}`} onClick={() => applyPreset("mix")}>④ Mixed</button>
        </div>
        <Vorticity2DCanvas dvxdy={dvxdy} dvydx={dvydx} running={running} tScale={tScale} />
        <div className="ctrl-row">
          <label>
            ∂v_x/∂y : <span className="val">{dvxdy.toFixed(2)}</span>
            <input type="range" min="-1" max="1" step="0.05"
              value={dvxdy} onChange={(e) => setDvxdy(+e.target.value)} />
          </label>
          <label>
            ∂v_y/∂x : <span className="val">{dvydx.toFixed(2)}</span>
            <input type="range" min="-1" max="1" step="0.05"
              value={dvydx} onChange={(e) => setDvydx(+e.target.value)} />
          </label>
          <button className="btn" onClick={() => setRunning(r => !r)}>
            {running ? "⏸ pause" : "▶ play"}
          </button>
        </div>
        <div className="kpi-grid">
          <div className="kpi amber">
            <div className="lbl">각속도 ω_z = ½(∂v_y/∂x − ∂v_x/∂y)</div>
            <div className="val">{omega_z.toFixed(3)}</div>
          </div>
          <div className="kpi purple">
            <div className="lbl">와도 ζ_z = 2ω_z</div>
            <div className="val">{zeta_z.toFixed(3)}</div>
          </div>
          <div className="kpi green">
            <div className="lbl">전단변형률 = ½(∂v_y/∂x + ∂v_x/∂y)</div>
            <div className="val">{((dvydx + dvxdy) / 2).toFixed(3)}</div>
          </div>
        </div>
      </div>

      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🧠</span>물리적 해석 — 왜 이 정의인가</div>
        <div className="grid-2">
          <div className="concept-box green">
            <h4>① Pure rotation (순수 회전)</h4>
            <p>∂v_x/∂y = −∂v_y/∂x → α = −β → 대각선 이등분선 자체가 돌아갑니다. 모양은 그대로, 방향만 회전. <strong>Forced vortex</strong> 의 국소 모습.</p>
          </div>
          <div className="concept-box amber">
            <h4>② Simple shear (단순 전단)</h4>
            <p>∂v_x/∂y ≠ 0, ∂v_y/∂x = 0. 평행사변형으로 기울어짐. <strong>회전과 변형이 50:50 혼합</strong> 되어 있음. ω_z = −½(∂v_x/∂y) 로 0이 아님.</p>
          </div>
          <div className="concept-box">
            <h4>③ Pure strain (순수 변형)</h4>
            <p>∂v_x/∂y = ∂v_y/∂x → α = β → 대각선 이등분선은 고정되고, 두 변이 대칭적으로 기울어짐. <strong>회전 없이 모양만 변형</strong>. ω_z = 0.</p>
          </div>
          <div className="concept-box rose">
            <h4>④ Mixed flow</h4>
            <p>실제 유동은 대부분 이 모드. 회전 + 변형이 동시에 일어남. 와도는 순회전 부분만 측정하므로 ω_z ≠ 0 일 때 '회전 유동'.</p>
          </div>
        </div>
        <div className="math-block">
          <span className="cyan">ω_z = ½(∂v_y/∂x − ∂v_x/∂y)</span>
          &nbsp;&nbsp;⇔&nbsp;&nbsp;
          <span className="highlight">와도 ζ_z = ∂v_y/∂x − ∂v_x/∂y = 2ω_z</span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--text3)", textAlign: "center" }}>
          "와도는 각속도의 2배" — 이 인수 2가 α 와 β 의 <strong>차이</strong> 로 순수 회전을 걸러내기 때문에 붙는 것.
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   VORTEX PROFILE CANVAS (Forced vs Free)
   r ≤ a : v_θ = r ω         (Forced, linear)
   r > a : v_θ = ω a² / r    (Free, 1/r)
   Pressure:
     r ≤ a : p(r) = p∞ − ρω²a² + ½ρω²r²
     r > a : p(r) = p∞ − ρω²a⁴ / (2r²)
   ═════════════════════════════════════════════════════════════════ */
function VortexProfileCanvas({ omega, a, rho, pInf, mode }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    const PADL = 60, PADR = 40, PADT = 30, PADB = 50;
    const PW = W - PADL - PADR, PH = H - PADT - PADB;

    ctx.strokeStyle = "rgba(167,139,250,0.18)"; ctx.lineWidth = 1;
    ctx.strokeRect(PADL, PADT, PW, PH);

    const rMax = 3 * a;
    const vTheta = (r) => (r <= a ? r * omega : omega * a * a / r);
    const pressure = (r) =>
      r <= a
        ? pInf - rho * omega * omega * a * a + 0.5 * rho * omega * omega * r * r
        : pInf - rho * omega * omega * a * a * a * a / (2 * r * r);

    const vMax = a * omega;
    const pMin = pressure(0);  // deepest at r=0

    const fn = mode === "velocity" ? vTheta : pressure;
    const fMax = mode === "velocity" ? vMax : pInf;
    const fMin = mode === "velocity" ? 0 : pMin;
    const span = fMax - fMin;

    // Gridlines
    ctx.strokeStyle = "rgba(167,139,250,0.06)"; ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const x = PADL + (PW * i) / 6;
      ctx.beginPath(); ctx.moveTo(x, PADT); ctx.lineTo(x, PADT + PH); ctx.stroke();
    }
    for (let i = 1; i < 5; i++) {
      const y = PADT + (PH * i) / 5;
      ctx.beginPath(); ctx.moveTo(PADL, y); ctx.lineTo(PADL + PW, y); ctx.stroke();
    }

    // Shade forced region vs free region
    const xAtA = PADL + (a / rMax) * PW;
    ctx.fillStyle = "rgba(0,212,255,0.05)";
    ctx.fillRect(PADL, PADT, xAtA - PADL, PH);
    ctx.fillStyle = "rgba(245,158,11,0.05)";
    ctx.fillRect(xAtA, PADT, PADL + PW - xAtA, PH);

    // Dashed vertical line at r=a
    ctx.strokeStyle = "rgba(167,139,250,0.5)";
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(xAtA, PADT); ctx.lineTo(xAtA, PADT + PH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#a78bfa"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("r = a", xAtA - 18, PADT - 6);

    // Region labels
    ctx.fillStyle = "#00d4ff"; ctx.font = "bold 11px 'IBM Plex Mono'";
    ctx.fillText("Forced", PADL + (xAtA - PADL) / 2 - 18, PADT + 18);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("Free", xAtA + (PADL + PW - xAtA) / 2 - 14, PADT + 18);

    // Curve
    ctx.strokeStyle = mode === "velocity" ? "#00d4ff" : "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const r = (rMax * i) / 300;
      const v = fn(r);
      const x = PADL + (r / rMax) * PW;
      const y = PADT + PH - ((v - fMin) / span) * PH * 0.95;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#94a3b8"; ctx.font = "12px 'IBM Plex Mono'";
    ctx.fillText("r", PADL + PW + 10, PADT + PH + 4);
    if (mode === "velocity") {
      ctx.save();
      ctx.translate(18, PADT + PH / 2 + 20); ctx.rotate(-Math.PI / 2);
      ctx.fillText("v_θ", 0, 0);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(18, PADT + PH / 2 + 14); ctx.rotate(-Math.PI / 2);
      ctx.fillText("p(r)", 0, 0);
      ctx.restore();
    }

    // Tick marks
    ctx.fillStyle = "#64748b"; ctx.font = "10px 'IBM Plex Mono'";
    for (let i = 0; i <= 3; i++) {
      const x = PADL + (PW * i) / 3;
      ctx.fillText(`${(rMax * i / 3 / a).toFixed(1)}a`, x - 10, PADT + PH + 14);
    }

    // Continuity markers at r=a
    const xA = xAtA, yA = PADT + PH - ((fn(a) - fMin) / span) * PH * 0.95;
    ctx.fillStyle = "#a78bfa";
    ctx.beginPath(); ctx.arc(xA, yA, 5, 0, Math.PI * 2); ctx.fill();

    // Readout label for v(a) or p(a)
    ctx.fillStyle = "#a78bfa"; ctx.font = "11px 'IBM Plex Mono'";
    if (mode === "velocity") {
      ctx.fillText(`v_θ(a) = aω = ${fn(a).toFixed(2)}`, xA + 8, yA - 4);
    } else {
      ctx.fillText(`p(a) = ${fn(a).toFixed(0)} Pa`, xA + 8, yA - 4);
    }

    // p_inf asymptote (pressure mode)
    if (mode === "pressure") {
      const yInf = PADT + PH - ((pInf - fMin) / span) * PH * 0.95;
      ctx.strokeStyle = "rgba(148,163,184,0.4)"; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(PADL, yInf); ctx.lineTo(PADL + PW, yInf); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#94a3b8"; ctx.font = "10px 'IBM Plex Mono'";
      ctx.fillText("p_∞", PADL + PW - 40, yInf - 4);
    }
  }, [omega, a, rho, pInf, mode]);

  return (
    <div className="w10-canvas-wrap">
      <canvas ref={ref} width={720} height={300} />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   VORTEX ROTATION CANVAS — particle orientation animation
   Two side-by-side canvases. Each renders particles orbiting on
   concentric rings. The arrow on each particle shows its OWN spin:
   • Forced vortex: arrow rotates rigidly with orbit (ω·t)  → ζ = 2ω
   • Free vortex:   arrow stays pointing the same direction → ζ = 0
   A small gray "+" cross is also tracked to make shear visible:
   in forced it stays rigid, in free it shears (inner faster than outer).
   Demonstrates the meaning of "irrotational despite circular motion".
   ═════════════════════════════════════════════════════════════════ */
function VortexRotationCanvas({ playing, speed }) {
  const refF = useRef(null);
  const refR = useRef(null);
  const tRef = useRef(0);
  const lastFrameRef = useRef(performance.now());
  const rafRef = useRef(null);

  useEffect(() => {
    const cF = refF.current, cR = refR.current;
    if (!cF || !cR) return;
    const ctxF = cF.getContext("2d");
    const ctxR = cR.getContext("2d");
    const W = 320, H = 320, cx = W / 2, cy = H / 2;

    const omega = 0.6;          // forced vortex angular velocity
    const C = 60;                // free vortex strength (v_θ = C/r)
    const radii = [40, 70, 100];
    const Nperring = 6;
    const particles = [];
    radii.forEach(r => {
      for (let k = 0; k < Nperring; k++) {
        particles.push({ r, th0: (k / Nperring) * 2 * Math.PI });
      }
    });

    const drawAxes = (ctx) => {
      ctx.strokeStyle = "rgba(167,139,250,0.15)";
      ctx.lineWidth = 1;
      for (let r = 30; r <= 130; r += 30) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    };

    const drawParticle = (ctx, x, y, arrowAng, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      const dx = Math.cos(arrowAng) * 12;
      const dy = Math.sin(arrowAng) * 12;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.lineTo(x + dx - 6 * Math.cos(arrowAng - 0.5),
                 y + dy - 6 * Math.sin(arrowAng - 0.5));
      ctx.lineTo(x + dx - 6 * Math.cos(arrowAng + 0.5),
                 y + dy - 6 * Math.sin(arrowAng + 0.5));
      ctx.closePath(); ctx.fill();
    };

    const drawDeformableCross = (ctx, type, t) => {
      const r0 = 70;
      const halfsize = 9;
      let p1, p2, p3, p4;
      if (type === "forced") {
        const theta_c = omega * t;
        const cxp = cx + r0 * Math.cos(theta_c);
        const cyp = cy + r0 * Math.sin(theta_c);
        const ang = omega * t;
        const co = Math.cos(ang), si = Math.sin(ang);
        const v = halfsize;
        // rigid cross — both arms rotate together
        p1 = [cxp + co * 0 + si * v, cyp + si * 0 - co * v];
        p2 = [cxp - co * 0 - si * v, cyp - si * 0 + co * v];
        p3 = [cxp + co * v - si * 0, cyp + si * v + co * 0];
        p4 = [cxp - co * v + si * 0, cyp - si * v - co * 0];
      } else {
        // each corner advected by its own v_θ at its own radius
        const corners = [
          { x0: r0, y0: halfsize },
          { x0: r0, y0: -halfsize },
          { x0: r0 + halfsize, y0: 0 },
          { x0: r0 - halfsize, y0: 0 },
        ];
        const out = corners.map(c0 => {
          const r = Math.hypot(c0.x0, c0.y0);
          const th_i = Math.atan2(c0.y0, c0.x0);
          const th_now = th_i + (C / (r * r)) * t;
          return [cx + r * Math.cos(th_now), cy + r * Math.sin(th_now)];
        });
        [p1, p2, p3, p4] = out;
      }
      ctx.strokeStyle = "rgba(226,232,240,0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
      ctx.moveTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]);
      ctx.stroke();
      ctx.fillStyle = "rgba(226,232,240,0.8)";
      [p1, p2, p3, p4].forEach(p => {
        ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, Math.PI * 2); ctx.fill();
      });
    };

    const renderForced = (t) => {
      ctxF.clearRect(0, 0, W, H);
      drawAxes(ctxF);
      drawDeformableCross(ctxF, "forced", t);
      particles.forEach(p => {
        const th = p.th0 + omega * t;
        const x = cx + p.r * Math.cos(th);
        const y = cy + p.r * Math.sin(th);
        drawParticle(ctxF, x, y, omega * t, "#ef4444");
      });
    };

    const renderFree = (t) => {
      ctxR.clearRect(0, 0, W, H);
      drawAxes(ctxR);
      drawDeformableCross(ctxR, "free", t);
      particles.forEach(p => {
        const th = p.th0 + (C / (p.r * p.r)) * t;
        const x = cx + p.r * Math.cos(th);
        const y = cy + p.r * Math.sin(th);
        // arrow always points the same compass direction (e.g. east)
        drawParticle(ctxR, x, y, 0, "#10b981");
      });
    };

    const tick = (now) => {
      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      if (playing) tRef.current += dt * speed;
      renderForced(tRef.current);
      renderFree(tRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, speed]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
      <div style={{ background: "var(--navy2)", borderRadius: "8px",
        border: "1px solid var(--border)", padding: "0.6rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.78rem", color: "var(--red)", fontWeight: 600,
          marginBottom: "0.4rem", letterSpacing: "0.04em" }}>
          FORCED VORTEX · ζ = 2ω · 입자가 자전함
        </div>
        <canvas ref={refF} width={320} height={320}
          style={{ width: "100%", maxWidth: "320px", height: "auto",
            display: "block", margin: "0 auto" }} />
        <div style={{ fontSize: "0.72rem", color: "var(--text3)",
          marginTop: "0.4rem", fontFamily: "'IBM Plex Mono', monospace" }}>
          v_θ = rω · 화살표가 회전과 함께 돈다
        </div>
      </div>
      <div style={{ background: "var(--navy2)", borderRadius: "8px",
        border: "1px solid var(--border)", padding: "0.6rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.78rem", color: "var(--green)", fontWeight: 600,
          marginBottom: "0.4rem", letterSpacing: "0.04em" }}>
          FREE VORTEX · ζ = 0 · 비회전 (irrotational)
        </div>
        <canvas ref={refR} width={320} height={320}
          style={{ width: "100%", maxWidth: "320px", height: "auto",
            display: "block", margin: "0 auto" }} />
        <div style={{ fontSize: "0.72rem", color: "var(--text3)",
          marginTop: "0.4rem", fontFamily: "'IBM Plex Mono', monospace" }}>
          v_θ = C/r · 화살표가 항상 같은 방향
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   TAB 3 — FORCED vs FREE VORTEX
   ═════════════════════════════════════════════════════════════════ */
function TabVortex() {
  const [omega, setOmega] = useState(2);      // rad/s
  const [a, setA] = useState(0.05);           // m (stirrer radius)
  const [rho, setRho] = useState(1000);       // kg/m³
  const pInf = 101325;                        // Pa
  const [mode, setMode] = useState("velocity");
  const [rotPlaying, setRotPlaying] = useState(true);
  const [rotSpeed, setRotSpeed] = useState(1);

  const v_a = a * omega;
  const p_center = pInf - rho * omega * omega * a * a;   // p at r=0

  return (
    <div>
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🌊</span>Forced vs Free Vortex</div>
        <div className="grid-2">
          <div className="concept-box">
            <h4>🎯 상황 설정</h4>
            <p>반지름 <span className="math-inline">a</span> 의 교반기가 각속도 <span className="math-inline">ω</span> 로 회전. 교반기 내부 유체는 고체처럼 함께 돌고 (forced vortex), 바깥 유체는 자유롭게 회전 (free vortex, 비점성 극한).</p>
          </div>
          <div className="concept-box amber">
            <h4>📐 좌표계 — CCS (r, θ, z)</h4>
            <p>원통좌표계. 축대칭, 오직 방위 속도 <span className="math-inline">v_θ(r)</span> 만 존재 (v_r = v_z = 0).</p>
          </div>
        </div>
      </div>

      {/* Velocity continuity */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">📏</span>속도 분포와 연속 조건</div>
        <div className="math-block">
          <span className="cyan">r ≤ a (Forced):</span>&nbsp;&nbsp; v_θ = r ω
          &nbsp;&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;&nbsp;&nbsp;
          <span className="highlight">r &gt; a (Free):</span>&nbsp;&nbsp; v_θ = C / r
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.5rem" }}>
          Free vortex는 ∇×v = 0 조건 → <span className="math-inline">(1/r)∂(rv_θ)/∂r = 0</span> → <span className="math-inline">r v_θ = const ≡ C</span>.
          연속 조건 <span className="math-inline">v_θ(a) = aω</span> 로부터 <span className="math-inline">C = ωa²</span>.
        </p>
        <div className="math-block">
          따라서&nbsp;&nbsp;<span className="highlight">r &gt; a (Free): v_θ(r) = ω a² / r</span>
        </div>
      </div>

      {/* Rotation visualization — irrotationality intuition */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🌀</span>왜 비회전인가? — 입자의 자전 vs 공전</div>
        <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          학생들이 가장 헷갈려하는 지점입니다. <strong>"회전하는데 왜 비회전인가?"</strong> 답은 vorticity 가 입자의
          <strong> 공전 (curved orbit) 이 아니라 자전 (own spin) </strong>을 측정하기 때문입니다. 두 vortex 에서
          입자에 작은 화살표를 박아두고 시간에 따른 방향 변화를 비교해 봅시다.
        </p>
        <VortexRotationCanvas playing={rotPlaying} speed={rotSpeed} />
        <div className="ctrl-row" style={{ marginTop: "0.8rem" }}>
          <label>
            애니메이션 속도 : <span className="val">{rotSpeed.toFixed(1)}×</span>
            <input type="range" min="0.2" max="2.5" step="0.1"
              value={rotSpeed} onChange={(e) => setRotSpeed(+e.target.value)} />
          </label>
          <button className={`btn ${rotPlaying ? "active" : ""}`}
            onClick={() => setRotPlaying(p => !p)}>
            {rotPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
        <div className="grid-2" style={{ marginTop: "0.8rem" }}>
          <div className="concept-box red">
            <h4>🔴 Forced — 자전 + 공전</h4>
            <p>입자의 화살표가 공전과 함께 같은 각속도로 돌아갑니다. 한 바퀴 공전하면 화살표도 정확히 한 바퀴
              자전. 이는 강체 회전과 동일하고, vorticity ζ = 2ω. 회색 "+" 표시가 모양을 그대로 유지하며 회전하는 점도 확인하세요.</p>
          </div>
          <div className="concept-box green">
            <h4>🟢 Free — 공전만, 자전 없음</h4>
            <p>입자의 화살표가 항상 같은 방향(예: 동쪽)을 가리키며 공전합니다. 관람차 캐빈처럼. 입자 자체는
              회전하지 않으므로 ζ = 0. 단, 회색 "+" 는 변형됩니다 — 안쪽이 v_θ = C/r 로 더 빨라 십자가가
              평행사변형으로 전단(shear). 이 변형은 순수 변형(deformation)일 뿐 회전이 아닙니다.</p>
          </div>
        </div>
        <div className="concept-box amber">
          <h4>📐 수학적 확인</h4>
          <p>
            CCS 에서 vorticity 의 z 성분은 <span className="math-inline">ζ_z = (1/r)·∂(rv_θ)/∂r</span>.<br/>
            • Forced: <span className="math-inline">rv_θ = ωr²</span> → <span className="math-inline">ζ_z = (1/r)·2ωr = 2ω ≠ 0</span>.<br/>
            • Free: <span className="math-inline">rv_θ = C</span> (상수!) → <span className="math-inline">∂(C)/∂r = 0</span> → <span className="math-inline">ζ_z = 0</span>.
            <br/>핵심: free vortex 에서 <strong>r·v_θ 가 r 에 무관한 상수</strong>이므로 미분이 0. 이게 비회전의 수학적
            증명. <em>회오리치는 욕조 배수구 (이상화)가 비회전인 이유.</em>
          </p>
        </div>
        <div className="concept-box purple">
          <h4>🛁 사고 실험 — Rankine vortex</h4>
          <p>실제 욕조 배수구는 forced + free 의 합성 (Rankine vortex) 입니다. 중심부 (r &lt; a) 는 점성 때문에
            forced 처럼 강체 회전, 외곽부 (r &gt; a) 는 free 처럼 비회전. 작은 종이배를 띄우면 중심 가까이는
            빠르게 자전하고, 멀리는 자전 없이 떠내려갑니다.
            12쪽의 v_θ 그래프 (삼각형 모양) 가 바로 이 합성입니다.</p>
        </div>
      </div>

      {/* Pressure derivation */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">💧</span>압력 분포 유도 (Euler + Bernoulli)</div>
        <div className="grid-2">
          <div className="concept-box green">
            <h4>① Forced 영역 (r ≤ a) — Euler</h4>
            <p>Euler의 r-성분: <span className="math-inline">−v_θ²/r = −(1/ρ) ∂p/∂r</span> → <span className="math-inline">∂p/∂r = ρω²r</span> → 적분 후 <span className="math-inline">p(r) = ½ρω²r² + C₁</span></p>
          </div>
          <div className="concept-box amber">
            <h4>② Free 영역 (r &gt; a) — Bernoulli</h4>
            <p>비회전이므로 유선 전체에서 Bernoulli 성립. <span className="math-inline">r → ∞</span> 에서 <span className="math-inline">v_θ → 0, p → p∞</span>:<br/>
            <span className="math-inline">p(r) + ½ρv_θ²(r) = p∞</span> → <span className="math-inline">p(r) = p∞ − ρω²a⁴/(2r²)</span></p>
          </div>
          <div className="concept-box purple">
            <h4>③ 압력 연속 조건 r = a</h4>
            <p>두 식을 r=a 에서 같게 놓아 C₁ 결정: <span className="math-inline">C₁ = p∞ − ρω²a²</span>.<br/>
            최종: <span className="math-inline">p(r ≤ a) = p∞ − ρω²a² + ½ρω²r²</span></p>
          </div>
          <div className="concept-box red">
            <h4>📉 중심부가 가장 낮은 압력</h4>
            <p>r = 0 에서 <span className="math-inline">p(0) = p∞ − ρω²a²</span>. 교반기 중앙이 압력 최소 → 수면이 V 자 모양으로 움푹 파임. 압력 기울기가 유체를 중심 쪽으로 밀어넣어 원심력과 균형.</p>
          </div>
        </div>
      </div>

      {/* Interactive */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">📊</span>Interactive — 속도/압력 라이브 프로파일</div>
        <div className="seg-tabs">
          <button className={`seg-tab ${mode === "velocity" ? "active" : ""}`} onClick={() => setMode("velocity")}>속도 v_θ(r)</button>
          <button className={`seg-tab ${mode === "pressure" ? "active" : ""}`} onClick={() => setMode("pressure")}>압력 p(r)</button>
        </div>
        <VortexProfileCanvas omega={omega} a={a} rho={rho} pInf={pInf} mode={mode} />
        <div className="ctrl-row">
          <label>
            각속도 ω (rad/s) : <span className="val">{omega.toFixed(2)}</span>
            <input type="range" min="0.5" max="20" step="0.1"
              value={omega} onChange={(e) => setOmega(+e.target.value)} />
          </label>
          <label>
            교반기 반경 a (m) : <span className="val">{a.toFixed(3)}</span>
            <input type="range" min="0.01" max="0.15" step="0.005"
              value={a} onChange={(e) => setA(+e.target.value)} />
          </label>
          <label>
            유체 밀도 ρ (kg/m³) : <span className="val">{rho}</span>
            <input type="range" min="500" max="1500" step="10"
              value={rho} onChange={(e) => setRho(+e.target.value)} />
          </label>
        </div>
        <div className="kpi-grid">
          <div className="kpi"><div className="lbl">v_θ(a) = aω (최대속도)</div><div className="val">{fmt(v_a, 3)} m/s</div></div>
          <div className="kpi amber"><div className="lbl">p(0) 중심부 압력</div><div className="val">{fmt(p_center, 0)} Pa</div></div>
          <div className="kpi green"><div className="lbl">압력 저하 Δp = p∞ − p(0)</div><div className="val">{fmt(pInf - p_center, 0)} Pa</div></div>
          <div className="kpi purple"><div className="lbl">p(0) / p∞</div><div className="val">{fmt(p_center / pInf, 3)}</div></div>
        </div>
        <div className="concept-box">
          <h4>🔬 관찰 포인트</h4>
          <p>
            • <strong>속도 모드</strong>: Forced 영역은 직선 (v ∝ r), Free 영역은 쌍곡선 (v ∝ 1/r). 최대값은 정확히 r = a 지점.<br/>
            • <strong>압력 모드</strong>: 중심이 최소, r → ∞ 에서 p → p∞. 두 곡선이 r = a 에서 매끄럽게 이어지는지 (연속 조건!) 확인.<br/>
            • ω 를 2 배로 늘리면 Δp 는 4 배로 증가 (ω² 의존). a 를 2 배로 늘려도 Δp 는 4 배 (a² 의존).
          </p>
        </div>
      </div>

      {/* Bernoulli derivation in free region */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🧭</span>일반화 Bernoulli 방정식 — 왜 비회전 유동에서만?</div>
        <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          Euler 방정식에서 대류항을 벡터 항등식으로 분해하고 정상상태를 적용하면:
        </p>
        <div className="math-block">
          ∂v/∂t + ∇(v²/2) + <span className="red">ζ × v</span> = −∇(p/ρ + gz)
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.5rem" }}>
          정상상태에서 <span className="math-inline">∂v/∂t = 0</span>. 비회전이면 <span className="math-inline">ζ = 0</span> → 둘째 항이 사라지고:
        </p>
        <div className="math-block">
          ∇(p/ρ + v²/2 + gz) = 0 &nbsp;&nbsp;⇒&nbsp;&nbsp;
          <span className="highlight">p/ρ + v²/2 + gz = constant</span> (everywhere, not just along streamlines!)
        </div>
        <div className="concept-box amber">
          <h4>⭐ 회전 vs 비회전의 결정적 차이</h4>
          <p>일반 Euler 유동에서 Bernoulli 는 <strong>같은 유선 상에서만</strong> 성립. 하지만 비회전이면 ζ = 0 이라 Bernoulli 상수가 <strong>전체 유동장에서 같아짐</strong>. Free vortex에서 r = ∞ 의 p∞ 를 r &gt; a 어디서든 사용할 수 있었던 이유.</p>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   ORTHOGONALITY CANVAS: φ vs ψ for various flow patterns
   Visualizes equipotential lines (φ = const) and streamlines (ψ = const)
   to demonstrate their orthogonality.
   ═════════════════════════════════════════════════════════════════ */
function OrthogonalityCanvas({ flowType, U, m }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    const scale = 80;
    const cx = W / 2, cy = H / 2;
    const toX = (x) => cx + x * scale;
    const toY = (y) => cy - y * scale;
    const xMin = -W / (2 * scale), xMax = W / (2 * scale);
    const yMin = -H / (2 * scale), yMax = H / (2 * scale);

    // Define φ and ψ for the chosen flow
    //  φ = velocity potential (red lines)
    //  ψ = stream function  (cyan lines)
    let phi, psi;
    if (flowType === "uniform") {
      phi = (x, y) => U * x;
      psi = (x, y) => U * y;
    } else if (flowType === "source") {
      phi = (x, y) => {
        const r = Math.sqrt(x * x + y * y);
        return r < 1e-9 ? -Infinity : m * Math.log(r);
      };
      psi = (x, y) => Math.atan2(y, x) * m;
    } else if (flowType === "sourceUniform") {
      // Superposition
      phi = (x, y) => {
        const r = Math.sqrt(x * x + y * y);
        return U * x + (r < 1e-9 ? 0 : m * Math.log(r));
      };
      psi = (x, y) => U * y + Math.atan2(y, x) * m;
    } else if (flowType === "stagnation") {
      // φ = ½c(x² − y²),  ψ = cxy
      const coef = U;
      phi = (x, y) => 0.5 * coef * (x * x - y * y);
      psi = (x, y) => coef * x * y;
    }

    // Compute min/max of φ, ψ on a grid
    const Ng = 80;
    let phiMin = Infinity, phiMax = -Infinity;
    let psiMin = Infinity, psiMax = -Infinity;
    for (let i = 0; i <= Ng; i++) {
      for (let j = 0; j <= Ng; j++) {
        const x = xMin + (xMax - xMin) * i / Ng;
        const y = yMin + (yMax - yMin) * j / Ng;
        const f = phi(x, y), g = psi(x, y);
        if (isFinite(f)) { if (f < phiMin) phiMin = f; if (f > phiMax) phiMax = f; }
        if (isFinite(g)) { if (g < psiMin) psiMin = g; if (g > psiMax) psiMax = g; }
      }
    }

    // Marching-squares contour draw
    const drawContours = (fn, fMin, fMax, nLevels, color) => {
      const Nx = 120, Ny = 90;
      const grid = [];
      for (let i = 0; i <= Nx; i++) {
        grid[i] = [];
        for (let j = 0; j <= Ny; j++) {
          const x = xMin + (xMax - xMin) * i / Nx;
          const y = yMin + (yMax - yMin) * j / Ny;
          grid[i][j] = fn(x, y);
        }
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.2;
      for (let k = 1; k < nLevels; k++) {
        const level = fMin + (fMax - fMin) * k / nLevels;
        for (let i = 0; i < Nx; i++) {
          for (let j = 0; j < Ny; j++) {
            const v00 = grid[i][j], v10 = grid[i + 1][j],
                  v11 = grid[i + 1][j + 1], v01 = grid[i][j + 1];
            if (![v00, v10, v11, v01].every(isFinite)) continue;
            const idx =
              ((v00 > level) ? 1 : 0) |
              ((v10 > level) ? 2 : 0) |
              ((v11 > level) ? 4 : 0) |
              ((v01 > level) ? 8 : 0);
            if (idx === 0 || idx === 15) continue;
            // Get 4 corner pixel coords
            const x0 = xMin + (xMax - xMin) * i / Nx;
            const x1 = xMin + (xMax - xMin) * (i + 1) / Nx;
            const y0 = yMin + (yMax - yMin) * j / Ny;
            const y1 = yMin + (yMax - yMin) * (j + 1) / Ny;
            const px00 = toX(x0), py00 = toY(y0);
            const px10 = toX(x1), py10 = toY(y0);
            const px11 = toX(x1), py11 = toY(y1);
            const px01 = toX(x0), py01 = toY(y1);
            // Interpolate edge crossings
            const lerp = (a, b, va, vb) => {
              const t = (level - va) / (vb - va);
              return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
            };
            const eBottom = () => lerp([px00, py00], [px10, py10], v00, v10);
            const eRight  = () => lerp([px10, py10], [px11, py11], v10, v11);
            const eTop    = () => lerp([px01, py01], [px11, py11], v01, v11);
            const eLeft   = () => lerp([px00, py00], [px01, py01], v00, v01);
            const drawSeg = (p, q) => {
              ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
            };
            switch (idx) {
              case 1: case 14: drawSeg(eBottom(), eLeft()); break;
              case 2: case 13: drawSeg(eBottom(), eRight()); break;
              case 3: case 12: drawSeg(eLeft(), eRight()); break;
              case 4: case 11: drawSeg(eTop(), eRight()); break;
              case 5: drawSeg(eBottom(), eLeft()); drawSeg(eTop(), eRight()); break;
              case 6: case 9: drawSeg(eBottom(), eTop()); break;
              case 7: case 8: drawSeg(eLeft(), eTop()); break;
              case 10: drawSeg(eLeft(), eBottom()); drawSeg(eRight(), eTop()); break;
              default: break;
            }
          }
        }
      }
    };

    drawContours(phi, phiMin, phiMax, 20, "rgba(239,68,68,0.7)");    // red = equipotential
    drawContours(psi, psiMin, psiMax, 20, "rgba(0,212,255,0.7)");   // cyan = streamlines

    // Axes
    ctx.strokeStyle = "rgba(148,163,184,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // Legend
    ctx.fillStyle = "rgba(30,42,61,0.85)"; ctx.fillRect(12, 12, 260, 56);
    ctx.strokeStyle = "rgba(167,139,250,0.3)"; ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, 260, 56);
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(22, 28); ctx.lineTo(48, 28); ctx.stroke();
    ctx.fillStyle = "#ef4444"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("φ = const (equipotential lines)", 56, 32);
    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(22, 50); ctx.lineTo(48, 50); ctx.stroke();
    ctx.fillStyle = "#00d4ff";
    ctx.fillText("ψ = const (streamlines)", 56, 54);
  }, [flowType, U, m]);

  return (
    <div className="w10-canvas-wrap">
      <canvas ref={ref} width={720} height={380} />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   TAB 4 — LAPLACE EQUATION (velocity potential & stream function)
   ═════════════════════════════════════════════════════════════════ */
function TabLaplace() {
  const [flowType, setFlowType] = useState("uniform");
  const [U, setU] = useState(1);
  const [m, setM] = useState(0.5);

  const needsU = ["uniform", "sourceUniform", "stagnation"].includes(flowType);
  const needsM = ["source", "sourceUniform"].includes(flowType);

  return (
    <div>
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">ϕ</span>속도 퍼텐셜 & 유선함수 — 정의</div>
        <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          2D 비점성·비압축·비회전 유동 (<span className="math-inline">v_z = 0, ∇·v = 0, ∇×v = 0</span>) 에서 두 가지 보조 스칼라 함수를 정의할 수 있습니다.
        </p>
        <div className="grid-2">
          <div className="concept-box red">
            <h4>🔴 속도 퍼텐셜 φ(x, y)</h4>
            <p>비회전 조건에서 <span className="math-inline">v = ∇φ</span> 로 정의.<br/>
            <span className="math-inline">v_x = ∂φ/∂x</span>, <span className="math-inline">v_y = ∂φ/∂y</span>.<br/>
            <strong>비회전성 자동 만족</strong>: ∇×∇φ ≡ 0 (수학적 항등식).</p>
          </div>
          <div className="concept-box">
            <h4>🔵 유선함수 ψ(x, y)</h4>
            <p><span className="math-inline">v_x = ∂ψ/∂y</span>, <span className="math-inline">v_y = −∂ψ/∂x</span> 로 정의.<br/>
            <strong>연속방정식 자동 만족</strong>: ∂v_x/∂x + ∂v_y/∂y = ∂²ψ/∂x∂y − ∂²ψ/∂y∂x = 0.</p>
          </div>
        </div>
      </div>

      {/* Laplace derivation */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">∇²</span>Laplace 방정식으로의 환원</div>
        <div className="grid-2">
          <div className="concept-box red">
            <h4>🔴 φ 에 남은 조건 = 연속방정식</h4>
            <p>φ 는 이미 비회전 만족. 연속방정식에 대입:</p>
            <div className="math-block">
              ∇·v = ∂v_x/∂x + ∂v_y/∂y = ∂²φ/∂x² + ∂²φ/∂y² = 0
            </div>
            <p style={{ textAlign: "center" }}>⇒ <span className="math-inline">∇²φ = 0</span></p>
          </div>
          <div className="concept-box">
            <h4>🔵 ψ 에 남은 조건 = 비회전성</h4>
            <p>ψ 는 이미 연속방정식 만족. 비회전 조건에 대입:</p>
            <div className="math-block">
              ∂v_y/∂x − ∂v_x/∂y = −∂²ψ/∂x² − ∂²ψ/∂y² = 0
            </div>
            <p style={{ textAlign: "center" }}>⇒ <span className="math-inline">∇²ψ = 0</span></p>
          </div>
        </div>
        <div className="math-block" style={{ fontSize: "1.12rem" }}>
          <span className="highlight">∇²φ = 0</span>&nbsp;&nbsp;&&nbsp;&nbsp;<span className="cyan">∇²ψ = 0</span>&nbsp;&nbsp;—&nbsp;&nbsp;Laplace 방정식!
        </div>
        <div className="concept-box purple">
          <h4>🎁 왜 이게 대박인가</h4>
          <p>복잡한 비선형 N-S 방정식이 <strong>선형·동차 Laplace 방정식</strong> 로 환원. 이로써 ① 변수분리법 (Sturm-Liouville) 으로 해석적 해 가능, ② <strong>선형성 → 중첩(superposition) 성립</strong>: 두 기본 해의 합도 해. 복잡한 유동을 기본 블록의 조합으로 구성 가능.</p>
        </div>
      </div>

      {/* Orthogonality — key interactive */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">⊥</span>Interactive — φ 와 ψ 는 항상 직교</div>
        <div className="math-block">
          ∇φ · ∇ψ = (∂φ/∂x)(∂ψ/∂x) + (∂φ/∂y)(∂ψ/∂y) = v_x · (−v_y) + v_y · v_x = <span className="green">0</span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          두 벡터의 내적이 0 → 등퍼텐셜선(빨강) 과 유선(파랑) 은 모든 점에서 수직. 여러 유동을 선택해서 직접 확인해 보세요.
        </p>
        <div className="seg-tabs">
          <button className={`seg-tab ${flowType === "uniform" ? "active" : ""}`} onClick={() => setFlowType("uniform")}>① Uniform flow</button>
          <button className={`seg-tab ${flowType === "source" ? "active" : ""}`} onClick={() => setFlowType("source")}>② Line source</button>
          <button className={`seg-tab ${flowType === "sourceUniform" ? "active" : ""}`} onClick={() => setFlowType("sourceUniform")}>③ Source + Uniform (Rankine body)</button>
          <button className={`seg-tab ${flowType === "stagnation" ? "active" : ""}`} onClick={() => setFlowType("stagnation")}>④ Stagnation</button>
        </div>
        <OrthogonalityCanvas flowType={flowType} U={U} m={m} />
        <div className="ctrl-row">
          {needsU && (
            <label>
              U (freestream speed) : <span className="val">{U.toFixed(2)}</span>
              <input type="range" min="0.2" max="3" step="0.05"
                value={U} onChange={(e) => setU(+e.target.value)} />
            </label>
          )}
          {needsM && (
            <label>
              m (source strength) : <span className="val">{m.toFixed(2)}</span>
              <input type="range" min="-1.5" max="1.5" step="0.05"
                value={m} onChange={(e) => setM(+e.target.value)} />
            </label>
          )}
        </div>
        <div className="grid-2">
          <div className="concept-box red">
            <h4>🔴 Uniform flow</h4>
            <p>v = (U, 0) → φ = Ux, ψ = Uy. 수직선(빨강) 과 수평선(파랑) 이 격자 모양으로 교차.</p>
          </div>
          <div className="concept-box">
            <h4>🔵 Line source (m &gt; 0)</h4>
            <p>원점에서 방사형으로 분출. φ = m ln r (동심원), ψ = m θ (방사선). 동심원 ⊥ 방사선, 눈으로 명백.</p>
          </div>
          <div className="concept-box purple">
            <h4>🟣 Source + Uniform 중첩 (Rankine half-body)</h4>
            <p>동심원적 기본해 + 수평 균일류 중첩. <strong>같은 Laplace 방정식의 두 해의 합도 해</strong>. 이 중첩이 '반달' 모양 몸체 주변의 유동을 만듦.</p>
          </div>
          <div className="concept-box amber">
            <h4>🟡 Stagnation flow</h4>
            <p>ψ = cxy, φ = ½c(x²−y²). 유선은 쌍곡선 xy = const, 등퍼텐셜도 쌍곡선 x²−y² = const. 서로 수직.</p>
          </div>
        </div>
      </div>

      {/* Property table */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">📋</span>정리 — φ와 ψ 의 역할 대응</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.6rem", textAlign: "left", color: "var(--text3)" }}>항목</th>
                <th style={{ padding: "0.6rem", color: "var(--red)" }}>속도 퍼텐셜 φ</th>
                <th style={{ padding: "0.6rem", color: "var(--cyan)" }}>유선함수 ψ</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["정의", "v = ∇φ", "v_x = ∂ψ/∂y, v_y = −∂ψ/∂x"],
                ["자동 만족하는 조건", "비회전성 (∇×v = 0)", "연속방정식 (∇·v = 0)"],
                ["Laplace 를 얻기 위해 결합해야 하는 조건", "연속방정식", "비회전성"],
                ["등고선의 의미", "등퍼텐셜선 (equipotential)", "유선 (streamline, v 와 평행)"],
                ["존재 조건", "비회전 유동일 때만 존재", "2D 유동이면 항상 존재"],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border2)" }}>
                  <td style={{ padding: "0.55rem", color: "var(--text)", fontWeight: 500 }}>{row[0]}</td>
                  <td style={{ padding: "0.55rem", color: "var(--text2)" }}>{row[1]}</td>
                  <td style={{ padding: "0.55rem", color: "var(--text2)" }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mass flow interpretation of ψ */}
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">💧</span>유선함수의 물리적 의미 — 질량 수송량</div>
        <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          두 점 사이의 <span className="math-inline">ψ</span> 값 차이는 두 점 사이를 통과하는 단위 폭당 부피 유량과 같습니다:
        </p>
        <div className="math-block">
          Q<sub>A→B</sub> = ψ(B) − ψ(A)
        </div>
        <div className="concept-box green">
          <h4>🎯 귀결</h4>
          <p>① 유선 (ψ = const) 을 가로지르는 유량은 0. 즉 <strong>유체가 유선을 넘지 않음</strong>. <br/>
          ② 두 유선 사이의 ψ 차이 → 그 사이로 흐르는 유량. 촘촘한 유선 = 빠른 유속.<br/>
          ③ 고체 경계는 항상 유선 (유체가 들어가지 못하므로).</p>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   CYLINDER FLOW CANVAS
   ψ(r, θ) = U sin θ (r − a²/r)
   φ(r, θ) = U cos θ (r + a²/r)
   ═════════════════════════════════════════════════════════════════ */
function CylinderFlowCanvas({ U, a, showPhi, showPsi }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    const scale = W / 8;
    const cx = W / 2, cy = H / 2;
    const toX = (x) => cx + x * scale;
    const toY = (y) => cy - y * scale;

    const psi = (x, y) => {
      const r = Math.sqrt(x * x + y * y);
      if (r < a) return NaN;
      const s = y / r;
      return U * s * (r - a * a / r);
    };
    const phi = (x, y) => {
      const r = Math.sqrt(x * x + y * y);
      if (r < a) return NaN;
      const cs = x / r;
      return U * cs * (r + a * a / r);
    };

    const xMin = -W / (2 * scale), xMax = W / (2 * scale);
    const yMin = -H / (2 * scale), yMax = H / (2 * scale);

    const drawContours = (fn, fMin, fMax, nLevels, color) => {
      const Nx = 180, Ny = 100;
      const grid = [];
      for (let i = 0; i <= Nx; i++) {
        grid[i] = [];
        for (let j = 0; j <= Ny; j++) {
          const x = xMin + (xMax - xMin) * i / Nx;
          const y = yMin + (yMax - yMin) * j / Ny;
          grid[i][j] = fn(x, y);
        }
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.2;
      for (let k = 1; k <= nLevels; k++) {
        const level = fMin + (fMax - fMin) * k / (nLevels + 1);
        for (let i = 0; i < Nx; i++) {
          for (let j = 0; j < Ny; j++) {
            const v00 = grid[i][j], v10 = grid[i + 1][j],
                  v11 = grid[i + 1][j + 1], v01 = grid[i][j + 1];
            if (![v00, v10, v11, v01].every(isFinite)) continue;
            const idx =
              ((v00 > level) ? 1 : 0) |
              ((v10 > level) ? 2 : 0) |
              ((v11 > level) ? 4 : 0) |
              ((v01 > level) ? 8 : 0);
            if (idx === 0 || idx === 15) continue;
            const x0 = xMin + (xMax - xMin) * i / Nx;
            const x1 = xMin + (xMax - xMin) * (i + 1) / Nx;
            const y0 = yMin + (yMax - yMin) * j / Ny;
            const y1 = yMin + (yMax - yMin) * (j + 1) / Ny;
            const px00 = toX(x0), py00 = toY(y0);
            const px10 = toX(x1), py10 = toY(y0);
            const px11 = toX(x1), py11 = toY(y1);
            const px01 = toX(x0), py01 = toY(y1);
            const lerp = (a, b, va, vb) => {
              const t = (level - va) / (vb - va);
              return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
            };
            const eB = () => lerp([px00, py00], [px10, py10], v00, v10);
            const eR = () => lerp([px10, py10], [px11, py11], v10, v11);
            const eT = () => lerp([px01, py01], [px11, py11], v01, v11);
            const eL = () => lerp([px00, py00], [px01, py01], v00, v01);
            const seg = (p, q) => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
            switch (idx) {
              case 1: case 14: seg(eB(), eL()); break;
              case 2: case 13: seg(eB(), eR()); break;
              case 3: case 12: seg(eL(), eR()); break;
              case 4: case 11: seg(eT(), eR()); break;
              case 5: seg(eB(), eL()); seg(eT(), eR()); break;
              case 6: case 9: seg(eB(), eT()); break;
              case 7: case 8: seg(eL(), eT()); break;
              case 10: seg(eL(), eB()); seg(eR(), eT()); break;
              default: break;
            }
          }
        }
      }
    };

    if (showPhi) drawContours(phi, -4 * U, 4 * U, 18, "rgba(239,68,68,0.55)");
    if (showPsi) drawContours(psi, -2 * U, 2 * U, 16, "rgba(0,212,255,0.8)");

    // Draw cylinder
    ctx.fillStyle = "rgba(100,116,139,0.55)";
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, a * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#64748b"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("a", cx + a * scale / 2 - 4, cy - 5);

    // Stagnation points
    ctx.fillStyle = "#f472b6";
    ctx.beginPath(); ctx.arc(toX(-a), cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(toX(a), cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f472b6"; ctx.font = "10px 'IBM Plex Mono'";
    ctx.fillText("stagnation", toX(-a) - 34, cy + 16);
    ctx.fillText("stagnation", toX(a) + 6, cy + 16);

    // Far-field arrows
    ctx.strokeStyle = "#94a3b8"; ctx.fillStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    for (let yy = -2.5; yy <= 2.5; yy += 1.0) {
      const x1 = toX(-3.5), x2 = toX(-2.8), yp = toY(yy);
      ctx.beginPath(); ctx.moveTo(x1, yp); ctx.lineTo(x2, yp); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, yp); ctx.lineTo(x2 - 5, yp - 3); ctx.lineTo(x2 - 5, yp + 3);
      ctx.closePath(); ctx.fill();
    }
    ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("U", toX(-3.2), toY(2.5) - 6);
  }, [U, a, showPhi, showPsi]);

  return (
    <div className="w10-canvas-wrap">
      <canvas ref={ref} width={720} height={380} />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   STREAM PROBE CANVAS — three concepts in one view
   • Background streamlines (ψ = const) showing field structure
   • Two RED probe streamlines at user-selected y₁, y₂ (far upstream)
     → Δψ = ψ(y₂) − ψ(y₁) numerically equals volumetric flow rate
   • GREEN velocity profile u(y) sampled at vertical slice x = xSlice
   Demonstrates: ψ labels streamlines, Δψ = flow rate, profile is local
   ═════════════════════════════════════════════════════════════════ */
function StreamProbeCanvas({ U, a, y1, y2, xSlice }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Domain: x ∈ [-2.5, 2.5], y ∈ [-1.5, 1.5]
    const xmin = -2.5, xmax = 2.5, ymin = -1.5, ymax = 1.5;
    const px = x => ((x - xmin) / (xmax - xmin)) * W;
    const py = y => H - ((y - ymin) / (ymax - ymin)) * H;
    const dx_unit = W / (xmax - xmin);

    // ψ = U y (1 − a²/(x² + y²)), velocity components
    const psi = (x, y) => {
      const r2 = x * x + y * y;
      if (r2 < 1e-6) return 0;
      return U * y * (1 - (a * a) / r2);
    };
    const uv = (x, y) => {
      const r2 = x * x + y * y;
      if (r2 < a * a) return [0, 0];
      const u = U * (1 - (a * a * (x * x - y * y)) / (r2 * r2));
      const v = -U * ((2 * a * a * x * y) / (r2 * r2));
      return [u, v];
    };

    // Light grid
    ctx.strokeStyle = "rgba(167,139,250,0.06)";
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(xmin); gx <= xmax; gx++) {
      ctx.beginPath(); ctx.moveTo(px(gx), 0); ctx.lineTo(px(gx), H); ctx.stroke();
    }
    for (let gy = Math.ceil(ymin); gy <= ymax; gy++) {
      ctx.beginPath(); ctx.moveTo(0, py(gy)); ctx.lineTo(W, py(gy)); ctx.stroke();
    }

    // Marching-squares-style contour for psi = c
    const drawPsiContour = (cVal, color, lw) => {
      const Nx = 140, Ny = 90;
      const dx = (xmax - xmin) / Nx, dy = (ymax - ymin) / Ny;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let i = 0; i < Nx; i++) {
        for (let j = 0; j < Ny; j++) {
          const x0 = xmin + i * dx, x1 = x0 + dx;
          const y0 = ymin + j * dy, y1 = y0 + dy;
          const cxm = (x0 + x1) / 2, cym = (y0 + y1) / 2;
          if (cxm * cxm + cym * cym < a * a * 0.95) continue;
          const v00 = psi(x0, y0) - cVal;
          const v10 = psi(x1, y0) - cVal;
          const v11 = psi(x1, y1) - cVal;
          const v01 = psi(x0, y1) - cVal;
          const pts = [];
          const it = (xa, ya, va, xb, yb, vb) => {
            const t = va / (va - vb);
            return [xa + t * (xb - xa), ya + t * (yb - ya)];
          };
          if ((v00 < 0) !== (v10 < 0)) pts.push(it(x0, y0, v00, x1, y0, v10));
          if ((v10 < 0) !== (v11 < 0)) pts.push(it(x1, y0, v10, x1, y1, v11));
          if ((v11 < 0) !== (v01 < 0)) pts.push(it(x1, y1, v11, x0, y1, v01));
          if ((v01 < 0) !== (v00 < 0)) pts.push(it(x0, y1, v01, x0, y0, v00));
          if (pts.length >= 2) {
            ctx.moveTo(px(pts[0][0]), py(pts[0][1]));
            ctx.lineTo(px(pts[1][0]), py(pts[1][1]));
          }
        }
      }
      ctx.stroke();
    };

    // Background streamlines (purple family)
    const bgYvals = [-1.35, -1.05, -0.75, -0.45, -0.15, 0.15, 0.45, 0.75, 1.05, 1.35];
    bgYvals.forEach(yv => {
      const cVal = U * yv * (1 - (a * a) / (2.5 * 2.5 + yv * yv));
      drawPsiContour(cVal, "rgba(167,139,250,0.55)", 1.1);
    });
    // Dividing streamline ψ = 0
    drawPsiContour(0, "rgba(167,139,250,0.85)", 1.6);

    // Probe streamlines at y1, y2 (red, thicker)
    const psi1 = U * y1 * (1 - (a * a) / (2.5 * 2.5 + y1 * y1));
    const psi2 = U * y2 * (1 - (a * a) / (2.5 * 2.5 + y2 * y2));
    drawPsiContour(psi1, "#ef4444", 2.2);
    drawPsiContour(psi2, "#ef4444", 2.2);

    // Probe markers far upstream
    [{ y: y1, label: "ψ₁" }, { y: y2, label: "ψ₂" }].forEach(p => {
      ctx.strokeStyle = "rgba(239,68,68,0.4)";
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px(xmin), py(p.y));
      ctx.lineTo(px(-2.0), py(p.y));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ef4444";
      ctx.font = "11px 'IBM Plex Mono', monospace";
      ctx.fillText(p.label, px(xmin) + 4, py(p.y) - 4);
    });

    // Cylinder
    ctx.fillStyle = "rgba(36,50,72,0.85)";
    ctx.strokeStyle = "rgba(167,139,250,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px(0), py(0), a * dx_unit, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Velocity profile at xSlice (green)
    ctx.strokeStyle = "rgba(16,185,129,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(px(xSlice), 0); ctx.lineTo(px(xSlice), H); ctx.stroke();
    ctx.setLineDash([]);

    const baseX = px(xSlice);
    const profileScale = 0.5 * dx_unit;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    let started = false;
    const Ny = 200;
    for (let j = 0; j <= Ny; j++) {
      const y = ymin + (j * (ymax - ymin)) / Ny;
      if (y * y + xSlice * xSlice < a * a) continue;
      const [u] = uv(xSlice, y);
      const X = baseX + u * profileScale;
      const Y = py(y);
      if (!started) { ctx.moveTo(X, Y); started = true; }
      else ctx.lineTo(X, Y);
    }
    ctx.stroke();

    // Velocity arrows along profile
    ctx.strokeStyle = "#10b981";
    ctx.fillStyle = "#10b981";
    ctx.lineWidth = 1.2;
    [-1.2, -0.8, -0.4, 0.4, 0.8, 1.2].forEach(y => {
      if (y * y + xSlice * xSlice < a * a) return;
      const [u] = uv(xSlice, y);
      const X = baseX + u * profileScale;
      const Y = py(y);
      ctx.beginPath(); ctx.moveTo(baseX, Y); ctx.lineTo(X, Y); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(X, Y); ctx.lineTo(X - 5, Y - 3); ctx.lineTo(X - 5, Y + 3);
      ctx.closePath(); ctx.fill();
    });

    // Profile label
    ctx.fillStyle = "#10b981";
    ctx.font = "12px 'IBM Plex Sans KR', sans-serif";
    ctx.fillText(`u(y) profile @ x = ${xSlice.toFixed(1)}`, baseX + 8, 18);
  }, [U, a, y1, y2, xSlice]);

  return (
    <canvas ref={ref} width={760} height={420}
      style={{ width: "100%", height: "auto", display: "block",
        background: "var(--navy2)", borderRadius: "8px",
        border: "1px solid var(--border)" }} />
  );
}

/* ═════════════════════════════════════════════════════════════════
   SOURCE/SINK + UNIFORM SUPERPOSITION CANVAS
   ψ = U·y − (Q/π) atan2(y, x)   (sink at origin, Q>0 → sink strength)
   φ = U·x − (Q/π)·½·ln(x² + y²) ... not needed for visualization
   Show streamlines only for clarity. Sink strength can be +Q (sink) or −Q (source)
   ═════════════════════════════════════════════════════════════════ */
function SuperpositionCanvas({ U, Q }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);

    const scale = W / 8;
    const cx = W / 2, cy = H / 2;
    const toX = (x) => cx + x * scale;
    const toY = (y) => cy - y * scale;

    // ψ: superposition following the PDF (uniform flow in −y, line sink at origin)
    //   ψ₁ = U·x (uniform flow going in −y direction: v_y = −U → ψ₁ = U·x)
    //   ψ₂ = −(Q/π) atan2(y, x)  (sink of strength Q through narrow slot at origin)
    //   Total ψ = U·x − (Q/π) atan2(y, x)
    const psi = (x, y) => U * x - (Q / Math.PI) * Math.atan2(y, x);

    const xMin = -W / (2 * scale), xMax = W / (2 * scale);
    const yMin = -H / (2 * scale), yMax = H / (2 * scale);

    // Grid for streamlines
    const Nx = 180, Ny = 100;
    const grid = [];
    for (let i = 0; i <= Nx; i++) {
      grid[i] = [];
      for (let j = 0; j <= Ny; j++) {
        const x = xMin + (xMax - xMin) * i / Nx;
        const y = yMin + (yMax - yMin) * j / Ny;
        grid[i][j] = psi(x, y);
      }
    }

    // draw streamlines at multiple levels
    const psiValues = [];
    for (let k = -8; k <= 8; k++) psiValues.push(k * 0.3);

    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 1.2;
    for (const level of psiValues) {
      for (let i = 0; i < Nx; i++) {
        for (let j = 0; j < Ny; j++) {
          const v00 = grid[i][j], v10 = grid[i + 1][j],
                v11 = grid[i + 1][j + 1], v01 = grid[i][j + 1];
          if (![v00, v10, v11, v01].every(isFinite)) continue;
          const idx =
            ((v00 > level) ? 1 : 0) |
            ((v10 > level) ? 2 : 0) |
            ((v11 > level) ? 4 : 0) |
            ((v01 > level) ? 8 : 0);
          if (idx === 0 || idx === 15) continue;
          const x0 = xMin + (xMax - xMin) * i / Nx;
          const x1 = xMin + (xMax - xMin) * (i + 1) / Nx;
          const y0 = yMin + (yMax - yMin) * j / Ny;
          const y1 = yMin + (yMax - yMin) * (j + 1) / Ny;
          const px00 = toX(x0), py00 = toY(y0);
          const px10 = toX(x1), py10 = toY(y0);
          const px11 = toX(x1), py11 = toY(y1);
          const px01 = toX(x0), py01 = toY(y1);
          const lerp = (a, b, va, vb) => {
            const t = (level - va) / (vb - va);
            return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
          };
          const eB = () => lerp([px00, py00], [px10, py10], v00, v10);
          const eR = () => lerp([px10, py10], [px11, py11], v10, v11);
          const eT = () => lerp([px01, py01], [px11, py11], v01, v11);
          const eL = () => lerp([px00, py00], [px01, py01], v00, v01);
          const seg = (p, q) => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
          switch (idx) {
            case 1: case 14: seg(eB(), eL()); break;
            case 2: case 13: seg(eB(), eR()); break;
            case 3: case 12: seg(eL(), eR()); break;
            case 4: case 11: seg(eT(), eR()); break;
            case 5: seg(eB(), eL()); seg(eT(), eR()); break;
            case 6: case 9: seg(eB(), eT()); break;
            case 7: case 8: seg(eL(), eT()); break;
            case 10: seg(eL(), eB()); seg(eR(), eT()); break;
            default: break;
          }
        }
      }
    }

    // Sink/source point at origin
    const isSink = Q > 0;
    ctx.fillStyle = isSink ? "#f472b6" : "#10b981";
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isSink ? "#f472b6" : "#10b981"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText(isSink ? "Sink" : "Source", cx + 10, cy - 6);

    // Show Q/U ratio line (capture width)
    const dx = Math.abs(Q / U);  // Q / (πU) actually... half-width = Q/(2U)
    if (dx > 0 && dx < xMax) {
      ctx.strokeStyle = "rgba(245,158,11,0.5)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(toX(-xMax + 0.2), toY(dx / 2));
      ctx.lineTo(toX(xMax - 0.2), toY(dx / 2));
      ctx.moveTo(toX(-xMax + 0.2), toY(-dx / 2));
      ctx.lineTo(toX(xMax - 0.2), toY(-dx / 2));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f59e0b"; ctx.font = "10px 'IBM Plex Mono'";
      if (isSink) {
        ctx.fillText(`capture width Δx ≈ Q/U = ${(Math.abs(Q) / U).toFixed(2)}`, 20, toY(dx / 2) - 6);
      }
    }

    // Far-field flow arrows (downward, per PDF's −U convention)
    ctx.strokeStyle = "#94a3b8"; ctx.fillStyle = "#94a3b8"; ctx.lineWidth = 1.2;
    for (let xx = -3; xx <= 3; xx += 1.2) {
      const xp = toX(xx), y1 = toY(2.5), y2 = toY(2.0);
      ctx.beginPath(); ctx.moveTo(xp, y1); ctx.lineTo(xp, y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xp, y2); ctx.lineTo(xp - 3, y2 - 5); ctx.lineTo(xp + 3, y2 - 5);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px 'IBM Plex Mono'";
    ctx.fillText("U ↓", toX(-3) - 20, toY(2.3));
  }, [U, Q]);

  return (
    <div className="w10-canvas-wrap">
      <canvas ref={ref} width={720} height={380} />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   TAB 5 — CASE STUDIES
   Sub-tabs: cylinder / stagnation / source-sink
   ═════════════════════════════════════════════════════════════════ */
function TabCases() {
  const [sub, setSub] = useState("cylinder");

  // Cylinder state
  const [U_cyl, setU_cyl] = useState(1);
  const [a_cyl, setA_cyl] = useState(1);
  const [showPhi, setShowPhi] = useState(true);
  const [showPsi, setShowPsi] = useState(true);

  // Stream-probe state (for ψ flow-rate demonstration)
  const [U_pr, setU_pr] = useState(1);
  const [a_pr, setA_pr] = useState(0.6);
  const [y1_pr, setY1_pr] = useState(0.3);
  const [y2_pr, setY2_pr] = useState(0.9);
  const [xSlice_pr, setXSlice_pr] = useState(1.6);

  // Source/sink state
  const [U_ss, setU_ss] = useState(1);
  const [Q_ss, setQ_ss] = useState(2);

  return (
    <div>
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🗂</span>Case Studies — 선형성의 힘</div>
        <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
          Laplace 방정식은 <strong>선형·동차</strong> 입니다. 따라서 두 해의 합도 해. 이 원리로 기본 유동 (uniform · source · sink · vortex · doublet) 들의 조합으로 복잡한 실제 유동을 만들 수 있습니다.
        </p>
        <div className="seg-tabs">
          <button className={`seg-tab ${sub === "cylinder" ? "active" : ""}`} onClick={() => setSub("cylinder")}>실린더 주변 유동</button>
          <button className={`seg-tab ${sub === "stagnation" ? "active" : ""}`} onClick={() => setSub("stagnation")}>Stagnation flow</button>
          <button className={`seg-tab ${sub === "sourceSink" ? "active" : ""}`} onClick={() => setSub("sourceSink")}>Source/Sink + Uniform (superposition)</button>
        </div>
      </div>

      {/* === Cylinder === */}
      {sub === "cylinder" && (
        <>
          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">⭕</span>Flow past a cylinder — Sturm-Liouville 풀이</div>
            <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
              반경 a 의 실린더가 멀리서 일정한 속도 U 로 접근하는 유동 속에 놓임. 비점성·비회전 가정으로 해석.
            </p>
            <div className="concept-box purple">
              <h4>📐 유도 개요</h4>
              <p>
                ① Laplace 방정식 <span className="math-inline">∇²ψ = 0</span> 을 CCS 에서 변수분리 <span className="math-inline">ψ(r, θ) = R(r)T(θ)</span>.<br/>
                ② 두 개의 ODE 로 분리 → R'' r² + R' r − λ² R = 0 (Euler ODE, 해 <span className="math-inline">R = r<sup>λ</sup> + C r<sup>−λ</sup></span>), T'' + λ² T = 0 (해 <span className="math-inline">T = A cos λθ + B sin λθ</span>).<br/>
                ③ 주기 조건 T(θ+2π) = T(θ) → λ = n (정수).<br/>
                ④ BC 적용:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;• 실린더 표면 r = a 에서 유선 : <span className="math-inline">ψ(a, θ) = 0</span> → <span className="math-inline">C = −a²ⁿ</span>.<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;• 무한원에서 균일 유동 : <span className="math-inline">ψ → U r sin θ</span> → n = 1, A = 0, B = U.
              </p>
            </div>
            <div className="math-block">
              <span className="highlight">ψ(r, θ) = U sin θ · (r − a²/r)</span>,&nbsp;&nbsp;
              <span className="cyan">φ(r, θ) = U cos θ · (r + a²/r)</span>
            </div>
          </div>

          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">📊</span>Interactive — 스트림라인 & 등퍼텐셜</div>
            <CylinderFlowCanvas U={U_cyl} a={a_cyl} showPhi={showPhi} showPsi={showPsi} />
            <div className="ctrl-row">
              <label>
                U (freestream) : <span className="val">{U_cyl.toFixed(2)}</span>
                <input type="range" min="0.3" max="3" step="0.1"
                  value={U_cyl} onChange={(e) => setU_cyl(+e.target.value)} />
              </label>
              <label>
                a (cylinder radius) : <span className="val">{a_cyl.toFixed(2)}</span>
                <input type="range" min="0.5" max="1.6" step="0.05"
                  value={a_cyl} onChange={(e) => setA_cyl(+e.target.value)} />
              </label>
              <button className={`btn ${showPsi ? "active" : ""}`} onClick={() => setShowPsi(s => !s)}>
                Streamlines ψ
              </button>
              <button className={`btn ${showPhi ? "active" : ""}`} onClick={() => setShowPhi(s => !s)}>
                Equipotentials φ
              </button>
            </div>
            <div className="concept-box">
              <h4>🔬 관찰 포인트</h4>
              <p>
                • <strong>앞·뒤 stagnation point</strong> (분홍 점): (±a, 0). 이 점에서 유체가 완전히 멈추고 실린더 표면을 따라 갈라집니다.<br/>
                • 실린더 표면 자체가 ψ = 0 유선 → 유체가 표면을 넘지 못함 (경계조건).<br/>
                • 실린더 측면 (θ = ±π/2) 에서 속도가 최대로 <strong>2U</strong>. 이로 인해 Bernoulli 로 <strong>압력이 최소</strong> → d'Alembert 역설의 원인 (저항력 = 0).
              </p>
            </div>
          </div>

          {/* Stream Function Probe — three concepts in one view */}
          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">🎯</span>심화 — Stream function · Streamline · Velocity profile 한눈에</div>
            <p style={{ fontSize: "0.88rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
              세 개념의 관계를 직접 조작하며 확인하는 도구입니다. 두 개의 빨간 probe streamline (y₁, y₂ 위치)을
              움직이면 그 사이의 <strong>Δψ 값이 두 유선 사이를 통과하는 단위 깊이당 부피유량</strong>과 같음을 수치로
              확인할 수 있고, 초록색 velocity profile 은 한 단면 (x = x_slice) 에서의 u(y) 분포로 streamline 이 좁아지는 곳에서 속도가 빨라짐을 시각화합니다.
            </p>
            <StreamProbeCanvas U={U_pr} a={a_pr} y1={y1_pr} y2={y2_pr} xSlice={xSlice_pr} />
            <div className="ctrl-row" style={{ marginTop: "0.6rem" }}>
              <label>
                자유유동 U_∞ : <span className="val">{U_pr.toFixed(2)}</span>
                <input type="range" min="0.3" max="2" step="0.05"
                  value={U_pr} onChange={(e) => setU_pr(+e.target.value)} />
              </label>
              <label>
                실린더 반경 a : <span className="val">{a_pr.toFixed(2)}</span>
                <input type="range" min="0.2" max="1.0" step="0.02"
                  value={a_pr} onChange={(e) => setA_pr(+e.target.value)} />
              </label>
              <label>
                Probe y₁ : <span className="val">{(y1_pr >= 0 ? "+" : "") + y1_pr.toFixed(2)}</span>
                <input type="range" min="-1.5" max="1.5" step="0.02"
                  value={y1_pr} onChange={(e) => setY1_pr(+e.target.value)} />
              </label>
              <label>
                Probe y₂ : <span className="val">{(y2_pr >= 0 ? "+" : "") + y2_pr.toFixed(2)}</span>
                <input type="range" min="-1.5" max="1.5" step="0.02"
                  value={y2_pr} onChange={(e) => setY2_pr(+e.target.value)} />
              </label>
              <label>
                Profile 위치 x : <span className="val">{xSlice_pr.toFixed(2)}</span>
                <input type="range" min="-2.0" max="2.0" step="0.05"
                  value={xSlice_pr} onChange={(e) => setXSlice_pr(+e.target.value)} />
              </label>
            </div>
            {(() => {
              // Compute ψ at probes (far upstream approximation: x = -2.5)
              const psi1 = U_pr * y1_pr * (1 - (a_pr * a_pr) / (2.5 * 2.5 + y1_pr * y1_pr));
              const psi2 = U_pr * y2_pr * (1 - (a_pr * a_pr) / (2.5 * 2.5 + y2_pr * y2_pr));
              // u at slice
              const r2_s = xSlice_pr * xSlice_pr + y1_pr * y1_pr;
              const inside = r2_s < a_pr * a_pr;
              const u_at_y1 = inside ? 0 :
                U_pr * (1 - (a_pr * a_pr * (xSlice_pr * xSlice_pr - y1_pr * y1_pr)) / (r2_s * r2_s));
              return (
                <div className="kpi-grid" style={{ marginTop: "0.8rem" }}>
                  <div className="kpi"><div className="lbl">ψ₁ at y₁</div>
                    <div className="val">{fmt(psi1, 3)}</div></div>
                  <div className="kpi"><div className="lbl">ψ₂ at y₂</div>
                    <div className="val">{fmt(psi2, 3)}</div></div>
                  <div className="kpi amber">
                    <div className="lbl">Δψ = 두 유선 사이 유량</div>
                    <div className="val">{fmt(psi2 - psi1, 3)}</div></div>
                  <div className="kpi green">
                    <div className="lbl">u(y₁) at x = {xSlice_pr.toFixed(1)}</div>
                    <div className="val">{inside ? "—" : fmt(u_at_y1, 3)}</div></div>
                </div>
              );
            })()}
            <div className="grid-2" style={{ marginTop: "0.8rem" }}>
              <div className="concept-box">
                <h4>🔬 관찰 ① — Δψ = 유량</h4>
                <p>y₁, y₂ 슬라이더를 움직이면 두 빨간 probe streamline 이 함께 움직이고 Δψ 값이 실시간 갱신.
                  두 유선 사이 영역은 <strong>가상의 도관 (virtual duct)</strong> 으로 작동하고, 그 안의 단위 깊이당
                  유량이 정확히 Δψ. 유체는 streamline 을 가로지를 수 없습니다.</p>
              </div>
              <div className="concept-box purple">
                <h4>🔬 관찰 ② — 좁아진 곳 = 빠른 곳</h4>
                <p>실린더 위·아래 어깨 (θ = ±90°) 에서 보라색 streamline 이 가장 촘촘. 같은 Δψ 가 좁은 통로를
                  지나야 하므로 속도 ↑. 포텐셜 이론에 따르면 그 지점에서 |V| = 2U_∞. Bernoulli 로 압력 최소.</p>
              </div>
              <div className="concept-box green">
                <h4>🔬 관찰 ③ — Profile 은 국소 정보</h4>
                <p>초록색 곡선은 한 단면 x = x_slice 에서의 u(y) 단면도. 슬라이서를 다른 위치로 옮기면 모양이 바뀜.
                  velocity profile 은 <strong>국소 정보</strong>, ψ 는 <strong>장 전체의 구조 정보</strong>.</p>
              </div>
              <div className="concept-box amber">
                <h4>📐 수학적 확인</h4>
                <p>유량 정의: <span className="math-inline">Q = ∫ u dy (from y₁ to y₂) = ∫ ∂ψ/∂y dy = ψ(y₂) − ψ(y₁) = Δψ</span>.<br/>
                  미적분의 기본정리에서 직접 따라옵니다. ψ 의 정의 <span className="math-inline">u = ∂ψ/∂y</span>
                  를 적분하면 그대로 유량이 됩니다.</p>
              </div>
            </div>
          </div>

          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">⚠</span>d'Alembert 역설 — 이 이론의 한계</div>
            <div className="concept-box red">
              <h4>🚨 역설의 내용</h4>
              <p>이 퍼텐셜 해로 실린더 표면의 압력을 적분하면 drag = 0 이 나옵니다. 하지만 실제로는 마찰 drag 가 명백히 존재!</p>
            </div>
            <div className="concept-box amber">
              <h4>💡 해소</h4>
              <p>퍼텐셜 이론은 <strong>비점성</strong> 을 가정. 실제 실린더 주변에는 점성 경계층이 형성되고, 뒷부분에서 유동 분리 (flow separation) 가 일어나 wake 영역이 생깁니다. 이 wake 가 drag 의 원인. 퍼텐셜 이론은 실린더 <strong>앞쪽 표면의 압력 분포</strong> 는 잘 맞추지만 전체 drag 예측은 실패.</p>
            </div>
          </div>
        </>
      )}

      {/* === Stagnation flow === */}
      {sub === "stagnation" && (
        <>
          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">✚</span>Stagnation Flow — 가장 단순한 코너 유동</div>
            <div className="grid-2">
              <div className="concept-box">
                <h4>🎯 유도</h4>
                <p>ψ = cxy 를 가정. <span className="math-inline">v_x = ∂ψ/∂y = cx</span>, <span className="math-inline">v_y = −∂ψ/∂x = −cy</span>.<br/>
                연속방정식 자동 만족. 비회전 확인: <span className="math-inline">∂v_y/∂x − ∂v_x/∂y = 0</span> ✓.</p>
              </div>
              <div className="concept-box amber">
                <h4>📐 유선 = xy = K = 쌍곡선</h4>
                <p>각 ψ = K 값에 대해 <span className="math-inline">y = K/(cx)</span>. 1사분면과 3사분면에서 쌍곡선, 2·4사분면에서도 쌍곡선. 원점은 stagnation point.</p>
              </div>
            </div>
          </div>

          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">📊</span>Interactive — Stagnation flow 패턴</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "0.6rem" }}>
              Tab 4 의 직교성 시각화에서 'Stagnation' 모드로 돌아가면 쌍곡선 유선과 쌍곡선 등퍼텐셜이 서로 수직인 그림을 볼 수 있습니다.
            </p>
            <div className="concept-box green">
              <h4>🏭 공업 응용</h4>
              <p>반도체 공정의 <strong>spin coating</strong> (기판 중심에 액체를 떨어뜨릴 때), 제트 엔진 입구의 <strong>stagnation 지점</strong>, 피토관의 측정 원리 등 — 원점 근처의 '갈라지는 유동' 은 어디에나 있습니다.</p>
            </div>
          </div>
        </>
      )}

      {/* === Source/Sink + Uniform === */}
      {sub === "sourceSink" && (
        <>
          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">⇌</span>Line Source/Sink + Uniform Flow</div>
            <div className="concept-box purple">
              <h4>🎁 Laplace 방정식의 선물 — Superposition</h4>
              <p>두 유동 ψ₁, ψ₂ 가 각각 ∇²ψ = 0 의 해라면, <span className="math-inline">ψ = ψ₁ + ψ₂</span> 도 해. 기본 블록을 더해서 원하는 유동을 건설할 수 있습니다.</p>
            </div>
            <div className="grid-2">
              <div className="concept-box">
                <h4>① Uniform stream (강의 PDF 에서는 −y 방향)</h4>
                <p>v = (0, −U) → ψ₁ = U x</p>
              </div>
              <div className="concept-box amber">
                <h4>② Line sink (원점 슬롯)</h4>
                <p>단위 깊이당 유입 유량 Q 로 유체가 슬롯으로 빨려들어감 → v_r = −Q/(2πr), ψ₂ = −(Q/π)·θ = −(Q/π)·atan2(y, x)</p>
              </div>
            </div>
            <div className="math-block">
              ψ(x, y) = <span className="cyan">Ux</span> − <span className="highlight">(Q/π) atan2(y, x)</span>
            </div>
          </div>

          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">📊</span>Interactive — Sink 강도 슬라이더</div>
            <SuperpositionCanvas U={U_ss} Q={Q_ss} />
            <div className="ctrl-row">
              <label>
                U (freestream, downward) : <span className="val">{U_ss.toFixed(2)}</span>
                <input type="range" min="0.3" max="3" step="0.1"
                  value={U_ss} onChange={(e) => setU_ss(+e.target.value)} />
              </label>
              <label>
                Q (sink strength, + = sink, − = source) : <span className="val">{Q_ss.toFixed(2)}</span>
                <input type="range" min="-3" max="3" step="0.1"
                  value={Q_ss} onChange={(e) => setQ_ss(+e.target.value)} />
              </label>
              <button className="btn" onClick={() => { setU_ss(1); setQ_ss(2); }}>Sink preset</button>
              <button className="btn" onClick={() => { setU_ss(1); setQ_ss(-1.5); }}>Source preset</button>
            </div>
            <div className="concept-box green">
              <h4>🎯 Capture width 개념</h4>
              <p>Sink (Q &gt; 0) 의 경우, 멀리서 흘러내려오던 유체 중 <strong>x ∈ (−Q/(2U), Q/(2U))</strong> 범위의 '기둥' 만이 sink 로 빨려 들어갑니다. 이 폭을 capture width Δx = Q/U 라고 부릅니다. 주황 점선으로 표시됨.<br/>
              <strong>응용</strong>: 공기 정화장치 흡입구 설계, 지하수 양수정의 영향권 계산.</p>
            </div>
            <div className="concept-box amber">
              <h4>⚡ Q 부호 뒤집기</h4>
              <p>Q &lt; 0 으로 바꾸면 source (녹색). 균일류와 source 의 합은 <strong>Rankine half-body</strong> 유동을 만들고, 이는 선박의 뱃머리나 항공기 동체 앞부분 근처의 유동을 근사할 때 쓰입니다.</p>
            </div>
          </div>

          <div className="w10-card">
            <div className="w10-card-title"><span className="icon">🧰</span>Building blocks of potential flow — 정리</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "0.55rem", textAlign: "left", color: "var(--text3)" }}>Elementary flow</th>
                    <th style={{ padding: "0.55rem", color: "var(--red)" }}>φ</th>
                    <th style={{ padding: "0.55rem", color: "var(--cyan)" }}>ψ</th>
                    <th style={{ padding: "0.55rem", color: "var(--text2)" }}>Physical picture</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Uniform flow (+x)", "Ux", "Uy", "멀리서 일정한 속도 U"],
                    ["Line source", "m ln r", "m θ", "원점에서 방사형 분출, m > 0"],
                    ["Line sink", "−m ln r", "−m θ", "원점으로 빨려들어감"],
                    ["Free vortex", "Γθ / (2π)", "−(Γ/2π) ln r", "원점 주위 순환 Γ"],
                    ["Doublet", "μ cos θ / r", "−μ sin θ / r", "무한히 가까운 source + sink"],
                    ["Uniform + Doublet", "U(r + a²/r) cos θ", "U(r − a²/r) sin θ", "= 실린더 주변 유동!"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border2)" }}>
                      <td style={{ padding: "0.5rem", color: "var(--text)", fontWeight: 500 }}>{row[0]}</td>
                      <td style={{ padding: "0.5rem", color: "var(--red)", fontFamily: "'Crimson Pro', serif", fontStyle: "italic" }}>{row[1]}</td>
                      <td style={{ padding: "0.5rem", color: "var(--cyan)", fontFamily: "'Crimson Pro', serif", fontStyle: "italic" }}>{row[2]}</td>
                      <td style={{ padding: "0.5rem", color: "var(--text2)" }}>{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text3)", marginTop: "0.6rem", textAlign: "center" }}>
              <strong>실린더 유동 = Uniform + Doublet</strong> 이 사실은 19세기 중반부터 알려진 우아한 결과.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   TAB 6 — QUIZ
   ═════════════════════════════════════════════════════════════════ */
const QUIZ = [
  {
    q: "비점성 유체 (inviscid fluid) 근사가 유효한 조건이 아닌 것은?",
    opts: [
      "고체 경계에서 충분히 먼 영역",
      "재순환이 없는 유동 (no eddy/swirl)",
      "Reynolds 수가 매우 낮은 영역",
      "경계층 바깥의 주류 영역",
    ],
    a: 2,
    why: "Re 가 매우 낮으면 점성이 지배적 (creeping flow). 비점성 가정은 Re 가 크고 경계층 바깥에서 유효.",
  },
  {
    q: "와도(vorticity) 의 정의는?",
    opts: ["ζ = ∇·v", "ζ = ∇×v", "ζ = ∂v/∂t", "ζ = |v|²"],
    a: 1,
    why: "와도는 속도장의 curl. 유체 입자의 국소 회전을 측정.",
  },
  {
    q: "2D 유동에서 각속도 ω_z 와 와도 ζ_z 의 관계는?",
    opts: ["ω_z = ζ_z", "ω_z = 2ζ_z", "ω_z = ζ_z / 2", "ω_z = ζ_z²"],
    a: 2,
    why: "와도는 각속도의 2배. ω_z = ½(∂v_y/∂x − ∂v_x/∂y), ζ_z = ∂v_y/∂x − ∂v_x/∂y.",
  },
  {
    q: "Forced vortex 의 방위 속도 분포는?",
    opts: ["v_θ = const", "v_θ = rω (선형)", "v_θ = C/r (쌍곡선)", "v_θ = r²ω"],
    a: 1,
    why: "Forced vortex 는 고체처럼 회전 → 모든 유체 입자가 같은 각속도 ω. 따라서 v_θ = rω.",
  },
  {
    q: "Free vortex (irrotational vortex) 의 방위 속도 분포는?",
    opts: ["v_θ = const", "v_θ = rω", "v_θ = C/r", "v_θ = r²ω"],
    a: 2,
    why: "비회전 조건 ∇×v = 0 → (1/r)∂(rv_θ)/∂r = 0 → rv_θ = C → v_θ = C/r.",
  },
  {
    q: "비회전 유동에서 Bernoulli 방정식이 특별한 점은?",
    opts: [
      "같은 유선 상에서만 성립",
      "전체 유동장에서 같은 상수 (모든 유선에 대해)",
      "점성이 있어도 성립",
      "회전 유동에서도 성립",
    ],
    a: 1,
    why: "ζ = 0 이면 Euler 방정식의 ζ×v 항이 사라져 전체가 gradient 방정식이 됨. 따라서 Bernoulli 상수가 전 유동장에서 동일.",
  },
  {
    q: "속도 퍼텐셜 φ 와 유선함수 ψ 의 관계는?",
    opts: [
      "평행",
      "직교 (∇φ · ∇ψ = 0)",
      "반대 방향",
      "같은 함수",
    ],
    a: 1,
    why: "∇φ·∇ψ = v_x(−v_y) + v_y(v_x) = 0. 두 등고선 계열은 어디서든 수직.",
  },
  {
    q: "속도 퍼텐셜 φ 에 Laplace 방정식이 적용되려면 어떤 조건이 필요한가?",
    opts: [
      "비회전성 조건만",
      "연속방정식 (비압축) 조건을 추가로 대입",
      "Bernoulli 방정식",
      "대칭 조건",
    ],
    a: 1,
    why: "φ 는 이미 비회전 자동 만족. ∇²φ = ∇·v = 0 을 얻으려면 연속방정식을 사용해야 함.",
  },
  {
    q: "유선함수 ψ 의 두 점 사이 값 차이 Δψ 가 의미하는 것은?",
    opts: [
      "속도 크기의 차이",
      "두 점 사이를 통과하는 단위 폭당 부피 유량",
      "압력 차이",
      "회전율의 차이",
    ],
    a: 1,
    why: "ψ(B) − ψ(A) = 두 점 사이를 가로지르는 단위 폭당 유량. 따라서 ψ = const 선(유선)을 가로지르는 유량은 0 → 유체가 유선을 넘지 않음.",
  },
  {
    q: "Laplace 방정식의 어떤 수학적 성질이 'superposition (중첩)' 을 가능하게 하는가?",
    opts: [
      "비선형성",
      "선형성 & 동차성 (linear & homogeneous)",
      "주기성",
      "대칭성",
    ],
    a: 1,
    why: "∇²ψ₁ = 0 과 ∇²ψ₂ = 0 이면 ∇²(ψ₁ + ψ₂) = 0. 이게 기본 유동들의 조합으로 복잡한 유동을 만들 수 있는 근거.",
  },
  {
    q: "실린더 주변 퍼텐셜 유동의 유선함수 ψ = U sin θ (r − a²/r) 에서, 실린더 표면 (r = a) 에서의 값은?",
    opts: ["Ua", "0", "∞", "U/a"],
    a: 1,
    why: "r = a 대입 → (a − a²/a) = 0. 실린더 표면은 ψ = 0 유선. 즉 고체 경계는 항상 유선.",
  },
  {
    q: "d'Alembert 역설이란 무엇인가?",
    opts: [
      "실린더 주변 유동에 해가 존재하지 않는다",
      "비점성 퍼텐셜 이론이 예측하는 항력(drag) 이 0 이라는 모순",
      "압력이 음수가 된다",
      "연속방정식과 비회전성이 모순된다",
    ],
    a: 1,
    why: "퍼텐셜 해로 실린더 표면 압력을 적분하면 drag = 0. 하지만 실제로는 drag 존재. 이는 점성 경계층 분리에 의한 것으로, 퍼텐셜 이론의 한계를 보여줌.",
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
    setIdx((i) => i + 1); setSelected(null);
  };
  const reset = () => { setIdx(0); setSelected(null); setScore(0); setDone(false); setAnswers({}); };

  if (done) {
    const ratio = score / QUIZ.length;
    return (
      <div className="w10-card">
        <div className="w10-card-title"><span className="icon">🎯</span>퀴즈 완료 — Quiz Complete</div>
        <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <div style={{ fontSize: "3rem", fontWeight: 700, color: ratio >= 0.8 ? "var(--green)" : ratio >= 0.5 ? "var(--amber)" : "var(--red)" }}>
            {score} / {QUIZ.length}
          </div>
          <div style={{ color: "var(--text2)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            {ratio >= 0.8 ? "🏆 훌륭합니다! 와도·Laplace 유동 완전 정복!" :
             ratio >= 0.5 ? "👍 괜찮습니다. 틀린 문제를 다시 학습해 보세요." :
             "📖 강의자료를 다시 한 번 읽어보고 도전해보세요."}
          </div>
          <button className="btn primary" onClick={reset}>↺ 다시 풀기</button>
        </div>
        <div className="w10-div"></div>
        <h4 style={{ color: "var(--purple)", marginBottom: "0.8rem" }}>응답 검토</h4>
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
    <div className="w10-card">
      <div className="w10-card-title"><span className="icon">❓</span>자가평가 Quiz — Week 10</div>
      <div className="quiz-progress">
        <span style={{ fontSize: "0.85rem", color: "var(--text2)" }}>문항 {idx + 1} / {QUIZ.length}</span>
        <span className="pct">점수 {score} / {idx + (selected !== null ? 1 : 0)}</span>
      </div>
      <div className="quiz-bar"><div className="quiz-bar-fill" style={{ width: `${pct}%` }} /></div>
      <div className="quiz-q">{cur.q}</div>
      {cur.opts.map((opt, i) => {
        const cls =
          selected === null ? "quiz-opt"
          : i === cur.a ? "quiz-opt correct disabled"
          : i === selected ? "quiz-opt wrong disabled"
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

/* ═════════════════════════════════════════════════════════════════
   ROOT
   ═════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview", label: "개요 Overview" },
  { id: "vorticity", label: "와도 2D 시각화" },
  { id: "vortex", label: "Forced vs Free Vortex" },
  { id: "laplace", label: "Laplace 방정식" },
  { id: "cases", label: "Case Studies" },
  { id: "quiz", label: "퀴즈 Quiz" },
];

export default function Week10App() {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <style>{css}</style>
      <div className="w10-root">
        <div className="w10-header">
          <div className="w10-header-top">
            <span className="w10-week-badge">Week 10</span>
            <h1>Vorticity & Laplace Equation (Potential Flow)</h1>
          </div>
          <p>비점성 유체 · 와도 · Forced/Free Vortex · 속도 퍼텐셜 & 유선함수 · 실린더 주변 유동 · Superposition</p>
        </div>

        <div className="w10-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`w10-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="w10-content">
          {tab === "overview" && <TabOverview />}
          {tab === "vorticity" && <TabVorticity />}
          {tab === "vortex" && <TabVortex />}
          {tab === "laplace" && <TabLaplace />}
          {tab === "cases" && <TabCases />}
          {tab === "quiz" && <TabQuiz />}
        </div>
      </div>
    </>
  );
}
