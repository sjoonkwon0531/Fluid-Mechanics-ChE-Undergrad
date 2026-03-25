import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const Sub = ({ children }) => <sub className="text-xs">{children}</sub>;
const Sup = ({ children }) => <sup className="text-xs">{children}</sup>;

const C = {
  bg: "#060b18", card: "#0f1729", accent: "#f97316", accentDim: "#c2410c",
  cyan: "#06b6d4", cyanDim: "#0e7490", green: "#22c55e", danger: "#ef4444",
  purple: "#a78bfa", text: "#e2e8f0", textDim: "#94a3b8",
  border: "#1a2744", hi: "#1e1b4b",
};

const TABS = [
  { id: "overview",   label: "📋 개요",              short: "개요"  },
  { id: "shear",      label: "🔧 전단응력 모델",      short: "τ모델" },
  { id: "fanning",    label: "📊 Fanning f & Moody",  short: "Moody" },
  { id: "fittings",   label: "🔩 배관 부속",           short: "부속"  },
  { id: "branch",     label: "🔀 Q∝D⁴ 분기설계",      short: "D⁴분기"},
  { id: "turbulent",  label: "🌪️ 난류 프로파일",      short: "난류"  },
  { id: "compress",   label: "💨 압축성 기체",         short: "기체"  },
  { id: "dalembert",  label: "🎭 d'Alembert",         short: "역설"  },
  { id: "stokes",     label: "🔬 Stokes 법칙",        short: "Stokes"},
  { id: "practice",   label: "✏️ 연습문제",            short: "문제"  },
  { id: "industry",   label: "🏭 산업응용",            short: "응용"  },
];

// ═══════════════ OVERVIEW ═══════════════
function OverviewTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: C.accent }}>Week 4 — Friction Factor, Pipe Systems & Creeping Flow</h2>
        <p style={{ color: C.text, lineHeight: 1.8 }}>
          이번 주는 <strong style={{ color: C.accent }}>전단응력의 미시적 기원</strong>(층류 vs 난류)에서 출발하여,
          <strong style={{ color: C.cyan }}> Fanning friction factor</strong>와 <strong style={{ color: C.green }}>Moody chart</strong>를 통해
          실제 배관 설계에 활용합니다. 배관 부속품의 등가길이 개념, 난류 속도분포(1/n 법칙), 
          압축성 기체의 장거리 파이프라인 해석, 그리고 보충자료로
          <strong style={{ color: C.purple }}> d'Alembert 역설</strong>과 <strong style={{ color: C.danger }}>Stokes 법칙</strong>을 학습합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "🔧", title: "전단응력 모델", desc: "층류 τ∝u_m vs 난류 τ∝u_m²의 미시적 기원", color: C.accent },
          { icon: "📊", title: "Fanning f & Moody", desc: "f_F=16/Re(층류), Colebrook-White(난류), Moody chart", color: C.cyan },
          { icon: "🔩", title: "배관 부속", desc: "K_L, 등가길이 (L/D)_e, 밸브·엘보 손실계수", color: C.green },
          { icon: "💨", title: "압축성 기체", desc: "등온 이상기체 파이프라인, 최대 유속(choked flow)", color: C.purple },
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
            { eq: "f_F = τ_w / (½ρu_m²)", label: "Fanning friction factor 정의", c: C.accent },
            { eq: "f_F = 16/Re  (laminar)", label: "층류 마찰계수", c: C.cyan },
            { eq: "1/√f_F = -1.737 ln(0.269ε/D + 1.257/Re√f_F)", label: "Colebrook-White (난류)", c: C.green },
            { eq: "ℱ = 2f_F·u_m²·L/D", label: "마찰소산과 f_F 관계", c: C.danger },
            { eq: "Δp = K_L·ρu²/2,  K_L = f_F·L_eq/D", label: "배관 부속 압력손실", c: C.purple },
            { eq: "u/u_C = (y/a)^(1/n)", label: "난류 거듭제곱 법칙", c: C.cyan },
            { eq: "F_D = 6πμUR", label: "Stokes 법칙 (creeping flow)", c: C.accent },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-1.5 rounded" style={{ background: `${r.c}08` }}>
              <span className="w-72 flex-shrink-0" style={{ color: r.c }}>{r.eq}</span>
              <span style={{ color: C.textDim }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ SHEAR STRESS MODELS ═══════════════
function ShearTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>전단응력의 미시적 기원</h2>
        <p className="text-sm" style={{ color: C.textDim }}>차선 변경 비유: 인접 유체층 간 운동량 교환이 전단응력의 본질</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.cyan}33` }}>
          <h3 className="font-bold mb-3" style={{ color: C.cyan }}>층류: τ ∝ u<Sub>m</Sub></h3>
          <div className="space-y-2 text-sm" style={{ color: C.text }}>
            <p>인접 유체층 A(속도 u_A)와 B(속도 u_B) 사이의 분자 확산에 의한 운동량 전달:</p>
            <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>
              <div>τ = ṁ·δ·(du/dr) = η·(du/dr)</div>
              <div className="mt-1">≈ ν·ρ·(du/dr) ≈ ν·ρ·(u<Sub>m</Sub>/a)</div>
            </div>
            <p className="text-xs" style={{ color: C.textDim }}>
              → <strong style={{ color: C.cyan }}>τ ∝ u<Sub>m</Sub></strong> → ΔP ∝ Q (1차)
            </p>
            <p className="text-xs" style={{ color: C.textDim }}>
              η = 점도, ν = η/ρ = 동점도 [m²/s], δ = 분자 간 거리
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.danger}33` }}>
          <h3 className="font-bold mb-3" style={{ color: C.danger }}>난류: τ ∝ u<Sub>m</Sub>²</h3>
          <div className="space-y-2 text-sm" style={{ color: C.text }}>
            <p>Eddy(와류)에 의한 대규모 운동량 교환. 분자 점성 대신 eddy viscosity ν_T 지배:</p>
            <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>
              <div>τ = (ν+ν_T)·ρ·(du/dr) ≈ ν_T·ρ·(du/dr)</div>
              <div className="mt-1">ν_T ≈ c·u<Sub>m</Sub>·a → τ ≈ c·ρ·u<Sub>m</Sub>²</div>
            </div>
            <p className="text-xs" style={{ color: C.textDim }}>
              → <strong style={{ color: C.danger }}>τ ∝ u<Sub>m</Sub>²</strong> → ΔP ∝ Q² (2차)
            </p>
            <p className="text-xs" style={{ color: C.textDim }}>
              ν_T ≫ ν (eddy 운동량 전달이 분자 확산보다 압도적)
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>🚗 차선 변경 비유 (Lane-Change Analogy)</h3>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.7 }}>
          고속도로 차선별 속도가 다를 때, 운전자가 빠른 차선에서 느린 차선으로 이동하면 
          느린 차선의 평균 속도가 올라갑니다. 이것이 <strong style={{ color: C.cyan }}>운동량 전달</strong>의 본질입니다.
          차선 변경 확률 P<Sub>p,q</Sub> = P₀ + α(u<Sub>q</Sub>−u<Sub>p</Sub>)/u<Sub>p</Sub>에서, 
          α가 클수록(= 점도가 낮을수록) 평형 도달이 빠릅니다. 
          충분한 시간이 지나면 모든 차선의 차량 수와 속도가 균일해집니다 — 이것이 <strong style={{ color: C.accent }}>전단응력에 의한 운동량 평형</strong>입니다.
        </p>
      </div>
    </div>
  );
}

