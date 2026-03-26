import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const Sub = ({ children }) => <sub className="text-xs">{children}</sub>;
const Sup = ({ children }) => <sup className="text-xs">{children}</sup>;

const C = {
  bg: "#060b18", card: "#0f1729", accent: "#14b8a6", accentDim: "#0d9488",
  cyan: "#06b6d4", cyanDim: "#0e7490", green: "#22c55e", danger: "#ef4444",
  purple: "#a78bfa", orange: "#f97316", text: "#e2e8f0", textDim: "#94a3b8",
  border: "#1a2744", hi: "#1e1b4b",
};

const TABS_KR = [
  { id: "overview", label: "📋 개요", short: "개요" },
  { id: "vecops", label: "🔢 벡터 연산", short: "내적외적" },
  { id: "gradient", label: "📐 Gradient", short: "∇f" },
  { id: "divergence", label: "🌊 Divergence", short: "∇·F" },
  { id: "curl", label: "🌀 Curl", short: "∇×F" },
  { id: "coords", label: "🔄 좌표계 변환", short: "좌표계" },
  { id: "practice", label: "✏️ 연습문제", short: "문제" },
  { id: "industry", label: "🏭 산업응용", short: "응용" },
];
const TABS_EN = [
  { id: "overview", label: "📋 Overview", short: "Intro" },
  { id: "vecops", label: "🔢 Vector Ops", short: "Dot/Cross" },
  { id: "gradient", label: "📐 Gradient", short: "∇f" },
  { id: "divergence", label: "🌊 Divergence", short: "∇·F" },
  { id: "curl", label: "🌀 Curl", short: "∇×F" },
  { id: "coords", label: "🔄 Coordinates", short: "Coords" },
  { id: "practice", label: "✏️ Practice", short: "Quiz" },
  { id: "industry", label: "🏭 Applications", short: "Apps" },
];

const L = {
  KR: {
    title: "Week 6 — Differential Equations of Fluid Mechanics",
    subtitle: "Week 6 · Differential Equations & Vector Calculus · SKKU SPMDL",
    prof: "Prof. S. Joon Kwon", weekHelper: "6주차 학습 도우미",
    overviewP: "이번 주는 유체역학의 미분 방정식을 세우기 위한 수학적 도구인 벡터 미적분을 학습합니다. 내적·외적의 기하학적 의미에서 출발하여, gradient(∇f), divergence(∇·F), curl(∇×F)의 물리적 의미를 이해하고, Gauss 발산 정리와 Stokes 정리를 유도합니다. 이를 원통좌표계(CCS)와 구면좌표계(SCS)로 확장합니다.",
    cards: ["내적 & 외적","Gradient ∇f","Divergence ∇·F","Curl ∇×F","좌표계 변환","Laplacian ∇²f"],
    cardsDesc: ["Kronecker δ, cosθ, sinθ, 평행사변형 넓이, 평행육면체 부피","스칼라장의 기울기, 선적분, 포텐셜 에너지","벡터장의 발산, flux, Gauss 정리","Vorticity, 순환, Stokes 정리","극좌표, 원통좌표(CCS), 구면좌표(SCS)","각 좌표계에서의 Laplacian 표현"],
    vecInner: "내적 (Inner product)", vecCross: "외적 (Cross product)", interactive: "Interactive 벡터 연산기 (2D)",
    gradTitle: "Gradient ∇f — 스칼라장의 기울기", gradCore: "핵심 개념", gradSim: "Gradient Field 시뮬레이터",
    gradNote: "배경색 = f(x,y) 등고선, 화살표 = ∇f. 극소에서 발산, 극대로 수렴.",
    gradLineInt: "선적분: ∫(∇f)·dl = f(r₂) − f(r₁) (경로 무관!)",
    gradPotential: "포텐셜 에너지 f = mgz → 힘 = −∇f = −mgê_z. W = mg(z₂ − z₁).",
    divTitle: "Divergence ∇·F — 벡터장의 발산", divCore: "핵심 개념",
    divPhys: "미소 체적에서 단위 시간당 순 유출량(net outflux). 양수 = source, 음수 = sink, 0 = 비압축성.",
    divGauss: "Gauss 정리: ∫_V ∇·F dV = ∮_S F·da",
    divBall: "물리적 비유: 물이 든 고무공을 짜면, 내부 체적 변화(좌변) = 표면을 통해 빠져나간 양(우변).",
    divDeriv: "유도: 미소 직육면체의 flux balance",
    divSim: "Divergence 시뮬레이터",
    divSimNote: "빨간 점선 = 미소 체적. Source 유동은 ∇·F > 0, 회전 유동은 ∇·F = 0.",
    curlTitle: "Curl ∇×F — Vorticity (와도)", curlCore: "핵심 개념",
    curlCirc: "Circulation ≡ 회전 속도 × 길이. 단위 면적당 순환 = vorticity의 한 성분.",
    curlSim: "Curl/Vorticity 시뮬레이터",
    curlSimNote: "녹색 원 = circulation 경로. Rigid rotation은 curl = 2, source는 curl = 0.",
    coordTitle: "좌표계 변환 — CCS & SCS", coordSim: "Interactive 좌표 변환기",
    coordRCCS: "RCCS (직교좌표)", coordCCS: "CCS (원통좌표)", coordSCS: "SCS (구면좌표)",
    coordRotMat: "단위벡터 회전행렬",
    practiceTitle: "연습문제", checkAns: "정답 확인", next: "다음 →", reset: "처음으로",
    correct: "✅ 정답!", wrong: "❌ 오답",
    industryTitle: "벡터 미적분의 산업 응용",
    footer1: "SKKU 화학공학부 · Smart Process & Materials Design Lab (SPMDL)",
    footer2: "화공유체역학 Week 6 학습 도우미 · 2025 Spring",
  },
  EN: {
    title: "Week 6 — Differential Equations of Fluid Mechanics",
    subtitle: "Week 6 · Differential Equations & Vector Calculus · SKKU SPMDL",
    prof: "Prof. S. Joon Kwon", weekHelper: "Week 6 Study Companion",
    overviewP: "This week covers vector calculus — the mathematical tools for formulating differential equations of fluid mechanics. Starting from the geometric meaning of dot & cross products, we study gradient (∇f), divergence (∇·F), curl (∇×F), derive the Gauss divergence theorem and Stokes' theorem, then extend to cylindrical (CCS) and spherical (SCS) coordinate systems.",
    cards: ["Dot & Cross","Gradient ∇f","Divergence ∇·F","Curl ∇×F","Coordinate Systems","Laplacian ∇²f"],
    cardsDesc: ["Kronecker δ, cosθ, sinθ, parallelogram area, parallelepiped volume","Slope of scalar field, line integral, potential energy","Vector field divergence, flux, Gauss theorem","Vorticity, circulation, Stokes theorem","Polar, cylindrical (CCS), spherical (SCS)","Laplacian in each coordinate system"],
    vecInner: "Dot product (Inner product)", vecCross: "Cross product", interactive: "Interactive vector calculator (2D)",
    gradTitle: "Gradient ∇f — slope of a scalar field", gradCore: "Key concepts", gradSim: "Gradient field simulator",
    gradNote: "Background = f(x,y) contours, arrows = ∇f. Diverges from minima, converges to maxima.",
    gradLineInt: "Line integral: ∫(∇f)·dl = f(r₂) − f(r₁) (path-independent!)",
    gradPotential: "Potential energy f = mgz → Force = −∇f = −mgê_z. W = mg(z₂ − z₁).",
    divTitle: "Divergence ∇·F — source/sink of vector field", divCore: "Key concepts",
    divPhys: "Net outflux per unit volume per unit time. Positive = source, negative = sink, 0 = incompressible.",
    divGauss: "Gauss theorem: ∫_V ∇·F dV = ∮_S F·da",
    divBall: "Physical analogy: squeezing a water-filled rubber ball — internal volume change (LHS) = water pushed out through surface (RHS).",
    divDeriv: "Derivation: flux balance on differential cuboid",
    divSim: "Divergence simulator",
    divSimNote: "Red dashed = differential volume. Source flow: ∇·F > 0, rotational: ∇·F = 0.",
    curlTitle: "Curl ∇×F — Vorticity", curlCore: "Key concepts",
    curlCirc: "Circulation ≡ rotational velocity × length. Circulation per unit area = vorticity component.",
    curlSim: "Curl/Vorticity simulator",
    curlSimNote: "Green circle = circulation path. Rigid rotation: curl = 2, source: curl = 0.",
    coordTitle: "Coordinate transformations — CCS & SCS", coordSim: "Interactive coordinate converter",
    coordRCCS: "RCCS (Cartesian)", coordCCS: "CCS (Cylindrical)", coordSCS: "SCS (Spherical)",
    coordRotMat: "Unit vector rotation matrices",
    practiceTitle: "Practice problems", checkAns: "Check answer", next: "Next →", reset: "Start over",
    correct: "✅ Correct!", wrong: "❌ Wrong",
    industryTitle: "Engineering applications of vector calculus",
    footer1: "SKKU School of Chemical Engineering · Smart Process & Materials Design Lab (SPMDL)",
    footer2: "Fluid Mechanics Week 6 Study Companion · 2025 Spring",
  },
};

