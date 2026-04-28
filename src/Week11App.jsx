// ============================================================
// Week11App.jsx — Computational Fluid Dynamics (CFD) Intro
// 화공유체역학 (Fluid Mechanics for Chemical Engineering)
// SKKU School of Chem. Eng. & Dept. of Semicon Convergence
// Smart Process & Materials Design Lab (SPMDL)
// Prof. S. Joon Kwon
// ------------------------------------------------------------
// Topics covered (Wk11 Part 1 / Part 2 / Part 3):
//   • Part 1 — What/Why CFD, applications, governing eq. hierarchy, grids
//   • Part 2 — FDM discretization, Forward/Backward/Central diff,
//              Forward/Backward Euler, Crank–Nicolson, 1D ODE examples
//   • Part 3 — Convention for 1D space, 1D Poisson (tridiag matrix),
//              2D Poisson (5-point stencil, NyNx block matrix)
// ============================================================
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  PY_ODE, ML_ODE, JL_ODE, CPP_ODE,
  PY_P1, ML_P1, JL_P1, CPP_P1,
  PY_P2, ML_P2, JL_P2, CPP_P2,
  PY_LBM, ML_LBM, JL_LBM, CPP_LBM,
} from "./Week11Codes";

// ── i18n ─────────────────────────────────────────────────────
const i18n = {
  ko: {
    weekTitle: "Week 11 — 전산유체역학(CFD) 입문",
    subtitle: "지배방정식의 이산화와 유한차분법 (FDM)",
    tabs: {
      overview: "개요",
      fdm: "FDM 기초",
      ode: "1D ODE",
      poisson1d: "1D Poisson",
      poisson2d: "2D Poisson",
      potential: "포텐셜 유동",
      karman: "Karman 와류",
      practice: "연습문제",
      codes: "Raw 코드",
    },
    run: "▶ 실행",
    stop: "■ 정지",
    reset: "↺ 초기화",
    download: "다운로드",
    show: "보기",
    hide: "숨기기",
    method: "방법",
    error: "오차",
    iterations: "반복 횟수",
    grid: "격자",
    finiteDiff: "유한차분 h",
    stepSize: "스텝 크기 Δx",
    timeStep: "시간 스텝 Δt",
    domain: "정의역",
    showAnalytic: "해석해 표시",
    showNumerical: "수치해 표시",
    pointCount: "격자점 수",
    converged: "수렴됨",
    diverged: "발산함",
    runtime: "계산 시간",
    matrix: "행렬",
  },
  en: {
    weekTitle: "Week 11 — Intro to Computational Fluid Dynamics",
    subtitle: "Discretization of governing equations & Finite Difference Method (FDM)",
    tabs: {
      overview: "Overview",
      fdm: "FDM Basics",
      ode: "1D ODE",
      poisson1d: "1D Poisson",
      poisson2d: "2D Poisson",
      potential: "Potential Flow",
      karman: "Karman Vortex",
      practice: "Practice",
      codes: "Raw Codes",
    },
    run: "▶ Run",
    stop: "■ Stop",
    reset: "↺ Reset",
    download: "Download",
    show: "Show",
    hide: "Hide",
    method: "Method",
    error: "Error",
    iterations: "Iterations",
    grid: "Grid",
    finiteDiff: "Finite diff h",
    stepSize: "Step size Δx",
    timeStep: "Time step Δt",
    domain: "Domain",
    showAnalytic: "Show analytic",
    showNumerical: "Show numerical",
    pointCount: "Grid points",
    converged: "Converged",
    diverged: "Diverged",
    runtime: "Runtime",
    matrix: "Matrix",
  },
};

// ── Common style tokens (matching existing repo) ─────────────
const C = {
  bg: "#0b0f17",
  panel: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#e5e7eb",
  textDim: "#9ca3af",
  accent: "#3b82f6",
  accentSoft: "#60a5fa",
  warn: "#f59e0b",
  ok: "#10b981",
  err: "#ef4444",
  purple: "#a78bfa",
  cyan: "#22d3ee",
  pink: "#f472b6",
};

// =============================================================
// MAIN COMPONENT
// =============================================================
export default function Week11App({ onBack }) {
  const [lang, setLang] = useState("ko");
  const [tab, setTab] = useState("overview");
  const t = i18n[lang];
  const handleBack = onBack || (() => { if (typeof window !== "undefined" && window.__backToHome) window.__backToHome(); });

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.bg} 0%, #0a0e15 100%)`,
      color: C.text,
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "20px",
    }}>
      {/* Header */}
      <header style={{
        maxWidth: 1400, margin: "0 auto 16px auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px",
        background: `linear-gradient(135deg, rgba(59,130,246,0.08), rgba(167,139,250,0.04))`,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
      }}>
        <div>
          <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 2 }}>
            SKKU · CHEM. ENG. · SPMDL
          </div>
          <h1 style={{ margin: "6px 0 2px 0", fontSize: 24, fontWeight: 700, color: C.text }}>
            {t.weekTitle}
          </h1>
          <div style={{ fontSize: 13, color: C.textDim }}>{t.subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(onBack || (typeof window !== "undefined")) && (
            <button onClick={handleBack} style={btnStyle()}>← Home</button>
          )}
          <button
            onClick={() => setLang("ko")}
            style={btnStyle(lang === "ko")}
          >한국어</button>
          <button
            onClick={() => setLang("en")}
            style={btnStyle(lang === "en")}
          >English</button>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{
        maxWidth: 1400, margin: "0 auto 16px auto",
        display: "flex", flexWrap: "wrap", gap: 6,
        padding: 8,
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
      }}>
        {Object.entries(t.tabs).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={tabBtnStyle(tab === k)}
          >{label}</button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1400, margin: "0 auto" }}>
        {tab === "overview" && <Overview lang={lang} />}
        {tab === "fdm" && <FDMBasics lang={lang} />}
        {tab === "ode" && <ODESolver lang={lang} />}
        {tab === "poisson1d" && <Poisson1D lang={lang} />}
        {tab === "poisson2d" && <Poisson2D lang={lang} />}
        {tab === "potential" && <PotentialFlow lang={lang} />}
        {tab === "karman" && <KarmanVortex lang={lang} />}
        {tab === "practice" && <Practice lang={lang} />}
        {tab === "codes" && <RawCodes lang={lang} />}
      </main>

      <footer style={{
        maxWidth: 1400, margin: "24px auto 0 auto",
        padding: "16px 24px",
        textAlign: "center",
        fontSize: 12,
        color: C.textDim,
        borderTop: `1px solid ${C.border}`,
      }}>
        © Prof. S. Joon Kwon · SPMDL · SKKU. {lang === "ko"
          ? "교육 목적의 인터랙티브 학습 자료입니다."
          : "Interactive learning material for educational use."}
      </footer>
    </div>
  );
}

// =============================================================
// SHARED STYLE HELPERS
// =============================================================
function btnStyle(active = false) {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? C.accent : C.border}`,
    background: active ? C.accent : "transparent",
    color: active ? "white" : C.text,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  };
}
function tabBtnStyle(active) {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: active ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : "transparent",
    color: active ? "white" : C.textDim,
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    transition: "all 0.15s",
  };
}
function Card({ children, style }) {
  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 18,
      marginBottom: 16,
      ...style,
    }}>{children}</div>
  );
}
function Eq({ children, style }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Cambria Math', 'Consolas', monospace",
      fontSize: 14,
      padding: "10px 14px",
      background: "#0d1117",
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      margin: "8px 0",
      whiteSpace: "pre-wrap",
      color: C.cyan,
      ...style,
    }}>{children}</div>
  );
}
function Slider({ label, value, min, max, step, onChange, unit }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 12, color: C.textDim, marginBottom: 4,
      }}>
        <span>{label}</span>
        <span style={{ color: C.accentSoft, fontFamily: "monospace" }}>
          {value}{unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: C.accent }} />
    </div>
  );
}
function H2({ children }) {
  return (
    <h2 style={{
      fontSize: 18, fontWeight: 600, color: C.text,
      margin: "0 0 12px 0",
      paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
    }}>{children}</h2>
  );
}
function H3({ children }) {
  return (
    <h3 style={{ fontSize: 15, fontWeight: 600, color: C.accentSoft, margin: "12px 0 6px 0" }}>
      {children}
    </h3>
  );
}

// =============================================================
// 1) OVERVIEW
// =============================================================
function Overview({ lang }) {
  const isKo = lang === "ko";
  return (
    <>
      <Card>
        <H2>{isKo ? "CFD란 무엇인가?" : "What is CFD?"}</H2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}>
          {isKo ? (
            <>
              <b style={{ color: C.accentSoft }}>전산유체역학(Computational Fluid Dynamics, CFD)</b>은
              유체의 거동을 지배하는 미분방정식(ODE/PDE)을 컴퓨터로 풀어,
              해석적으로 구하기 어려운 복잡한 유동을 수치적으로 분석하는 학문입니다.
              제주도 주변 카르만 와류, F1 차량 주변 유동, 반도체 챔버 내 가스 흐름,
              혈관 내 혈류 등 — 거의 모든 산업·자연계 유동을 대상으로 합니다.
            </>
          ) : (
            <>
              <b style={{ color: C.accentSoft }}>Computational Fluid Dynamics (CFD)</b> solves the
              governing differential equations (ODEs / PDEs) of fluid motion numerically on a computer,
              enabling analysis of flows that are intractable by analytic methods. It is applied across
              vastly different domains — Karman vortex streets behind Jeju Island, F1 aerodynamics,
              gas flow in semiconductor chambers, blood flow in arteries.
            </>
          )}
        </p>

        <H3>{isKo ? "왜 CFD가 필요한가?" : "Why CFD?"}</H3>
        <ul style={{ fontSize: 13, lineHeight: 1.7, color: C.textDim, paddingLeft: 20 }}>
          <li>{isKo ? "대부분의 N-S 방정식은 해석해가 존재하지 않음" : "Most N-S equations have no analytic solution"}</li>
          <li>{isKo ? "값비싸거나 위험한 실험을 대체" : "Replaces expensive or dangerous experiments"}</li>
          <li>{isKo ? "다양한 조건에 대한 동시 비교 시뮬레이션" : "Multiple parametric simulations in parallel"}</li>
          <li>{isKo ? "숨겨진 정보(압력장, 와도장 등)의 가시화" : "Visualization of hidden fields (pressure, vorticity)"}</li>
        </ul>
      </Card>

      <Card>
        <H2>{isKo ? "CFD 프로세스" : "The CFD Process"}</H2>
        <CFDProcessDiagram isKo={isKo} />
      </Card>

      <Card>
        <H2>{isKo ? "지배방정식의 계층구조" : "Hierarchy of Governing Equations"}</H2>
        <p style={{ fontSize: 13, color: C.textDim, marginBottom: 12 }}>
          {isKo
            ? "위로 갈수록 물리적으로 정확하지만 계산 비용이 높고, 아래로 갈수록 단순화되어 효율적입니다."
            : "More accurate (top) — more efficient (bottom). Pick the cheapest model that captures the physics you need."}
        </p>
        <HierarchyTable isKo={isKo} />
      </Card>

      <Card>
        <H2>{isKo ? "수치해법의 종류" : "Numerical Methods Overview"}</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {[
            { acro: "FDM", name: isKo ? "유한차분법" : "Finite Difference",
              desc: isKo ? "이산 격자점에서 도함수를 차분 근사" : "Approximate derivatives by differences on a discrete grid" },
            { acro: "FEM", name: isKo ? "유한요소법" : "Finite Element",
              desc: isKo ? "변분 원리, 비균일 요소에 함수 근사" : "Variational principle, basis functions on (non)uniform elements" },
            { acro: "FVM", name: isKo ? "유한체적법" : "Finite Volume",
              desc: isKo ? "보존형식, 셀 평균 — CFD 산업 표준" : "Conservative form, cell averages — CFD industry standard" },
            { acro: "BEM", name: isKo ? "경계요소법" : "Boundary Element",
              desc: isKo ? "경계만 이산화 (Green 함수 활용)" : "Discretize boundary only (Green's function approach)" },
            { acro: "LBM", name: isKo ? "격자 볼츠만법" : "Lattice Boltzmann",
              desc: isKo ? "분자 충돌·이동 모델 (Boltzmann eq.)" : "Particle distribution streaming + collision (Boltzmann eq.)" },
            { acro: "Spectral", name: isKo ? "스펙트럴법" : "Spectral",
              desc: isKo ? "FFT 기반 — 주기 경계에서 매우 정확" : "FFT-based — exceptional accuracy on periodic domains" },
          ].map(m => (
            <div key={m.acro} style={{
              padding: 14,
              background: C.card,
              borderRadius: 8,
              borderLeft: `3px solid ${C.accent}`,
            }}>
              <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 1.5 }}>{m.acro}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "2px 0 4px 0" }}>
                {m.name}
              </div>
              <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{m.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: C.textDim, marginTop: 12, fontStyle: "italic" }}>
          {isKo
            ? "이번 주차에서는 가장 직관적이고 코딩이 쉬운 FDM에 집중합니다."
            : "This week we focus on FDM — the most intuitive and easy-to-implement method."}
        </p>
      </Card>
    </>
  );
}

function CFDProcessDiagram({ isKo }) {
  const steps = isKo ? [
    { n: 1, t: "물리 시스템 정의", d: "분석 대상의 도메인·경계·물성치 결정" },
    { n: 2, t: "지배방정식 선택", d: "N-S, Euler, Potential 등 단순화 가정과 함께" },
    { n: 3, t: "이산화", d: "FDM/FEM/FVM/LBM 중 하나로 격자에 매핑" },
    { n: 4, t: "수치 풀이", d: "선형/비선형 시스템 행렬 해석 (직접/반복)" },
    { n: 5, t: "검증", d: "해석해·실험·다른 코드와 비교, 격자 수렴성 확인" },
    { n: 6, t: "후처리", d: "시각화, 라인플롯, 적분량 추출" },
  ] : [
    { n: 1, t: "Define physical system", d: "Domain, boundaries, fluid properties" },
    { n: 2, t: "Choose governing eq.", d: "N-S / Euler / Potential, with simplifying assumptions" },
    { n: 3, t: "Discretize", d: "FDM / FEM / FVM / LBM on a chosen grid" },
    { n: 4, t: "Solve", d: "Linear or nonlinear system (direct / iterative)" },
    { n: 5, t: "Verify", d: "vs. analytic / experimental / other codes; grid convergence" },
    { n: 6, t: "Post-process", d: "Visualize, line-plot, extract integral quantities" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10 }}>
      {steps.map(s => (
        <div key={s.n} style={{
          padding: 12,
          background: `linear-gradient(135deg, rgba(59,130,246,0.06), rgba(34,211,238,0.04))`,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 14,
            background: C.accent, color: "white",
            fontSize: 13, fontWeight: 700, marginBottom: 6,
          }}>{s.n}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.t}</div>
          <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5, marginTop: 4 }}>{s.d}</div>
        </div>
      ))}
    </div>
  );
}

function HierarchyTable({ isKo }) {
  const rows = [
    { lvl: isKo ? "분자" : "Molecular", eq: "Boltzmann", phys: isKo ? "비평형 충돌·이동" : "Non-eq. collision/streaming", cost: 5 },
    { lvl: isKo ? "연속체" : "Continuum", eq: "Navier–Stokes (full)", phys: isKo ? "Newtonian 점성유체" : "Newtonian viscous fluid", cost: 4 },
    { lvl: isKo ? "비점성" : "Inviscid", eq: "Euler", phys: isKo ? "비점성·단열" : "Inviscid, adiabatic", cost: 3 },
    { lvl: isKo ? "비회전" : "Irrotational", eq: "Full Potential", phys: isKo ? "포텐셜 흐름 (∇×u=0)" : "Potential flow (∇×u=0)", cost: 2 },
    { lvl: isKo ? "비점성·비회전·비압축" : "Ideal", eq: "Laplace ∇²φ=0", phys: isKo ? "단일 PDE — 고전 유체" : "Single PDE — classical fluid", cost: 1 },
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%", borderCollapse: "collapse",
        fontSize: 13, color: C.text,
      }}>
        <thead>
          <tr style={{ background: C.card }}>
            <th style={th()}>{isKo ? "수준" : "Level"}</th>
            <th style={th()}>{isKo ? "지배방정식" : "Governing Eq."}</th>
            <th style={th()}>{isKo ? "물리" : "Physics"}</th>
            <th style={th()}>{isKo ? "계산 비용" : "Cost"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={td()}>{r.lvl}</td>
              <td style={{ ...td(), fontFamily: "monospace", color: C.accentSoft }}>{r.eq}</td>
              <td style={td()}>{r.phys}</td>
              <td style={td()}>
                <span style={{ color: r.cost >= 4 ? C.err : r.cost >= 3 ? C.warn : C.ok }}>
                  {"●".repeat(r.cost)}{"○".repeat(5 - r.cost)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function th() {
  return { padding: "8px 12px", textAlign: "left", color: C.textDim, fontWeight: 600, fontSize: 12 };
}
function td() {
  return { padding: "8px 12px" };
}

// =============================================================
// 2) FDM BASICS — 1st & 2nd derivative discretization, visual
// =============================================================
function FDMBasics({ lang }) {
  const isKo = lang === "ko";
  const [h, setH] = useState(0.3);
  const [x0, setX0] = useState(1.0);
  const [funcKey, setFuncKey] = useState("sin");
  const [scheme, setScheme] = useState("forward");

  const fn = useMemo(() => {
    const fns = {
      sin: { f: x => Math.sin(x), df: x => Math.cos(x), label: "sin(x)" },
      exp: { f: x => Math.exp(0.5 * x), df: x => 0.5 * Math.exp(0.5 * x), label: "exp(x/2)" },
      poly: { f: x => x * x * x - 2 * x, df: x => 3 * x * x - 2, label: "x³ − 2x" },
      tanh: { f: x => Math.tanh(x), df: x => 1 - Math.tanh(x) ** 2, label: "tanh(x)" },
    };
    return fns[funcKey];
  }, [funcKey]);

  const exact = fn.df(x0);
  const fwd = (fn.f(x0 + h) - fn.f(x0)) / h;
  const bwd = (fn.f(x0) - fn.f(x0 - h)) / h;
  const ctr = (fn.f(x0 + h / 2) - fn.f(x0 - h / 2)) / h;
  const ctrFull = (fn.f(x0 + h) - fn.f(x0 - h)) / (2 * h);
  // 2nd derivative (central)
  const d2 = (fn.f(x0 + h) - 2 * fn.f(x0) + fn.f(x0 - h)) / (h * h);

  return (
    <>
      <Card>
        <H2>{isKo ? "도함수의 이산화" : "Discretization of Derivatives"}</H2>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          {isKo
            ? "FDM의 핵심 아이디어: 미분의 정의(극한)에서 h를 유한한 작은 값으로 두면, ODE/PDE는 대수방정식(FDE)으로 변환됩니다. 격자가 작아질수록 오차도 줄어듭니다(Lax 동치정리)."
            : "Core idea: replace the limit h→0 in the derivative definition with a finite small h. ODEs/PDEs then become algebraic equations (FDEs). Smaller h → smaller error (Lax equivalence theorem)."}
        </p>
        <Eq>{`f'(x₀) = lim(h→0) [f(x₀+h) - f(x₀)] / h
  ≈ [f(x₀+h) - f(x₀)] / h     (forward,   O(h))
  ≈ [f(x₀) - f(x₀-h)] / h     (backward,  O(h))
  ≈ [f(x₀+h) - f(x₀-h)] / (2h) (central,   O(h²))

