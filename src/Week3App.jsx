import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Utility components ───
const Sub = ({ children }) => <sub className="text-xs">{children}</sub>;
const Sup = ({ children }) => <sup className="text-xs">{children}</sup>;

// ─── Theme ───
const C = {
  bg: "#0a0f1e", card: "#111827", cardHover: "#1a2342",
  accent: "#22d3ee", accentDim: "#0e7490",
  warm: "#f59e0b", warmDim: "#b45309",
  danger: "#ef4444", success: "#10b981", purple: "#a78bfa",
  text: "#e2e8f0", textDim: "#94a3b8",
  border: "#1e293b", hi: "#312e81",
};

// ─── Tab definitions ───
const TABS = [
  { id: "overview",    label: "📋 개요",              short: "개요"  },
  { id: "momentum",    label: "🚀 운동량 보존",       short: "운동량" },
  { id: "reynolds",    label: "🌊 Reynolds Number",   short: "Re"    },
  { id: "laminar",     label: "🔬 층류 해석",          short: "층류"  },
  { id: "friction",    label: "⚡ 마찰소산",           short: "마찰"  },
  { id: "simulation",  label: "🎮 시뮬레이션",         short: "Sim"   },
  { id: "cfd",         label: "🧪 Wedge CFD",         short: "CFD"   },
  { id: "practice",    label: "✏️ 연습문제",           short: "문제"  },
  { id: "industry",    label: "🏭 산업응용",           short: "응용"  },
];

// ═══════════════════════════════════════
//  OVERVIEW
// ═══════════════════════════════════════
function OverviewTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: C.accent }}>Week 3 — Momentum Balance & Fluid Friction in Pipes</h2>
        <p style={{ color: C.text, lineHeight: 1.8 }}>
          이번 주는 <strong style={{ color: C.warm }}>운동량 보존 (Momentum Balance)</strong>과
          <strong style={{ color: C.accent }}> 관 내 유체마찰 (Fluid Friction in Pipes)</strong>을 다룹니다.
          힘과 대류에 의한 운동량 전달, 각운동량을 학습한 후,
          일반화된 Bernoulli 방정식으로 마찰소산을 해석하고,
          Reynolds number로 유동 체계를 판별합니다.
          마지막으로 층류에서의 Hagen-Poiseuille 법칙과 lumped quantity 개념을 완성합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: "🚀", title: "Part 1: Momentum Balance", desc: "힘·대류에 의한 운동량 전달, 오리피스 해석, 각운동량 & 원심펌프", color: C.purple },
          { icon: "🌊", title: "Part 2: Fluid Friction", desc: "일반화된 Bernoulli, ΔP∝Qⁿ 관계, Reynolds 실험, Re 유도", color: C.accent },
          { icon: "🔬", title: "Part 3: Laminar Flow", desc: "Poiseuille 속도분포, Hagen-Poiseuille 법칙, 마찰소산 ℱ, Lumped K.E.", color: C.warm },
          { icon: "🧪", title: "Bonus: Wedge CFD", desc: "LBM D2Q9 시뮬레이션 — wedge 주위 유동, 물 vs 오일 비교, 와도·압력 시각화", color: C.success },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-bold mb-1" style={{ color: item.color }}>{item.title}</h3>
            <p className="text-sm" style={{ color: C.textDim }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>📚 핵심 방정식 Quick Reference</h3>
        <div className="space-y-2 text-sm font-mono">
          {[
            { eq: "F = dM/dt = d(Mu)/dt", label: "운동량-힘 관계", c: C.purple },
            { eq: "τ_w = D(p₁−p₂)/(4L)", label: "관벽 전단응력", c: C.purple },
            { eq: "Re = ρu_mD/η", label: "Reynolds number", c: C.accent },
            { eq: "Δ(u²/2)+gΔz+Δp/ρ+w+ℱ=0", label: "일반화된 Bernoulli", c: C.accent },
            { eq: "u(r)=(-Δp/4ηL)(a²−r²)", label: "층류 속도분포", c: C.warm },
            { eq: "Q = πa⁴(p₁−p₂)/(8ηL)", label: "Hagen-Poiseuille", c: C.warm },
            { eq: "ℱ = 8ηu_mL/(ρa²)", label: "마찰소산 (수평관 층류)", c: C.danger },
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

// ═══════════════════════════════════════
//  MOMENTUM BALANCE (Part 1)
// ═══════════════════════════════════════
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
        <p className="text-sm" style={{ color: C.textDim }}>
          운동량(Momentum) M = Mu, 힘 = dM/dt = 운동량의 시간변화율
        </p>
      </div>

      {/* Force by momentum transfer */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>① 힘에 의한 운동량 전달</h3>
        <div className="space-y-3 text-sm" style={{ color: C.text }}>
          <div className="p-3 rounded-lg" style={{ background: C.bg }}>
            <p className="mb-2"><strong style={{ color: C.accent }}>핵심 관계:</strong> Force = Ma = M(du/dt) = d(Mu)/dt = dM/dt</p>
            <p>힘의 종류:</p>
            <p className="ml-3">• <strong style={{ color: C.warm }}>표면력(Contact force):</strong> 압력, 전단응력 — 단거리 작용</p>
            <p className="ml-3">• <strong style={{ color: C.purple }}>체적력(Body force):</strong> 중력, 전기장, 자기장 — 장거리 작용</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: C.bg }}>
            <p><strong style={{ color: C.accent }}>관 내 정상유동 — 벽면 전단응력:</strong></p>
            <p className="font-mono mt-1 text-center" style={{ color: C.warm }}>
              τ<Sub>w</Sub> = D(p₁ − p₂) / (4L)
            </p>
            <p className="text-xs mt-2" style={{ color: C.textDim }}>
              전진력 = p₁·πD²/4, 후퇴력 = p₂·πD²/4 + τ_w·πDL, 정상상태에서 dM/dt = 0
            </p>
          </div>
        </div>
      </div>

      {/* Convective momentum — Jet impingement calculator */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>② 대류에 의한 운동량 전달 — Jet Impingement 계산기</h3>
        <p className="text-sm mb-3" style={{ color: C.textDim }}>
          제트가 방패에 수직 충돌할 때: Ṁ<Sub>in</Sub> = ṁu, Ṁ<Sub>out</Sub> = 0 (방사상 분산) → F = ρQu
        </p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "유속 u (ft/s)", val: jetV, set: setJetV, step: 1 },
            { label: "유량 Q (ft³/s)", val: jetQ, set: setJetQ, step: 0.1 },
            { label: "밀도 ρ (lb/ft³)", val: rhoJet, set: setRhoJet, step: 0.1 },
          ].map((p, i) => (
            <div key={i}>
              <label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step}
                onChange={e => p.set(+e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-sm"
                style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
          <span className="text-sm" style={{ color: C.textDim }}>F = ρQu = </span>
          <span className="text-2xl font-bold" style={{ color: C.accent }}>{jetForce.toFixed(1)}</span>
          <span className="text-sm" style={{ color: C.textDim }}> lb<Sub>f</Sub> (gc 보정 전)</span>
        </div>
      </div>

      {/* Orifice plate */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.danger }}>③ 오리피스 판 해석 (Bernoulli + Momentum Balance)</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: `${C.success}15` }}>
              <h4 className="font-bold mb-1" style={{ color: C.success }}>상류 (① → ②): Bernoulli 적용 ✓</h4>
              <p>수축 유동, 거의 무마찰</p>
              <p className="font-mono text-xs mt-1" style={{ color: C.accent }}>
                (p₁−p₂)/ρ = (u₁²/2)(A₁²/A₂² − 1)
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: `${C.danger}15` }}>
              <h4 className="font-bold mb-1" style={{ color: C.danger }}>하류 (② → ③): 운동량 수지 필요 ✗</h4>
              <p>확장 유동, 강한 난류·에디</p>
              <p className="font-mono text-xs mt-1" style={{ color: C.accent }}>
                mu₂ − mu₃ + (p₂−p₃)A₁ = 0
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `${C.warm}15` }}>
            <h4 className="font-bold mb-1" style={{ color: C.warm }}>마찰소산 (결합):</h4>
            <p className="font-mono text-center" style={{ color: C.danger }}>
              (p₁−p₃)/ρ = (u₁²/2)(A₁/A₂ − 1)² &gt; 0 (항상 양수!)
            </p>
            <p className="text-xs mt-1" style={{ color: C.textDim }}>
              수축→확장에 의한 에디(turbulence)가 에너지를 비가역적으로 소산시킵니다.
            </p>
          </div>
        </div>
      </div>

      {/* Angular momentum — Centrifugal pump calculator */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.purple }}>④ 각운동량 & 원심펌프 토크 계산기</h3>
        <p className="text-sm mb-2" style={{ color: C.textDim }}>
          임펠러 토크: T = ṁ[(ru)₂ − (ru)₁] = ṁω(r₂² − r₁²)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[
            { label: "r₁ (m)", val: r1, set: setR1, step: 0.01 },
            { label: "r₂ (m)", val: r2, set: setR2, step: 0.01 },
            { label: "ω (rad/s)", val: omega, set: setOmega, step: 1 },
            { label: "ṁ (kg/s)", val: massFlow, set: setMassFlow, step: 0.1 },
          ].map((p, i) => (
            <div key={i}>
              <label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step}
                onChange={e => p.set(+e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-sm"
                style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: C.bg }}>
          <span className="text-sm" style={{ color: C.textDim }}>T = ṁω(r₂²−r₁²) = </span>
          <span className="text-2xl font-bold" style={{ color: C.purple }}>{torque.toFixed(3)}</span>
          <span className="text-sm" style={{ color: C.textDim }}> N·m</span>
        </div>
        <div className="mt-3 p-3 rounded-lg" style={{ background: C.bg }}>
          <h4 className="font-bold text-xs mb-2" style={{ color: C.warm }}>관성모멘트 참고 (Moment of Inertia)</h4>
          <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: C.textDim }}>
            <span>솔리드 실린더: I = MR²/2</span>
            <span>솔리드 구: I = 2MR²/5</span>
            <span>얇은 막대: I = ML²/12</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  REYNOLDS NUMBER