// ═══════════════ OVERVIEW ═══════════════
function OverviewTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: C.accent }}>Week 6 — Differential Equations of Fluid Mechanics</h2>
        <p style={{ color: C.text, lineHeight: 1.8 }}>
          이번 주는 유체역학의 <strong style={{ color: C.accent }}>미분 방정식</strong>을 세우기 위한 수학적 도구인
          <strong style={{ color: C.cyan }}> 벡터 미적분</strong>을 학습합니다. 내적·외적의 기하학적 의미에서 출발하여,
          <strong style={{ color: C.green }}> gradient(∇f)</strong>, <strong style={{ color: C.orange }}>divergence(∇·F)</strong>,
          <strong style={{ color: C.purple }}>curl(∇×F)</strong>의 물리적 의미를 이해하고,
          <strong style={{ color: C.danger }}>Gauss 발산 정리</strong>와 <strong style={{ color: C.cyan }}>Stokes 정리</strong>를 유도합니다.
          이를 <strong style={{ color: C.accent }}>원통좌표계(CCS)</strong>와 <strong style={{ color: C.purple }}>구면좌표계(SCS)</strong>로 확장합니다.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: "🔢", title: "내적 & 외적", desc: "Kronecker δ, cosθ, sinθ, 평행사변형 넓이, 평행육면체 부피", color: C.accent },
          { icon: "📐", title: "Gradient ∇f", desc: "스칼라장의 기울기, 선적분, 포텐셜 에너지", color: C.green },
          { icon: "🌊", title: "Divergence ∇·F", desc: "벡터장의 발산, flux, Gauss 정리", color: C.orange },
          { icon: "🌀", title: "Curl ∇×F", desc: "Vorticity, 순환, Stokes 정리", color: C.purple },
          { icon: "🔄", title: "좌표계 변환", desc: "극좌표, 원통좌표(CCS), 구면좌표(SCS)", color: C.cyan },
          { icon: "📊", title: "Laplacian ∇²f", desc: "각 좌표계에서의 Laplacian 표현", color: C.danger },
        ].map((item, i) => (
          <div key={i} className="p-3 rounded-xl hover:scale-[1.02] transition-all" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="text-2xl mb-1">{item.icon}</div>
            <h3 className="font-bold text-xs mb-1" style={{ color: item.color }}>{item.title}</h3>
            <p className="text-xs" style={{ color: C.textDim }}>{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>📐 Quick Reference</h3>
        <div className="space-y-1.5 text-xs font-mono">
          {[
            { eq: "a·b = |a||b|cosθ = a_xb_x + a_yb_y + a_zb_z", label: "내적 (스칼라)", c: C.accent },
            { eq: "|a×b| = |a||b|sinθ = 평행사변형 넓이", label: "외적 크기", c: C.cyan },
            { eq: "∇f = (∂f/∂x)ê_x + (∂f/∂y)ê_y + (∂f/∂z)ê_z", label: "Gradient (RCCS)", c: C.green },
            { eq: "∇·F = ∂F_x/∂x + ∂F_y/∂y + ∂F_z/∂z", label: "Divergence (스칼라)", c: C.orange },
            { eq: "∇×F = |ê_x  ê_y  ê_z; ∂/∂x ∂/∂y ∂/∂z; F_x F_y F_z|", label: "Curl (벡터)", c: C.purple },
            { eq: "∫_V ∇·F dV = ∮_S F·da", label: "Gauss 발산 정리", c: C.danger },
            { eq: "∫_S (∇×A)·da = ∮_C A·dl", label: "Stokes 정리", c: C.cyan },
            { eq: "∇f = (∂f/∂ρ)ρ̂ + (1/ρ)(∂f/∂φ)φ̂ + (∂f/∂z)ẑ", label: "Gradient (CCS)", c: C.accent },
            { eq: "∇²f = (1/r²)∂/∂r(r²∂f/∂r) + ...", label: "Laplacian (SCS)", c: C.purple },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-1.5 rounded" style={{ background: `${r.c}08` }}>
              <span className="w-80 flex-shrink-0" style={{ color: r.c }}>{r.eq}</span>
              <span style={{ color: C.textDim }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ VECTOR OPERATIONS ═══════════════
function VecOpsTab() {
  const cvRef = useRef(null);
  const [ax, setAx] = useState(3); const [ay, setAy] = useState(1);
  const [bx, setBx] = useState(1); const [by, setBy] = useState(3);

  const dot = ax * bx + ay * by;
  const crossZ = ax * by - ay * bx;
  const magA = Math.sqrt(ax * ax + ay * ay);
  const magB = Math.sqrt(bx * bx + by * by);
  const theta = Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB || 1)))) * 180 / Math.PI;

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return; const ctx = cv.getContext("2d");
    const W = cv.width = 400, H = cv.height = 280; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const ox = W / 2, oy = H / 2, sc = 40;
    ctx.strokeStyle = C.border; ctx.lineWidth = 0.5;
    for (let x = -4; x <= 4; x++) { ctx.beginPath(); ctx.moveTo(ox + x * sc, 0); ctx.lineTo(ox + x * sc, H); ctx.stroke(); }
    for (let y = -3; y <= 3; y++) { ctx.beginPath(); ctx.moveTo(0, oy + y * sc); ctx.lineTo(W, oy + y * sc); ctx.stroke(); }
    function drawVec(x, y, col, label) {
      const ex = ox + x * sc, ey = oy - y * sc;
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
      const ang = Math.atan2(oy - ey, ex - ox), hl = 8;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang - .4), ey + hl * Math.sin(ang - .4)); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang + .4), ey + hl * Math.sin(ang + .4)); ctx.stroke();
      ctx.fillStyle = col; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "left"; ctx.fillText(label, ex + 5, ey - 5);
    }
    drawVec(ax, ay, C.cyan, "a"); drawVec(bx, by, C.orange, "b");
    if (Math.abs(crossZ) > 0.01) {
      ctx.fillStyle = `${C.purple}20`; ctx.beginPath();
      ctx.moveTo(ox, oy); ctx.lineTo(ox + ax * sc, oy - ay * sc); ctx.lineTo(ox + (ax + bx) * sc, oy - (ay + by) * sc); ctx.lineTo(ox + bx * sc, oy - by * sc); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.purple; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`|a×b|=${Math.abs(crossZ).toFixed(1)}`, ox + (ax + bx) * sc / 2, oy - (ay + by) * sc / 2);
    }
    ctx.fillStyle = C.textDim; ctx.font = "9px monospace"; ctx.textAlign = "left"; ctx.fillText("θ=" + theta.toFixed(1) + "°", ox + 8, oy - 8);
  }, [ax, ay, bx, by, dot, crossZ, theta]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>벡터 내적 & 외적</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Kronecker δ, 기하학적 의미, 행렬식 표현</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.cyan}33` }}>
          <h3 className="font-bold mb-2" style={{ color: C.cyan }}>내적 (Inner product)</h3>
          <div className="space-y-2 text-sm" style={{ color: C.text }}>
            <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>a·b = a<Sub>x</Sub>b<Sub>x</Sub> + a<Sub>y</Sub>b<Sub>y</Sub> + a<Sub>z</Sub>b<Sub>z</Sub> = |a||b|cosθ</div>
            <p className="text-xs" style={{ color: C.textDim }}>Kronecker delta: e<Sub>i</Sub>·e<Sub>j</Sub> = δ<Sub>ij</Sub> (i=j일 때 1, i≠j일 때 0)</p>
            <p className="text-xs" style={{ color: C.textDim }}>a·b = 0이면 a와 b는 직교. a·a = |a|² ≥ 0.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.orange}33` }}>
          <h3 className="font-bold mb-2" style={{ color: C.orange }}>외적 (Cross product)</h3>
          <div className="space-y-2 text-sm" style={{ color: C.text }}>
            <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>|a×b| = |a||b|sinθ = 평행사변형 넓이</div>
            <p className="text-xs" style={{ color: C.textDim }}>Right-hand rule. a×b = −b×a (반교환). e<Sub>x</Sub>×e<Sub>y</Sub> = e<Sub>z</Sub> (순환).</p>
            <p className="text-xs" style={{ color: C.textDim }}>A·(B×C) = 평행육면체 부피 (scalar triple product).</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>🔬 Interactive 벡터 연산기 (2D)</h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[{ l: "a_x", v: ax, s: setAx }, { l: "a_y", v: ay, s: setAy }, { l: "b_x", v: bx, s: setBx }, { l: "b_y", v: by, s: setBy }].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.l}</label>
              <input type="range" min={-4} max={4} step={.1} value={p.v} onChange={e => p.s(+e.target.value)} className="w-full" style={{ accentColor: i < 2 ? C.cyan : C.orange }} />
              <span className="text-xs font-mono" style={{ color: i < 2 ? C.cyan : C.orange }}>{p.v.toFixed(1)}</span></div>
          ))}
        </div>
        <canvas ref={cvRef} className="w-full rounded-lg" style={{ maxWidth: 400 }} />
        <div className="grid grid-cols-4 gap-3 mt-3">
          {[{ l: "a·b", v: dot.toFixed(2), c: C.accent }, { l: "|a×b|_z", v: crossZ.toFixed(2), c: C.purple }, { l: "θ", v: theta.toFixed(1) + "°", c: C.green }, { l: "|a|·|b|sinθ", v: (magA * magB * Math.sin(theta * Math.PI / 180)).toFixed(2), c: C.orange }].map((m, i) => (
            <div key={i} className="p-2 rounded-lg text-center" style={{ background: C.bg }}><div className="text-xs" style={{ color: C.textDim }}>{m.l}</div><div className="text-lg font-bold" style={{ color: m.c }}>{m.v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ GRADIENT ═══════════════
function GradientTab() {
  const gRef = useRef(null);
  const [fn, setFn] = useState(0);
  const funcs = [
    { name: "f = −x² − y²", f: (x, y) => -x * x - y * y, gx: (x, y) => -2 * x, gy: (x, y) => -2 * y },
    { name: "f = x·exp(−x²−y²)", f: (x, y) => x * Math.exp(-x * x - y * y), gx: (x, y) => (1 - 2 * x * x) * Math.exp(-x * x - y * y), gy: (x, y) => -2 * x * y * Math.exp(-x * x - y * y) },
    { name: "f = sin(x)·cos(y)", f: (x, y) => Math.sin(x) * Math.cos(y), gx: (x, y) => Math.cos(x) * Math.cos(y), gy: (x, y) => -Math.sin(x) * Math.sin(y) },
  ];
  const cur = funcs[fn];

  useEffect(() => {
    const cv = gRef.current; if (!cv) return; const ctx = cv.getContext("2d");
    const W = cv.width = 480, H = cv.height = 320; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const rng = 2.5, step = .3, sc = W / (2 * rng);
    const ox = W / 2, oy = H / 2;
    // contour
    for (let px = 0; px < W; px += 2) for (let py = 0; py < H; py += 2) {
      const x = (px - ox) / sc, y = -(py - oy) / sc;
      const v = cur.f(x, y);
      const t = (v + 2) / 4;
      const r = Math.round(50 + 180 * Math.max(0, Math.min(1, t)));
      const g = Math.round(80 + 80 * Math.max(0, Math.min(1, 1 - Math.abs(t - .5) * 2)));
      const b = Math.round(200 - 150 * Math.max(0, Math.min(1, t)));
      ctx.fillStyle = `rgba(${r},${g},${b},.5)`; ctx.fillRect(px, py, 2, 2);
    }
    // gradient vectors
    for (let x = -rng + step / 2; x <= rng; x += step) for (let y = -rng + step / 2; y <= rng; y += step) {
      const gx = cur.gx(x, y), gy = cur.gy(x, y);
      const mag = Math.sqrt(gx * gx + gy * gy);
      if (mag < .01) continue;
      const len = Math.min(mag * sc * .12, 14);
      const px = ox + x * sc, py = oy - y * sc;
      const ex = px + (gx / mag) * len, ey = py - (gy / mag) * len;
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(.8, .2 + mag * .3)})`;
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
      const ang = Math.atan2(py - ey, ex - px), hl = 3;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang - .5), ey + hl * Math.sin(ang - .5)); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang + .5), ey + hl * Math.sin(ang + .5)); ctx.stroke();
    }
    ctx.fillStyle = C.text; ctx.font = "11px sans-serif"; ctx.textAlign = "left"; ctx.fillText(cur.name, 8, 16);
    ctx.fillStyle = C.textDim; ctx.font = "9px sans-serif"; ctx.fillText("화살표 = ∇f (gradient 방향 & 크기)", 8, H - 8);
  }, [fn, cur]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.green }}>Gradient ∇f — 스칼라장의 기울기</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>핵심 개념</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>∇f = (∂f/∂x)ê<Sub>x</Sub> + (∂f/∂y)ê<Sub>y</Sub> + (∂f/∂z)ê<Sub>z</Sub> → 벡터</div>
          <p>고차원 공간에서의 "기울기" 일반화. ∇f는 f가 가장 빠르게 증가하는 방향을 가리킵니다.</p>
          <div className="p-2 rounded font-mono text-xs" style={{ background: `${C.green}15`, color: C.green }}>선적분: ∫(∇f)·dl = f(r₂) − f(r₁) (경로 무관!)</div>
          <p className="text-xs" style={{ color: C.textDim }}>포텐셜 에너지 f = mgz → 힘 = −∇f = −mgê<Sub>z</Sub>. W = mg(z₂ − z₁). z₂ &gt; z₁이면 W &gt; 0 (외부 에너지 필요).</p>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.accent}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.accent }}>🔬 Gradient Field 시뮬레이터</h3>
        <div className="flex gap-2 mb-3">
          {funcs.map((f, i) => (<button key={i} onClick={() => setFn(i)} className="px-3 py-1 rounded-lg text-xs" style={{ background: fn === i ? C.accent : C.bg, color: fn === i ? C.bg : C.textDim, border: `1px solid ${fn === i ? C.accent : C.border}` }}>{f.name}</button>))}
        </div>
        <canvas ref={gRef} className="w-full rounded-lg" style={{ maxWidth: 480 }} />
        <p className="text-xs mt-2" style={{ color: C.textDim }}>배경색 = f(x,y) 등고선, 화살표 = ∇f. 극소에서 발산(diverge), 극대로 수렴(converge).</p>
      </div>
    </div>
  );
}

// ═══════════════ DIVERGENCE ═══════════════
function DivergenceTab() {
  const dRef = useRef(null);
  const [field, setField] = useState(0);
  const fields = [
    { name: "F = (x, y) — source", fx: (x, y) => x, fy: (x, y) => y, divF: "∇·F = 2 (uniform source)" },
    { name: "F = (−y, x) — rotation", fx: (x, y) => -y, fy: (x, y) => x, divF: "∇·F = 0 (incompressible)" },
    { name: "F = (x², xy) — nonuniform", fx: (x, y) => x * x, fy: (x, y) => x * y, divF: "∇·F = 2x + x = 3x" },
  ];
  const cur = fields[field];

  useEffect(() => {
    const cv = dRef.current; if (!cv) return; const ctx = cv.getContext("2d");
    const W = cv.width = 480, H = cv.height = 300; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const rng = 2.5, step = .35, sc = W / (2 * rng), ox = W / 2, oy = H / 2;
    for (let x = -rng + step / 2; x <= rng; x += step) for (let y = -rng + step / 2; y <= rng; y += step) {
      const fx = cur.fx(x, y), fy = cur.fy(x, y);
      const mag = Math.sqrt(fx * fx + fy * fy); if (mag < .01) continue;
      const len = Math.min(mag * sc * .1, 14);
      const px = ox + x * sc, py = oy - y * sc;
      const ex = px + (fx / mag) * len, ey = py - (fy / mag) * len;
      const hue = mag < 1 ? 200 : mag < 2 ? 40 : 0;
      ctx.strokeStyle = `hsla(${hue},70%,55%,${Math.min(.9, .3 + mag * .2)})`;
      ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
      const ang = Math.atan2(py - ey, ex - px), hl = 3;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang - .5), ey + hl * Math.sin(ang - .5)); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang + .5), ey + hl * Math.sin(ang + .5)); ctx.stroke();
    }
    // draw a small box to show flux
    const bx = 0.5, by = 0.5, bs = 0.4;
    ctx.strokeStyle = C.danger; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.strokeRect(ox + (bx - bs / 2) * sc, oy - (by + bs / 2) * sc, bs * sc, bs * sc); ctx.setLineDash([]);
    ctx.fillStyle = C.text; ctx.font = "11px sans-serif"; ctx.textAlign = "left"; ctx.fillText(cur.name, 8, 16);
    ctx.fillStyle = C.orange; ctx.font = "10px sans-serif"; ctx.fillText(cur.divF, 8, H - 8);
  }, [field, cur]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.orange }}>Divergence ∇·F — 벡터장의 발산</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>핵심 개념</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>∇·F = ∂F<Sub>x</Sub>/∂x + ∂F<Sub>y</Sub>/∂y + ∂F<Sub>z</Sub>/∂z → 스칼라</div>
          <p>미소 체적에서 단위 시간당 순 유출량(net outflux). 양수 = source, 음수 = sink, 0 = 비압축성.</p>
          <div className="p-2 rounded font-mono text-xs" style={{ background: `${C.danger}15`, color: C.danger }}>Gauss 정리: ∫<Sub>V</Sub> ∇·F dV = ∮<Sub>S</Sub> F·da</div>
          <p className="text-xs" style={{ color: C.textDim }}>물리적 비유: 물이 든 고무공을 짜면, 내부 체적 변화(좌변) = 표면을 통해 빠져나간 양(우변).</p>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>유도: 미소 직육면체의 flux balance</h3>
        <div className="space-y-1 text-xs" style={{ color: C.text }}>
          <p>x-방향 입출: (v<Sub>x</Sub> + ∂v<Sub>x</Sub>/∂x·dx)dydz − v<Sub>x</Sub>dydz = (∂v<Sub>x</Sub>/∂x)dxdydz</p>
          <p>y, z-방향도 동일 → 총 순유출 = (∂v<Sub>x</Sub>/∂x + ∂v<Sub>y</Sub>/∂y + ∂v<Sub>z</Sub>/∂z)dV = (∇·v)dV</p>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.orange}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.orange }}>🔬 Divergence 시뮬레이터</h3>
        <div className="flex gap-2 mb-3">{fields.map((f, i) => (<button key={i} onClick={() => setField(i)} className="px-3 py-1 rounded-lg text-xs" style={{ background: field === i ? C.orange : C.bg, color: field === i ? C.bg : C.textDim, border: `1px solid ${field === i ? C.orange : C.border}` }}>{f.name}</button>))}</div>
        <canvas ref={dRef} className="w-full rounded-lg" style={{ maxWidth: 480 }} />
        <p className="text-xs mt-2" style={{ color: C.textDim }}>빨간 점선 = 미소 체적. Source 유동은 ∇·F &gt; 0, 회전 유동은 ∇·F = 0.</p>
      </div>
    </div>
  );
}

// ═══════════════ CURL ═══════════════
function CurlTab() {
  const cRef = useRef(null);
  const [cField, setCField] = useState(0);
  const cFields = [
    { name: "F = (−y, x) — rigid rotation", fx: (x, y) => -y, fy: (x, y) => x, curl: "∇×F = 2ê_z (constant)" },
    { name: "F = (y, 0) — shear", fx: (x, y) => y, fy: (x, y) => 0, curl: "∇×F = −ê_z" },
    { name: "F = (x, y) — source (irrotational)", fx: (x, y) => x, fy: (x, y) => y, curl: "∇×F = 0" },
  ];
  const cur = cFields[cField];

  useEffect(() => {
    const cv = cRef.current; if (!cv) return; const ctx = cv.getContext("2d");
    const W = cv.width = 480, H = cv.height = 300; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const rng = 2.5, step = .35, sc = W / (2 * rng), ox = W / 2, oy = H / 2;
    for (let x = -rng + step / 2; x <= rng; x += step) for (let y = -rng + step / 2; y <= rng; y += step) {
      const fx = cur.fx(x, y), fy = cur.fy(x, y);
      const mag = Math.sqrt(fx * fx + fy * fy); if (mag < .01) continue;
      const len = Math.min(mag * sc * .1, 14);
      const px = ox + x * sc, py = oy - y * sc;
      const ex = px + (fx / mag) * len, ey = py - (fy / mag) * len;
      ctx.strokeStyle = `hsla(280,60%,55%,${Math.min(.9, .3 + mag * .15)})`;
      ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
      const ang = Math.atan2(py - ey, ex - px), hl = 3;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang - .5), ey + hl * Math.sin(ang - .5)); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang + .5), ey + hl * Math.sin(ang + .5)); ctx.stroke();
    }
    // draw circulation loop
    ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox + 0.5 * sc, oy - 0.5 * sc, 0.5 * sc, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.green; ctx.font = "9px sans-serif"; ctx.textAlign = "center"; ctx.fillText("∮F·dl", ox + 0.5 * sc, oy - 0.5 * sc);
    ctx.fillStyle = C.text; ctx.font = "11px sans-serif"; ctx.textAlign = "left"; ctx.fillText(cur.name, 8, 16);
    ctx.fillStyle = C.purple; ctx.font = "10px sans-serif"; ctx.fillText(cur.curl, 8, H - 8);
  }, [cField, cur]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.purple }}>Curl ∇×F — Vorticity (와도)</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>핵심 개념</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <p>Circulation ≡ 회전 속도 × 길이. 단위 면적당 순환 = vorticity의 한 성분.</p>
          <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>(∇×v)<Sub>z</Sub> = ∂v<Sub>y</Sub>/∂x − ∂v<Sub>x</Sub>/∂y</div>
          <p className="text-xs" style={{ color: C.textDim }}>z축 주위 순환: 위(v<Sub>y</Sub> + ∂v<Sub>y</Sub>/∂x·dx)dy − 아래(v<Sub>y</Sub>dy) − 좌(v<Sub>x</Sub> + ∂v<Sub>x</Sub>/∂y·dy)dx + 우(v<Sub>x</Sub>dx)</p>
          <div className="p-2 rounded font-mono text-xs" style={{ background: `${C.cyan}15`, color: C.cyan }}>Stokes 정리: ∫<Sub>S</Sub> (∇×A)·da = ∮<Sub>C</Sub> A·dl</div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.purple}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.purple }}>🔬 Curl/Vorticity 시뮬레이터</h3>
        <div className="flex gap-2 mb-3">{cFields.map((f, i) => (<button key={i} onClick={() => setCField(i)} className="px-3 py-1 rounded-lg text-xs" style={{ background: cField === i ? C.purple : C.bg, color: cField === i ? C.bg : C.textDim, border: `1px solid ${cField === i ? C.purple : C.border}` }}>{f.name}</button>))}</div>
        <canvas ref={cRef} className="w-full rounded-lg" style={{ maxWidth: 480 }} />
        <p className="text-xs mt-2" style={{ color: C.textDim }}>녹색 원 = circulation 경로. Rigid rotation은 curl = 2, source는 curl = 0 (비회전).</p>
      </div>
    </div>
  );
}

// ═══════════════ COORDINATE SYSTEMS ═══════════════
function CoordsTab() {
  const [x, setX] = useState(1); const [y, setY] = useState(1); const [z, setZ] = useState(1);
  const rho = Math.sqrt(x * x + y * y);
  const phi = Math.atan2(y, x) * 180 / Math.PI;
  const rSph = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(z / (rSph || 1)) * 180 / Math.PI;
  const phiSph = Math.atan2(y, x) * 180 / Math.PI;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.cyan }}>좌표계 변환 — CCS & SCS</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>🔬 Interactive 좌표 변환기</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ l: "x", v: x, s: setX, c: C.cyan }, { l: "y", v: y, s: setY, c: C.green }, { l: "z", v: z, s: setZ, c: C.orange }].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.l}</label>
              <input type="range" min={-3} max={3} step={.1} value={p.v} onChange={e => p.s(+e.target.value)} className="w-full" style={{ accentColor: p.c }} />
              <span className="text-xs font-mono" style={{ color: p.c }}>{p.v.toFixed(1)}</span></div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl" style={{ background: C.bg, border: `1px solid ${C.cyan}33` }}>
            <h4 className="font-bold text-xs mb-2" style={{ color: C.cyan }}>RCCS (직교좌표)</h4>
            <div className="space-y-1 text-xs font-mono" style={{ color: C.text }}>
              <div>x = {x.toFixed(2)}</div><div>y = {y.toFixed(2)}</div><div>z = {z.toFixed(2)}</div>
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: C.bg, border: `1px solid ${C.accent}33` }}>
            <h4 className="font-bold text-xs mb-2" style={{ color: C.accent }}>CCS (원통좌표)</h4>
            <div className="space-y-1 text-xs font-mono" style={{ color: C.text }}>
              <div>ρ = √(x²+y²) = {rho.toFixed(3)}</div>
              <div>φ = tan⁻¹(y/x) = {phi.toFixed(1)}°</div>
              <div>z = {z.toFixed(2)}</div>
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: C.bg, border: `1px solid ${C.purple}33` }}>
            <h4 className="font-bold text-xs mb-2" style={{ color: C.purple }}>SCS (구면좌표)</h4>
            <div className="space-y-1 text-xs font-mono" style={{ color: C.text }}>
              <div>r = √(x²+y²+z²) = {rSph.toFixed(3)}</div>
              <div>θ (polar) = {theta.toFixed(1)}°</div>
              <div>φ (azimuth) = {phiSph.toFixed(1)}°</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.accent}33` }}>
          <h3 className="font-bold mb-2" style={{ color: C.accent }}>CCS: ∇, ∇·, ∇×, ∇²</h3>
          <div className="space-y-1 text-xs font-mono" style={{ color: C.text }}>
            <div style={{ color: C.green }}>∇f = (∂f/∂ρ)ρ̂ + (1/ρ)(∂f/∂φ)φ̂ + (∂f/∂z)ẑ</div>
            <div style={{ color: C.orange }}>∇·F = (1/ρ)∂(ρF<Sub>ρ</Sub>)/∂ρ + (1/ρ)∂F<Sub>φ</Sub>/∂φ + ∂F<Sub>z</Sub>/∂z</div>
            <div style={{ color: C.purple }}>∇²f = (1/ρ)∂/∂ρ(ρ∂f/∂ρ) + (1/ρ²)∂²f/∂φ² + ∂²f/∂z²</div>
          </div>
          <p className="text-xs mt-2" style={{ color: C.textDim }}>기저 벡터: ê<Sub>ρ</Sub> = cosφ·ê<Sub>x</Sub> + sinφ·ê<Sub>y</Sub>, ê<Sub>φ</Sub> = −sinφ·ê<Sub>x</Sub> + cosφ·ê<Sub>y</Sub></p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.purple}33` }}>
          <h3 className="font-bold mb-2" style={{ color: C.purple }}>SCS: ∇, ∇·, ∇×, ∇²</h3>
          <div className="space-y-1 text-xs font-mono" style={{ color: C.text }}>
            <div style={{ color: C.green }}>∇f = (∂f/∂r)r̂ + (1/r)(∂f/∂θ)θ̂ + 1/(rsinθ)(∂f/∂φ)φ̂</div>
            <div style={{ color: C.orange }}>∇·F = (1/r²)∂(r²F<Sub>r</Sub>)/∂r + 1/(rsinθ)∂(sinθ·F<Sub>θ</Sub>)/∂θ + ...</div>
            <div style={{ color: C.purple }}>∇²f = (1/r²)∂/∂r(r²∂f/∂r) + 1/(r²sinθ)∂/∂θ(sinθ∂f/∂θ) + ...</div>
          </div>
          <p className="text-xs mt-2" style={{ color: C.textDim }}>지구 위치: r−R<Sub>earth</Sub>=고도, 90°−θ=위도, φ=경도</p>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-2" style={{ color: C.green }}>단위벡터 회전행렬</h3>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono" style={{ color: C.text }}>
          <div className="p-2 rounded" style={{ background: C.bg }}>
            <div style={{ color: C.accent }}>CCS ↔ RCCS:</div>
            <div>[ê<Sub>ρ</Sub>]   [cosφ   sinφ  0][ê<Sub>x</Sub>]</div>
            <div>[ê<Sub>φ</Sub>] = [−sinφ  cosφ  0][ê<Sub>y</Sub>]</div>
            <div>[ê<Sub>z</Sub>]   [0      0     1][ê<Sub>z</Sub>]</div>
          </div>
          <div className="p-2 rounded" style={{ background: C.bg }}>
            <div style={{ color: C.purple }}>SCS ↔ RCCS:</div>
            <div>[ê<Sub>r</Sub>]   [sθcφ  sθsφ  cθ ][ê<Sub>x</Sub>]</div>
            <div>[ê<Sub>θ</Sub>] = [cθcφ  cθsφ  −sθ][ê<Sub>y</Sub>]</div>
            <div>[ê<Sub>φ</Sub>]   [−sφ   cφ    0  ][ê<Sub>z</Sub>]</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ PRACTICE ═══════════════
function PracticeTab() {
  const [cur, setCur] = useState(0); const [sel, setSel] = useState(null); const [show, setShow] = useState(false);
  const qs = [
    { q: "a = (1,2,0), b = (3,0,0)일 때 a·b는?", o: ["3", "6", "0", "2"], a: 0, e: "a·b = 1×3 + 2×0 + 0×0 = 3." },
    { q: "∇·F의 결과는 스칼라인가 벡터인가?", o: ["스칼라", "벡터", "텐서", "정의 불가"], a: 0, e: "∇·F = ∂F_x/∂x + ∂F_y/∂y + ∂F_z/∂z → 스칼라." },
    { q: "∇×F의 결과는?", o: ["스칼라", "벡터", "텐서", "행렬"], a: 1, e: "Curl은 벡터량이며, vorticity를 나타낸다." },
    { q: "Gauss 발산 정리는?", o: ["∫∇·FdV = ∮F·da", "∫∇fdV = ∮fda", "∫∇×F·da = ∮F·dl", "∇²f = 0"], a: 0, e: "체적 적분(divergence) = 표면 적분(flux)." },
    { q: "Stokes 정리는?", o: ["∫∇·FdV = ∮F·da", "∫(∇×A)·da = ∮A·dl", "∇f = −F", "∇²f = ∇·∇f"], a: 1, e: "면적분(curl) = 선적분(circulation)." },
    { q: "F = (x,y,z)의 ∇·F는?", o: ["0", "1", "3", "x+y+z"], a: 2, e: "∂x/∂x + ∂y/∂y + ∂z/∂z = 1+1+1 = 3." },
    { q: "F = (−y,x,0)의 ∇×F는?", o: ["0", "ê_z", "2ê_z", "−2ê_z"], a: 2, e: "∂x/∂x − ∂(−y)/∂y = 1−(−1) = 2. → 2ê_z." },
    { q: "CCS에서 ∇f의 φ̂ 성분은?", o: ["∂f/∂φ", "(1/ρ)∂f/∂φ", "ρ∂f/∂φ", "∂f/∂ρ"], a: 1, e: "arc length = ρdφ이므로 (1/ρ)∂f/∂φ." },
    { q: "SCS에서 r에 대한 Laplacian 항은?", o: ["∂²f/∂r²", "(1/r)∂²(rf)/∂r²", "(1/r²)∂/∂r(r²∂f/∂r)", "r²∂f/∂r"], a: 2, e: "(1/r²)∂/∂r(r²∂f/∂r) — 구면 대칭 확산." },
    { q: "∇×(∇f) = ?", o: ["∇²f", "0", "f", "∇f"], a: 1, e: "gradient의 curl은 항상 0. (보존장 ↔ curl-free)." },
  ];
  const q = qs[cur];
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>연습문제</h2>
        <div className="flex items-center gap-3"><span className="text-sm" style={{ color: C.textDim }}>{cur + 1}/{qs.length}</span><div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.bg }}><div className="h-full rounded-full transition-all" style={{ width: `${(cur + 1) / qs.length * 100}%`, background: C.accent }} /></div></div>
      </div>
      <div className="p-5 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-4" style={{ color: C.text }}>{q.q}</h3>
        <div className="space-y-2">
          {q.o.map((opt, i) => { let bg = C.bg, bc = C.border; if (show) { if (i === q.a) { bg = `${C.green}20`; bc = C.green; } else if (i === sel) { bg = `${C.danger}20`; bc = C.danger; } } else if (i === sel) { bg = `${C.accent}20`; bc = C.accent; } return (<button key={i} onClick={() => !show && setSel(i)} className="w-full text-left p-3 rounded-lg text-sm" style={{ background: bg, border: `1px solid ${bc}`, color: C.text }}><span className="font-mono mr-2" style={{ color: C.accent }}>{String.fromCharCode(65 + i)}.</span>{opt}</button>); })}
        </div>
        {show && (<div className="mt-4 p-4 rounded-lg animate-fadeIn" style={{ background: `${sel === q.a ? C.green : C.danger}15`, border: `1px solid ${sel === q.a ? C.green : C.danger}40` }}><div className="font-bold mb-1" style={{ color: sel === q.a ? C.green : C.danger }}>{sel === q.a ? "✅ 정답!" : "❌ 오답"}</div><p className="text-sm" style={{ color: C.text }}>{q.e}</p></div>)}
        <div className="flex gap-3 mt-4">
          {!show ? (<button onClick={() => sel !== null && setShow(true)} disabled={sel === null} className="px-5 py-2 rounded-lg font-bold text-sm" style={{ background: sel !== null ? C.accent : C.border, color: sel !== null ? C.bg : C.textDim }}>정답 확인</button>) : (<button onClick={() => { setCur((cur + 1) % qs.length); setSel(null); setShow(false); }} className="px-5 py-2 rounded-lg font-bold text-sm" style={{ background: C.accent, color: C.bg }}>다음 →</button>)}
          <button onClick={() => { setCur(0); setSel(null); setShow(false); }} className="px-4 py-2 rounded-lg text-sm" style={{ background: C.bg, color: C.textDim, border: `1px solid ${C.border}` }}>처음으로</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ INDUSTRY ═══════════════
function IndustryTab() {
  const [exp, setExp] = useState(null);
  const apps = [
    { icon: "🌊", title: "CFD — Navier-Stokes 방정식", f: "Computational Fluid Dynamics", c: "N-S 방정식: ρ(∂v/∂t + v·∇v) = −∇p + μ∇²v + ρg. ∇·v = 0 (비압축성). Gradient(압력), Divergence(연속), Curl(와도)이 모두 등장합니다.", r: "∇p, ∇·v, ∇²v, ∇×v" },
    { icon: "⚡", title: "반도체 — 전기장 & Poisson 방정식", f: "Semiconductor / TCAD", c: "∇²φ = −ρ/ε (Poisson). 전기장 E = −∇φ. MOSFET 채널 전위 분포를 구면/원통좌표계에서 풀어야 하는 경우가 많습니다.", r: "∇²φ = −ρ/ε, E = −∇φ" },
    { icon: "🔥", title: "열전달 — Fourier 법칙 & 확산방정식", f: "Heat Transfer / Reactor", c: "q = −k∇T (Fourier). ∂T/∂t = α∇²T. 원통형 반응기에서는 CCS Laplacian이 필수.", r: "∇²T (CCS/SCS)" },
    { icon: "🧪", title: "화학반응공학 — 물질전달", f: "Reaction Engineering", c: "J = −D∇C (Fick). ∂C/∂t = D∇²C + r. 촉매 입자 내부 확산은 SCS에서 ∇²C를 풀어야 합니다 (Thiele modulus).", r: "∇²C in SCS, Thiele" },
    { icon: "🌀", title: "기상학 — 와도 & 코리올리", f: "Meteorology / Climate", c: "기상 모델의 핵심: ω = ∇×v (와도 방정식). 태풍, 제트기류, 해류의 회전은 curl로 기술됩니다.", r: "∇×v = ω (vorticity)" },
    { icon: "🔬", title: "전자기학 — Maxwell 방정식", f: "Electromagnetics", c: "∇·E = ρ/ε₀, ∇×B = μ₀J + μ₀ε₀∂E/∂t. Gauss & Stokes 정리가 Maxwell 방정식의 적분형을 미분형으로 변환하는 핵심.", r: "Gauss, Stokes → Maxwell" },
  ];
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>벡터 미적분의 산업 응용</h2>
      </div>
      <div className="space-y-3">
        {apps.map((a, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${exp === i ? C.accent : C.border}` }}>
            <button onClick={() => setExp(exp === i ? null : i)} className="w-full text-left p-4 flex items-center gap-3">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1"><div className="font-bold text-sm" style={{ color: C.text }}>{a.title}</div><div className="text-xs" style={{ color: C.textDim }}>{a.f}</div></div>
              <span style={{ color: C.accent, transform: exp === i ? "rotate(180deg)" : "rotate(0)", transition: "transform .3s" }}>▼</span>
            </button>
            {exp === i && (<div className="px-4 pb-4 animate-fadeIn"><p className="text-sm mb-2" style={{ color: C.text, lineHeight: 1.7 }}>{a.c}</p><div className="p-2 rounded-lg" style={{ background: `${C.accent}10` }}><span className="text-xs font-bold" style={{ color: C.accent }}>핵심: </span><span className="text-xs font-mono" style={{ color: C.cyan }}>{a.r}</span></div></div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ MAIN ═══════════════
export default function Week6App() {
  const [tab, setTab] = useState("overview");
  const [lang, setLang] = useState("KR");
  const t = L[lang];
  const TABS = lang === "KR" ? TABS_KR : TABS_EN;
  const render = () => { switch (tab) { case "overview": return <OverviewTab />; case "vecops": return <VecOpsTab />; case "gradient": return <GradientTab />; case "divergence": return <DivergenceTab />; case "curl": return <CurlTab />; case "coords": return <CoordsTab />; case "practice": return <PracticeTab />; case "industry": return <IndustryTab />; default: return <OverviewTab />; } };
  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;800&display=swap');
        *{font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;}
        .font-mono{font-family:'JetBrains Mono',monospace;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .animate-fadeIn{animation:fadeIn .4s ease-out}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:white;cursor:pointer}
        input[type="number"]{-moz-appearance:textfield}input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
      `}</style>
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div><h1 className="text-lg font-bold" style={{ color: C.accent, fontFamily: "'Outfit',sans-serif" }}>{lang === "KR" ? "화공유체역학" : "Fluid Mechanics for ChemE"}</h1><p className="text-xs" style={{ color: C.textDim }}>{t.subtitle}</p></div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 rounded-lg p-0.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                {["KR", "EN"].map(k => (<button key={k} onClick={() => setLang(k)} className="px-2 py-1 rounded text-xs font-bold" style={{ background: lang === k ? C.accent : "transparent", color: lang === k ? C.bg : C.textDim }}>{k === "KR" ? "🇰🇷" : "🇺🇸"} {k}</button>))}
              </div>
              <div className="text-right text-xs" style={{ color: C.textDim }}><div>{t.prof}</div><div style={{ color: C.accent }}>{t.weekHelper}</div></div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {TABS.map(tb => (<button key={tb.id} onClick={() => setTab(tb.id)} className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0" style={{ background: tab === tb.id ? C.accent : "transparent", color: tab === tb.id ? C.bg : C.textDim, border: `1px solid ${tab === tb.id ? C.accent : "transparent"}` }}><span className="hidden md:inline">{tb.label}</span><span className="md:hidden">{tb.short}</span></button>))}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{render()}</main>
      <footer className="text-center py-6 text-xs" style={{ color: C.textDim, borderTop: `1px solid ${C.border}` }}>
        <p>{t.footer1}</p>
        <p className="mt-1" style={{ color: C.accentDim }}>{t.footer2}</p>
      </footer>
    </div>
  );
}