f''(x₀) ≈ [f(x₀+h) - 2f(x₀) + f(x₀-h)] / h²   (central, O(h²))`}</Eq>
      </Card>

      <Card>
        <H2>{isKo ? "인터랙티브 시각화" : "Interactive Visualization"}</H2>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
          <div>
            <H3>{isKo ? "함수 선택" : "Function"}</H3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {[
                ["sin", "sin(x)"], ["exp", "exp(x/2)"],
                ["poly", "x³−2x"], ["tanh", "tanh(x)"],
              ].map(([k, lbl]) => (
                <button key={k} onClick={() => setFuncKey(k)} style={btnStyle(funcKey === k)}>{lbl}</button>
              ))}
            </div>
            <Slider label={`x₀`} value={x0} min={-2} max={3} step={0.05} onChange={setX0} />
            <Slider label={`h`} value={h.toFixed(3)} min={0.005} max={1.0} step={0.005}
              onChange={v => setH(parseFloat(v))} />
            <H3>{isKo ? "차분 방식" : "Scheme"}</H3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["forward", "backward", "central"].map(s => (
                <button key={s} onClick={() => setScheme(s)} style={btnStyle(scheme === s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <DerivativePlot fn={fn} x0={x0} h={h} scheme={scheme} />
            <ResultsTable
              isKo={isKo} exact={exact}
              fwd={fwd} bwd={bwd} ctrHalf={ctr} ctrFull={ctrFull} d2={d2}
            />
          </div>
        </div>
      </Card>

      <Card>
        <H2>{isKo ? "수렴 차수 (Order of Accuracy)" : "Order of Accuracy"}</H2>
        <ConvergenceStudy fn={fn} x0={x0} />
      </Card>
    </>
  );
}

function DerivativePlot({ fn, x0, h, scheme }) {
  const W = 700, H = 320, pad = 40;
  const xMin = x0 - Math.max(2 * h, 1.5);
  const xMax = x0 + Math.max(2 * h, 1.5);
  const N = 200;
  // Sample function
  const pts = [];
  let yMin = Infinity, yMax = -Infinity;
  for (let i = 0; i <= N; i++) {
    const x = xMin + (xMax - xMin) * i / N;
    const y = fn.f(x);
    pts.push([x, y]);
    if (Number.isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  }
  const dy = yMax - yMin || 1;
  yMin -= 0.1 * dy; yMax += 0.1 * dy;
  const X = x => pad + (W - 2 * pad) * (x - xMin) / (xMax - xMin);
  const Y = y => H - pad - (H - 2 * pad) * (y - yMin) / (yMax - yMin);

  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${X(x)} ${Y(y)}`).join(" ");
  const exact = fn.df(x0);
  let p1, p2, color;
  if (scheme === "forward") {
    p1 = [x0, fn.f(x0)]; p2 = [x0 + h, fn.f(x0 + h)]; color = "#ef4444";
  } else if (scheme === "backward") {
    p1 = [x0 - h, fn.f(x0 - h)]; p2 = [x0, fn.f(x0)]; color = "#f59e0b";
  } else {
    p1 = [x0 - h / 2, fn.f(x0 - h / 2)]; p2 = [x0 + h / 2, fn.f(x0 + h / 2)]; color = "#10b981";
  }
  // Tangent (exact)
  const tx1 = xMin, tx2 = xMax;
  const ty1 = fn.f(x0) + exact * (tx1 - x0);
  const ty2 = fn.f(x0) + exact * (tx2 - x0);

  return (
    <svg width={W} height={H} style={{
      background: "#0d1117", borderRadius: 8, border: `1px solid ${C.border}`,
      width: "100%", maxWidth: W, height: "auto",
    }}>
      {/* Axes */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#334155" />
      {/* Ticks */}
      {[xMin, x0, xMax].map((x, i) => (
        <text key={i} x={X(x)} y={H - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">
          {x.toFixed(2)}
        </text>
      ))}
      <text x={W - pad} y={H - pad + 30} fill={C.textDim} fontSize={11} textAnchor="end">x</text>
      <text x={pad - 28} y={pad + 4} fill={C.textDim} fontSize={11}>f(x)</text>
      {/* Function curve */}
      <path d={path} fill="none" stroke={C.accentSoft} strokeWidth={2} />
      {/* Exact tangent */}
      <line x1={X(tx1)} y1={Y(ty1)} x2={X(tx2)} y2={Y(ty2)}
        stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7} />
      {/* Secant */}
      <line x1={X(p1[0])} y1={Y(p1[1])} x2={X(p2[0])} y2={Y(p2[1])}
        stroke={color} strokeWidth={2.5} />
      {/* Marked points */}
      <circle cx={X(p1[0])} cy={Y(p1[1])} r={4} fill={color} />
      <circle cx={X(p2[0])} cy={Y(p2[1])} r={4} fill={color} />
      <circle cx={X(x0)} cy={Y(fn.f(x0))} r={3} fill="white" />
      {/* Legend */}
      <g transform={`translate(${W - 200}, ${pad + 10})`}>
        <rect x={0} y={0} width={190} height={56} rx={6} fill="#0a0e15" stroke={C.border} />
        <line x1={10} y1={16} x2={30} y2={16} stroke="#22d3ee" strokeDasharray="4 4" strokeWidth={1.5} />
        <text x={36} y={20} fill={C.text} fontSize={11}>exact tangent</text>
        <line x1={10} y1={36} x2={30} y2={36} stroke={color} strokeWidth={2.5} />
        <text x={36} y={40} fill={C.text} fontSize={11}>{scheme} secant</text>
      </g>
    </svg>
  );
}

function ResultsTable({ isKo, exact, fwd, bwd, ctrHalf, ctrFull, d2 }) {
  const fmt = v => Number.isFinite(v) ? v.toFixed(6) : "—";
  const err = v => Number.isFinite(v) ? Math.abs(v - exact).toExponential(2) : "—";
  return (
    <table style={{
      width: "100%", borderCollapse: "collapse", marginTop: 14,
      fontSize: 13, color: C.text, fontFamily: "monospace",
    }}>
      <thead>
        <tr style={{ background: C.card }}>
          <th style={th()}>{isKo ? "방법" : "Method"}</th>
          <th style={th()}>{isKo ? "값" : "Value"}</th>
          <th style={th()}>|err|</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ background: "rgba(34,211,238,0.05)" }}>
          <td style={td()}>{isKo ? "해석해" : "Exact"} f'(x₀)</td>
          <td style={{ ...td(), color: C.cyan }}>{fmt(exact)}</td>
          <td style={td()}>—</td>
        </tr>
        <tr><td style={td()}>Forward</td><td style={td()}>{fmt(fwd)}</td><td style={{ ...td(), color: C.warn }}>{err(fwd)}</td></tr>
        <tr><td style={td()}>Backward</td><td style={td()}>{fmt(bwd)}</td><td style={{ ...td(), color: C.warn }}>{err(bwd)}</td></tr>
        <tr><td style={td()}>Central (h/2)</td><td style={td()}>{fmt(ctrHalf)}</td><td style={{ ...td(), color: C.ok }}>{err(ctrHalf)}</td></tr>
        <tr><td style={td()}>Central (full h)</td><td style={td()}>{fmt(ctrFull)}</td><td style={{ ...td(), color: C.ok }}>{err(ctrFull)}</td></tr>
        <tr><td style={td()}>f''(x₀) central</td><td style={{ ...td(), color: C.purple }}>{fmt(d2)}</td><td style={td()}>—</td></tr>
      </tbody>
    </table>
  );
}