// ═══════════════ FANNING f & MOODY CHART ═══════════════
function FanningTab() {
  const [Re, setRe] = useState(10000);
  const [epsD, setEpsD] = useState(0.001);
  const canvasRef = useRef(null);

  // Colebrook-White solver (iterative)
  const calcFf = useCallback((re, ed) => {
    if (re < 2300) return 16 / re;
    let ff = 0.01;
    for (let i = 0; i < 50; i++) {
      const rhs = -1.737 * Math.log(0.269 * ed + 1.257 / (re * Math.sqrt(ff)));
      const ffNew = 1 / (rhs * rhs);
      if (Math.abs(ffNew - ff) < 1e-10) break;
      ff = ffNew;
    }
    return ff;
  }, []);

  const fF = calcFf(Re, epsD);

  // Draw Moody chart
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width = 560, H = cv.height = 320;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    const logReMin = 2.8, logReMax = 7.2;
    const logFMin = Math.log10(0.002), logFMax = Math.log10(0.04);
    const mL = 60, mR = 20, mT = 20, mB = 40;
    const pW = W - mL - mR, pH = H - mT - mB;

    const toX = lr => mL + (lr - logReMin) / (logReMax - logReMin) * pW;
    const toY = lf => mT + (logFMax - lf) / (logFMax - logFMin) * pH;

    // Grid
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 0.5;
    for (let lr = 3; lr <= 7; lr++) { ctx.beginPath(); ctx.moveTo(toX(lr), mT); ctx.lineTo(toX(lr), H - mB); ctx.stroke(); }
    for (let lf = -2.6; lf <= -1.4; lf += 0.2) { ctx.beginPath(); ctx.moveTo(mL, toY(lf)); ctx.lineTo(W - mR, toY(lf)); ctx.stroke(); }

    // Laminar line
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
    for (let lr = logReMin; lr <= Math.log10(2300); lr += 0.02) {
      const re = Math.pow(10, lr), ff = 16 / re;
      const x = toX(lr), y = toY(Math.log10(ff));
      lr === logReMin ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Turbulent lines for various ε/D
    const roughnesses = [0, 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.02, 0.04];
    roughnesses.forEach((ed, idx) => {
      ctx.strokeStyle = ed === 0 ? C.green : `rgba(249,115,22,${0.3 + 0.7 * idx / roughnesses.length})`;
      ctx.lineWidth = ed === epsD ? 2.5 : 1;
      ctx.beginPath();
      let started = false;
      for (let lr = Math.log10(4000); lr <= logReMax; lr += 0.03) {
        const re = Math.pow(10, lr), ff = calcFf(re, ed);
        const lf = Math.log10(ff);
        if (lf < logFMin || lf > logFMax) continue;
        const x = toX(lr), y = toY(lf);
        !started ? (ctx.moveTo(x, y), started = true) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Current point
    const logReCur = Math.log10(Re), logFCur = Math.log10(fF);
    if (logReCur >= logReMin && logReCur <= logReMax && logFCur >= logFMin && logFCur <= logFMax) {
      const cx = toX(logReCur), cy = toY(logFCur);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Labels
    ctx.fillStyle = C.textDim; ctx.font = "10px monospace";
    ctx.fillText("Re", W / 2, H - 5);
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("f_F", 0, 0); ctx.restore();
    for (let lr = 3; lr <= 7; lr++) ctx.fillText(`10^${lr}`, toX(lr) - 12, H - mB + 15);
    ctx.fillStyle = C.cyan; ctx.fillText("Laminar f=16/Re", toX(3.2), toY(Math.log10(16 / 2000)) - 8);
    ctx.fillStyle = C.green; ctx.fillText("Smooth", toX(6.5), toY(Math.log10(calcFf(3e6, 0))) - 6);
  }, [Re, epsD, fF, calcFf]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.cyan }}>Fanning Friction Factor & Interactive Moody Chart</h2>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-2" style={{ color: C.accent }}>f<Sub>F</Sub> 정의</h3>
        <div className="p-3 rounded-lg text-center font-mono" style={{ background: C.bg, color: C.cyan }}>
          f<Sub>F</Sub> = τ<Sub>w</Sub> / (½ρu<Sub>m</Sub>²) — 벽면 전단응력 대 관성력의 비
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
          <div className="p-2 rounded" style={{ background: `${C.cyan}15` }}>
            <span style={{ color: C.cyan }}>층류:</span> <span style={{ color: C.text }}>f<Sub>F</Sub> = 16/Re (원형관), 14.227/Re (정방관)</span>
          </div>
          <div className="p-2 rounded" style={{ background: `${C.accent}15` }}>
            <span style={{ color: C.accent }}>난류:</span> <span style={{ color: C.text }}>Colebrook-White 암시적 방정식 (수치해)</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.green }}>📊 Interactive Moody Chart</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textDim }}>Re (10²~10⁷)</label>
            <input type="range" min={2.5} max={7} step={0.01} value={Math.log10(Re)} onChange={e => setRe(Math.pow(10, +e.target.value))}
              className="w-full" style={{ accentColor: C.accent }} />
            <div className="text-xs font-mono mt-1" style={{ color: C.accent }}>Re = {Re < 1e5 ? Re.toFixed(0) : Re.toExponential(2)}</div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textDim }}>ε/D (상대조도)</label>
            <input type="range" min={0} max={0.05} step={0.0001} value={epsD} onChange={e => setEpsD(+e.target.value)}
              className="w-full" style={{ accentColor: C.green }} />
            <div className="text-xs font-mono mt-1" style={{ color: C.green }}>ε/D = {epsD.toFixed(4)}</div>
          </div>
        </div>

        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ maxWidth: 560 }} />

        <div className="flex gap-4 mt-3 p-3 rounded-lg" style={{ background: C.bg }}>
          <div className="text-center flex-1">
            <div className="text-xs" style={{ color: C.textDim }}>f<Sub>F</Sub></div>
            <div className="text-xl font-bold" style={{ color: C.accent }}>{fF.toFixed(5)}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs" style={{ color: C.textDim }}>유동 체계</div>
            <div className="text-sm font-bold" style={{ color: Re < 2300 ? C.cyan : Re > 4000 ? C.danger : C.accent }}>
              {Re < 2300 ? "Laminar" : Re > 4000 ? "Turbulent" : "Transition"}
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs" style={{ color: C.textDim }}>Δh/L (head loss/m)</div>
            <div className="text-sm font-bold" style={{ color: C.green }}>2f<Sub>F</Sub>u²/(gD)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ PIPE FITTINGS ═══════════════