// ═══════════════════════════════════════
function ReynoldsTab() {
  const [rho, setRho] = useState(1000);
  const [u, setU] = useState(1.0);
  const [D, setD] = useState(0.05);
  const [eta, setEta] = useState(0.001);
  const Re = (rho * u * D) / eta;
  const regime = Re < 2000 ? "Laminar" : Re > 4000 ? "Turbulent" : "Transition";
  const regimeColor = Re < 2000 ? C.success : Re > 4000 ? C.danger : C.warm;
  const regimeKR = Re < 2000 ? "층류" : Re > 4000 ? "난류" : "전이";

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Reynolds Number 계산기</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Re = ρu<Sub>m</Sub>D / η — 관성효과(accelerator) vs 점성효과(brake)</p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "밀도 ρ (kg/m³)", val: rho, set: setRho, step: 10 },
            { label: "속도 u_m (m/s)", val: u, set: setU, step: 0.1 },
            { label: "직경 D (m)", val: D, set: setD, step: 0.001 },
            { label: "점도 η (Pa·s)", val: eta, set: setEta, step: 0.0001 },
          ].map((p, i) => (
            <div key={i}>
              <label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step}
                onChange={e => p.set(+e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-sm"
                style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl" style={{ background: C.bg }}>
          <div>
            <span className="text-sm" style={{ color: C.textDim }}>Re = </span>
            <span className="text-3xl font-bold" style={{ color: regimeColor }}>{Re < 1e7 ? Re.toFixed(0) : Re.toExponential(2)}</span>
          </div>
          <div className="px-4 py-2 rounded-full font-bold" style={{ background: `${regimeColor}30`, color: regimeColor }}>
            {regime} ({regimeKR})
          </div>
        </div>
      </div>

      {/* Physical derivation */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>🧠 Re의 물리적 의미</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg" style={{ background: `${C.danger}15` }}>
            <h4 className="font-bold text-sm mb-1" style={{ color: C.danger }}>관성효과 (Inertial)</h4>
            <p className="text-sm" style={{ color: C.text }}>~ ρu<Sub>m</Sub><Sup>2</Sup> [kg/(m·s²)]</p>
            <p className="text-xs" style={{ color: C.textDim }}>빠르지만 불안정 (높은 변동)</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `${C.accent}15` }}>
            <h4 className="font-bold text-sm mb-1" style={{ color: C.accent }}>점성효과 (Viscous)</h4>
            <p className="text-sm" style={{ color: C.text }}>~ ηu<Sub>m</Sub>/D [kg/(m·s²)]</p>
            <p className="text-xs" style={{ color: C.textDim }}>느리지만 안정 (낮은 변동)</p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.success }}>⚡ 프리셋 (클릭 적용)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: "모세혈관", rho: 1000, u: 0.1, D: 0.00002, eta: 0.001 },
            { name: "수도관", rho: 1000, u: 1.5, D: 0.02, eta: 0.001 },
            { name: "고분자 (Ex3.1)", rho: 900, u: 0.5, D: 0.02, eta: 0.01 },
            { name: "대형선박", rho: 1000, u: 10, D: 30, eta: 0.001 },
          ].map((ex, i) => (
            <button key={i} onClick={() => { setRho(ex.rho); setU(ex.u); setD(ex.D); setEta(ex.eta); }}
              className="p-2 rounded-lg text-left text-xs transition-all hover:scale-[1.03]"
              style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
              <div className="font-bold" style={{ color: C.accent }}>{ex.name}</div>
              <div style={{ color: C.textDim }}>Re≈{((ex.rho * ex.u * ex.D) / ex.eta).toExponential(1)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Flow regime table */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>📊 유동 체계 분류</h3>
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>
            {["Re 범위","유동 체계","ΔP 비례","특성"].map((h,i)=>(<th key={i} className="text-left p-2" style={{color:C.warm}}>{h}</th>))}
          </tr></thead>
          <tbody>{[
            ["< 2,000","층류","Q","안정적, n=1"],
            ["2,000~4,000","전이","Q^n (1<n<2)","불안정"],
            ["> 4,000","난류","Q^1.8~Q²","완전발달, n≈2"],
          ].map((row,i)=>(<tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
            {row.map((cell,j)=>(<td key={j} className="p-2" style={{color:j===0?[C.success,C.warm,C.danger][i]:C.text}}>{cell}</td>))}
          </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  LAMINAR FLOW (Part 3)
// ═══════════════════════════════════════
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
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width = 500, H = cv.height = 240;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    const pT = 30, pB = H - 30, cY = (pT + pB) / 2, pH = pB - pT;
    const lX = 80, rX = W - 40, pW = rX - lX;

    ctx.strokeStyle = C.textDim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lX, pT); ctx.lineTo(rX, pT); ctx.moveTo(lX, pB); ctx.lineTo(rX, pB); ctx.stroke();

    const mxA = pW * 0.7;
    for (let i = 0; i <= 15; i++) {
      const f = i / 15, y = pT + f * pH, rN = (y - cY) / (pH / 2), uN = 1 - rN * rN, aL = uN * mxA;
      ctx.strokeStyle = `rgba(34,211,238,${0.3 + 0.7 * uN})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(lX, y); ctx.lineTo(lX + aL, y); ctx.stroke();
      if (aL > 10) { ctx.beginPath(); ctx.moveTo(lX + aL, y); ctx.lineTo(lX + aL - 6, y - 3); ctx.moveTo(lX + aL, y); ctx.lineTo(lX + aL - 6, y + 3); ctx.stroke(); }
    }

    ctx.strokeStyle = C.warm; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath();
    for (let i = 0; i <= 50; i++) { const f = i / 50, y = pT + f * pH, rN = (y - cY) / (pH / 2), x = lX + (1 - rN * rN) * mxA; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);

    ctx.strokeStyle = C.danger; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath();
    for (let i = 0; i <= 50; i++) { const f = i / 50, y = pT + f * pH, rN = (y - cY) / (pH / 2), x = lX - 10 - Math.abs(rN) * 40; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);

    ctx.font = "11px monospace";
    ctx.fillStyle = C.warm; ctx.fillText("u(r) 포물선", lX + mxA * 0.3, pT - 8);
    ctx.fillStyle = C.danger; ctx.fillText("τ(r) 선형", lX - 55, pT - 8);
    ctx.fillStyle = C.accent; ctx.fillText("u_M", lX + mxA + 5, cY + 4);
    ctx.fillStyle = C.textDim; ctx.fillText("r=0", lX - 25, cY + 4);
  }, [dP, a, L, eta]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Part 3: 층류 (Laminar Flow) 해석</h2>
        <p className="text-sm" style={{ color: C.textDim }}>Newtonian 유체: 포물선 속도분포 + 선형 전단응력</p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>🎯 속도 & 전단응력 시각화</h3>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ maxWidth: 500, background: C.bg }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Δp (Pa)", val: dP, set: setDP, step: 10 },
            { label: "반지름 a (m)", val: a, set: setA, step: 0.001 },
            { label: "길이 L (m)", val: L, set: setL, step: 0.1 },
            { label: "점도 η (Pa·s)", val: eta, set: setEta, step: 0.0001 },
          ].map((p, i) => (
            <div key={i}>
              <label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.label}</label>
              <input type="number" value={p.val} step={p.step} onChange={e => p.set(+e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-sm"
                style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "u_M (최대)", val: uMax, c: C.accent },
            { label: "u_m (평균)", val: uMean, c: C.warm },
            { label: "Q (유량)", val: Q, c: C.success },
          ].map((v, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: `${v.c}15` }}>
              <div className="text-xs" style={{ color: C.textDim }}>{v.label}</div>
              <div className="font-bold text-sm" style={{ color: v.c }}>{v.val < 0.01 ? v.val.toExponential(3) : v.val.toFixed(4)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>📐 핵심 방정식</h3>
        <div className="space-y-3">
          {[
            { t: "힘 평형", eq: "τ = (r/2)(−dp/dz)", n: "정상상태 원통형 유체요소" },
            { t: "속도분포", eq: "u(r) = (−Δp/4ηL)(a²−r²) = u_M[1−(r/a)²]", n: "포물선 — 중심 최대, 벽면 0" },
            { t: "전단응력", eq: "τ(r) = −rΔp/(2L)", n: "선형 — 중심 0, 벽면 최대" },
            { t: "Hagen-Poiseuille", eq: "Q = πa⁴(p₁−p₂)/(8ηL)", n: "Q ∝ Δp, Q ∝ a⁴" },
            { t: "u_m = u_M/2", eq: "평균속도 = 최대속도의 절반", n: "층류 고유 특성" },
            { t: "경사관(오르막)", eq: "u(r) = −(Δp+ρgsinθL)/(4ηL)·(a²−r²)", n: "중력이 유동 방해" },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: C.bg }}>
              <span className="font-bold text-xs" style={{ color: C.warm }}>{item.t}: </span>
              <span className="font-mono text-xs" style={{ color: C.accent }}>{item.eq}</span>
              <div className="text-xs mt-1" style={{ color: C.textDim }}>{item.n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  FRICTIONAL DISSIPATION
// ═══════════════════════════════════════
function FrictionTab() {
  const [showLumped, setShowLumped] = useState(false);
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>마찰소산 ℱ & Lumped Quantity</h2>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.warm }}>🔄 일반화된 Bernoulli 방정식</h3>
        <div className="p-3 rounded-lg text-center font-mono" style={{ background: C.bg, color: C.accent }}>
          Δ(u²/2) + gΔz + Δp/ρ + w + ℱ = 0
        </div>
        <div className="mt-3 space-y-1 text-sm">
          {[
            { t: "ℱ = e₂ − e₁ − q ≥ 0", d: "마찰소산은 항상 양수 (비가역)", c: C.danger },
            { t: "ℱ > 0 → p₁ > p₂", d: "압력 강하 발생", c: C.warm },
            { t: "ℱ > 0 → q < 0", d: "열 손실 (벽면 마찰열)", c: C.accent },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 p-2 rounded" style={{ background: `${r.c}10` }}>
              <span className="font-mono w-44 flex-shrink-0" style={{ color: r.c }}>{r.t}</span>
              <span style={{ color: C.text }}>{r.d}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-lg text-center" style={{ background: C.bg }}>
          <div className="text-xs" style={{ color: C.textDim }}>수평관 + 등속 + 무외부일:</div>
          <div className="font-mono font-bold mt-1" style={{ color: C.accent }}>ℱ = −Δp/ρ = (p₁−p₂)/ρ = 8ηu<Sub>m</Sub>L/(ρa²)</div>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: C.success }}>
          📦 Lumped Quantity
          <button onClick={() => setShowLumped(!showLumped)} className="text-xs px-3 py-1 rounded-full"
            style={{ background: C.bg, color: C.accent, border: `1px solid ${C.accentDim}` }}>
            {showLumped ? "접기" : "상세"}
          </button>
        </h3>
        <div className="p-3 rounded-lg text-center font-mono text-sm" style={{ background: C.bg, color: C.accent }}>
          〈Ψ〉 = ∫₀ᵃ 2πrdr(ρuΨ) / ∫₀ᵃ 2πrdr(ρu)
        </div>
        {showLumped && (
          <div className="mt-4 space-y-3 animate-fadeIn">
            <div className="p-3 rounded-lg text-sm" style={{ background: `${C.accent}10`, color: C.text }}>
              <p><strong style={{ color: C.accent }}>Ψ = u²/2 일 때:</strong></p>
              <p>• 〈u²〉 = u<Sub>M</Sub>²/2 = (√2·u<Sub>m</Sub>)²</p>
              <p>• 〈K.E.〉 = α·u<Sub>m</Sub>²/2</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded text-center text-sm" style={{ background: C.bg }}>
                <div style={{ color: C.success }}>층류: α = 2</div>
                <div className="text-xs" style={{ color: C.textDim }}>큰 속도 분산</div>
              </div>
              <div className="p-2 rounded text-center text-sm" style={{ background: C.bg }}>
                <div style={{ color: C.danger }}>난류: α ≈ 1.07</div>
                <div className="text-xs" style={{ color: C.textDim }}>균일한 프로파일</div>
              </div>
            </div>
            <p className="text-xs" style={{ color: C.danger }}>⚠️ 〈K.E.〉 = α·u<Sub>m</Sub>²/2 ≠ u<Sub>m</Sub>²/2 (층류에서 2배 차이!)</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  SIMULATION
// ═══════════════════════════════════════
function SimulationTab() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [flowRate, setFlowRate] = useState(50);
  const [simType, setSimType] = useState("pipe");
  const particlesRef = useRef([]);

  useEffect(() => {
    const ps = [];
    for (let i = 0; i < 80; i++) {
      const rN = Math.random() * 2 - 1;
      ps.push({ x: Math.random() * 500, y: 130 + rN * 80, rNorm: rN, baseSpeed: flowRate / 50 });
    }
    particlesRef.current = ps;
  }, [simType, flowRate]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width = 500, H = cv.height = 260;
    const isLam = flowRate < 40, isTurb = flowRate > 70;

    const draw = () => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const pT = 50, pB = 210, cY = 130, pH = pB - pT;

      ctx.strokeStyle = "#475569"; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(0, pT); ctx.lineTo(W, pT); ctx.moveTo(0, pB); ctx.lineTo(W, pB);
      if (simType === "orifice") {
        const ox = 200, oh = 25;
        ctx.moveTo(ox, pT); ctx.lineTo(ox, cY - oh);
        ctx.moveTo(ox, cY + oh); ctx.lineTo(ox, pB);
      }
      ctx.stroke();

      if (simType === "orifice") {
        ctx.setLineDash([4, 4]); ctx.strokeStyle = C.warm; ctx.beginPath();
        ctx.moveTo(240, pT + 15); ctx.lineTo(240, pB - 15); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = "10px monospace"; ctx.fillStyle = C.textDim;
        ctx.fillText("①", 100, pB + 18); ctx.fillText("②", 235, pB + 18); ctx.fillText("③", 420, pB + 18);
      }

      particlesRef.current.forEach(p => {
        const rA = Math.abs(p.rNorm);
        let spd;
        if (simType === "orifice") {
          const inO = p.x > 180 && p.x < 260, aftO = p.x > 260;
          spd = inO ? p.baseSpeed * 3 * (1 - rA * 0.5) : aftO ? p.baseSpeed * (1 - rA * rA) * 1.2 : p.baseSpeed * (1 - rA * rA);
          if (aftO && !isLam) p.y += (Math.random() - 0.5) * 2;
        } else {
          if (isLam) spd = p.baseSpeed * (1 - rA * rA);
          else if (isTurb) { spd = p.baseSpeed * (1 - Math.pow(rA, 1 / 7)) * 1.5; p.y += (Math.random() - 0.5) * 1.5; }
          else { spd = p.baseSpeed * (1 - rA * rA); if (Math.random() < 0.1) p.y += (Math.random() - 0.5) * 3; }
        }
        p.x += Math.max(spd * 1.5, 0.1);
        p.y = Math.max(pT + 3, Math.min(pB - 3, p.y));
        if (p.x > W + 10) { p.x = -10; p.rNorm = Math.random() * 2 - 1; p.y = cY + p.rNorm * (pH / 2 - 5); }
        const al = 0.4 + 0.6 * (1 - rA);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isTurb ? `rgba(239,68,68,${al})` : isLam ? `rgba(34,211,238,${al})` : `rgba(245,158,11,${al})`;
        ctx.fill();
      });

      ctx.font = "12px monospace";
      ctx.fillStyle = isLam ? C.accent : isTurb ? C.danger : C.warm;
      ctx.fillText(isLam ? "LAMINAR" : isTurb ? "TURBULENT" : "TRANSITION", 10, 25);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [flowRate, simType]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${C.hi}, ${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>Interactive Flow Simulation</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex gap-2 mb-4">
          {[{ id: "pipe", l: "직선관" }, { id: "orifice", l: "오리피스" }].map(t => (
            <button key={t.id} onClick={() => setSimType(t.id)} className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: simType === t.id ? C.accent : C.bg, color: simType === t.id ? C.bg : C.text, border: `1px solid ${simType === t.id ? C.accent : C.border}` }}>
              {t.l}
            </button>
          ))}
        </div>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ maxWidth: 500 }} />
        <div className="mt-4">
          <label className="text-sm mb-1 block" style={{ color: C.textDim }}>유량 조절</label>
          <input type="range" min="5" max="100" value={flowRate} onChange={e => setFlowRate(+e.target.value)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, ${C.success}, ${C.warm}, ${C.danger})` }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: C.textDim }}>
            <span>층류</span><span>전이</span><span>난류</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  PRACTICE PROBLEMS
// ═══════════════════════════════════════
function PracticeTab() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(false);

  const qs = [
    { q: "힘(Force)과 운동량(Momentum)의 관계로 옳은 것은?", o: ["F = Mu", "F = dM/dt", "F = M/t", "F = Mu²"], a: 1, e: "F = d(Mu)/dt = dM/dt. 힘은 운동량의 시간 변화율입니다. Newton의 제2법칙의 일반형입니다." },
    { q: "관 내 정상유동에서 벽면 전단응력 τ_w는?", o: ["D(p₁−p₂)/(4L)", "D(p₁−p₂)/(2L)", "D²(p₁−p₂)/(4L)", "(p₁−p₂)/(DL)"], a: 0, e: "τ_w = D(p₁−p₂)/(4L). 전진력(압력×단면적)과 후퇴력(압력×단면적 + 전단력×벽면적)의 평형에서 유도됩니다." },
    { q: "Re = 900인 관 유동의 유동 체계는?", o: ["층류", "전이", "난류", "판단 불가"], a: 0, e: "Re < 2,000 → 층류(laminar). ΔP ∝ Q (n=1)." },
    { q: "Hagen-Poiseuille: 관 반지름 2배 → 유량 변화?", o: ["2배", "4배", "8배", "16배"], a: 3, e: "Q ∝ a⁴ → 2⁴ = 16배. 직경의 영향이 매우 큽니다!" },
    { q: "층류에서 u_m과 u_M의 관계?", o: ["u_m = u_M", "u_m = u_M/2", "u_m = u_M/4", "u_m = 2u_M"], a: 1, e: "포물선 분포 적분 → u_m = u_M/2." },
    { q: "마찰소산 ℱ의 부호는?", o: ["항상 ≥ 0", "항상 ≤ 0", "조건에 따라", "항상 0"], a: 0, e: "ℱ = e₂−e₁−q ≥ 0. 마찰은 항상 에너지를 소산 (비가역)." },
    { q: "층류 lumped K.E. 보정계수 α는?", o: ["1", "1.07", "2", "4"], a: 2, e: "〈K.E.〉 = α·u_m²/2. 층류 α=2, 난류 α≈1.07." },
    { q: "원심펌프 임펠러 토크의 표현은?", o: ["ṁω(r₂²−r₁²)", "ṁω(r₂−r₁)", "ṁω²(r₂²−r₁²)", "Iω"], a: 0, e: "T = ṁ[(ru)₂−(ru)₁] = ṁω(r₂²−r₁²). 각운동량 수지에서 유도됩니다." },
    { q: "오리피스 마찰소산 (p₁−p₃)/ρ는?", o: ["(u₁²/2)(A₁/A₂−1)²", "(u₁²/2)(A₂/A₁−1)²", "u₁²(A₁/A₂)", "0"], a: 0, e: "Bernoulli(상류) + 운동량수지(하류) 결합 결과. 항상 양수." },
    { q: "고분자: ρ=900, η=0.01, D=0.02, u_m=0.5일 때 Re?", o: ["90", "450", "900", "9000"], a: 2, e: "Re = 900×0.5×0.02/0.01 = 900 (층류). Example 3.1과 동일." },
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
        <h3 className="font-bold text-lg mb-4" style={{ color: C.text }}>{q.q}</h3>
        <div className="space-y-2">
          {q.o.map((opt, i) => {
            let bg = C.bg, bc = C.border;
            if (show) { if (i === q.a) { bg = `${C.success}20`; bc = C.success; } else if (i === sel) { bg = `${C.danger}20`; bc = C.danger; } }
            else if (i === sel) { bg = `${C.accent}20`; bc = C.accent; }
            return (
              <button key={i} onClick={() => !show && setSel(i)} className="w-full text-left p-3 rounded-lg text-sm"
                style={{ background: bg, border: `1px solid ${bc}`, color: C.text }}>
                <span className="font-mono mr-2" style={{ color: C.accent }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>
        {show && (
          <div className="mt-4 p-4 rounded-lg animate-fadeIn" style={{ background: `${sel === q.a ? C.success : C.danger}15`, border: `1px solid ${sel === q.a ? C.success : C.danger}40` }}>
            <div className="font-bold mb-1" style={{ color: sel === q.a ? C.success : C.danger }}>{sel === q.a ? "✅ 정답!" : "❌ 오답"}</div>
            <p className="text-sm" style={{ color: C.text }}>{q.e}</p>
          </div>
        )}
        <div className="flex gap-3 mt-4">
          {!show ? (
            <button onClick={() => sel !== null && setShow(true)} disabled={sel === null}
              className="px-5 py-2 rounded-lg font-bold text-sm"
              style={{ background: sel !== null ? C.accent : C.border, color: sel !== null ? C.bg : C.textDim }}>
              정답 확인
            </button>
          ) : (
            <button onClick={() => { setCur((cur + 1) % qs.length); setSel(null); setShow(false); }}
              className="px-5 py-2 rounded-lg font-bold text-sm" style={{ background: C.accent, color: C.bg }}>
              다음 문제 →
            </button>
          )}
          <button onClick={() => { setCur(0); setSel(null); setShow(false); }}
            className="px-4 py-2 rounded-lg text-sm" style={{ background: C.bg, color: C.textDim, border: `1px solid ${C.border}` }}>
            처음으로
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  INDUSTRY APPLICATIONS
// ═══════════════════════════════════════
function IndustryTab() {
  const [exp, setExp] = useState(null);
  const apps = [
    { icon: "💊", title: "제약 — 고점도 슬러리 수송", field: "Bio/Pharma", content: "약물 현탁액(수백~수천 cP) → Re ≪ 2000 → 완전 층류. Hagen-Poiseuille로 정밀 유량 제어. Q ∝ a⁴이므로 미세 직경 변화가 유량에 극적 영향.", rel: "Q ∝ a⁴, ΔP ∝ Q" },
    { icon: "⛽", title: "석유화학 — 파이프라인 설계", field: "Petrochemical", content: "수백 km 원유 수송. ℱ = 8ηu_mL/(ρa²)에서 L이 매우 크므로 ℱ 지배적. 가열로 점도 감소 → ℱ 절감이 핵심 전략.", rel: "ℱ ∝ ηL/a²" },
    { icon: "🔬", title: "반도체 CMP — 슬러리 공급", field: "Semiconductor", content: "나노입자 슬러리를 웨이퍼에 균일 공급. Re < 2000 유지 + τ_w 균일성이 연마 균일성에 직결.", rel: "τ_w = aΔp/(2L)" },
    { icon: "🩸", title: "생체의공학 — 혈류역학", field: "Biomedical", content: "대동맥 Re~4000 (난류 가능), 모세혈관 Re~0.001 (완전 층류). τ_w가 동맥경화 발생 위치 예측의 핵심.", rel: "τ_w → 동맥경화 예측" },
    { icon: "🏭", title: "고분자 압출 — 다이 유동", field: "Polymer", content: "고분자 용융체(η ~ 100~10,000 Pa·s) → Re < 1. Ex 3.1처럼 경사관으로 무펌프 유동 가능. Δz/L = −ℱ₀/(gL).", rel: "경사관 무펌프 조건" },
    { icon: "💧", title: "유량 측정 — 오리피스/로터미터", field: "Flow Measurement", content: "오리피스: Bernoulli + 운동량수지 → (p₁−p₂) ∝ Q². C_D로 실유량 보정. 로터미터: Q ≈ a√(2Mg/ρA).", rel: "ΔP ∝ Q², C_D" },
    { icon: "🔧", title: "원심펌프 — 임펠러 설계", field: "Pump Engineering", content: "토크 T = ṁω(r₂²−r₁²)에서, 출구반경 r₂가 토크를 지배. 각운동량 수지는 터보기계 설계의 기초.", rel: "T = ṁω(r₂²−r₁²)" },
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
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: C.text }}>{a.title}</div>
                <div className="text-xs" style={{ color: C.textDim }}>{a.field}</div>
              </div>
              <span style={{ color: C.accent, transform: exp === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>▼</span>
            </button>
            {exp === i && (
              <div className="px-4 pb-4 animate-fadeIn">
                <p className="text-sm mb-2" style={{ color: C.text, lineHeight: 1.7 }}>{a.content}</p>
                <div className="p-2 rounded-lg" style={{ background: `${C.accent}10` }}>
                  <span className="text-xs font-bold" style={{ color: C.accent }}>핵심: </span>
                  <span className="text-xs font-mono" style={{ color: C.warm }}>{a.rel}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  WEDGE CFD SIMULATION (LBM D2Q9)
// ═══════════════════════════════════════
const FLUIDS = {
  water: { name: "Water (25°C)", nameKr: "물 (25°C)", density: 998, kinViscosity: 8.9e-7, color: "#3b82f6" },
  oil: { name: "Motor Oil (25°C)", nameKr: "모터오일 (25°C)", density: 880, kinViscosity: 1.0e-4, color: "#f59e0b" },
};
const cxL = [0,1,0,-1,0,1,-1,-1,1], cyL = [0,0,1,0,-1,1,1,-1,-1];
const wL = [4/9,1/9,1/9,1/9,1/9,1/36,1/36,1/36,1/36], oppL = [0,3,4,1,2,7,8,5,6];

function createLBM(NX, NY, omega, uIn, solid) {
  const N=NX*NY, f=new Float64Array(9*N), ft=new Float64Array(9*N);
  const rho=new Float64Array(N), ux=new Float64Array(N), uy=new Float64Array(N), vort=new Float64Array(N);
  for(let i=0;i<N;i++){rho[i]=1;ux[i]=solid[i]?0:uIn;uy[i]=0;
    for(let k=0;k<9;k++){const cu=cxL[k]*ux[i]+cyL[k]*uy[i];const u2=ux[i]*ux[i]+uy[i]*uy[i];f[k*N+i]=wL[k]*rho[i]*(1+3*cu+4.5*cu*cu-1.5*u2);}}
  function step(){
    for(let i=0;i<N;i++){if(solid[i])continue;let r=0;for(let k=0;k<9;k++)r+=f[k*N+i];let vx=0,vy=0;for(let k=0;k<9;k++){vx+=cxL[k]*f[k*N+i];vy+=cyL[k]*f[k*N+i];}vx/=r;vy/=r;rho[i]=r;ux[i]=vx;uy[i]=vy;
      for(let k=0;k<9;k++){const cu=cxL[k]*vx+cyL[k]*vy;const u2=vx*vx+vy*vy;const fe=wL[k]*r*(1+3*cu+4.5*cu*cu-1.5*u2);f[k*N+i]+=omega*(fe-f[k*N+i]);}}
    for(let k=0;k<9;k++)for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){const nx=x-cxL[k],ny=y-cyL[k];if(nx>=0&&nx<NX&&ny>=0&&ny<NY)ft[k*N+y*NX+x]=f[k*N+ny*NX+nx];}
    for(let i=0;i<N;i++)if(solid[i]){for(let k=0;k<9;k++)ft[oppL[k]*N+i]=f[k*N+i];rho[i]=1;ux[i]=0;uy[i]=0;}
    for(let i=0;i<f.length;i++)f[i]=ft[i];
    for(let y=1;y<NY-1;y++){const i=y*NX;if(solid[i])continue;const r=(f[0*N+i]+f[2*N+i]+f[4*N+i]+2*(f[3*N+i]+f[6*N+i]+f[7*N+i]))/(1-uIn);rho[i]=r;f[1*N+i]=f[3*N+i]+(2/3)*r*uIn;f[5*N+i]=f[7*N+i]+(1/6)*r*uIn-0.5*(f[2*N+i]-f[4*N+i]);f[8*N+i]=f[6*N+i]+(1/6)*r*uIn+0.5*(f[2*N+i]-f[4*N+i]);ux[i]=uIn;uy[i]=0;}
    for(let y=1;y<NY-1;y++){const i=y*NX+(NX-1),s=y*NX+(NX-2);for(let k=0;k<9;k++)f[k*N+i]=f[k*N+s];rho[i]=rho[s];ux[i]=ux[s];uy[i]=uy[s];}
    for(let y=1;y<NY-1;y++)for(let x=1;x<NX-1;x++){const i=y*NX+x;vort[i]=(uy[y*NX+x+1]-uy[y*NX+x-1])*0.5-(ux[(y+1)*NX+x]-ux[(y-1)*NX+x])*0.5;}
  }
  return {step,rho,ux,uy,vorticity:vort};
}

function buildWedge(NX,NY,wX,wH,wHW,tR){
  const m=new Uint8Array(NX*NY),tY=NY-wH,bY=NY-1,rP=Math.max(tR,0.5);
  for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){const i=y*NX+x;if(y===0||y===NY-1){m[i]=1;continue;}
    if(y>=tY&&y<=bY){const fr=(y-tY)/Math.max(wH,1);if(Math.abs(x-wX)<=wHW*fr)m[i]=1;}
    if(y>=tY-rP&&y<tY+rP){const dx=x-wX,dy=y-tY;if(dy<=0&&dx*dx+dy*dy<=rP*rP)m[i]=1;}}
  return m;
}

function velColor(v,mx){const t=Math.min(v/mx,1);let r,g,b;if(t<.25){r=0;g=Math.round(255*(t/.25));b=255;}else if(t<.5){r=0;g=255;b=Math.round(255*(1-(t-.25)/.25));}else if(t<.75){r=Math.round(255*((t-.5)/.25));g=255;b=0;}else{r=255;g=Math.round(255*(1-(t-.75)/.25));b=0;}return`rgb(${r},${g},${b})`;}
function vortColor(v,mx){const t=Math.max(-1,Math.min(1,v/mx));if(t>0)return`rgb(255,${Math.round(255*(1-t))},${Math.round(255*(1-t))})`;const s=-t;return`rgb(${Math.round(255*(1-s))},${Math.round(255*(1-s))},255)`;}
function presColor(v,mn,mx){const t=Math.min(1,Math.max(0,(v-mn)/(mx-mn+1e-10)));return`rgb(${Math.round(68+t*185)},${Math.round(1+t*230)},${Math.round(84+(0.5-Math.abs(t-0.5))*2*66)})`;}

function WedgeCFDTab(){
  const NX=200,NY=60,WX=Math.floor(NX*.35),WH=25,WHW=4;
  const[tipR,setTipR]=useState(2);
  const[uIn,setUIn]=useState(0.08);
  const[fl,setFl]=useState("water");
  const[vm,setVm]=useState("velocity");
  const[run,setRun]=useState(false);
  const[steps,setSteps]=useState(0);
  const[cmp,setCmp]=useState(false);
  const cvRef=useRef(null),cv2Ref=useRef(null),slvRef=useRef(null),slv2Ref=useRef(null),animR=useRef(null),stpR=useRef(0);

  const phys=useMemo(()=>{const L=.01,wh=(WH/NY)*L,fp=FLUIDS[fl],Re=.5*wh/fp.kinViscosity;return{Re:Re.toFixed(0)};},[fl,tipR]);
  const phys2=useMemo(()=>{if(!cmp)return null;const of=fl==="water"?"oil":"water",L=.01,wh=(WH/NY)*L,fp=FLUIDS[of],Re=.5*wh/fp.kinViscosity;return{Re:Re.toFixed(0)};},[cmp,fl,tipR]);
  const getOm=useCallback(fk=>1/(3*(fk==="water"?.02:.15)+.5),[]);
  const initS=useCallback(fk=>{const m=buildWedge(NX,NY,WX,WH,WHW,tipR);return createLBM(NX,NY,getOm(fk),uIn,m);},[tipR,uIn,getOm]);

  const reset=useCallback(()=>{setRun(false);if(animR.current)cancelAnimationFrame(animR.current);slvRef.current=initS(fl);if(cmp)slv2Ref.current=initS(fl==="water"?"oil":"water");stpR.current=0;setSteps(0);},[initS,fl,cmp]);
  useEffect(()=>{reset();},[tipR,uIn,fl,cmp]);

  const renderCV=useCallback((cv,slv)=>{
    if(!cv||!slv)return;const ctx=cv.getContext("2d"),img=ctx.createImageData(NX,NY);
    let mxV=0,mxW=0,mnP=1e9,mxP=-1e9;
    for(let i=0;i<NX*NY;i++){const v=Math.sqrt(slv.ux[i]**2+slv.uy[i]**2);if(v>mxV)mxV=v;const w=Math.abs(slv.vorticity[i]);if(w>mxW)mxW=w;const p=slv.rho[i]/3;if(p<mnP)mnP=p;if(p>mxP)mxP=p;}
    if(mxV<1e-10)mxV=.1;if(mxW<1e-10)mxW=.01;
    const sm=buildWedge(NX,NY,WX,WH,WHW,tipR);
    for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){const i=y*NX+x,pi=i*4;
      if(sm[i]){img.data[pi]=40;img.data[pi+1]=40;img.data[pi+2]=50;img.data[pi+3]=255;continue;}
      let cs;if(vm==="velocity")cs=velColor(Math.sqrt(slv.ux[i]**2+slv.uy[i]**2),mxV*.8);else if(vm==="vorticity")cs=vortColor(slv.vorticity[i],mxW*.5);else cs=presColor(slv.rho[i]/3,mnP,mxP);
      const mt=cs.match(/\d+/g);img.data[pi]=+mt[0];img.data[pi+1]=+mt[1];img.data[pi+2]=+mt[2];img.data[pi+3]=255;}
    const tc=document.createElement("canvas");tc.width=NX;tc.height=NY;tc.getContext("2d").putImageData(img,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(tc,0,0,cv.width,cv.height);
  },[vm,tipR]);

  useEffect(()=>{if(!run)return;const loop=()=>{const s=slvRef.current,s2=slv2Ref.current;if(!s)return;for(let i=0;i<15;i++){s.step();if(cmp&&s2)s2.step();}stpR.current+=15;setSteps(stpR.current);renderCV(cvRef.current,s);if(cmp&&s2)renderCV(cv2Ref.current,s2);animR.current=requestAnimationFrame(loop);};animR.current=requestAnimationFrame(loop);return()=>{if(animR.current)cancelAnimationFrame(animR.current);};},[run,renderCV,cmp]);
  useEffect(()=>{if(slvRef.current&&cvRef.current)renderCV(cvRef.current,slvRef.current);if(cmp&&slv2Ref.current&&cv2Ref.current)renderCV(cv2Ref.current,slv2Ref.current);},[renderCV,cmp,steps]);

  const dp=useMemo(()=>{const s=slvRef.current;if(!s||steps<10)return{d1:0,d2:0};const m=buildWedge(NX,NY,WX,WH,WHW,tipR);let pI=0,pO=0,cI=0,cO=0;for(let y=1;y<NY-1;y++){if(!m[y*NX+5]){pI+=s.rho[y*NX+5]/3;cI++;}if(!m[y*NX+NX-6]){pO+=s.rho[y*NX+NX-6]/3;cO++;}}const d1=cI>0&&cO>0?pI/cI-pO/cO:0;let d2=0;if(cmp&&slv2Ref.current){const s2=slv2Ref.current;let p2I=0,p2O=0,c2I=0,c2O=0;for(let y=1;y<NY-1;y++){if(!m[y*NX+5]){p2I+=s2.rho[y*NX+5]/3;c2I++;}if(!m[y*NX+NX-6]){p2O+=s2.rho[y*NX+NX-6]/3;c2O++;}}d2=c2I>0&&c2O>0?p2I/c2I-p2O/c2O:0;}return{d1,d2};},[steps,cmp,tipR]);

  const cW=800,cH=Math.round(cW*NY/NX),ofk=fl==="water"?"oil":"water";

  return(
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg, ${C.hi}, ${C.card})`,border:`1px solid ${C.accentDim}`}}>
        <h2 className="text-2xl font-bold mb-1" style={{color:C.accent}}>Wedge Flow CFD — Lattice-Boltzmann D2Q9</h2>
        <p className="text-sm" style={{color:C.textDim}}>관 내 wedge 장애물 주위 유동 · 속도장/와도/압력 시각화 · 물 vs 오일 비교</p>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs block mb-1" style={{color:C.textDim}}>Tip Radius (곡률반경)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0.5} max={8} step={0.5} value={tipR} onChange={e=>setTipR(+e.target.value)} className="flex-1" style={{accentColor:"#3b82f6"}}/>
              <span className="text-sm font-bold" style={{color:C.accent,minWidth:50,textAlign:"right"}}>R={tipR}px</span>
            </div>
            <div className="text-xs mt-1" style={{color:C.textDim}}>~{((tipR/NY)*10).toFixed(2)} mm</div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{color:C.textDim}}>Inlet Velocity (LBM)</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0.02} max={0.15} step={0.01} value={uIn} onChange={e=>setUIn(+e.target.value)} className="flex-1" style={{accentColor:"#3b82f6"}}/>
              <span className="text-sm font-bold" style={{color:C.accent,minWidth:40,textAlign:"right"}}>{uIn.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{color:C.textDim}}>Primary Fluid</label>
            <div className="flex gap-2 mt-1">
              {Object.entries(FLUIDS).map(([k,fp])=>(
                <button key={k} onClick={()=>setFl(k)} className="flex-1 py-1.5 rounded-lg text-xs font-bold"
                  style={{background:fl===k?`${fp.color}22`:"transparent",color:fl===k?fp.color:C.textDim,border:`1px solid ${fl===k?fp.color:C.border}`}}>{fp.nameKr}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[{k:"velocity",l:"→ 속도장"},{k:"vorticity",l:"↻ 와도"},{k:"pressure",l:"◉ 압력"}].map(m=>(
              <button key={m.k} onClick={()=>setVm(m.k)} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{background:vm===m.k?C.accent:C.bg,color:vm===m.k?C.bg:C.textDim}}>{m.l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs flex items-center gap-1" style={{color:C.textDim}}>
              <input type="checkbox" checked={cmp} onChange={e=>setCmp(e.target.checked)} style={{accentColor:C.warm}}/>비교모드
            </label>
            <button onClick={()=>setRun(!run)} className="px-4 py-1.5 rounded-lg text-xs font-bold"
              style={{background:run?C.danger:C.success,color:"#fff"}}>{run?"■ STOP":"▶ RUN"}</button>
            <button onClick={reset} className="px-3 py-1.5 rounded-lg text-xs"
              style={{background:"transparent",color:C.textDim,border:`1px solid ${C.border}`}}>↺ RESET</button>
          </div>
        </div>

        {/* Canvas */}
        <div className="rounded-lg overflow-hidden mb-2" style={{background:"#000",border:`1px solid ${FLUIDS[fl].color}33`}}>
          <div className="relative">
            <canvas ref={cvRef} width={cW} height={cH} style={{display:"block",width:"100%",imageRendering:"pixelated"}}/>
            <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold" style={{background:"rgba(0,0,0,.7)",color:FLUIDS[fl].color}}>
              {FLUIDS[fl].nameKr} · Re ≈ {phys.Re}
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs" style={{background:"rgba(0,0,0,.7)",color:C.textDim}}>t = {steps}</div>
          </div>
        </div>

        {cmp&&(<div className="rounded-lg overflow-hidden mb-2" style={{background:"#000",border:`1px solid ${FLUIDS[ofk].color}33`}}>
          <div className="relative">
            <canvas ref={cv2Ref} width={cW} height={cH} style={{display:"block",width:"100%",imageRendering:"pixelated"}}/>
            <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold" style={{background:"rgba(0,0,0,.7)",color:FLUIDS[ofk].color}}>
              {FLUIDS[ofk].nameKr} · Re ≈ {phys2?.Re||"—"}
            </div>
          </div>
        </div>)}

        {/* Color bar */}
        <div className="flex items-center gap-2 my-3">
          <span className="text-xs" style={{color:C.textDim}}>LOW</span>
          <div className="flex-1 h-2 rounded-full" style={{background:vm==="velocity"?"linear-gradient(90deg,#0000ff,#00ffff,#00ff00,#ffff00,#ff0000)":vm==="vorticity"?"linear-gradient(90deg,#0000ff,#ffffff,#ff0000)":"linear-gradient(90deg,#440154,#31688e,#35b779,#fde725)"}}/>
          <span className="text-xs" style={{color:C.textDim}}>HIGH</span>
          <span className="text-xs ml-2" style={{color:C.textDim}}>{vm==="velocity"?"|u| (속도)":vm==="vorticity"?"ω (와도)":"p (압력)"}</span>
        </div>

        {/* Metrics */}
        <div className={`grid gap-3 ${cmp?"grid-cols-2":"grid-cols-4"}`}>
          {cmp?(<>
            <div className="p-3 rounded-lg" style={{background:C.bg,border:`1px solid ${FLUIDS[fl].color}33`}}>
              <div className="text-xs font-bold mb-2" style={{color:FLUIDS[fl].color}}>{FLUIDS[fl].nameKr}</div>
              <div className="flex justify-between text-xs"><span style={{color:C.textDim}}>Re</span><span style={{color:C.text}}>{phys.Re}</span></div>
              <div className="flex justify-between text-xs"><span style={{color:C.textDim}}>ΔP</span><span style={{color:C.text}}>{dp.d1.toExponential(3)}</span></div>
              <div className="flex justify-between text-xs"><span style={{color:C.textDim}}>ν</span><span style={{color:C.text}}>{FLUIDS[fl].kinViscosity.toExponential(1)}</span></div>
            </div>
            <div className="p-3 rounded-lg" style={{background:C.bg,border:`1px solid ${FLUIDS[ofk].color}33`}}>
              <div className="text-xs font-bold mb-2" style={{color:FLUIDS[ofk].color}}>{FLUIDS[ofk].nameKr}</div>
              <div className="flex justify-between text-xs"><span style={{color:C.textDim}}>Re</span><span style={{color:C.text}}>{phys2?.Re||"—"}</span></div>
              <div className="flex justify-between text-xs"><span style={{color:C.textDim}}>ΔP</span><span style={{color:C.text}}>{dp.d2.toExponential(3)}</span></div>
              <div className="flex justify-between text-xs"><span style={{color:C.textDim}}>ν</span><span style={{color:C.text}}>{FLUIDS[ofk].kinViscosity.toExponential(1)}</span></div>
            </div>
          </>):(<>
            {[{l:"Reynolds",v:phys.Re,c:"#60a5fa"},{l:"ΔP (LBM)",v:dp.d1.toExponential(3),c:C.warm},{l:"Tip R",v:`${((tipR/NY)*10).toFixed(2)} mm`,c:C.success},{l:"ν (m²/s)",v:FLUIDS[fl].kinViscosity.toExponential(1),c:C.purple}].map((m,i)=>(
              <div key={i} className="p-3 rounded-lg text-center" style={{background:C.bg}}>
                <div className="text-xs" style={{color:C.textDim}}>{m.l}</div>
                <div className="text-lg font-bold" style={{color:m.c}}>{m.v}</div>
              </div>))}</>)}
        </div>
      </div>

      {/* Physics notes */}
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
        <h3 className="font-bold mb-3" style={{color:"#60a5fa"}}>◈ 시뮬레이션 노트</h3>
        <div className="space-y-2 text-sm" style={{color:C.text,lineHeight:1.7}}>
          <p><strong style={{color:C.accent}}>Lattice-Boltzmann Method (D2Q9)</strong>: BGK 충돌 연산자 + Zou-He 입구 경계조건. 격자 {NX}×{NY}, wedge 높이 {WH}px.</p>
          <p><strong style={{color:C.warm}}>Tip Radius 효과</strong>: 곡률반경 ↓(날카로움 ↑) → 유동 분리 급격화 → 하류 강한 와류(vortex shedding) + 큰 압력 손실. Part 1 오리피스 해석의 연장선!</p>
          <p><strong style={{color:C.success}}>물 vs 오일</strong>: 물(ν≈8.9×10⁻⁷) → Re 높음 → 난류 전이 빠름, 강한 에디. 오일(ν≈1×10⁻⁴) → Re ~100배 낮음 → 층류 유지, 점성 전단 ΔP은 더 클 수 있음.</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════
export default function Week3App() {
  const [tab, setTab] = useState("overview");

  const render = () => {
    switch (tab) {
      case "overview":   return <OverviewTab />;
      case "momentum":   return <MomentumTab />;
      case "reynolds":   return <ReynoldsTab />;
      case "laminar":    return <LaminarTab />;
      case "friction":   return <FrictionTab />;
      case "simulation": return <SimulationTab />;
      case "cfd":        return <WedgeCFDTab />;
      case "practice":   return <PracticeTab />;
      case "industry":   return <IndustryTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
        * { font-family: 'Noto Sans KR', sans-serif; box-sizing: border-box; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: white; cursor: pointer; border: 2px solid #0a0f1e; }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold" style={{ color: C.accent }}>화공유체역학</h1>
              <p className="text-xs" style={{ color: C.textDim }}>Week 3 · Momentum Balance & Fluid Friction · SKKU SPMDL</p>
            </div>
            <div className="text-right text-xs" style={{ color: C.textDim }}>
              <div>Prof. S. Joon Kwon</div>
              <div style={{ color: C.warm }}>3주차 학습 도우미</div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
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
        <p className="mt-1" style={{ color: C.accentDim }}>화공유체역학 Week 3 학습 도우미 · 2025 Spring</p>
      </footer>
    </div>
  );
}