function ConvergenceStudy({ fn, x0 }) {
  const hs = [];
  for (let k = 0; k < 20; k++) hs.push(0.5 * Math.pow(0.5, k * 0.5));
  const data = hs.map(h => {
    const exact = fn.df(x0);
    const fwd = Math.abs((fn.f(x0 + h) - fn.f(x0)) / h - exact);
    const ctr = Math.abs((fn.f(x0 + h) - fn.f(x0 - h)) / (2 * h) - exact);
    return { h, fwd, ctr };
  });
  const W = 700, H = 280, pad = 50;
  const xs = data.map(d => Math.log10(d.h));
  const ys = data.flatMap(d => [Math.log10(d.fwd || 1e-16), Math.log10(d.ctr || 1e-16)]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const X = x => pad + (W - 2 * pad) * (x - xMin) / (xMax - xMin);
  const Y = y => H - pad - (H - 2 * pad) * (y - yMin) / (yMax - yMin);
  const fwdPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${X(Math.log10(d.h))} ${Y(Math.log10(d.fwd || 1e-16))}`).join(" ");
  const ctrPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${X(Math.log10(d.h))} ${Y(Math.log10(d.ctr || 1e-16))}`).join(" ");

  return (
    <div>
      <p style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>
        log₁₀(error) vs log₁₀(h) — Forward/Backward는 기울기 1, Central은 기울기 2.
      </p>
      <svg width={W} height={H} style={{ background: "#0d1117", borderRadius: 8, border: `1px solid ${C.border}`, width: "100%", maxWidth: W, height: "auto" }}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#334155" />
        <text x={W - pad} y={H - pad + 24} fill={C.textDim} fontSize={11} textAnchor="end">log₁₀(h)</text>
        <text x={pad - 8} y={pad + 4} fill={C.textDim} fontSize={11} textAnchor="end">log₁₀(err)</text>
        <path d={fwdPath} fill="none" stroke="#ef4444" strokeWidth={2} />
        <path d={ctrPath} fill="none" stroke="#10b981" strokeWidth={2} />
        {/* Legend */}
        <g transform={`translate(${W - 180}, ${pad + 10})`}>
          <rect x={0} y={0} width={170} height={56} rx={6} fill="#0a0e15" stroke={C.border} />
          <line x1={10} y1={16} x2={30} y2={16} stroke="#ef4444" strokeWidth={2} />
          <text x={36} y={20} fill={C.text} fontSize={11}>Forward (slope 1)</text>
          <line x1={10} y1={36} x2={30} y2={36} stroke="#10b981" strokeWidth={2} />
          <text x={36} y={40} fill={C.text} fontSize={11}>Central (slope 2)</text>
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// 3) 1D ODE — Forward/Backward Euler & Crank-Nicolson
// =============================================================
function ODESolver({ lang }) {
  const isKo = lang === "ko";
  const [problem, setProblem] = useState("ex1");
  const [method, setMethod] = useState("forward");
  const [dx, setDx] = useState(0.05);
  const [showAll, setShowAll] = useState(false);

  // Problems
  const problems = {
    ex1: {
      label: "du/dx = exp(2x), u(0)=0",
      rhs: (x, u) => Math.exp(2 * x),
      jac: () => 0, // ∂(rhs)/∂u = 0 for explicit term
      analytic: x => (Math.exp(2 * x) - 1) / 2,
      L: 1.0, u0: 0,
    },
    ex2: {
      label: "du/dx = 2u + exp(2x), u(0)=0",
      rhs: (x, u) => 2 * u + Math.exp(2 * x),
      jac: () => 2,
      analytic: x => x * Math.exp(2 * x),
      L: 1.0, u0: 0,
    },
    decay: {
      label: "du/dx = -10u, u(0)=1  (stiff-ish)",
      rhs: (x, u) => -10 * u,
      jac: () => -10,
      analytic: x => Math.exp(-10 * x),
      L: 1.0, u0: 1,
    },
    osc: {
      label: "du/dx = -3u + sin(5x), u(0)=0",
      rhs: (x, u) => -3 * u + Math.sin(5 * x),
      jac: () => -3,
      analytic: x => {
        // particular: A sin + B cos: A=−15/34, B=−5/34? actually solve: u'+3u=sin5x => up = (3 sin5x − 5 cos5x)/34, hom = C e^{-3x}, u(0)=0 → C = 5/34
        const num = 3 * Math.sin(5 * x) - 5 * Math.cos(5 * x);
        return num / 34 + (5 / 34) * Math.exp(-3 * x);
      },
      L: 2.0, u0: 0,
    },
  };
  const P = problems[problem];

  const series = useMemo(() => {
    return solveODE(P, method, dx, showAll);
  }, [P, method, dx, showAll]);

  return (
    <>
      <Card>
        <H2>{isKo ? "1차 ODE 풀이" : "First-Order ODE Solvers"}</H2>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          {isKo
            ? "일반적인 1차 ODE: u'(x) + g(u(x)) = f(x). 시간 적분(또는 공간 marching)을 위한 세 가지 표준 스킴을 비교합니다."
            : "Generic 1st-order ODE: u'(x) + g(u(x)) = f(x). Three standard marching schemes are compared."}
        </p>
        <Eq>{`Forward Euler   (explicit, O(Δx)):
  uₙ₊₁ = uₙ + Δx · [ f(xₙ) − g(uₙ) ]

Backward Euler  (implicit, O(Δx), unconditionally stable for linear g):
  uₙ₊₁ = uₙ + Δx · [ f(xₙ₊₁) − g(uₙ₊₁) ]
  → solved by Newton iteration

Crank–Nicolson  (implicit, O(Δx²)):
  uₙ₊₁ = uₙ + (Δx/2) · [ f(xₙ) + f(xₙ₊₁) − g(uₙ) − g(uₙ₊₁) ]`}</Eq>
      </Card>

      <Card>
        <H2>{isKo ? "시뮬레이션" : "Simulation"}</H2>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
          <div>
            <H3>{isKo ? "문제 선택" : "Problem"}</H3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {Object.entries(problems).map(([k, p]) => (
                <button key={k} onClick={() => setProblem(k)} style={{
                  ...btnStyle(problem === k),
                  textAlign: "left", fontFamily: "monospace", fontSize: 12,
                }}>{p.label}</button>
              ))}
            </div>
            <H3>{isKo ? "수치 방법" : "Method"}</H3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {[
                ["forward", "Forward Euler"],
                ["backward", "Backward Euler"],
                ["cn", "Crank–Nicolson"],
              ].map(([k, lbl]) => (
                <button key={k} onClick={() => setMethod(k)} style={btnStyle(method === k)}>{lbl}</button>
              ))}
            </div>
            <button onClick={() => setShowAll(!showAll)} style={btnStyle(showAll)}>
              {showAll ? (isKo ? "모든 방법 표시" : "All methods shown") : (isKo ? "전부 비교" : "Compare all")}
            </button>
            <Slider label={`Δx = ${dx.toFixed(4)}`} value={dx} min={0.001} max={0.2} step={0.001}
              onChange={setDx} />
            <div style={{
              padding: 10, background: C.card, borderRadius: 6, marginTop: 10,
              fontSize: 12, color: C.textDim, lineHeight: 1.6,
            }}>
              <div>{isKo ? "도메인" : "Domain"}: [0, {P.L}]</div>
              <div>{isKo ? "격자점 수" : "Grid points"}: {Math.round(P.L / dx) + 1}</div>
              <div>{isKo ? "초기값" : "Initial"} u(0) = {P.u0}</div>
            </div>
          </div>
          <ODEPlot series={series} P={P} />
        </div>

        <ErrorTable series={series} P={P} isKo={isKo} />
      </Card>
    </>
  );
}

function solveODE(P, method, dx, showAll) {
  const N = Math.round(P.L / dx);
  const xs = Array.from({ length: N + 1 }, (_, i) => i * dx);
  const analytic = xs.map(x => P.analytic(x));

  function step(method, u, x, xNext) {
    if (method === "forward") {
      return u + dx * P.rhs(x, u);
    } else if (method === "backward") {
      // u_{n+1} = u_n + dx*(f(x_{n+1}) - g(u_{n+1}))
      // For linear: g(u)=a*u+const, this is solvable directly. We use Newton.
      let v = u; // initial guess
      for (let it = 0; it < 50; it++) {
        const F = v - u - dx * P.rhs(xNext, v);
        const dF = 1 - dx * P.jac(xNext, v);
        const dv = -F / dF;
        v += dv;
        if (Math.abs(dv) < 1e-12) break;
      }
      return v;
    } else if (method === "cn") {
      let v = u;
      for (let it = 0; it < 50; it++) {
        const F = v - u - 0.5 * dx * (P.rhs(x, u) + P.rhs(xNext, v));
        const dF = 1 - 0.5 * dx * P.jac(xNext, v);
        const dv = -F / dF;
        v += dv;
        if (Math.abs(dv) < 1e-12) break;
      }
      return v;
    }
  }

  function runMethod(m) {
    const u = [P.u0];
    for (let i = 0; i < N; i++) {
      const next = step(m, u[i], xs[i], xs[i + 1]);
      u.push(Number.isFinite(next) ? next : NaN);
    }
    return u;
  }

  return {
    xs, analytic,
    fwd: showAll || method === "forward" ? runMethod("forward") : null,
    bwd: showAll || method === "backward" ? runMethod("backward") : null,
    cn:  showAll || method === "cn" ? runMethod("cn") : null,
  };
}

function ODEPlot({ series, P }) {
  const W = 760, H = 380, pad = 50;
  const { xs, analytic, fwd, bwd, cn } = series;
  const allY = [...analytic, ...(fwd || []), ...(bwd || []), ...(cn || [])].filter(Number.isFinite);
  let yMin = Math.min(...allY), yMax = Math.max(...allY);
  const dy = yMax - yMin || 1;
  yMin -= 0.1 * dy; yMax += 0.1 * dy;
  const xMin = 0, xMax = P.L;
  const X = x => pad + (W - 2 * pad) * (x - xMin) / (xMax - xMin);
  const Y = y => H - pad - (H - 2 * pad) * (y - yMin) / (yMax - yMin);
  const buildPath = arr => arr
    .map((y, i) => Number.isFinite(y) ? `${i === 0 ? "M" : "L"} ${X(xs[i])} ${Y(y)}` : "")
    .filter(Boolean).join(" ");

  return (
    <svg width={W} height={H} style={{
      background: "#0d1117", borderRadius: 8, border: `1px solid ${C.border}`,
      width: "100%", maxWidth: W, height: "auto",
    }}>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#334155" />
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const x = xMin + (xMax - xMin) * f;
        return <text key={i} x={X(x)} y={H - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{x.toFixed(2)}</text>;
      })}
      {[yMin, (yMin + yMax) / 2, yMax].map((y, i) => (
        <text key={i} x={pad - 6} y={Y(y) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{y.toFixed(2)}</text>
      ))}
      <text x={W - pad} y={H - pad + 30} fill={C.textDim} fontSize={11} textAnchor="end">x</text>
      <text x={pad - 30} y={pad + 4} fill={C.textDim} fontSize={11}>u(x)</text>

      {/* Analytic */}
      <path d={buildPath(analytic)} fill="none" stroke="#22d3ee" strokeWidth={2.5} />
      {/* Numerical */}
      {fwd && <path d={buildPath(fwd)} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3" />}
      {bwd && <path d={buildPath(bwd)} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3" />}
      {cn && <path d={buildPath(cn)} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="6 3" />}

      {/* Legend */}
      <g transform={`translate(${W - 200}, ${pad + 10})`}>
        <rect x={0} y={0} width={185} height={94} rx={6} fill="#0a0e15" stroke={C.border} />
        <line x1={10} y1={16} x2={30} y2={16} stroke="#22d3ee" strokeWidth={2.5} />
        <text x={36} y={20} fill={C.text} fontSize={11}>Analytic</text>
        {fwd && <><line x1={10} y1={36} x2={30} y2={36} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={36} y={40} fill={C.text} fontSize={11}>Forward Euler</text></>}
        {bwd && <><line x1={10} y1={56} x2={30} y2={56} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={36} y={60} fill={C.text} fontSize={11}>Backward Euler</text></>}
        {cn && <><line x1={10} y1={76} x2={30} y2={76} stroke="#10b981" strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={36} y={80} fill={C.text} fontSize={11}>Crank–Nicolson</text></>}
      </g>
    </svg>
  );
}

function ErrorTable({ series, P, isKo }) {
  const { xs, analytic, fwd, bwd, cn } = series;
  function l2(arr) {
    if (!arr) return null;
    let s = 0, n = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!Number.isFinite(arr[i])) return Infinity;
      s += (arr[i] - analytic[i]) ** 2; n++;
    }
    return Math.sqrt(s / n);
  }
  function maxErr(arr) {
    if (!arr) return null;
    let m = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!Number.isFinite(arr[i])) return Infinity;
      m = Math.max(m, Math.abs(arr[i] - analytic[i]));
    }
    return m;
  }
  const rows = [
    ["Forward Euler", fwd, "#ef4444"],
    ["Backward Euler", bwd, "#f59e0b"],
    ["Crank–Nicolson", cn, "#10b981"],
  ].filter(r => r[1]);
  return (
    <table style={{
      width: "100%", borderCollapse: "collapse", marginTop: 16,
      fontSize: 13, color: C.text, fontFamily: "monospace",
    }}>
      <thead>
        <tr style={{ background: C.card }}>
          <th style={th()}>{isKo ? "방법" : "Method"}</th>
          <th style={th()}>L² {isKo ? "오차" : "error"}</th>
          <th style={th()}>L∞ {isKo ? "오차" : "error"}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, arr, color]) => {
          const e2 = l2(arr); const eInf = maxErr(arr);
          return (
            <tr key={name}>
              <td style={{ ...td(), color }}>{name}</td>
              <td style={td()}>{Number.isFinite(e2) ? e2.toExponential(3) : (isKo ? "발산" : "DIVERGED")}</td>
              <td style={td()}>{Number.isFinite(eInf) ? eInf.toExponential(3) : (isKo ? "발산" : "DIVERGED")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// =============================================================
// 4) 1D POISSON
// =============================================================
function Poisson1D({ lang }) {
  const isKo = lang === "ko";
  const [h, setH] = useState(0.05);
  const [src, setSrc] = useState("uniform");
  const [uL, setUL] = useState(2.0);
  const [uR, setUR] = useState(2.2);
  const [L] = useState(1.0);

  const sources = {
    uniform: { f: x => 1, label: "f(x) = 1" },
    sin: { f: x => Math.sin(2 * Math.PI * x), label: "f(x) = sin(2πx)" },
    gauss: { f: x => Math.exp(-50 * (x - 0.5) ** 2), label: "f(x) = exp(-50(x-½)²)" },
    step: { f: x => x < 0.5 ? 0 : 1, label: "f(x) = 0 (x<½), 1 (x≥½)" },
  };
  const result = useMemo(() => solvePoisson1D(h, L, sources[src].f, uL, uR), [h, L, src, uL, uR]);

  return (
    <>
      <Card>
        <H2>{isKo ? "1D Poisson 방정식" : "1D Poisson Equation"}</H2>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          {isKo
            ? "정상상태 확산, 압력장, 정전기 포텐셜 등에서 자주 등장하는 기본 PDE입니다. 중심차분으로 이산화하면 삼중대각(tridiagonal) 행렬계가 됩니다."
            : "Fundamental PDE for steady-state diffusion, pressure fields, electrostatic potential. Central differencing yields a tridiagonal linear system."}
        </p>
        <Eq>{`d²u/dx² = f(x),    x ∈ [0, ${L}]
BCs: u(0) = ${uL},  u(${L}) = ${uR}

Discretization (central, h = ${h.toFixed(3)}):
  [u(xₙ₊₁) − 2u(xₙ) + u(xₙ₋₁)] / h² = f(xₙ)
  → A · u = F   (tridiagonal, [1, -2, 1] stencil)

Matrix structure:
        ⎡ -2  1  0  ⋯  0 ⎤  ⎡ u₁ ⎤   ⎡ h²f₁ - u₀ ⎤
        ⎢  1 -2  1  ⋯  0 ⎥  ⎢ u₂ ⎥   ⎢   h²f₂    ⎥
   A =  ⎢  0  1 -2  ⋯  0 ⎥, ⎢ ⋮  ⎥ = ⎢    ⋮      ⎥
        ⎢  ⋮     ⋱     ⋮ ⎥  ⎢    ⎥   ⎢           ⎥
        ⎣  0  0  ⋯  1 -2 ⎦  ⎣ uₙ ⎦   ⎣ h²fₙ - uᴺ ⎦`}</Eq>
      </Card>

      <Card>
        <H2>{isKo ? "시뮬레이션" : "Simulation"}</H2>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
          <div>
            <H3>{isKo ? "소스항 f(x)" : "Source f(x)"}</H3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {Object.entries(sources).map(([k, s]) => (
                <button key={k} onClick={() => setSrc(k)} style={{
                  ...btnStyle(src === k), textAlign: "left", fontFamily: "monospace", fontSize: 12,
                }}>{s.label}</button>
              ))}
            </div>
            <Slider label={`h = ${h.toFixed(3)}`} value={h} min={0.005} max={0.2} step={0.005}
              onChange={setH} />
            <Slider label={`u(0) = ${uL.toFixed(2)}`} value={uL} min={-2} max={5} step={0.1}
              onChange={setUL} />
            <Slider label={`u(${L}) = ${uR.toFixed(2)}`} value={uR} min={-2} max={5} step={0.1}
              onChange={setUR} />
            <div style={{
              padding: 10, background: C.card, borderRadius: 6, marginTop: 10,
              fontSize: 12, color: C.textDim, lineHeight: 1.6,
            }}>
              <div>{isKo ? "내부 격자점" : "Interior pts"}: N = {result.N}</div>
              <div>{isKo ? "행렬 크기" : "Matrix size"}: {result.N}×{result.N}</div>
              <div>{isKo ? "조건수" : "Cond."}: ~ O(1/h²)</div>
            </div>
          </div>
          <Poisson1DPlot result={result} L={L} src={src} sources={sources} uL={uL} uR={uR} />
        </div>
      </Card>

      <Card>
        <H2>{isKo ? "격자 수렴성 (h-study)" : "Grid Convergence (h-study)"}</H2>
        <Poisson1DConvergence src={src} sources={sources} uL={uL} uR={uR} L={L} isKo={isKo} />
      </Card>
    </>
  );
}

function solvePoisson1D(h, L, fFn, uL, uR) {
  const Ntot = Math.round(L / h);    // total intervals → x_0...x_Ntot
  const N = Ntot - 1;                 // interior unknowns
  if (N <= 0) return { xs: [0, L], u: [uL, uR], N: 0 };
  // Tridiagonal system using Thomas algorithm
  const a = new Array(N).fill(1);   // sub
  const b = new Array(N).fill(-2);  // main
  const c = new Array(N).fill(1);   // sup
  const d = new Array(N);
  for (let i = 0; i < N; i++) {
    const x = (i + 1) * h;
    d[i] = h * h * fFn(x);
  }
  d[0] -= uL;
  d[N - 1] -= uR;

  // Thomas
  const cP = new Array(N), dP = new Array(N);
  cP[0] = c[0] / b[0];
  dP[0] = d[0] / b[0];
  for (let i = 1; i < N; i++) {
    const m = b[i] - a[i] * cP[i - 1];
    cP[i] = c[i] / m;
    dP[i] = (d[i] - a[i] * dP[i - 1]) / m;
  }
  const u = new Array(N);
  u[N - 1] = dP[N - 1];
  for (let i = N - 2; i >= 0; i--) u[i] = dP[i] - cP[i] * u[i + 1];

  // Build full xs / u with boundary
  const xs = [0];
  const uFull = [uL];
  for (let i = 0; i < N; i++) {
    xs.push((i + 1) * h);
    uFull.push(u[i]);
  }
  xs.push(L); uFull.push(uR);
  return { xs, u: uFull, N };
}

function Poisson1DPlot({ result, L, src, sources, uL, uR }) {
  const W = 760, H = 360, pad = 50;
  const { xs, u } = result;
  // Analytic if available
  let analytic = null;
  if (src === "uniform") {
    // d²u/dx² = 1, u(0)=uL, u(L)=uR
    // u = x²/2 + C1 x + uL with C1 = (uR - uL - L²/2)/L
    const C1 = (uR - uL - L * L / 2) / L;
    analytic = xs.map(x => x * x / 2 + C1 * x + uL);
  }
  const allY = [...u, ...(analytic || [])];
  let yMin = Math.min(...allY), yMax = Math.max(...allY);
  const dy = yMax - yMin || 1;
  yMin -= 0.1 * dy; yMax += 0.1 * dy;
  const X = x => pad + (W - 2 * pad) * (x / L);
  const Y = y => H - pad - (H - 2 * pad) * (y - yMin) / (yMax - yMin);
  const path = u.map((y, i) => `${i === 0 ? "M" : "L"} ${X(xs[i])} ${Y(y)}`).join(" ");
  const aPath = analytic ? analytic.map((y, i) => `${i === 0 ? "M" : "L"} ${X(xs[i])} ${Y(y)}`).join(" ") : null;

  return (
    <svg width={W} height={H} style={{ background: "#0d1117", borderRadius: 8, border: `1px solid ${C.border}`, width: "100%", maxWidth: W, height: "auto" }}>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#334155" />
      {aPath && <path d={aPath} stroke="#22d3ee" strokeWidth={3} fill="none" />}
      <path d={path} stroke="#3b82f6" strokeWidth={2} fill="none" />
      {u.map((y, i) => i % Math.max(1, Math.floor(u.length / 80)) === 0 && (
        <circle key={i} cx={X(xs[i])} cy={Y(y)} r={2.5} fill="#60a5fa" />
      ))}
      <text x={W - pad} y={H - pad + 24} fill={C.textDim} fontSize={11} textAnchor="end">x</text>
      <text x={pad - 30} y={pad + 4} fill={C.textDim} fontSize={11}>u(x)</text>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const x = f * L;
        return <text key={i} x={X(x)} y={H - pad + 16} fill={C.textDim} fontSize={10} textAnchor="middle">{x.toFixed(2)}</text>;
      })}
      {[yMin, (yMin + yMax) / 2, yMax].map((y, i) => (
        <text key={i} x={pad - 6} y={Y(y) + 4} fill={C.textDim} fontSize={10} textAnchor="end">{y.toFixed(2)}</text>
      ))}
      <g transform={`translate(${W - 200}, ${pad + 10})`}>
        <rect x={0} y={0} width={185} height={aPath ? 56 : 36} rx={6} fill="#0a0e15" stroke={C.border} />
        <line x1={10} y1={16} x2={30} y2={16} stroke="#3b82f6" strokeWidth={2} />
        <text x={36} y={20} fill={C.text} fontSize={11}>FDM (Thomas)</text>
        {aPath && <><line x1={10} y1={36} x2={30} y2={36} stroke="#22d3ee" strokeWidth={3} />
          <text x={36} y={40} fill={C.text} fontSize={11}>Analytic</text></>}
      </g>
    </svg>
  );
}