function FittingsTab() {
  const [velocity, setVelocity] = useState(2.0);
  const [rho, setRho] = useState(1000);
  const [fitting, setFitting] = useState("std_elbow_90");

  const fittings = {
    std_elbow_90: { name: "Standard 90° Elbow", LDe: 30 },
    square_elbow_90: { name: "Square 90° Elbow", LDe: 70 },
    elbow_45: { name: "45° Elbow", LDe: 15 },
    close_return: { name: "Close Return Bend", LDe: 75 },
    gate_valve: { name: "Gate Valve (open)", LDe: 6.5 },
    globe_valve: { name: "Globe Valve (open)", LDe: 330 },
    angle_valve: { name: "Angle Valve (open)", LDe: 160 },
    std_tee: { name: "Standard T (side outlet)", LDe: 70 },
    sudden_exp_1_4: { name: "Sudden Expansion 1:4", LDe: 30 },
    sudden_exp_1_2: { name: "Sudden Expansion 1:2", LDe: 20 },
    sudden_con_2_1: { name: "Sudden Contraction 2:1", LDe: 11 },
    sudden_con_4_1: { name: "Sudden Contraction 4:1", LDe: 15 },
  };

  const sel = fittings[fitting];
  const fF = 0.005; // typical turbulent fF
  const KL = fF * sel.LDe;
  const dp = KL * rho * velocity * velocity / 2;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.green }}>배관 부속 압력손실 계산기</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Δp = K<Sub>L</Sub>·ρu²/2, K<Sub>L</Sub> = f<Sub>F</Sub>·(L/D)<Sub>e</Sub></p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textDim }}>부속품 종류</label>
            <select value={fitting} onChange={e => setFitting(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg text-xs"
              style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }}>
              {Object.entries(fittings).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textDim }}>유속 u (m/s)</label>
            <input type="number" value={velocity} step={0.1} onChange={e => setVelocity(+e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg text-xs"
              style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textDim }}>밀도 ρ (kg/m³)</label>
            <input type="number" value={rho} step={10} onChange={e => setRho(+e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg text-xs"
              style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: C.textDim }}>f<Sub>F</Sub> (마찰계수)</label>
            <div className="px-2 py-1.5 rounded-lg text-xs" style={{ background: C.bg, color: C.accent, border: `1px solid ${C.border}` }}>
              ≈ 0.005 (typical turb.)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "(L/D)_e", v: sel.LDe, c: C.cyan },
            { l: "K_L = f_F·(L/D)_e", v: KL.toFixed(4), c: C.green },
            { l: "Δp (Pa)", v: dp.toFixed(1), c: C.accent },
          ].map((m, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
              <div className="text-xs" style={{ color: C.textDim }}>{m.l}</div>
              <div className="text-lg font-bold" style={{ color: m.c }}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-2" style={{ color: C.accent }}>📌 Inlet/Outlet 손실계수 K<Sub>L</Sub></h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-bold text-xs mb-2" style={{ color: C.cyan }}>Inlet (입구)</h4>
            {[["Reentrant", 0.8], ["Sharp-edged", 0.5], ["Slightly rounded", 0.2], ["Well-rounded", 0.04]].map(([n, v], i) => (
              <div key={i} className="flex justify-between py-0.5" style={{ color: C.text }}>
                <span className="text-xs">{n}</span><span className="text-xs font-mono" style={{ color: C.accent }}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-xs mb-2" style={{ color: C.danger }}>Outlet (출구)</h4>
            <p className="text-xs" style={{ color: C.text }}>모든 형태: K<Sub>L</Sub> = 1.0</p>
            <p className="text-xs mt-1" style={{ color: C.textDim }}>출구에서는 유체의 운동에너지가 모두 소산됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ Q ∝ D⁴ BRANCHING DESIGN ═══════════════
function BranchTab() {
  const [r, setR] = useState(0.50);
  const [P0, setP0] = useState(120);
  const [Navail, setNavail] = useState(16);
  const packRef = useRef(null);
  const bloodRef = useRef(null);
  const backRef = useRef(null);
  const stageRef = useRef(null);

  function hexPack(R, rr) { const pts=[]; for(let y=-R;y<=R;y+=rr*2*0.866){const row=Math.round((y+R)/(rr*2*0.866));const xO=(row%2)*rr;for(let x=-R+xO;x<=R;x+=rr*2){if(Math.sqrt(x*x+y*y)+rr<=R*.98)pts.push([x,y]);}}return pts; }
  function hexN(R,rr){return hexPack(R,rr).length||1;}

  const Nreq = useMemo(() => Math.round(1/Math.pow(r,4)), [r]);
  const nFit = useMemo(() => hexN(100, 100*r), [r]);

  // Optimal staging
  const staging = useMemo(() => {
    if(Nreq<=nFit) return [{ri:r,ni:Nreq}];
    let best=null;
    for(let k=2;k<=8;k++){
      const ri=Math.pow(r,1/k);
      const niMax=hexN(100,100*ri);
      const niNeed=Math.ceil(Math.pow(Nreq,1/k));
      if(niNeed>niMax*1.05)continue;
      const ni=Math.min(niMax,niNeed);
      const stages=[];for(let s=0;s<k;s++)stages.push({ri,ni});
      if(!best||k<best.length){best=stages;}
      break;
    }
    if(!best){const k=Math.ceil(Math.log(Nreq)/Math.log(3));const ri=Math.pow(r,1/k);const ni=Math.ceil(Math.pow(Nreq,1/k));const stages=[];for(let s=0;s<k;s++)stages.push({ri,ni});best=stages;}
    return best;
  }, [r, Nreq, nFit]);

  // Case 1: Pipe packing
  useEffect(() => {
    const cv=packRef.current;if(!cv)return;const ctx=cv.getContext("2d");const W=cv.width=540,H=cv.height=160;
    ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    const bigR=55,smallR=Math.max(2,bigR*r);
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(55,H/2,bigR,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=`${C.cyan}15`;ctx.fill();
    ctx.fillStyle=C.textDim;ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText("D₀",55,H/2+bigR+14);
    ctx.strokeStyle=C.textDim+"55";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(115,H/2);ctx.lineTo(155,H/2);ctx.stroke();
    ctx.fillStyle=C.text;ctx.font="14px sans-serif";ctx.fillText("=",135,H/2+5);
    const pts=hexPack(bigR,smallR);const maxShow=Math.min(pts.length,Nreq,80);
    const cols=Math.min(maxShow,10);const rows=Math.ceil(maxShow/cols);
    const gap=Math.min(smallR*2.8,48);const sx=185,sy=H/2-(rows-1)*gap/2;
    ctx.strokeStyle=C.accent;ctx.lineWidth=0.8;
    let cnt=0;for(let row=0;row<rows&&cnt<maxShow;row++){for(let col=0;col<cols&&cnt<maxShow;col++){
      ctx.fillStyle=`${C.accent}25`;ctx.beginPath();ctx.arc(sx+col*gap,sy+row*gap,smallR,0,Math.PI*2);ctx.fill();ctx.stroke();cnt++;}}
    ctx.fillStyle=C.text;ctx.font="12px sans-serif";ctx.textAlign="left";
    const lx=sx+cols*gap+10;
    ctx.fillText(`Need: ${Nreq.toLocaleString()} pipes`,lx,H/2-10);
    ctx.fillStyle=C.textDim;ctx.font="11px sans-serif";
    ctx.fillText(`Fit on cross-section: ${nFit}`,lx,H/2+8);
    ctx.fillStyle=Nreq>nFit?C.danger:C.green;
    ctx.fillText(Nreq>nFit?`Gap: ${(Nreq-nFit).toLocaleString()} — staging needed!`:"✓ Direct connection OK",lx,H/2+26);
  }, [r, Nreq, nFit]);

  // Case 2: Blood pressure
  useEffect(() => {
    const cv=bloodRef.current;if(!cv)return;const ctx=cv.getContext("2d");const W=cv.width=540,H=cv.height=170;
    ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    const stages=[{n:"Aorta",P:P0,d:25},{n:"Lg artery",P:P0*.85,d:8},{n:"Sm artery",P:P0*.70,d:2},{n:"Arteriole",P:P0*.55,d:.5},{n:"Capillary",P:P0*.25,d:.15},{n:"Venule",P:P0*.12,d:.3},{n:"Vein",P:P0*.05,d:6}];
    const barH=90,maxD=25;
    stages.forEach((s,i)=>{
      const x=30+i*74;const pH=(s.P/P0)*barH;
      ctx.fillStyle=i<=3?`${C.accent}30`:i===4?`${C.purple}30`:`${C.cyan}30`;
      ctx.fillRect(x-18,25+barH-pH,36,pH);
      ctx.strokeStyle=i<=3?C.accent:i===4?C.purple:C.cyan;ctx.lineWidth=0.8;ctx.strokeRect(x-18,25+barH-pH,36,pH);
      ctx.fillStyle=C.text;ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(Math.round(s.P)+"",x,25+barH-pH-5);
      ctx.fillStyle=C.textDim;ctx.font="8px sans-serif";ctx.fillText("mmHg",x,25+barH-pH+7);
      ctx.fillStyle=C.textDim;ctx.font="9px sans-serif";ctx.fillText(s.n,x,25+barH+16);
      const bH=Math.max(2,(s.d/maxD)*30);
      ctx.fillStyle=`${C.danger}20`;ctx.fillRect(x-18,H-bH-12,36,bH);
      ctx.strokeStyle=`${C.danger}50`;ctx.lineWidth=.5;ctx.strokeRect(x-18,H-bH-12,36,bH);
    });
    ctx.fillStyle=C.textDim;ctx.font="9px sans-serif";ctx.textAlign="left";ctx.fillText("Pressure",5,18);ctx.fillText("Vessel size",5,H-4);
  },[P0]);

  // Case 3: Backflow
  useEffect(() => {
    const cv=backRef.current;if(!cv)return;const ctx=cv.getContext("2d");const W=cv.width=540,H=cv.height=130;
    ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    const Nreq16=16,ratio=Navail/Nreq16;
    const Pj=1/(1+ratio);const backPct=ratio<1?(1-ratio)/(1+ratio)*100:0;const fwdPct=100-backPct;
    const midY=H/2,jX=220;
    ctx.fillStyle=`${C.cyan}15`;ctx.fillRect(30,midY-20,jX-50,40);ctx.strokeStyle=`${C.cyan}40`;ctx.lineWidth=1;ctx.strokeRect(30,midY-20,jX-50,40);
    const fH=Math.max(2,32*(fwdPct/100));
    ctx.fillStyle=`${C.green}50`;ctx.fillRect(30,midY-fH/2,jX-50,fH);
    if(backPct>0){const bH=Math.max(1,24*(backPct/100));ctx.fillStyle=`${C.danger}40`;ctx.fillRect(30,midY+fH/2+2,jX-50,bH);
      ctx.fillStyle=C.danger;ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText(`← backflow ${backPct.toFixed(1)}%`,(30+jX-20)/2,midY+fH/2+bH+12);}
    ctx.fillStyle=`${C.purple}30`;ctx.beginPath();ctx.arc(jX,midY,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=C.purple;ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=C.text;ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText("Pj",jX,midY+3);
    const nShow=Math.min(Navail,10),smGap=Math.min(16,100/nShow);
    ctx.strokeStyle=`${C.accent}55`;ctx.lineWidth=.5;
    for(let i=0;i<nShow;i++){const y=midY-(nShow-1)*smGap/2+i*smGap;ctx.fillStyle=`${C.accent}15`;ctx.fillRect(jX+18,y-2,250,4);ctx.strokeRect(jX+18,y-2,250,4);}
    ctx.fillStyle=C.textDim;ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(`${Navail}/${Nreq16} pipes (r=0.5)`,jX+140,midY-nShow*smGap/2-8);
    // Pressure bar
    const bX=jX+290,bW=50,bY=10,bHt=H-25;const pjY=bY+(1-Pj)*bHt;
    ctx.strokeStyle=C.textDim+"33";ctx.lineWidth=.5;ctx.strokeRect(bX,bY,bW,bHt);
    ctx.fillStyle=`${C.cyan}20`;ctx.fillRect(bX,bY,bW,pjY-bY);ctx.fillStyle=`${C.accent}20`;ctx.fillRect(bX,pjY,bW,bY+bHt-pjY);
    ctx.setLineDash([3,3]);ctx.strokeStyle=C.purple;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bX,pjY);ctx.lineTo(bX+bW,pjY);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=C.text;ctx.font="9px sans-serif";ctx.textAlign="right";ctx.fillText("P₀",bX-4,bY+10);ctx.fillStyle=C.purple;ctx.fillText(`Pj=${(Pj*100).toFixed(0)}%`,bX-4,pjY+4);
  },[Navail]);

  // Staged branching viz
  useEffect(() => {
    const cv=stageRef.current;if(!cv)return;const ctx=cv.getContext("2d");const W=cv.width=540,H=cv.height=200;
    ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    const k=staging.length;if(k<=1){ctx.fillStyle=C.green;ctx.font="13px sans-serif";ctx.textAlign="center";ctx.fillText("Direct connection — no staging needed",W/2,H/2);return;}
    const segW=(W-50)/(k+1);const colors=[C.cyan,C.purple,C.accent,C.green,"#BA7517",C.danger];
    function drawLev(x,y,h,lev){
      if(lev>=k)return;const s=staging[lev];const nShow=Math.min(s.ni,5);const gap=h/(nShow+1);
      const pR=Math.max(3,18*Math.pow(r,(lev)/(k)));const cR=Math.max(2,pR*s.ri);const col=colors[lev%colors.length];
      for(let i=0;i<nShow;i++){const ny=y-h/2+gap*(i+1);
        ctx.strokeStyle=col+"44";ctx.lineWidth=Math.max(.5,cR*.4);ctx.beginPath();ctx.moveTo(x+pR,y);ctx.quadraticCurveTo(x+segW*.4,(y+ny)/2,x+segW-cR,ny);ctx.stroke();
        ctx.fillStyle=col+"35";ctx.strokeStyle=col+"99";ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x+segW,ny,cR,0,Math.PI*2);ctx.fill();ctx.stroke();
        if(lev<k-1&&nShow<=4)drawLev(x+segW,ny,h/nShow,lev+1);}
      if(s.ni>nShow){ctx.fillStyle=C.textDim;ctx.font="8px sans-serif";ctx.textAlign="left";ctx.fillText(`+${s.ni-nShow}`,x+segW+cR+2,y);}
    }
    const sx=25,sy=H/2;
    ctx.fillStyle=`${C.cyan}30`;ctx.strokeStyle=C.cyan;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(sx,sy,16,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=C.text;ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText("D₀",sx,sy+3);
    drawLev(sx,sy,H-30,0);
    const Nact=staging.reduce((p,s)=>p*s.ni,1);
    ctx.fillStyle=C.text;ctx.font="11px sans-serif";ctx.textAlign="right";ctx.fillText(`${k} stages → ${Nact.toLocaleString()} pipes`,W-10,16);
    ctx.fillStyle=C.textDim;ctx.font="10px sans-serif";
    for(let s=0;s<=k;s++){const x=sx+s*segW;const Dc=s===0?1:staging.slice(0,s).reduce((p,st)=>p*st.ri,1);
      ctx.textAlign="center";ctx.fillText(s===0?"D₀":`${Dc.toFixed(3)}D₀`,x+(s===0?0:segW),H-4);}
  },[staging,r]);

  const gap = Nreq - nFit;
  const Nact = staging.reduce((p,s)=>p*s.ni,1);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
        <h2 className="text-2xl font-bold mb-2" style={{color:C.accent}}>Q ∝ D⁴ — 배관 분기 설계의 엔지니어링</h2>
        <p className="text-sm" style={{color:C.textDim}}>Hagen-Poiseuille의 4제곱 법칙이 배관 네트워크 설계에 미치는 영향</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg font-mono text-xs text-center" style={{background:C.bg}}>
          <div className="text-xs mb-1" style={{color:C.textDim}}>Hagen-Poiseuille (층류)</div>
          <div style={{color:C.cyan}}>Q = πD⁴ΔP / (128μL)</div>
        </div>
        <div className="p-3 rounded-lg font-mono text-xs text-center" style={{background:C.bg}}>
          <div className="text-xs mb-1" style={{color:C.textDim}}>관 분기 조건</div>
          <div style={{color:C.accent}}>N = 1/r⁴ (유량 보존), N<Sub>fit</Sub> ~ 0.9/r² (패킹 한계)</div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
        <h3 className="font-bold mb-3" style={{color:C.accent}}>Case 1: 큰 관 → 작은 관 분기</h3>
        <div className="mb-3">
          <label className="text-xs block mb-1" style={{color:C.textDim}}>r = D<Sub>small</Sub>/D<Sub>large</Sub></label>
          <input type="range" min={0.08} max={0.70} step={0.01} value={r} onChange={e=>setR(+e.target.value)} className="w-full" style={{accentColor:C.accent}} />
          <div className="text-xs font-mono" style={{color:C.accent}}>r = {r.toFixed(2)}</div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-3">
          {[{l:"N (1/r⁴)",v:Nreq.toLocaleString(),c:C.accent},{l:"Fit (packing)",v:nFit,c:C.cyan},{l:"Gap",v:gap>0?gap.toLocaleString():"0",c:gap>0?C.danger:C.green},{l:"Stages",v:staging.length,c:C.green}].map((m,i)=>(
            <div key={i} className="p-3 rounded-lg text-center" style={{background:C.bg}}><div className="text-xs" style={{color:C.textDim}}>{m.l}</div><div className="text-lg font-bold" style={{color:m.c}}>{m.v}</div></div>))}
        </div>
        <canvas ref={packRef} className="w-full rounded-lg" style={{maxWidth:540}} />
      </div>

      {/* Case 2: Blood */}
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
        <h3 className="font-bold mb-3" style={{color:C.danger}}>Case 2: 인체 혈관계 — 왜 피는 돌아올 수 있는가?</h3>
        <div className="mb-3">
          <label className="text-xs block mb-1" style={{color:C.textDim}}>수축기 혈압 P₀ (mmHg)</label>
          <input type="range" min={80} max={180} step={1} value={P0} onChange={e=>setP0(+e.target.value)} className="w-full" style={{accentColor:C.danger}} />
          <div className="text-xs font-mono" style={{color:C.danger}}>P₀ = {P0} mmHg</div>
        </div>
        <canvas ref={bloodRef} className="w-full rounded-lg" style={{maxWidth:540}} />
        <div className="mt-3 p-3 rounded-lg text-xs" style={{background:C.bg,color:C.text,lineHeight:1.7}}>
          <p>대동맥(D=20mm) → 모세혈관(D~8μm): r ≈ 1/2500, <strong style={{color:C.accent}}>N = 2500⁴ ≈ 4×10¹³</strong>. 실제 모세혈관 ~10¹⁰개.</p>
          <p className="mt-1">모세혈관 압력: ~{Math.round(P0*.25)} mmHg ({Math.round(25)}% of P₀). 정맥: ~{Math.round(P0*.05)} mmHg.</p>
          <p className="mt-1"><strong style={{color:C.cyan}}>혈액 귀환 메커니즘:</strong> (1) 정맥 판막 역류 방지, (2) 골격근 펌프, (3) 흉강 음압(호흡), (4) 심장 이완기 흡인. 에너지원: 동맥벽 탄성 반동(Windkessel) + 근육 수축.</p>
        </div>
      </div>

      {/* Case 3: Backflow */}
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
        <h3 className="font-bold mb-3" style={{color:C.purple}}>Case 3: 관 부족 시 역류</h3>
        <div className="mb-3">
          <label className="text-xs block mb-1" style={{color:C.textDim}}>사용 가능한 소관 N<Sub>avail</Sub> (r=0.5, 필요 16개)</label>
          <input type="range" min={1} max={30} step={1} value={Navail} onChange={e=>setNavail(+e.target.value)} className="w-full" style={{accentColor:C.purple}} />
          <div className="text-xs font-mono" style={{color:C.purple}}>N<Sub>avail</Sub> = {Navail} / 16</div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[{l:"Forward flow",v:(Navail>=16?100:Navail/(1+Navail/16)*100/1).toFixed(1)+"%",c:Navail>=16?C.green:C.accent},{l:"Backflow",v:(Navail>=16?0:(1-Navail/16)/(1+Navail/16)*100).toFixed(1)+"%",c:Navail<16?C.danger:C.green},{l:"P_j / P₀",v:(1/(1+Navail/16)*100).toFixed(0)+"%",c:C.purple}].map((m,i)=>(
            <div key={i} className="p-3 rounded-lg text-center" style={{background:C.bg}}><div className="text-xs" style={{color:C.textDim}}>{m.l}</div><div className="text-lg font-bold" style={{color:m.c}}>{m.v}</div></div>))}
        </div>
        <canvas ref={backRef} className="w-full rounded-lg" style={{maxWidth:540}} />
      </div>

      {/* Optimal Staging */}
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.accent}33`}}>
        <h3 className="font-bold mb-3" style={{color:C.green}}>최적 Staged Branching 설계</h3>
        <p className="text-xs mb-3" style={{color:C.textDim}}>각 단계에서 패킹 한계를 만족하면서 총 N = 1/r⁴을 달성하는 최소 단계 설계</p>
        <canvas ref={stageRef} className="w-full rounded-lg" style={{maxWidth:540}} />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs" style={{borderCollapse:"collapse"}}>
            <thead><tr>{["Stage","r_i","n_i (branches)","Pack limit","D_cumul","N_cumul"].map((h,i)=>(<th key={i} className="p-2 text-center" style={{background:C.bg,color:C.textDim,border:`1px solid ${C.border}`}}>{h}</th>))}</tr></thead>
            <tbody>{staging.map((s,i)=>{
              const Nc=staging.slice(0,i+1).reduce((p,st)=>p*st.ni,1);
              const Dc=staging.slice(0,i+1).reduce((p,st)=>p*st.ri,1);
              const pl=hexN(100,100*s.ri);const ok=s.ni<=pl;
              return(<tr key={i}>{[
                {v:i+1,c:C.text},{v:s.ri.toFixed(4),c:C.purple},{v:s.ni,c:C.accent},{v:pl+(ok?" ✓":" ✗"),c:ok?C.green:C.danger},{v:Dc.toFixed(4)+" D₀",c:C.cyan},{v:Nc.toLocaleString(),c:C.text}
              ].map((cell,j)=>(<td key={j} className="p-2 text-center font-mono" style={{color:cell.c,border:`1px solid ${C.border}`}}>{cell.v}</td>))}</tr>);
            })}</tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-lg text-xs" style={{background:C.bg,color:C.text,lineHeight:1.7}}>
          {staging.length<=1 ? <p style={{color:C.green}}>r = {r.toFixed(2)}: 직접 연결 가능. {nFit}개 패킹 한계 내.</p> :
          <p><strong style={{color:C.green}}>{staging.length}단계 분기 설계:</strong> r = {r.toFixed(2)}에서 1/r⁴ = {Nreq.toLocaleString()}개 필요하지만 패킹 한계 {nFit}개. 각 단계 r<Sub>i</Sub> ≈ {staging[0].ri.toFixed(3)} (= r<Sup>1/{staging.length}</Sup>), n<Sub>i</Sub> ≈ {staging[0].ni}. 이것이 <strong style={{color:C.cyan}}>혈관 fractal branching</strong>, <strong style={{color:C.accent}}>열교환기 manifold header</strong>, <strong style={{color:C.purple}}>나무 가지 구조</strong>의 설계 원리입니다.</p>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ TURBULENT PROFILE ═══════════════
function TurbulentTab() {
  const [nExp, setNExp] = useState(7);
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width = 400, H = cv.height = 300;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    const mL = 50, mR = 20, mT = 20, mB = 40;
    const pW = W - mL - mR, pH = H - mT - mB;

    // Axes
    ctx.strokeStyle = C.textDim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mL, mT); ctx.lineTo(mL, H - mB); ctx.lineTo(W - mR, H - mB); ctx.stroke();
    ctx.font = "10px monospace"; ctx.fillStyle = C.textDim;
    ctx.fillText("u/u_C", W / 2, H - 5); ctx.fillText("0", mL - 12, H - mB + 4);
    ctx.fillText("1.0", W - mR - 12, H - mB + 14); ctx.fillText("y/a", mL - 15, mT + 10);
    ctx.fillText("1", mL - 12, mT + 4);

    // Laminar (parabolic)
    ctx.strokeStyle = `${C.cyan}80`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const ya = i / 100;
      const uRatio = 2 * ya * (1 - ya) * 2; // parabolic, normalized to u_C
      const x = mL + Math.min(uRatio, 1) * pW;
      const y = H - mB - ya * pH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // Turbulent (1/n power law)
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const ya = i / 100;
      const uRatio = Math.pow(ya, 1 / nExp);
      const x = mL + uRatio * pW;
      const y = H - mB - ya * pH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = `${C.cyan}aa`; ctx.fillText("Laminar (parabolic)", mL + 10, H - mB - pH * 0.5);
    ctx.fillStyle = C.accent; ctx.fillText(`Turbulent n=${nExp}`, mL + pW * 0.55, mT + 30);
  }, [nExp]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>난류 속도 프로파일 — 1/n 거듭제곱 법칙</h2>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="mb-3">
          <label className="text-xs mb-1 block" style={{ color: C.textDim }}>지수 n (Re ↑ → n ↑): 층류쪽 ← n → 난류쪽</label>
          <input type="range" min={4} max={12} step={0.1} value={nExp} onChange={e => setNExp(+e.target.value)}
            className="w-full" style={{ accentColor: C.accent }} />
          <div className="text-xs font-mono" style={{ color: C.accent }}>n = {nExp} → u/u<Sub>C</Sub> = (y/a)<Sup>1/{nExp}</Sup></div>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ maxWidth: 400 }} />

        <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: C.bg, color: C.text }}>
          <p><strong style={{ color: C.accent }}>핵심:</strong> n이 클수록 프로파일이 평탄해짐(= 중심부 평평, 벽면 근처 급변). Re = 1.1×10⁵일 때 n=7이 대표적.</p>
          <p className="mt-1"><strong style={{ color: C.cyan }}>Laminar sublayer:</strong> δ/D ≈ 62·Re<Sup>−7/8</Sup>. 벽면 가까이에만 존재하는 매우 얇은 층류 영역.</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ COMPRESSIBLE GAS ═══════════════
function CompressTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.purple }}>압축성 기체의 파이프라인 유동</h2>
        <p className="text-sm" style={{ color: C.textDim }}>등온, 정상상태, 이상기체 — 장거리 수평 파이프라인</p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.cyan }}>핵심 유도</h3>
        <div className="space-y-3 text-sm" style={{ color: C.text }}>
          <div className="p-3 rounded" style={{ background: C.bg }}>
            <p className="font-bold text-xs" style={{ color: C.accent }}>출발점 (에너지+운동량 수지):</p>
            <p className="font-mono text-xs mt-1">du/u + dp/(ρu²) + 2f<Sub>F</Sub>·dx/D = 0</p>
          </div>
          <div className="p-3 rounded" style={{ background: C.bg }}>
            <p className="font-bold text-xs" style={{ color: C.accent }}>이상기체 + 등온 + 일정 질량유속 G=ρu=const:</p>
            <p className="font-mono text-xs mt-1">du/u = −dρ/ρ = −dp/p</p>
          </div>
          <div className="p-3 rounded" style={{ background: `${C.purple}15` }}>
            <p className="font-bold text-xs" style={{ color: C.purple }}>최종 관계식:</p>
            <p className="font-mono text-xs mt-1">4f<Sub>F</Sub>L/D = ρ₁(p₁²−p₂²)/(G²p₁) + log(p₂/p₁)²</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.danger }}>⚡ Choked Flow (최대 유량)</h3>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.7 }}>
          출구 압력 p₂를 계속 낮추면, G<Sub>max</Sub>에서 더 이상 유량이 증가하지 않습니다.
          이때 출구 유속 u₂* = √(RT/M<Sub>W</Sub>) — <strong style={{ color: C.danger }}>등온 음속</strong>에 도달합니다.
          p₂ &lt; p₂*로 더 낮춰도 유량은 일정하고, 출구에서 <strong style={{ color: C.accent }}>충격파(shock wave)</strong>가 발생합니다.
        </p>
        <div className="mt-2 p-3 rounded font-mono text-xs text-center" style={{ background: C.bg, color: C.purple }}>
          4f<Sub>F</Sub>L/D + 1 = −logX + X,  X ≡ (p₁/p₂*)² — 비선형 방정식
        </div>
      </div>
    </div>
  );
}

// ═══════════════ D'ALEMBERT PARADOX ═══════════════
function DAlembertTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.purple }}>d'Alembert의 역설 — 왜 Bernoulli만으로는 부족한가</h2>
        <p className="text-sm" style={{ color: C.textDim }}>비점성(inviscid) 가정의 한계: 이론적으로 항력이 0?!</p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.cyan }}>유도 과정</h3>
        <div className="space-y-3 text-sm" style={{ color: C.text, lineHeight: 1.7 }}>
          <p><strong style={{ color: C.accent }}>설정:</strong> 반지름 R인 긴 원기둥 주위 유동. 비압축성 + 비회전(irrotational) 가정.</p>
          <p><strong style={{ color: C.cyan }}>핵심 가정:</strong> ∇×v = 0 → v = −∇φ (속도 포텐셜 존재) + ∇·v = 0 → ∇²φ = 0 (Laplace 방정식)</p>
          <p><strong style={{ color: C.green }}>해:</strong> φ(r,θ) = U(r + R²/r)cosθ에서</p>
          <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>
            v<Sub>r</Sub> = U(1 − R²/r²)cosθ,  v<Sub>θ</Sub> = −U(1 + R²/r²)sinθ
          </div>
          <p><strong style={{ color: C.accent }}>Bernoulli로 압력:</strong> p(R,θ) = (ρU²/2)(1 − 4sin²θ)</p>
          <p><strong style={{ color: C.danger }}>결과:</strong> F<Sub>x</Sub> = ∮p·cosθ·dA = 0, F<Sub>y</Sub> = ∮p·sinθ·dA = 0</p>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.danger }}>⚡ 역설의 의미</h3>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.7 }}>
          이론적으로 원기둥에 작용하는 힘이 0 — 하지만 실험에서는 명백히 항력이 존재합니다.
          이는 <strong style={{ color: C.accent }}>Bernoulli 방정식이 점성 효과를 무시</strong>했기 때문입니다.
          실제 유동에서는 벽면 근처에서 경계층(boundary layer)이 형성되고, 유동 분리(separation)와 
          후류(wake)가 발생하여 압력 항력과 마찰 항력이 생깁니다.
        </p>
        <p className="text-sm mt-2 font-bold" style={{ color: C.purple }}>
          결론: 점성과 전단응력을 고려한 Navier-Stokes 방정식이 필요합니다.
        </p>
      </div>
    </div>
  );
}

// ═══════════════ STOKES LAW ═══════════════
function StokesTab() {
  const [R, setR] = useState(0.001);
  const [mu, setMu] = useState(0.001);
  const [U, setU] = useState(0.01);
  const [drho, setDrho] = useState(1500);

  const FD = 6 * Math.PI * mu * U * R;
  const Re = (1000 * U * 2 * R) / mu;
  const UT = (2 * R * R * drho * 9.81) / (9 * mu);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Stokes 법칙 & Creeping Flow</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Re ≪ 1에서의 구 주위 유동: F<Sub>D</Sub> = 6πμUR</p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.cyan }}>Stokes 항력 계산기</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "반지름 R (m)", val: R, set: setR, step: 0.0001 },
            { label: "점도 μ (Pa·s)", val: mu, set: setMu, step: 0.0001 },
            { label: "속도 U (m/s)", val: U, set: setU, step: 0.001 },
            { label: "Δρ (kg/m³)", val: drho, set: setDrho, step: 10 },
          ].map((p, i) => (
            <div key={i}>
              <label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step} onChange={e => p.set(+e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-xs"
                style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
            <div className="text-xs" style={{ color: C.textDim }}>F<Sub>D</Sub> = 6πμUR</div>
            <div className="text-lg font-bold" style={{ color: C.accent }}>{FD.toExponential(3)} N</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
            <div className="text-xs" style={{ color: C.textDim }}>Re (= ρU·2R/μ)</div>
            <div className="text-lg font-bold" style={{ color: Re < 1 ? C.green : C.danger }}>{Re.toFixed(3)}</div>
            <div className="text-xs" style={{ color: C.textDim }}>{Re < 1 ? "✓ Creeping flow" : "⚠ Re > 1"}</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
            <div className="text-xs" style={{ color: C.textDim }}>종단속도 U<Sub>T</Sub></div>
            <div className="text-lg font-bold" style={{ color: C.purple }}>{UT.toExponential(3)} m/s</div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.green }}>📐 핵심 관계식</h3>
        <div className="space-y-2">
          {[
            { t: "Stokes 방정식", eq: "∇p = μ∇²v (관성항 무시)", n: "Re ≪ 1에서 N-S 방정식의 극한" },
            { t: "구 주위 유동", eq: "ψ = UR²sin²θ[½(r/R)²−¾(r/R)+¼(R/r)]", n: "Stream function 해" },
            { t: "항력 (Stokes law)", eq: "F_D = 6πμUR (1/3 압력 + 2/3 전단)", n: "ζ = 6πμR (drag coefficient)" },
            { t: "종단속도", eq: "U_T = 2R²Δρg/(9μ)", n: "부력 = 항력 균형" },
            { t: "Stokes-Einstein", eq: "D = k_BT/(6πμR)", n: "확산계수와 점도의 관계" },
          ].map((r, i) => (
            <div key={i} className="p-2 rounded text-xs" style={{ background: C.bg }}>
              <span className="font-bold" style={{ color: C.accent }}>{r.t}: </span>
              <span className="font-mono" style={{ color: C.cyan }}>{r.eq}</span>
              <span className="ml-2" style={{ color: C.textDim }}>{r.n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ PRACTICE ═══════════════
function PracticeTab() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(false);

  const qs = [
    { q: "Fanning friction factor f_F의 정의는?", o: ["τ_w/(½ρu_m²)", "τ_w/(ρu_m²)", "ΔP/(½ρu_m²)", "16/Re"], a: 0, e: "f_F = τ_w/(½ρu_m²). 벽면 전단응력 대 관성력(단위면적당)의 비입니다." },
    { q: "층류(원형관)에서 f_F와 Re의 관계는?", o: ["f_F = 16/Re", "f_F = 64/Re", "f_F = 8/Re", "f_F = Re/16"], a: 0, e: "Fanning: f_F = 16/Re. 참고로 Darcy friction factor f_D = 4f_F = 64/Re입니다. 혼동 주의!" },
    { q: "난류에서 τ ∝ u_m²인 이유는?", o: ["eddy viscosity ν_T ≈ cu_ma", "분자 점도가 증가", "관 직경이 변화", "압력이 2차 함수"], a: 0, e: "ν_T ≈ c·u_m·a (eddy 스케일링). τ ≈ ν_T·ρ·(u_m/a) = c·ρ·u_m²." },
    { q: "Colebrook-White 방정식이 '암시적(implicit)'인 이유는?", o: ["f_F가 양변에 모두 존재", "Re가 미지수", "ε/D를 모름", "L이 포함"], a: 0, e: "1/√f_F = −1.737ln(0.269ε/D + 1.257/(Re√f_F)). f_F가 좌변과 우변에 모두 있어 반복법(iteration)이 필요합니다." },
    { q: "Globe valve(open)의 등가길이 (L/D)_e는 약?", o: ["30", "70", "160", "330"], a: 3, e: "(L/D)_e = 330. 가장 큰 등가길이를 가진 부속품 중 하나입니다." },
    { q: "Pipe outlet의 손실계수 K_L은?", o: ["0.04", "0.5", "0.8", "1.0"], a: 3, e: "모든 형태의 outlet에서 K_L = 1.0. 유체의 운동에너지가 모두 소산됩니다." },
    { q: "d'Alembert 역설에서 원기둥에 작용하는 이론적 힘은?", o: ["6πμUR", "ρU²R", "0", "πρU²R²"], a: 2, e: "비점성(inviscid) + 비회전(irrotational) 가정 → 힘 = 0. 실제로는 점성에 의한 항력이 존재합니다." },
    { q: "Stokes 법칙 F_D = 6πμUR에서 압력 vs 전단의 기여 비율은?", o: ["1/3 압력 + 2/3 전단", "2/3 압력 + 1/3 전단", "모두 전단", "모두 압력"], a: 0, e: "Stokes 법칙: 1/3이 압력 항력, 2/3가 전단 항력입니다." },
    { q: "구의 종단속도 U_T의 표현은?", o: ["2R²Δρg/(9μ)", "R²Δρg/(6μ)", "4R²Δρg/(3μ)", "RΔρg/(μ)"], a: 0, e: "부력 (4/3)πR³Δρg = 항력 6πμU_TR → U_T = 2R²Δρg/(9μ)." },
    { q: "Laminar sublayer의 두께 δ/D ≈ ?", o: ["62·Re^(-7/8)", "16/Re", "Re^(-1/2)", "1/Re"], a: 0, e: "δ/D ≈ 62·Re^(−7/8). Re가 높을수록 sublayer가 얇아집니다." },
  ];

  const q = qs[cur];
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>연습문제</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: C.textDim }}>{cur + 1}/{qs.length}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.bg }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${((cur + 1) / qs.length) * 100}%`, background: C.accent }} />
          </div>
        </div>
      </div>
      <div className="p-5 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-4" style={{ color: C.text }}>{q.q}</h3>
        <div className="space-y-2">
          {q.o.map((opt, i) => {
            let bg = C.bg, bc = C.border;
            if (show) { if (i === q.a) { bg = `${C.green}20`; bc = C.green; } else if (i === sel) { bg = `${C.danger}20`; bc = C.danger; } }
            else if (i === sel) { bg = `${C.accent}20`; bc = C.accent; }
            return (
              <button key={i} onClick={() => !show && setSel(i)} className="w-full text-left p-3 rounded-lg text-sm"
                style={{ background: bg, border: `1px solid ${bc}`, color: C.text }}>
                <span className="font-mono mr-2" style={{ color: C.accent }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>);
          })}
        </div>
        {show && (
          <div className="mt-4 p-4 rounded-lg animate-fadeIn" style={{ background: `${sel === q.a ? C.green : C.danger}15`, border: `1px solid ${sel === q.a ? C.green : C.danger}40` }}>
            <div className="font-bold mb-1" style={{ color: sel === q.a ? C.green : C.danger }}>{sel === q.a ? "✅ 정답!" : "❌ 오답"}</div>
            <p className="text-sm" style={{ color: C.text }}>{q.e}</p>
          </div>
        )}
        <div className="flex gap-3 mt-4">
          {!show ? (
            <button onClick={() => sel !== null && setShow(true)} disabled={sel === null}
              className="px-5 py-2 rounded-lg font-bold text-sm"
              style={{ background: sel !== null ? C.accent : C.border, color: sel !== null ? C.bg : C.textDim }}>정답 확인</button>
          ) : (
            <button onClick={() => { setCur((cur + 1) % qs.length); setSel(null); setShow(false); }}
              className="px-5 py-2 rounded-lg font-bold text-sm" style={{ background: C.accent, color: C.bg }}>다음 →</button>
          )}
          <button onClick={() => { setCur(0); setSel(null); setShow(false); }}
            className="px-4 py-2 rounded-lg text-sm" style={{ background: C.bg, color: C.textDim, border: `1px solid ${C.border}` }}>처음으로</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ INDUSTRY ═══════════════
function IndustryTab() {
  const [exp, setExp] = useState(null);
  const apps = [
    { icon: "⛽", title: "천연가스 장거리 파이프라인", f: "Pipeline Eng.", c: "압축성 기체 해석으로 펌프스테이션 간격 결정. 4f_FL/D + log(p₂/p₁)² 관계식이 핵심.", r: "Choked flow, G_max" },
    { icon: "🏭", title: "정유공장 — 배관 시스템 설계", f: "Refinery", c: "수백 개의 밸브·엘보·티를 포함한 복잡한 배관. 등가길이 (L/D)_e 합산으로 전체 압력손실 계산.", r: "ΣK_L, (L/D)_e table" },
    { icon: "💊", title: "제약/식품 — 위생배관", f: "Pharma/Food", c: "Drawn tubing(ε≈0.0015mm)으로 매끈한 관 사용. Moody chart에서 smooth pipe line 기준 설계.", r: "ε/D → 0, f_F from smooth curve" },
    { icon: "🔬", title: "나노입자 침강 — Stokes 법칙", f: "Nanotech", c: "콜로이드·나노입자의 침강속도와 확산계수를 Stokes-Einstein으로 예측. DLS 측정의 이론적 기초.", r: "D = k_BT/(6πμR)" },
    { icon: "🚀", title: "로켓 배관 — 극한조건 설계", f: "Aerospace", c: "극저온 연료(LH2, LOX) 배관에서 f_F와 K_L의 정밀 계산이 엔진 성능을 좌우. 배관 굴곡 최소화 설계.", r: "f_F, Δh = 2f_F·u²L/(gD)" },
    { icon: "🏥", title: "인공심폐장치 — 혈류 시뮬레이션", f: "Biomedical", c: "혈액은 비뉴턴(shear-thinning) 유체. Stokes flow 영역에서의 미세 순환과 항력 해석이 디바이스 설계에 필수.", r: "Creeping flow, F_D=6πμUR" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>화학공학 산업 응용</h2>
      </div>
      <div className="space-y-3">
        {apps.map((a, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${exp === i ? C.accent : C.border}` }}>
            <button onClick={() => setExp(exp === i ? null : i)} className="w-full text-left p-4 flex items-center gap-3">
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1"><div className="font-bold text-sm" style={{ color: C.text }}>{a.title}</div><div className="text-xs" style={{ color: C.textDim }}>{a.f}</div></div>
              <span style={{ color: C.accent, transform: exp === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>▼</span>
            </button>
            {exp === i && (
              <div className="px-4 pb-4 animate-fadeIn">
                <p className="text-sm mb-2" style={{ color: C.text, lineHeight: 1.7 }}>{a.c}</p>
                <div className="p-2 rounded-lg" style={{ background: `${C.accent}10` }}>
                  <span className="text-xs font-bold" style={{ color: C.accent }}>핵심: </span>
                  <span className="text-xs font-mono" style={{ color: C.cyan }}>{a.r}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ MAIN EXPORT ═══════════════
export default function Week4App() {
  const [tab, setTab] = useState("overview");

  const render = () => {
    switch (tab) {
      case "overview":  return <OverviewTab />;
      case "shear":     return <ShearTab />;
      case "fanning":   return <FanningTab />;
      case "fittings":  return <FittingsTab />;
      case "branch":    return <BranchTab />;
      case "turbulent": return <TurbulentTab />;
      case "compress":  return <CompressTab />;
      case "dalembert": return <DAlembertTab />;
      case "stokes":    return <StokesTab />;
      case "practice":  return <PracticeTab />;
      case "industry":  return <IndustryTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;800&display=swap');
        * { font-family: 'Noto Sans KR', sans-serif; box-sizing: border-box; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; cursor: pointer; }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
        select { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold" style={{ color: C.accent, fontFamily: "'Outfit', sans-serif" }}>화공유체역학</h1>
              <p className="text-xs" style={{ color: C.textDim }}>Week 4 · Friction Factor, Pipe Systems & Creeping Flow · SKKU SPMDL</p>
            </div>
            <div className="text-right text-xs" style={{ color: C.textDim }}>
              <div>Prof. S. Joon Kwon</div>
              <div style={{ color: C.accent }}>4주차 학습 도우미</div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                style={{ background: tab === t.id ? C.accent : "transparent", color: tab === t.id ? C.bg : C.textDim, border: `1px solid ${tab === t.id ? C.accent : "transparent"}` }}>
                <span className="hidden md:inline">{t.label}</span>
                <span className="md:hidden">{t.short}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">{render()}</main>

      <footer className="text-center py-6 text-xs" style={{ color: C.textDim, borderTop: `1px solid ${C.border}` }}>
        <p>SKKU 화학공학부 · Smart Process & Materials Design Lab (SPMDL)</p>
        <p className="mt-1" style={{ color: C.accentDim }}>화공유체역학 Week 4 학습 도우미 · 2025 Spring</p>
      </footer>
    </div>
  );
}