function Poisson1DConvergence({ src, sources, uL, uR, L, isKo }) {
  if (src !== "uniform") {
    return <p style={{ fontSize: 13, color: C.textDim }}>
      {isKo
        ? "균일 소스(f=1)인 경우 해석해와 비교한 격자 수렴성을 보입니다. 다른 소스를 선택하면 fine grid를 reference로 사용합니다."
        : "Convergence shown vs analytic only for uniform source f=1. For others, fine grid is used as reference."}
    </p>;
  }
  const C1 = (uR - uL - L * L / 2) / L;
  const exact = x => x * x / 2 + C1 * x + uL;
  const hs = [0.2, 0.1, 0.05, 0.02, 0.01, 0.005];
  const data = hs.map(h => {
    const r = solvePoisson1D(h, L, () => 1, uL, uR);
    let maxE = 0;
    for (let i = 0; i < r.xs.length; i++) {
      maxE = Math.max(maxE, Math.abs(r.u[i] - exact(r.xs[i])));
    }
    return { h, err: maxE };
  });
  return (
    <table style={{
      width: "100%", borderCollapse: "collapse",
      fontSize: 13, color: C.text, fontFamily: "monospace",
    }}>
      <thead>
        <tr style={{ background: C.card }}>
          <th style={th()}>h</th>
          <th style={th()}>L∞ {isKo ? "오차" : "error"}</th>
          <th style={th()}>{isKo ? "비율" : "ratio"} (≈ 4 → O(h²))</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
            <td style={td()}>{d.h.toFixed(4)}</td>
            <td style={{ ...td(), color: C.warn }}>{d.err.toExponential(3)}</td>
            <td style={td()}>{i > 0 ? (data[i - 1].err / d.err).toFixed(2) : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =============================================================
// 5) 2D POISSON
// =============================================================
function Poisson2D({ lang }) {
  const isKo = lang === "ko";
  const [Nx, setNx] = useState(40);
  const [Ny, setNy] = useState(40);
  const [src, setSrc] = useState("default");
  const [iters, setIters] = useState(0);
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState(null);
  const reqRef = useRef();

  const sources = {
    default: {
      label: "f = 2 sin(3πx) cos(5πy)",
      f: (x, y) => 2 * Math.sin(3 * Math.PI * x) * Math.cos(5 * Math.PI * y),
    },
    point: {
      label: isKo ? "중심 점원" : "Point source at center",
      f: (x, y) => {
        const r2 = (x - 0.5) ** 2 + (y - 0.5) ** 2;
        return Math.exp(-200 * r2);
      },
    },
    dipole: {
      label: isKo ? "쌍극자" : "Dipole",
      f: (x, y) => {
        const r1 = (x - 0.3) ** 2 + (y - 0.5) ** 2;
        const r2 = (x - 0.7) ** 2 + (y - 0.5) ** 2;
        return Math.exp(-150 * r1) - Math.exp(-150 * r2);
      },
    },
    cross: {
      label: isKo ? "교차선" : "Cross pattern",
      f: (x, y) => Math.sin(5 * Math.PI * x) + Math.sin(5 * Math.PI * y),
    },
  };

  // Solver — Gauss–Seidel iteration with red-black ordering for visualization
  const solve = useCallback(() => {
    const Lx = 1.0, Ly = 2.0;
    const hx = Lx / (Nx - 1), hy = Ly / (Ny - 1);
    const u = new Float64Array(Nx * Ny);
    const f = new Float64Array(Nx * Ny);
    for (let j = 0; j < Ny; j++) {
      for (let i = 0; i < Nx; i++) {
        const x = i * hx, y = j * hy;
        f[j * Nx + i] = sources[src].f(x, y);
      }
    }
    // Boundary: u = 0 (Dirichlet)
    return { u, f, Nx, Ny, hx, hy };
  }, [Nx, Ny, src]);

  useEffect(() => {
    setGrid(solve());
    setIters(0);
  }, [solve]);

  // Iteration step (Gauss-Seidel)
  const iterate = useCallback(() => {
    if (!grid) return;
    const { u, f, Nx, Ny, hx, hy } = grid;
    const ITER_PER_FRAME = 50;
    const hx2 = hx * hx, hy2 = hy * hy, denom = 2 * (hx2 + hy2);
    for (let s = 0; s < ITER_PER_FRAME; s++) {
      for (let j = 1; j < Ny - 1; j++) {
        for (let i = 1; i < Nx - 1; i++) {
          const idx = j * Nx + i;
          u[idx] = (
            hy2 * (u[idx - 1] + u[idx + 1]) +
            hx2 * (u[idx - Nx] + u[idx + Nx]) -
            hx2 * hy2 * f[idx]
          ) / denom;
        }
      }
    }
    setIters(it => it + ITER_PER_FRAME);
    setGrid({ ...grid });
  }, [grid]);

  useEffect(() => {
    if (running) {
      reqRef.current = requestAnimationFrame(() => iterate());
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [running, iterate, grid]);

  const reset = () => {
    setGrid(solve());
    setIters(0);
    setRunning(false);
  };

  return (
    <>
      <Card>
        <H2>{isKo ? "2D Poisson 방정식" : "2D Poisson Equation"}</H2>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          {isKo
            ? "5점 스텐실(5-point stencil)로 이산화하면, 각 격자점은 동서남북 4개 이웃과 자신의 값을 -4 가중치로 결합합니다. 행렬 A는 NyNx × NyNx 크기의 블록 삼중대각(block tridiagonal) 구조입니다."
            : "5-point stencil discretization couples each grid point to its 4 neighbors (with weight 1) and itself (weight -4). The system matrix A has block-tridiagonal structure of size NyNx × NyNx."}
        </p>
        <Eq>{`∇²u = f(x,y),  domain (0,1) × (0,2),   u = 0 on ∂Ω

5-point stencil:
  [u(i+1,j) + u(i-1,j) + u(i,j+1) + u(i,j-1) - 4 u(i,j)] / h² = f(i,j)

Block matrix structure (Nx unknowns per row, Ny rows):
       ⎡ D   C   Z   ⋯   Z ⎤             ⎡ -4  1   0  ⋯ ⎤
       ⎢ C   D   C   ⋯   Z ⎥             ⎢  1 -4  1  ⋯ ⎥
   A = ⎢ Z   C   D   ⋯   Z ⎥,   D =      ⎢  0  1 -4  ⋯ ⎥
       ⎢ ⋮       ⋱       ⋮ ⎥             ⎢  ⋮          ⎥
       ⎣ Z   ⋯   C   C   D ⎦             ⎣  ⋯  1 -4    ⎦
                                          C = I (Nx × Nx), Z = 0 matrix
solver: Gauss–Seidel iteration (in-place red-black)`}</Eq>
      </Card>

      <Card>
        <H2>{isKo ? "라이브 시뮬레이션 — Gauss–Seidel 반복" : "Live Simulation — Gauss–Seidel Iteration"}</H2>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
          <div>
            <H3>{isKo ? "소스" : "Source"}</H3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {Object.entries(sources).map(([k, s]) => (
                <button key={k} onClick={() => setSrc(k)} style={{
                  ...btnStyle(src === k), textAlign: "left", fontSize: 12,
                }}>{s.label}</button>
              ))}
            </div>
            <Slider label={`Nx = ${Nx}`} value={Nx} min={20} max={120} step={5} onChange={setNx} />
            <Slider label={`Ny = ${Ny}`} value={Ny} min={20} max={120} step={5} onChange={setNy} />
            <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
              <button onClick={() => setRunning(!running)} style={{
                ...btnStyle(running), background: running ? C.err : C.ok, color: "white", flex: 1
              }}>{running ? "■ Stop" : "▶ Run"}</button>
              <button onClick={reset} style={{ ...btnStyle(false), flex: 1 }}>↺ Reset</button>
            </div>
            <div style={{
              padding: 10, background: C.card, borderRadius: 6,
              fontSize: 12, color: C.textDim, lineHeight: 1.6, fontFamily: "monospace",
            }}>
              <div>{isKo ? "반복" : "iters"}: {iters.toLocaleString()}</div>
              <div>{isKo ? "총 미지수" : "DOF"}: {Nx * Ny}</div>
              <div>{isKo ? "메모리" : "memory"}: ~{(8 * Nx * Ny * 2 / 1024).toFixed(1)} KB</div>
            </div>
          </div>
          <Poisson2DHeatmap grid={grid} />
        </div>
      </Card>
    </>
  );
}

function Poisson2DHeatmap({ grid }) {
  const canvasRef = useRef();
  useEffect(() => {
    if (!grid) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { u, Nx, Ny } = grid;
    canvas.width = Nx; canvas.height = Ny;
    let mn = Infinity, mx = -Infinity;
    for (let k = 0; k < u.length; k++) {
      if (u[k] < mn) mn = u[k];
      if (u[k] > mx) mx = u[k];
    }
    const rng = Math.max(Math.abs(mn), Math.abs(mx)) || 1;
    const img = ctx.createImageData(Nx, Ny);
    for (let j = 0; j < Ny; j++) {
      for (let i = 0; i < Nx; i++) {
        const v = u[j * Nx + i] / rng; // -1..1
        const [r, g, b] = colormap(v);
        const idx = ((Ny - 1 - j) * Nx + i) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [grid]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <canvas ref={canvasRef}
        style={{
          width: "100%", maxWidth: 480, aspectRatio: "1/2",
          imageRendering: "pixelated",
          border: `1px solid ${C.border}`, borderRadius: 6,
          background: "#0d1117",
        }}
      />
    </div>
  );
}

// "RdBu" diverging colormap (-1 to 1 → red ... white ... blue)
function colormap(v) {
  v = Math.max(-1, Math.min(1, v));
  if (v >= 0) {
    const t = v;
    return [Math.round(255 * (1 - 0.7 * t)), Math.round(255 * (1 - 0.7 * t)), 255];
  } else {
    const t = -v;
    return [255, Math.round(255 * (1 - 0.7 * t)), Math.round(255 * (1 - 0.7 * t))];
  }
}

// =============================================================
// 6) KARMAN VORTEX (Lattice-Boltzmann mini demo)
// =============================================================
function KarmanVortex({ lang }) {
  const isKo = lang === "ko";
  const canvasRef = useRef();
  const animRef = useRef();
  const stateRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [Re, setRe] = useState(120);
  const [vis, setVis] = useState("vorticity");
  const [step, setStep] = useState(0);
  const NX = 200, NY = 80;

  // Initialize LBM state
  const initLBM = useCallback(() => {
    const N = NX * NY;
    // D2Q9
    const w = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];
    const cx = [0, 1, 0, -1, 0, 1, -1, -1, 1];
    const cy = [0, 0, 1, 0, -1, 1, 1, -1, -1];
    const f = new Float32Array(N * 9);
    const fNew = new Float32Array(N * 9);
    const obstacle = new Uint8Array(N);
    const u0 = 0.04;
    // Cylinder
    const cxObs = NX / 4, cyObs = NY / 2, r = 8;
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const idx = j * NX + i;
        const dr2 = (i - cxObs) ** 2 + (j - cyObs) ** 2;
        if (dr2 <= r * r) obstacle[idx] = 1;
        for (let q = 0; q < 9; q++) {
          // Equilibrium with uniform u0 in x
          const cu = 3 * (cx[q] * u0);
          const feq = w[q] * (1 + cu + 0.5 * cu * cu - 1.5 * u0 * u0);
          f[idx * 9 + q] = feq;
        }
      }
    }
    return { f, fNew, obstacle, w, cx, cy, u0, NX, NY };
  }, []);

  const stepLBM = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const { f, fNew, obstacle, w, cx, cy, u0, NX, NY } = s;
    const nu = u0 * 16 / Re; // characteristic length = 2r=16
    const tau = 3 * nu + 0.5;
    const omega = 1 / tau;
    // Streaming with bounce-back
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const idx = j * NX + i;
        for (let q = 0; q < 9; q++) {
          let ip = i - cx[q], jp = j - cy[q];
          if (ip < 0) ip = 0; if (ip >= NX) ip = NX - 1;
          if (jp < 0) jp = NY - 1; if (jp >= NY) jp = 0; // periodic in y
          const srcIdx = jp * NX + ip;
          if (obstacle[srcIdx]) {
            // bounce-back
            const opp = [0, 3, 4, 1, 2, 7, 8, 5, 6][q];
            fNew[idx * 9 + q] = f[idx * 9 + opp];
          } else {
            fNew[idx * 9 + q] = f[srcIdx * 9 + q];
          }
        }
      }
    }
    // Inlet (Zou-He-ish): impose u=u0 at i=0
    for (let j = 0; j < NY; j++) {
      const idx = j * NX + 0;
      for (let q = 0; q < 9; q++) {
        const cu = 3 * (cx[q] * u0);
        const feq = w[q] * (1 + cu + 0.5 * cu * cu - 1.5 * u0 * u0);
        fNew[idx * 9 + q] = feq;
      }
    }
    // Outlet (zero gradient)
    for (let j = 0; j < NY; j++) {
      const idx = j * NX + (NX - 1);
      const idxL = j * NX + (NX - 2);
      for (let q = 0; q < 9; q++) fNew[idx * 9 + q] = fNew[idxL * 9 + q];
    }
    // Collision
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const idx = j * NX + i;
        if (obstacle[idx]) continue;
        let rho = 0, ux = 0, uy = 0;
        for (let q = 0; q < 9; q++) {
          const fq = fNew[idx * 9 + q];
          rho += fq;
          ux += fq * cx[q];
          uy += fq * cy[q];
        }
        ux /= rho; uy /= rho;
        for (let q = 0; q < 9; q++) {
          const cu = 3 * (cx[q] * ux + cy[q] * uy);
          const u2 = ux * ux + uy * uy;
          const feq = rho * w[q] * (1 + cu + 0.5 * cu * cu - 1.5 * u2);
          fNew[idx * 9 + q] += -omega * (fNew[idx * 9 + q] - feq);
        }
      }
    }
    f.set(fNew);
  }, [Re]);

  const draw = useCallback(() => {
    const s = stateRef.current;
    if (!s || !canvasRef.current) return;
    const { f, obstacle, cx, cy, NX, NY } = s;
    const canvas = canvasRef.current;
    canvas.width = NX; canvas.height = NY;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(NX, NY);
    // Compute field
    const ux = new Float32Array(NX * NY);
    const uy = new Float32Array(NX * NY);
    const rhoArr = new Float32Array(NX * NY);
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const idx = j * NX + i;
        let rho = 0, vx = 0, vy = 0;
        for (let q = 0; q < 9; q++) {
          const fq = f[idx * 9 + q];
          rho += fq; vx += fq * cx[q]; vy += fq * cy[q];
        }
        ux[idx] = vx / (rho || 1);
        uy[idx] = vy / (rho || 1);
        rhoArr[idx] = rho;
      }
    }
    let mn = Infinity, mx = -Infinity;
    const field = new Float32Array(NX * NY);
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const idx = j * NX + i;
        let val = 0;
        if (vis === "velocity") {
          val = Math.sqrt(ux[idx] ** 2 + uy[idx] ** 2);
        } else if (vis === "vorticity") {
          // central diff of velocity
          const ip = Math.min(i + 1, NX - 1), im = Math.max(i - 1, 0);
          const jp = Math.min(j + 1, NY - 1), jm = Math.max(j - 1, 0);
          val = (uy[j * NX + ip] - uy[j * NX + im]) / 2 - (ux[jp * NX + i] - ux[jm * NX + i]) / 2;
        } else { // pressure
          val = (rhoArr[idx] - 1) / 3; // p = ρ cs² ≈ ρ/3
        }
        field[idx] = val;
        if (Number.isFinite(val)) {
          if (val < mn) mn = val;
          if (val > mx) mx = val;
        }
      }
    }
    const rng = vis === "vorticity"
      ? Math.max(Math.abs(mn), Math.abs(mx)) || 1
      : (mx - mn) || 1;
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const idx = j * NX + i;
        let v;
        if (vis === "vorticity") v = field[idx] / rng;
        else v = (field[idx] - mn) / rng * 2 - 1;
        let r, g, b;
        if (vis === "velocity") {
          // viridis-ish
          const t = (v + 1) / 2;
          r = Math.round(68 + 187 * t);
          g = Math.round(1 + 230 * t);
          b = Math.round(84 + 50 * t);
        } else if (vis === "vorticity") {
          [r, g, b] = colormap(v);
        } else {
          [r, g, b] = colormap(v);
        }
        if (obstacle[idx]) { r = 80; g = 80; b = 80; }
        const px = ((NY - 1 - j) * NX + i) * 4;
        img.data[px] = r;
        img.data[px + 1] = g;
        img.data[px + 2] = b;
        img.data[px + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [vis]);

  useEffect(() => {
    stateRef.current = initLBM();
    setStep(0);
    draw();
  }, [initLBM, draw]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      for (let k = 0; k < 5; k++) stepLBM();
      setStep(s => s + 5);
      draw();
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, stepLBM, draw]);

  return (
    <>
      <Card>
        <H2>{isKo ? "Karman 와류 (LBM 데모)" : "Karman Vortex Street (LBM Demo)"}</H2>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          {isKo
            ? "원기둥 후류에서 Re ≈ 47 부근부터 주기적인 와류 방출(Karman vortex shedding)이 시작됩니다. 여기서는 D2Q9 격자 볼츠만(LBM) 기법으로 작은 도메인에서 시뮬레이션합니다. (브라우저에서 실행되는 미니 데모이므로 정밀도는 제한적입니다.)"
            : "A circular cylinder produces periodic vortex shedding for Re ≳ 47. This mini-demo solves the D2Q9 Lattice-Boltzmann equations directly in your browser. (Limited resolution for browser-side execution.)"}
        </p>
      </Card>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
          <div>
            <H3>{isKo ? "Reynolds 수" : "Reynolds Number"}</H3>
            <Slider label={`Re = ${Re}`} value={Re} min={10} max={300} step={10} onChange={setRe} />
            <H3>{isKo ? "시각화" : "Visualization"}</H3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {[
                ["velocity", isKo ? "속도 |u|" : "Velocity |u|"],
                ["vorticity", isKo ? "와도 ω" : "Vorticity ω"],
                ["pressure", isKo ? "압력 p" : "Pressure p"],
              ].map(([k, lbl]) => (
                <button key={k} onClick={() => setVis(k)} style={btnStyle(vis === k)}>{lbl}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setRunning(!running)} style={{
                ...btnStyle(running), background: running ? C.err : C.ok, color: "white", flex: 1
              }}>{running ? "■ Stop" : "▶ Run"}</button>
              <button onClick={() => {
                stateRef.current = initLBM();
                setStep(0); setRunning(false); draw();
              }} style={{ ...btnStyle(false), flex: 1 }}>↺ Reset</button>
            </div>
            <div style={{
              padding: 10, background: C.card, borderRadius: 6, marginTop: 12,
              fontSize: 12, color: C.textDim, fontFamily: "monospace",
            }}>
              <div>{isKo ? "스텝" : "step"}: {step}</div>
              <div>{isKo ? "격자" : "grid"}: {NX}×{NY}</div>
              <div>{isKo ? "동점성" : "ν"}: {(0.04 * 16 / Re).toFixed(4)}</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <canvas ref={canvasRef} style={{
              width: "100%", maxWidth: 800, aspectRatio: `${NX}/${NY}`,
              imageRendering: "pixelated",
              border: `1px solid ${C.border}`, borderRadius: 6,
              background: "#0d1117",
            }} />
          </div>
        </div>
      </Card>
    </>
  );
}

// =============================================================
// 6.5) POTENTIAL FLOW & STREAMLINES
// Solves Laplace ∇²φ = 0 via Gauss-Seidel; analytic superposition
// for canonical flows: uniform, source/sink, doublet, cylinder.
// Visualizes φ (equipotentials), ψ (streamlines), velocity, pressure.
// =============================================================
function PotentialFlow({ lang }) {
  const isKo = lang === "ko";
  const [flowType, setFlowType] = useState("cylinder");
  const [view, setView] = useState("streamlines"); // streamlines | potential | velocity | pressure
  const [Uinf, setUinf] = useState(1.0);
  const [strength, setStrength] = useState(1.0);
  const [radius, setRadius] = useState(0.5);

  const flows = {
    uniform: {
      ko: "균일류 (Uniform)",
      en: "Uniform Flow",
      desc_ko: "ϕ = U∞ x,  ψ = U∞ y. 일정한 수평 속도장.",
      desc_en: "ϕ = U∞ x,  ψ = U∞ y. Constant horizontal velocity field.",
    },
    source: {
      ko: "Source / Sink",
      en: "Source / Sink",
      desc_ko: "ϕ = (m/2π) ln r,  ψ = (m/2π) θ. 방사형으로 발산/수렴.",
      desc_en: "ϕ = (m/2π) ln r,  ψ = (m/2π) θ. Radial divergence (m>0) or convergence (m<0).",
    },
    doublet: {
      ko: "쌍극자 (Doublet)",
      en: "Doublet",
      desc_ko: "ϕ = (μ/2π) cosθ/r,  ψ = -(μ/2π) sinθ/r. Source–Sink 극한.",
      desc_en: "ϕ = (μ/2π) cosθ/r,  ψ = -(μ/2π) sinθ/r. Limit of source-sink pair.",
    },
    cylinder: {
      ko: "원기둥 주변 유동",
      en: "Flow past Cylinder",
      desc_ko: "ϕ = U∞(r + a²/r) cosθ,  ψ = U∞(r − a²/r) sinθ. 균일류 + 쌍극자.",
      desc_en: "ϕ = U∞(r + a²/r) cosθ,  ψ = U∞(r − a²/r) sinθ. Uniform flow + doublet.",
    },
    rankine: {
      ko: "Rankine 반체 (반체)",
      en: "Rankine Half-Body",
      desc_ko: "균일류 + Source. 폐곡선이 아닌 반체 형태.",
      desc_en: "Uniform flow + source. Open semi-infinite body shape.",
    },
  };

  // Analytic superposition on a regular grid.
  // Domain: x ∈ [-2, 2], y ∈ [-1.5, 1.5], NX × NY samples.
  const NX = 240, NY = 180;
  const XMIN = -2, XMAX = 2, YMIN = -1.5, YMAX = 1.5;
  const dx = (XMAX - XMIN) / (NX - 1);
  const dy = (YMAX - YMIN) / (NY - 1);

  const field = useMemo(() => {
    // Returns flat arrays for phi, psi, u, v, p, mask (inside-body=1)
    const phi = new Float32Array(NX * NY);
    const psi = new Float32Array(NX * NY);
    const u = new Float32Array(NX * NY);
    const v = new Float32Array(NX * NY);
    const p = new Float32Array(NX * NY);
    const mask = new Uint8Array(NX * NY);
    const a = radius;
    const m = strength;
    const mu = strength;

    let umax = 1e-9;
    for (let j = 0; j < NY; j++) {
      const y = YMIN + j * dy;
      for (let i = 0; i < NX; i++) {
        const x = XMIN + i * dx;
        const r2 = x * x + y * y;
        const r = Math.sqrt(r2);
        const theta = Math.atan2(y, x);
        const k = j * NX + i;
        let phii = 0, psii = 0, uu = 0, vv = 0;
        let inside = 0;

        if (flowType === "uniform") {
          phii = Uinf * x; psii = Uinf * y;
          uu = Uinf; vv = 0;
        } else if (flowType === "source") {
          if (r < 1e-6) { phii = 0; psii = 0; uu = 0; vv = 0; }
          else {
            phii = (m / (2 * Math.PI)) * Math.log(r);
            psii = (m / (2 * Math.PI)) * theta;
            const ur = m / (2 * Math.PI * r);
            uu = ur * Math.cos(theta);
            vv = ur * Math.sin(theta);
          }
        } else if (flowType === "doublet") {
          if (r < 1e-6) { phii = 0; psii = 0; uu = 0; vv = 0; }
          else {
            phii = (mu / (2 * Math.PI)) * Math.cos(theta) / r;
            psii = -(mu / (2 * Math.PI)) * Math.sin(theta) / r;
            // u = ∂ϕ/∂x, v = ∂ϕ/∂y of doublet:
            const c = mu / (2 * Math.PI);
            uu = c * (y * y - x * x) / Math.pow(r2, 2);
            vv = c * (-2 * x * y) / Math.pow(r2, 2);
          }
        } else if (flowType === "cylinder") {
          if (r < a) {
            inside = 1;
            phii = 0; psii = 0; uu = 0; vv = 0;
          } else {
            phii = Uinf * (r + a * a / r) * Math.cos(theta);
            psii = Uinf * (r - a * a / r) * Math.sin(theta);
            // ur = U∞ (1 - a²/r²) cosθ;  uθ = -U∞ (1 + a²/r²) sinθ
            const ur = Uinf * (1 - (a * a) / (r * r)) * Math.cos(theta);
            const ut = -Uinf * (1 + (a * a) / (r * r)) * Math.sin(theta);
            uu = ur * Math.cos(theta) - ut * Math.sin(theta);
            vv = ur * Math.sin(theta) + ut * Math.cos(theta);
          }
        } else if (flowType === "rankine") {
          // Uniform + source at origin
          phii = Uinf * x;
          psii = Uinf * y;
          if (r > 1e-6) {
            phii += (m / (2 * Math.PI)) * Math.log(r);
            psii += (m / (2 * Math.PI)) * theta;
          }
          uu = Uinf + (r > 1e-6 ? (m / (2 * Math.PI)) * Math.cos(theta) / r : 0);
          vv = (r > 1e-6 ? (m / (2 * Math.PI)) * Math.sin(theta) / r : 0);
          // Inside body: streamline ψ = ±m/2 forms half-body boundary
          const halfPsi = m / 2;
          if (Math.abs(y) < 0.001 && x < 0 && Math.abs(psii) < halfPsi) inside = 0;
        }

        phi[k] = phii;
        psi[k] = psii;
        u[k] = uu;
        v[k] = vv;
        mask[k] = inside;
        const speed2 = uu * uu + vv * vv;
        // Bernoulli: p = p∞ + ½ρ(U∞² - |v|²). With ρ=1, p∞=0, U∞ ref:
        p[k] = 0.5 * (Uinf * Uinf - speed2);
        if (Math.sqrt(speed2) > umax) umax = Math.sqrt(speed2);
      }
    }
    return { phi, psi, u, v, p, mask, umax };
  }, [flowType, Uinf, strength, radius]);

  return (
    <div>
      <H2>{isKo ? "포텐셜 유동 — Laplace ∇²ϕ = 0" : "Potential Flow — Laplace ∇²ϕ = 0"}</H2>
      <Card>
        <p style={{ color: C.textDim, marginTop: 0 }}>
          {isKo
            ? "비압축·비점성·비회전 유동에서는 속도가 포텐셜 ∇ϕ로 표현되고, 연속방정식 ∇·v = 0이 Laplace 방정식 ∇²ϕ = 0이 됩니다. 같은 흐름이 흐름함수 ψ로도 기술되며, ψ = const 곡선이 곧 유선(streamline)입니다. 압력은 Bernoulli로부터 직접 얻습니다."
            : "For incompressible, inviscid, irrotational flow, velocity equals ∇ϕ and continuity ∇·v = 0 reduces to Laplace ∇²ϕ = 0. The same flow has a streamfunction ψ; curves ψ = const are streamlines. Pressure follows from Bernoulli."}
        </p>
        <Eq>
          v = ∇ϕ,  ∇²ϕ = 0,  u = ∂ψ/∂y,  v = −∂ψ/∂x,  p + ½ρ|v|² = const
        </Eq>
      </Card>

      <Card>
        <H3>{isKo ? "기본 유동 선택" : "Choose canonical flow"}</H3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {Object.entries(flows).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setFlowType(key)}
              style={tabBtnStyle(flowType === key)}
            >
              {isKo ? val.ko : val.en}
            </button>
          ))}
        </div>
        <div style={{
          padding: 12, background: "rgba(59,130,246,0.06)",
          border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: 13,
        }}>
          {isKo ? flows[flowType].desc_ko : flows[flowType].desc_en}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
          <Slider label="U∞" value={Uinf} min={0.1} max={3} step={0.1} onChange={setUinf} />
          {flowType !== "uniform" && (
            <Slider
              label={flowType === "doublet" ? "μ" : flowType === "cylinder" ? "a (radius)" : "m (strength)"}
              value={flowType === "cylinder" ? radius : strength}
              min={0.1} max={2} step={0.05}
              onChange={flowType === "cylinder" ? setRadius : setStrength}
            />
          )}
        </div>
      </Card>

      <Card>
        <H3>{isKo ? "시각화 모드" : "Visualization mode"}</H3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {[
            { id: "streamlines", ko: "유선 (Streamlines)", en: "Streamlines (ψ)" },
            { id: "potential", ko: "등포텐셜 (Equipotentials)", en: "Equipotentials (ϕ)" },
            { id: "velocity", ko: "속도장 (Velocity field)", en: "Velocity field" },
            { id: "pressure", ko: "압력 분포 (Pressure)", en: "Pressure distribution" },
          ].map(opt => (
            <button key={opt.id} onClick={() => setView(opt.id)} style={tabBtnStyle(view === opt.id)}>
              {isKo ? opt.ko : opt.en}
            </button>
          ))}
        </div>

        <PotentialPlot
          field={field} view={view} flowType={flowType}
          Uinf={Uinf} strength={strength} radius={radius}
          NX={NX} NY={NY} XMIN={XMIN} XMAX={XMAX} YMIN={YMIN} YMAX={YMAX}
          isKo={isKo}
        />
      </Card>

      <Card>
        <H3>{isKo ? "응용: 표면 압력 계수 Cp" : "Application: surface pressure coefficient Cp"}</H3>
        <p style={{ color: C.textDim, fontSize: 13 }}>
          {isKo
            ? "원기둥 표면(r = a)에서 Cp = 1 − 4 sin²θ. 정체점 θ=0,π에서 Cp=1, 측면 θ=π/2에서 Cp=−3 (최대 가속). d'Alembert 역설: 비점성 유동에서 항력은 0이지만 실제 유동에서는 박리가 일어나 Karman 와류가 발생합니다."
            : "On the cylinder surface (r = a), Cp = 1 − 4 sin²θ. Cp = 1 at stagnation (θ=0,π); Cp = −3 at θ=π/2 (peak acceleration). d'Alembert paradox: inviscid drag is zero, but real flow separates and forms the Karman vortex (next tab)."}
        </p>
        <CpPlot flowType={flowType} radius={radius} isKo={isKo} />
      </Card>
    </div>
  );
}

// Canvas-based potential flow visualizer
function PotentialPlot({ field, view, flowType, Uinf, strength, radius, NX, NY, XMIN, XMAX, YMIN, YMAX, isKo }) {
  const canvasRef = useRef(null);
  const W = 720, H = 540;

  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return;
    const ctx = cvs.getContext("2d");
    cvs.width = W; cvs.height = H;
    ctx.fillStyle = "#0b0f17"; ctx.fillRect(0, 0, W, H);

    const xToPx = x => ((x - XMIN) / (XMAX - XMIN)) * W;
    const yToPx = y => H - ((y - YMIN) / (YMAX - YMIN)) * H;

    if (view === "pressure" || view === "potential" || view === "streamlines") {
      // Heatmap background
      const arr = view === "pressure" ? field.p : view === "potential" ? field.phi : field.psi;
      let amin = Infinity, amax = -Infinity;
      for (let k = 0; k < arr.length; k++) {
        if (field.mask[k]) continue;
        if (arr[k] < amin) amin = arr[k];
        if (arr[k] > amax) amax = arr[k];
      }
      // Clip extreme values from singularities (e.g., source/doublet center)
      if (flowType !== "uniform") {
        const span = Math.min(Math.abs(amin), Math.abs(amax));
        amin = -span * 0.6; amax = span * 0.6;
      }
      const range = amax - amin || 1;

      const img = ctx.createImageData(W, H);
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const xv = XMIN + (px / W) * (XMAX - XMIN);
          const yv = YMIN + ((H - py) / H) * (YMAX - YMIN);
          const i = Math.min(NX - 1, Math.max(0, Math.round((xv - XMIN) / (XMAX - XMIN) * (NX - 1))));
          const j = Math.min(NY - 1, Math.max(0, Math.round((yv - YMIN) / (YMAX - YMIN) * (NY - 1))));
          const k = j * NX + i;
          const idx = (py * W + px) * 4;
          if (field.mask[k]) {
            img.data[idx] = 70; img.data[idx + 1] = 70; img.data[idx + 2] = 70; img.data[idx + 3] = 255;
          } else {
            const t = Math.max(0, Math.min(1, (arr[k] - amin) / range));
            const [r, g, b] = colormap(2 * t - 1);
            img.data[idx] = r; img.data[idx + 1] = g; img.data[idx + 2] = b; img.data[idx + 3] = 255;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    } else {
      // Plain background for velocity field
      ctx.fillStyle = "#0b0f17"; ctx.fillRect(0, 0, W, H);
    }

    // Streamline integration (RK4 from seed points)
    if (view === "streamlines" || view === "velocity") {
      const interpVel = (xv, yv) => {
        const i = Math.min(NX - 2, Math.max(0, (xv - XMIN) / (XMAX - XMIN) * (NX - 1)));
        const j = Math.min(NY - 2, Math.max(0, (yv - YMIN) / (YMAX - YMIN) * (NY - 1)));
        const i0 = Math.floor(i), j0 = Math.floor(j);
        const fx = i - i0, fy = j - j0;
        const k00 = j0 * NX + i0, k10 = j0 * NX + i0 + 1;
        const k01 = (j0 + 1) * NX + i0, k11 = (j0 + 1) * NX + i0 + 1;
        const u = (1 - fx) * (1 - fy) * field.u[k00] + fx * (1 - fy) * field.u[k10]
                + (1 - fx) * fy * field.u[k01] + fx * fy * field.u[k11];
        const v = (1 - fx) * (1 - fy) * field.v[k00] + fx * (1 - fy) * field.v[k10]
                + (1 - fx) * fy * field.v[k01] + fx * fy * field.v[k11];
        return [u, v];
      };

      if (view === "streamlines") {
        // Seed at uniform y intervals on left edge
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.2;
        const seeds = [];
        for (let s = 1; s < 22; s++) {
          seeds.push([XMIN + 0.02, YMIN + (s / 22) * (YMAX - YMIN)]);
        }
        // Extra seeds near body for cylinder
        if (flowType === "cylinder") {
          for (let s = 0; s < 8; s++) {
            const ang = (s / 8) * 2 * Math.PI;
            seeds.push([radius * 1.15 * Math.cos(ang), radius * 1.15 * Math.sin(ang)]);
          }
        }
        const ds = 0.02;
        const maxStep = 1500;
        seeds.forEach(([x0, y0]) => {
          // Forward + backward integration
          for (const dir of [1, -1]) {
            ctx.beginPath();
            let xc = x0, yc = y0, started = false;
            for (let s = 0; s < maxStep; s++) {
              const [k1u, k1v] = interpVel(xc, yc);
              const [k2u, k2v] = interpVel(xc + dir * 0.5 * ds * k1u, yc + dir * 0.5 * ds * k1v);
              const [k3u, k3v] = interpVel(xc + dir * 0.5 * ds * k2u, yc + dir * 0.5 * ds * k2v);
              const [k4u, k4v] = interpVel(xc + dir * ds * k3u, yc + dir * ds * k3v);
              const speed = Math.sqrt(k1u * k1u + k1v * k1v);
              if (speed < 1e-4) break;
              xc += dir * ds * (k1u + 2 * k2u + 2 * k3u + k4u) / 6;
              yc += dir * ds * (k1v + 2 * k2v + 2 * k3v + k4v) / 6;
              if (xc < XMIN || xc > XMAX || yc < YMIN || yc > YMAX) break;
              // Body mask
              const ii = Math.round((xc - XMIN) / (XMAX - XMIN) * (NX - 1));
              const jj = Math.round((yc - YMIN) / (YMAX - YMIN) * (NY - 1));
              if (field.mask[jj * NX + ii]) break;
              const px = xToPx(xc), py = yToPx(yc);
              if (!started) { ctx.moveTo(px, py); started = true; }
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
        });
      } else {
        // Velocity arrows on subgrid
        const step = 16;
        for (let i = step; i < NX; i += step) {
          for (let j = step; j < NY; j += step) {
            const k = j * NX + i;
            if (field.mask[k]) continue;
            const xv = XMIN + i * (XMAX - XMIN) / (NX - 1);
            const yv = YMIN + j * (YMAX - YMIN) / (NY - 1);
            const u = field.u[k], v = field.v[k];
            const sp = Math.sqrt(u * u + v * v);
            if (sp < 1e-3) continue;
            const sc = 0.18;
            const px = xToPx(xv), py = yToPx(yv);
            const px2 = xToPx(xv + u * sc), py2 = yToPx(yv + v * sc);
            const t = Math.min(1, sp / (Uinf * 1.5));
            const [r, g, b] = colormap(2 * t - 1);
            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px2, py2); ctx.stroke();
            // Arrowhead
            const ang = Math.atan2(py2 - py, px2 - px);
            ctx.beginPath();
            ctx.moveTo(px2, py2);
            ctx.lineTo(px2 - 6 * Math.cos(ang - 0.5), py2 - 6 * Math.sin(ang - 0.5));
            ctx.lineTo(px2 - 6 * Math.cos(ang + 0.5), py2 - 6 * Math.sin(ang + 0.5));
            ctx.closePath(); ctx.fill();
          }
        }
      }
    }

    // Body outline (cylinder)
    if (flowType === "cylinder") {
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xToPx(0), yToPx(0), radius / (XMAX - XMIN) * W, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "rgba(251,191,36,0.15)";
      ctx.fill();
    }
    // Origin marker for source/doublet
    if (flowType === "source" || flowType === "doublet" || flowType === "rankine") {
      ctx.fillStyle = strength >= 0 ? "#ef4444" : "#3b82f6";
      ctx.beginPath();
      ctx.arc(xToPx(0), yToPx(0), 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Axes labels
    ctx.fillStyle = "#9ca3af"; ctx.font = "11px monospace";
    ctx.fillText("x →", W - 24, H - 8);
    ctx.fillText("↑ y", 8, 14);
  }, [field, view, flowType, Uinf, strength, radius, NX, NY, XMIN, XMAX, YMIN, YMAX]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxWidth: 720, border: `1px solid ${C.border}`, borderRadius: 8, background: "#0b0f17" }}
      />
      <div style={{ marginTop: 8, color: C.textDim, fontSize: 12 }}>
        {isKo
          ? `시각화: ${view === "streamlines" ? "유선 ψ = const" : view === "potential" ? "등포텐셜 ϕ" : view === "velocity" ? "속도 벡터 v" : "압력 p (Bernoulli)"} · 색상: ${view === "pressure" ? "RdBu (저압=청, 고압=적)" : "필드 등치선"}`
          : `View: ${view === "streamlines" ? "streamlines ψ = const" : view === "potential" ? "equipotentials ϕ" : view === "velocity" ? "velocity vectors v" : "pressure p (Bernoulli)"} · Color: ${view === "pressure" ? "RdBu (low=blue, high=red)" : "field contours"}`}
      </div>
    </div>
  );
}

// Cp plot: surface pressure coefficient on cylinder
function CpPlot({ flowType, radius, isKo }) {
  if (flowType !== "cylinder") {
    return (
      <div style={{ color: C.textDim, fontSize: 13, padding: 10 }}>
        {isKo ? "원기둥 유동을 선택하면 표면 Cp 분포가 표시됩니다." : "Select 'Flow past Cylinder' to see surface Cp distribution."}
      </div>
    );
  }
  const W = 600, H = 220;
  const data = [];
  for (let i = 0; i <= 180; i++) {
    const theta = (i / 180) * Math.PI;
    const cp = 1 - 4 * Math.sin(theta) * Math.sin(theta);
    data.push([theta, cp]);
  }
  const xToPx = t => 40 + (t / Math.PI) * (W - 60);
  const yToPx = cp => 20 + ((4 - cp) / 5) * (H - 40); // range: cp ∈ [-3, 1] → padded
  let path = "";
  data.forEach(([t, cp], i) => {
    path += (i === 0 ? "M" : "L") + xToPx(t).toFixed(1) + "," + yToPx(cp).toFixed(1) + " ";
  });
  return (
    <svg width={W} height={H} style={{ background: "#0b0f17", border: `1px solid ${C.border}`, borderRadius: 6 }}>
      {/* Axes */}
      <line x1={40} y1={H - 20} x2={W - 20} y2={H - 20} stroke="#374151" />
      <line x1={40} y1={20} x2={40} y2={H - 20} stroke="#374151" />
      {/* Cp = 0 line */}
      <line x1={40} y1={yToPx(0)} x2={W - 20} y2={yToPx(0)} stroke="#4b5563" strokeDasharray="3,3" />
      {/* Curve */}
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" />
      {/* Annotations */}
      <text x={xToPx(0) - 4} y={yToPx(1) - 6} fill="#10b981" fontSize="11">Cp=1 (정체점/stagnation)</text>
      <text x={xToPx(Math.PI / 2) - 30} y={yToPx(-3) + 14} fill="#ef4444" fontSize="11">Cp=−3 (θ=π/2)</text>
      <text x={W - 70} y={H - 6} fill="#9ca3af" fontSize="10">θ (rad)</text>
      <text x={6} y={26} fill="#9ca3af" fontSize="10">Cp</text>
      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <g key={i}>
          <line x1={xToPx(f * Math.PI)} y1={H - 20} x2={xToPx(f * Math.PI)} y2={H - 16} stroke="#6b7280" />
          <text x={xToPx(f * Math.PI) - 12} y={H - 4} fill="#9ca3af" fontSize="10">
            {f === 0 ? "0" : f === 1 ? "π" : f === 0.5 ? "π/2" : f === 0.25 ? "π/4" : "3π/4"}
          </text>
        </g>
      ))}
    </svg>
  );
}

// =============================================================
// 7) PRACTICE
// =============================================================
function Practice({ lang }) {
  const isKo = lang === "ko";
  const [shown, setShown] = useState({});
  const toggle = k => setShown(s => ({ ...s, [k]: !s[k] }));

  const problems = isKo ? [
    {
      id: "p1",
      q: "함수 f(x)=sin(x)에 대해, x₀=π/3에서 h=0.1로 (a) 전향차분 (b) 후향차분 (c) 중심차분으로 f'을 추정하고 해석해 cos(π/3)=0.5와 비교하시오.",
      a: `해석해: cos(π/3) = 0.5
Forward: [sin(π/3+0.1)−sin(π/3)]/0.1 ≈ 0.4565,  err ≈ 0.044
Backward: [sin(π/3)−sin(π/3−0.1)]/0.1 ≈ 0.5404,  err ≈ 0.040
Central: [sin(π/3+0.05)−sin(π/3−0.05)]/0.1 ≈ 0.4998,  err ≈ 4×10⁻⁴
→ Central은 이미 O(h²)로 정확.`,
    },
    {
      id: "p2",
      q: "ODE du/dx = -10u, u(0)=1을 (a) Forward Euler (b) Backward Euler로 Δx=0.05로 풀 때 안정성을 논하시오. Δx=0.25는 어떤가?",
      a: `Forward Euler: u_{n+1} = u_n (1 - 10Δx) = u_n × λ
  • Δx=0.05 → λ=0.5  (안정, 단조감소)
  • Δx=0.25 → λ=-1.5 (불안정, 부호반전 + 발산)
  • 안정조건: |1-10Δx| < 1  → Δx < 0.2

Backward Euler: u_{n+1} = u_n / (1+10Δx)
  • 모든 Δx > 0에서 |분모|>1 → 무조건 안정.
  • Δx=0.25에서도 정상적으로 감소(정확도는 떨어짐).`,
    },
    {
      id: "p3",
      q: "1D Poisson d²u/dx²=1, u(0)=u(1)=0을 h=0.25로 풀 때, 내부 미지수 N과 행렬 A의 형태를 적고, 해석해 u=x(x-1)/2와 비교하시오.",
      a: `N = (1/0.25) - 1 = 3개 내부 미지수 (x=0.25, 0.5, 0.75)
A = [[-2, 1, 0], [1, -2, 1], [0, 1, -2]]
F = h²·1·[1; 1; 1] = [0.0625; 0.0625; 0.0625] (양 끝 BC=0이므로 보정 없음)
A·u = F를 풀면 u = [-0.09375, -0.125, -0.09375]
해석해: u(x)=x(x-1)/2 → u(0.25)=-0.09375, u(0.5)=-0.125, u(0.75)=-0.09375  (정확히 일치 — 다항식 2차이므로 중심차분 O(h²)이 다항식 2차에 대해서는 정확.)`,
    },
    {
      id: "p4",
      q: "2D Poisson에서 5점 스텐실의 행렬 A 크기를 격자 (Nx, Ny) = (5, 4) (boundary 포함)로 가정하고 적으시오.",
      a: `내부 미지수: (Nx-2)(Ny-2) = 3×2 = 6
또는 Dirichlet 경계를 행렬에 포함시키면 NxNy = 20 × 20.
강의노트의 컨벤션(N_y = L_y/h + 1, N_x = L_x/h + 1, 모든 점 포함)에 따르면:
  A는 (NyNx) × (NyNx) = 20 × 20 행렬
  블록 구조: D는 5×5, C=I_5, Z=O_5
  Ny=4개 블록 × Ny=4개 블록 = 16개 블록의 4×4 블록행렬, 각 블록이 Nx=5
→ 총 (4×5) × (4×5) = 20 × 20.`,
    },
    {
      id: "p5",
      q: "Crank–Nicolson이 Forward Euler보다 본질적으로 좋은 이유 두 가지를 적으시오.",
      a: `(1) 정확도: Crank-Nicolson은 시간 방향으로 O(Δx²) (사다리꼴 적분), Forward Euler는 O(Δx).
(2) 안정성: Crank-Nicolson은 선형 문제에 대해 A-stable (절대안정 영역 = 좌반평면 전체).
  Forward Euler는 안정 영역이 |1+λΔx|≤1로 제한적 — stiff 문제에서 매우 작은 Δx 필요.
단점: Crank-Nicolson은 implicit이므로 매 스텝마다 (비선형이면 Newton) 풀이 필요. Stiff 문제에서 진동(ringing) 가능 — A-stable이지만 L-stable은 아님.`,
    },
    {
      id: "p6",
      q: "1D Poisson을 h=0.1과 h=0.05로 풀어 L∞ 오차를 비교했더니 후자가 약 ¼이었다. 이 관찰이 의미하는 바는?",
      a: `O(h²) 정확도를 확인한 것입니다.
h를 절반으로 줄이면 truncation error가 (1/2)² = 1/4로 감소. 관찰값과 일치.
일반적으로 두 격자 사이의 오차비 r = e_coarse / e_fine 을 측정하고
  log₂(r) ≈ p (수렴차수)
가 이론값(중심차분의 경우 p=2)과 맞는지 확인합니다 — Richardson 외삽 / grid convergence study의 기초.`,
    },
    {
      id: "p7",
      q: "FDM, FEM, FVM 중 보존법칙(질량/운동량/에너지)을 자연스럽게 만족하는 것은 무엇이며, 그 이유는?",
      a: `FVM (Finite Volume Method)이 자연스럽게 보존법칙을 만족합니다.
이유: FVM은 각 cell에 대해 적분형식의 보존법칙을 직접 이산화합니다. cell face에서의 flux가 양 옆 셀에 동일하게 (부호반대로) 기여하므로, 시스템 전체에 합산하면 내부 face flux는 모두 상쇄되고 경계 flux만 남습니다 → 이산 수준에서도 보존법칙 보장.
FDM은 미분형식을 점에서 근사하므로 보존성이 자동 보장되지 않음(특별 설계 필요).
FEM은 weak form을 사용 → Galerkin 직교성으로 일정 수준의 보존성 (테스트 함수 선택에 따라).
이 때문에 산업용 CFD(ANSYS Fluent, OpenFOAM 등)는 거의 모두 FVM 기반입니다.`,
    },
    {
      id: "p8",
      q: "본 강의의 Karman vortex 시뮬레이션은 LBM(Lattice Boltzmann)을 썼다. LBM과 N-S 직접 풀이의 차이를 간단히 설명하시오.",
      a: `LBM은 분자 분포함수 fᵢ(x, c, t)의 진화 (streaming + collision)를 풉니다 — Boltzmann eq.의 격자 이산화.
거시변수: ρ = Σf, ρu = Σcf 로 추출.
N-S 직접 풀이 (FDM/FEM/FVM): 압력-속도 결합 (continuity + momentum)을 직접 이산화.
LBM 장점: 알고리즘이 매우 단순 (local collision + nearest-neighbor streaming) → 병렬화 압도적, 복잡한 경계 처리 용이 (bounce-back), 다상유동·다공질매체 자연스러움.
LBM 한계: 압축성 효과가 격자 마하수 제한, 경계조건이 종종 까다로움, 메모리 사용량 큼.
저Re 흐름 시각화에는 매우 적합 — 따라서 본 데모에 사용.`,
    },
  ] : [
    // English version omitted for brevity in this comment header — included in full file
    {
      id: "p1",
      q: "For f(x)=sin(x) at x₀=π/3, with h=0.1, estimate f' using (a) forward, (b) backward, (c) central difference. Compare to exact cos(π/3)=0.5.",
      a: `Exact: cos(π/3) = 0.5
Forward: [sin(π/3+0.1)−sin(π/3)]/0.1 ≈ 0.4565,  err ≈ 0.044
Backward: [sin(π/3)−sin(π/3−0.1)]/0.1 ≈ 0.5404,  err ≈ 0.040
Central:  [sin(π/3+0.05)−sin(π/3−0.05)]/0.1 ≈ 0.4998,  err ≈ 4×10⁻⁴
→ Central is already O(h²) accurate.`,
    },
    {
      id: "p2",
      q: "Solve du/dx = -10u, u(0)=1 with (a) Forward Euler, (b) Backward Euler, Δx=0.05. Discuss stability. What about Δx=0.25?",
      a: `Forward Euler: u_{n+1} = u_n (1 - 10Δx) = u_n × λ
  • Δx=0.05 → λ=0.5  (stable, monotone decay)
  • Δx=0.25 → λ=-1.5 (unstable, sign flip + divergence)
  • Stability: |1-10Δx| < 1  → Δx < 0.2

Backward Euler: u_{n+1} = u_n / (1+10Δx)
  • For all Δx>0, |denom|>1 → unconditionally stable.
  • Even at Δx=0.25 it decays (less accurate but stable).`,
    },
    {
      id: "p3",
      q: "Solve 1D Poisson d²u/dx²=1, u(0)=u(1)=0 with h=0.25. Write the matrix A and compare to analytic u=x(x-1)/2.",
      a: `N = (1/0.25) - 1 = 3 interior unknowns (x=0.25, 0.5, 0.75)
A = [[-2, 1, 0], [1, -2, 1], [0, 1, -2]]
F = h²·1·[1; 1; 1] = [0.0625; 0.0625; 0.0625]
Solving A·u = F: u = [-0.09375, -0.125, -0.09375]
Analytic u(x)=x(x-1)/2 → u(0.25)=-0.09375, u(0.5)=-0.125, u(0.75)=-0.09375 (exact match — central difference is O(h²) and exact for polynomials ≤ 2).`,
    },
    {
      id: "p4",
      q: "For 2D Poisson with grid (Nx, Ny)=(5,4) (boundary inclusive), state the size of matrix A.",
      a: `Interior: (Nx-2)(Ny-2) = 3×2 = 6
Or with all points (lecture convention): Ny·Nx = 4×5 = 20 unknowns.
A is 20 × 20, block-tridiagonal.
Block sizes: D is Nx×Nx = 5×5, C = I_5, Z = O_5.
There are Ny=4 row-blocks of size Nx=5, totaling (4×5)×(4×5) = 20 × 20.`,
    },
    {
      id: "p5",
      q: "List two reasons Crank–Nicolson is intrinsically better than Forward Euler.",
      a: `(1) Accuracy: O(Δx²) (trapezoidal in time) vs O(Δx).
(2) Stability: A-stable for linear ODEs (entire LHP).
  Forward Euler stability region |1+λΔx|≤1 is bounded → tiny Δx required for stiff problems.
Caveat: CN is implicit (Newton iteration each step) and not L-stable → can ring on stiff problems.`,
    },
    {
      id: "p6",
      q: "When solving 1D Poisson, h=0.1 vs h=0.05 gave L∞ error ratio ≈ ¼. What does this confirm?",
      a: `It confirms O(h²) accuracy.
Halving h reduces truncation error by (1/2)² = 1/4 — consistent with central differencing.
Standard practice: measure ratio r = e_coarse / e_fine, then log₂(r) ≈ p (convergence order). For central diff, p=2.
This is the basis of Richardson extrapolation and grid convergence studies.`,
    },
    {
      id: "p7",
      q: "Among FDM, FEM, FVM, which naturally satisfies conservation laws and why?",
      a: `FVM (Finite Volume Method).
Reason: FVM directly discretizes the integral form of conservation laws on each cell. Fluxes at faces appear with opposite sign in adjacent cells → telescope cancellation, leaving only boundary flux. Conservation is enforced at the discrete level.
FDM uses pointwise differential form → conservation not automatic.
FEM uses weak form → some conservation via Galerkin orthogonality (depends on test functions).
This is why industrial CFD (ANSYS Fluent, OpenFOAM, …) is overwhelmingly FVM-based.`,
    },
    {
      id: "p8",
      q: "The Karman vortex demo uses LBM (Lattice Boltzmann). How does LBM differ from direct N-S solvers?",
      a: `LBM evolves the molecular distribution fᵢ(x, c, t) (streaming + collision) — discretization of Boltzmann eq.
Macroscopic vars: ρ = Σf, ρu = Σcf.
N-S direct solvers (FDM/FEM/FVM) discretize coupled (continuity + momentum) equations.
LBM advantages: very simple algorithm (local collision + nearest-neighbor streaming) → massively parallel; easy boundary handling (bounce-back); natural for multiphase / porous media.
LBM limits: lattice Mach restricts compressibility; some BCs are tricky; high memory usage.
Excellent for low-Re flow visualization — hence its use in this demo.`,
    },
  ];

  return (
    <Card>
      <H2>{isKo ? "연습문제" : "Practice Problems"}</H2>
      <p style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>
        {isKo ? "각 문항의 풀이는 클릭하여 펼쳐 보세요." : "Click each problem to reveal the solution."}
      </p>
      {problems.map((p, idx) => (
        <div key={p.id} style={{
          marginBottom: 10, padding: 14,
          background: C.card, borderRadius: 8,
          borderLeft: `3px solid ${C.purple}`,
        }}>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>
            <b style={{ color: C.purple }}>Q{idx + 1}.</b> {p.q}
          </div>
          <button onClick={() => toggle(p.id)} style={{
            ...btnStyle(shown[p.id]), marginTop: 8, fontSize: 12,
          }}>
            {shown[p.id] ? (isKo ? "풀이 숨기기" : "Hide solution") : (isKo ? "풀이 보기" : "Show solution")}
          </button>
          {shown[p.id] && (
            <pre style={{
              marginTop: 8, padding: 12,
              background: "#0d1117", border: `1px solid ${C.border}`,
              borderRadius: 6, fontFamily: "'JetBrains Mono', Consolas, monospace",
              fontSize: 12, color: C.cyan, lineHeight: 1.6,
              whiteSpace: "pre-wrap", overflowX: "auto",
            }}>{p.a}</pre>
          )}
        </div>
      ))}
    </Card>
  );
}

// =============================================================
// 8) RAW CODES (Python / MATLAB / Julia / C++)
// =============================================================
function RawCodes({ lang }) {
  const isKo = lang === "ko";
  const [topic, setTopic] = useState("ode");
  const [language, setLanguage] = useState("python");

  const codes = useMemo(() => buildCodeSamples(), []);
  const item = codes[topic][language];

  const download = () => {
    const blob = new Blob([item.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    navigator.clipboard?.writeText(item.code);
  };

  return (
    <>
      <Card>
        <H2>{isKo ? "다운로드 가능한 실습 코드" : "Downloadable Practice Code"}</H2>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          {isKo
            ? "동일한 알고리즘을 4가지 언어로 제공합니다. 본인의 환경에 맞춰 다운로드 후 실행해 보세요. 모든 코드는 외부 의존성을 최소화하여 작성되었습니다."
            : "The same algorithms in 4 languages. Download the file matching your environment. External dependencies are minimized."}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {Object.entries({
            ode: isKo ? "1D ODE (3가지 방법)" : "1D ODE (3 methods)",
            poisson1d: "1D Poisson (Thomas)",
            poisson2d: "2D Poisson (Gauss–Seidel)",
            karman: "Karman Vortex (LBM D2Q9)",
          }).map(([k, lbl]) => (
            <button key={k} onClick={() => setTopic(k)} style={btnStyle(topic === k)}>{lbl}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[
            ["python", "Python"], ["matlab", "MATLAB"],
            ["julia", "Julia"], ["cpp", "C++"]
          ].map(([k, lbl]) => (
            <button key={k} onClick={() => setLanguage(k)} style={btnStyle(language === k)}>{lbl}</button>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8,
        }}>
          <div style={{
            fontFamily: "monospace", color: C.accentSoft, fontSize: 13,
          }}>{item.filename}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={copy} style={btnStyle(false)}>📋 Copy</button>
            <button onClick={download} style={{ ...btnStyle(false), background: C.accent, color: "white" }}>
              ⬇ {isKo ? "다운로드" : "Download"}
            </button>
          </div>
        </div>
        <pre style={{
          padding: 16, background: "#0d1117", border: `1px solid ${C.border}`,
          borderRadius: 8, fontSize: 12, lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', Consolas, monospace",
          color: C.text, overflowX: "auto", maxHeight: 600,
        }}>{item.code}</pre>
      </Card>
    </>
  );
}

// Code samples are stored externally (will be loaded from imported module in production
// to keep this file readable). For inline distribution we embed them below.
function buildCodeSamples() {
  return CODES;
}

// CODES are defined at the bottom of file for readability of the React UI above.
const CODES = (() => ({
  ode: {
    python: {
      filename: "wk11_ode_methods.py",
      code: PY_ODE,
    },
    matlab: { filename: "wk11_ode_methods.m", code: ML_ODE },
    julia:  { filename: "wk11_ode_methods.jl", code: JL_ODE },
    cpp:    { filename: "wk11_ode_methods.cpp", code: CPP_ODE },
  },
  poisson1d: {
    python: { filename: "wk11_poisson1d.py", code: PY_P1 },
    matlab: { filename: "wk11_poisson1d.m", code: ML_P1 },
    julia:  { filename: "wk11_poisson1d.jl", code: JL_P1 },
    cpp:    { filename: "wk11_poisson1d.cpp", code: CPP_P1 },
  },
  poisson2d: {
    python: { filename: "wk11_poisson2d.py", code: PY_P2 },
    matlab: { filename: "wk11_poisson2d.m", code: ML_P2 },
    julia:  { filename: "wk11_poisson2d.jl", code: JL_P2 },
    cpp:    { filename: "wk11_poisson2d.cpp", code: CPP_P2 },
  },
  karman: {
    python: { filename: "wk11_karman_lbm.py", code: PY_LBM },
    matlab: { filename: "wk11_karman_lbm.m", code: ML_LBM },
    julia:  { filename: "wk11_karman_lbm.jl", code: JL_LBM },
    cpp:    { filename: "wk11_karman_lbm.cpp", code: CPP_LBM },
  },
}));

