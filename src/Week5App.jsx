import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const Sub = ({ children }) => <sub className="text-xs">{children}</sub>;
const Sup = ({ children }) => <sup className="text-xs">{children}</sup>;

const C = {
  bg: "#060b18", card: "#0f1729", accent: "#ec4899", accentDim: "#be185d",
  cyan: "#06b6d4", cyanDim: "#0e7490", green: "#22c55e", danger: "#ef4444",
  purple: "#a78bfa", orange: "#f97316", text: "#e2e8f0", textDim: "#94a3b8",
  border: "#1a2744", hi: "#1e1b4b",
};

const TABS = [
  { id: "overview", label: "📋 개요", short: "개요" },
  { id: "drag", label: "🎯 항력계수", short: "C_D" },
  { id: "shot", label: "🏭 Shot Tower", short: "Shot" },
  { id: "pbr", label: "⚗️ 충전층 (PBR)", short: "PBR" },
  { id: "distill", label: "🔬 증류탑", short: "증류" },
  { id: "sediment", label: "🌊 침강", short: "침강" },
  { id: "practice", label: "✏️ 연습문제", short: "문제" },
  { id: "industry", label: "🏭 산업응용", short: "응용" },
];

const G = 9.81;
function cdSphere(Re) { if (Re <= 0) return 1e4; return (24 / Re) * (1 + 0.173 * Math.pow(Re, 0.657)) + 0.413 / (1 + 16300 * Math.pow(Re, -1.09)); }
function termVel(D, rS, rF, mu) { let ut = .01, CD; for (let i = 0; i < 200; i++) { CD = cdSphere(rF * ut * D / mu); const un = Math.sqrt(4 * G * D * Math.abs(rS - rF) / (3 * rF * CD)); if (Math.abs(un - ut) < 1e-9) break; ut = .5 * ut + .5 * un; } CD = cdSphere(rF * ut * D / mu); return { ut, CD, Re: rF * ut * D / mu }; }
function ergunDP(u0, L, Dp, eps, rho, mu) { const Re = rho * u0 * Dp / (mu * (1 - eps)), v = 150 * mu * u0 * L * (1 - eps) ** 2 / (Dp * Dp * eps ** 3), ii = 1.75 * rho * u0 * u0 * L * (1 - eps) / (Dp * eps ** 3); return { dP: v + ii, Re, visc: v, inert: ii }; }
function darcyK(Dp, eps) { return Dp * Dp * eps ** 3 / (150 * (1 - eps) ** 2); }
function archNum(D, rS, rF, mu) { return G * rF * D ** 3 * Math.abs(rS - rF) / (mu * mu); }
function rzN(Re) { if (Re < .2) return 4.65; if (Re < 1) return 4.35 * Math.pow(Re, -.03); if (Re < 500) return 4.45 * Math.pow(Re, -.1); return 2.39; }

// ═══════════════ OVERVIEW ═══════════════
function OverviewTab() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-3" style={{ color: C.accent }}>Week 5 — Fluid Friction & Drag in Chemical Engineering</h2>
        <p style={{ color: C.text, lineHeight: 1.8 }}>
          이번 주는 <strong style={{ color: C.accent }}>항력(drag force)</strong>과 <strong style={{ color: C.cyan }}>항력계수 C<Sub>D</Sub></strong>의 정의에서 출발하여,
          <strong style={{ color: C.green }}> Stokes-Einstein 관계</strong>, 구형도(sphericity)에 따른 C<Sub>D</Sub> 변화, vortex shedding을 학습합니다.
          이를 <strong style={{ color: C.orange }}>충전층 반응기(PBR)</strong>의 Ergun 방정식과 Darcy's law,
          <strong style={{ color: C.purple }}> 증류탑 트레이 수력학</strong>(Francis weir formula),
          그리고 <strong style={{ color: C.danger }}>콜로이드 침강</strong>(Richardson-Zaki PDE)에 응용합니다.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: "🎯", title: "항력계수 C_D", desc: "Drag equation, C_D vs Re, sphericity, BL separation", color: C.accent },
          { icon: "🏭", title: "Shot Tower", desc: "u(t)=b(e^at−1)/(e^at+1), 종단속도, Ar 수", color: C.orange },
          { icon: "⚗️", title: "충전층 (PBR)", desc: "Ergun eq., Darcy's law (κ), pore model, 여과", color: C.cyan },
          { icon: "🔬", title: "증류탑", desc: "Francis weir, downcomer head, tray spacing", color: C.purple },
          { icon: "🌊", title: "콜로이드 침강", desc: "Richardson-Zaki: u=u_t·εⁿ, PDE (FDM)", color: C.green },
          { icon: "🔧", title: "Stokes-Einstein", desc: "D = k_BT/(6πηr), 확산계수", color: C.danger },
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
            { eq: "F_d = ρu²C_D·A / 2", label: "Drag equation", c: C.accent },
            { eq: "C_D = 24/Re  (Stokes, Re<1)", label: "Stokes 영역", c: C.cyan },
            { eq: "u_t = √(4gD|ρ_s−ρ_f| / 3ρ_fC_D)", label: "종단 속도", c: C.orange },
            { eq: "Ar = gρ_fD³|ρ_s−ρ_f| / μ²", label: "Archimedes 수", c: C.purple },
            { eq: "−ΔP·D_p·ε³/(ρu₀²L(1−ε)) = 150/Re + 1.75", label: "Ergun", c: C.cyan },
            { eq: "u₀ = −(κ/η)(dp/dx), κ = D_p²ε³/150(1−ε)²", label: "Darcy", c: C.accent },
            { eq: "d = (9L²/8gC_D²W²)^(1/3)", label: "Francis weir", c: C.purple },
            { eq: "u = u_t·εⁿ (2.39 ≤ n ≤ 4.65)", label: "Richardson-Zaki", c: C.danger },
            { eq: "D = k_BT/(6πηr)", label: "Stokes-Einstein", c: C.green },
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

// ═══════════════ DRAG ═══════════════
function DragTab() {
  const ref = useRef(null);
  const [hRe, setHRe] = useState(100);
  const [psi, setPsi] = useState(1.0);
  const CDat = cdSphere(hRe) * (psi < .99 ? 1 / (psi * psi) : 1);

  useEffect(() => {
    const cv = ref.current; if (!cv) return; const ctx = cv.getContext("2d");
    const W = cv.width = 560, H = cv.height = 340; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const p = { l: 55, r: 15, t: 15, b: 40 };
    const lrMin = -2, lrMax = 7, lcMin = -1.5, lcMax = 5;
    const xP = lr => p.l + (lr - lrMin) / (lrMax - lrMin) * (W - p.l - p.r);
    const yP = lc => p.t + (lcMax - lc) / (lcMax - lcMin) * (H - p.t - p.b);
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = .5;
    for (let lr = -2; lr <= 7; lr++) { ctx.beginPath(); ctx.moveTo(xP(lr), p.t); ctx.lineTo(xP(lr), H - p.b); ctx.stroke(); }
    for (let lc = -1; lc <= 5; lc++) { ctx.beginPath(); ctx.moveTo(p.l, yP(lc)); ctx.lineTo(W - p.r, yP(lc)); ctx.stroke(); }
    ctx.fillStyle = C.textDim; ctx.font = "10px monospace"; ctx.textAlign = "center";
    for (let lr = -1; lr <= 7; lr += 2) ctx.fillText(`10^${lr}`, xP(lr), H - p.b + 15);
    ctx.fillText("Re", W / 2, H - 5); ctx.textAlign = "right";
    for (let lc = 0; lc <= 4; lc++) ctx.fillText(`10^${lc}`, p.l - 6, yP(lc) + 4);
    ctx.beginPath(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5;
    for (let i = 0; i <= 500; i++) { const lr = lrMin + (i / 500) * (lrMax - lrMin); const cd = cdSphere(Math.pow(10, lr)); if (cd < .01) continue; const lc = Math.log10(cd); if (lc < lcMin || lc > lcMax) continue; i === 0 ? ctx.moveTo(xP(lr), yP(lc)) : ctx.lineTo(xP(lr), yP(lc)); }
    ctx.stroke(); ctx.fillStyle = C.cyan; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "left"; ctx.fillText("sphere", xP(5), yP(Math.log10(cdSphere(1e5))) - 8);
    ctx.beginPath(); ctx.strokeStyle = `${C.textDim}55`; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    for (let i = 0; i <= 200; i++) { const lr = lrMin + (i / 200) * 3; const lc = Math.log10(24) - lr; if (lc > lcMax) continue; i === 0 ? ctx.moveTo(xP(lr), yP(lc)) : ctx.lineTo(xP(lr), yP(lc)); }
    ctx.stroke(); ctx.setLineDash([]);
    if (psi < .99) { const f = 1 / (psi * psi); ctx.beginPath(); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); for (let i = 0; i <= 500; i++) { const lr = lrMin + (i / 500) * (lrMax - lrMin); const cd = cdSphere(Math.pow(10, lr)) * f; if (cd < .01) continue; const lc = Math.log10(cd); if (lc < lcMin || lc > lcMax) continue; i === 0 ? ctx.moveTo(xP(lr), yP(lc)) : ctx.lineTo(xP(lr), yP(lc)); } ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.orange; ctx.fillText(`ψ=${psi.toFixed(2)}`, xP(5), yP(Math.log10(cdSphere(1e5) * f)) - 8); }
    const logH = Math.log10(hRe), lhCD = Math.log10(CDat);
    if (lhCD >= lcMin && lhCD <= lcMax) { ctx.beginPath(); ctx.arc(xP(logH), yP(lhCD), 5, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.beginPath(); ctx.arc(xP(logH), yP(lhCD), 3, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill(); ctx.fillStyle = C.accent; ctx.font = "bold 10px sans-serif"; ctx.fillText(`C_D=${CDat < 1 ? CDat.toFixed(3) : CDat.toFixed(2)}`, xP(logH) + 8, yP(lhCD) - 6); }
    ctx.font = "9px sans-serif"; ctx.fillStyle = `${C.textDim}88`; ctx.textAlign = "center"; ctx.fillText("Stokes", xP(-1), p.t + 12); ctx.fillText("Transition", xP(1.5), p.t + 12); ctx.fillText("Newton", xP(4), p.t + 12); ctx.fillText("BL sep.", xP(5.7), p.t + 12);
  }, [hRe, psi, CDat]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>항력계수 C<Sub>D</Sub> & Drag Equation</h2>
        <p className="text-sm" style={{ color: C.textDim }}>F<Sub>d</Sub> = ρu²C<Sub>D</Sub>A/2 — 유체가 물체에 가하는 저항력</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.cyan}33` }}>
          <h3 className="font-bold mb-2" style={{ color: C.cyan }}>Drag equation 유도</h3>
          <div className="space-y-2 text-sm" style={{ color: C.text }}>
            <p>Stokes: F<Sub>d</Sub> = 6πηru → Drag eq: F<Sub>d</Sub> = ρu²C<Sub>D</Sub>πr²/2</p>
            <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>→ C<Sub>D</Sub> = 24η/(ρuD) = <strong style={{ color: C.cyan }}>24/Re</strong> (Stokes)</div>
            <p className="text-xs" style={{ color: C.textDim }}>Re&lt;1: 24/Re, 1~10³: 18Re⁻⁰·⁶, 10³~2×10⁵: ≈0.44</p>
          </div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.green}33` }}>
          <h3 className="font-bold mb-2" style={{ color: C.green }}>구형도 (Sphericity) ψ</h3>
          <div className="space-y-2 text-sm" style={{ color: C.text }}>
            <p>ψ = π<Sup>1/3</Sup>(6V<Sub>P</Sub>)<Sup>2/3</Sup> / A<Sub>P</Sub></p>
            <div className="grid grid-cols-2 gap-1 text-xs mt-2">
              {[["Sphere", 1], ["Cylinder", .874], ["Hemisphere", .840], ["Cone", .794], ["Torus", .894]].map(([n, v], i) => (
                <div key={i} className="flex justify-between p-1 rounded" style={{ background: C.bg }}><span>{n}</span><span style={{ color: C.green }}>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>📊 Interactive C<Sub>D</Sub> vs Re</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="text-xs block mb-1" style={{ color: C.textDim }}>Re</label><input type="range" min={-2} max={6} step={.01} value={Math.log10(hRe)} onChange={e => setHRe(Math.pow(10, +e.target.value))} className="w-full" style={{ accentColor: C.accent }} /><div className="text-xs font-mono mt-1" style={{ color: C.accent }}>Re = {hRe < 1e4 ? hRe.toFixed(hRe < 1 ? 3 : 0) : hRe.toExponential(2)}</div></div>
          <div><label className="text-xs block mb-1" style={{ color: C.textDim }}>Sphericity ψ</label><input type="range" min={.1} max={1} step={.01} value={psi} onChange={e => setPsi(+e.target.value)} className="w-full" style={{ accentColor: C.green }} /><div className="text-xs font-mono mt-1" style={{ color: C.green }}>ψ = {psi.toFixed(2)}</div></div>
        </div>
        <canvas ref={ref} className="w-full rounded-lg" style={{ maxWidth: 560 }} />
        <div className="flex gap-4 mt-3 p-3 rounded-lg" style={{ background: C.bg }}>
          <div className="text-center flex-1"><div className="text-xs" style={{ color: C.textDim }}>C<Sub>D</Sub></div><div className="text-xl font-bold" style={{ color: C.accent }}>{CDat < 1 ? CDat.toFixed(4) : CDat.toFixed(2)}</div></div>
          <div className="text-center flex-1"><div className="text-xs" style={{ color: C.textDim }}>유동 영역</div><div className="text-sm font-bold" style={{ color: hRe < 1 ? C.cyan : hRe < 1e3 ? C.green : hRe < 2e5 ? C.orange : C.danger }}>{hRe < 1 ? "Stokes" : hRe < 1e3 ? "Transition" : hRe < 2e5 ? "Newton" : "BL sep."}</div></div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-2" style={{ color: C.purple }}>Vortex Shedding & BL Separation</h3>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.7 }}>Re~10⁵에서 경계층 난류 전이 → <strong style={{ color: C.accent }}>C<Sub>D</Sub> 급감</strong>(drag crisis). 축구공 dimple, BASF Sharkskin Technology.</p>
      </div>
    </div>
  );
}

// ═══════════════ SHOT TOWER ═══════════════
function ShotTab() {
  const [D, setD] = useState(.002); const [rS, setRS] = useState(7800); const [rF, setRF] = useState(1.2); const [mu, setMu] = useState(1.8e-5);
  const r = useMemo(() => termVel(D, rS, rF, mu), [D, rS, rF, mu]);
  const Ar = useMemo(() => archNum(D, rS, rF, mu), [D, rS, rF, mu]);
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.orange }}>Shot Tower — 중력 낙하와 종단 속도</h2>
        <p className="text-sm" style={{ color: C.textDim }}>ρ<Sub>S</Sub> ≫ ρ<Sub>f</Sub> 근사에서의 비선형 ODE → 해석해</p>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.cyan }}>핵심 유도</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}><div>g − cu² = du/dt,  c ≡ 3ρ<Sub>f</Sub>C<Sub>D</Sub>/(2ρ<Sub>S</Sub>D)</div></div>
          <div className="p-2 rounded font-mono text-xs" style={{ background: `${C.orange}15` }}><div style={{ color: C.orange }}>u(t) = b·(e<Sup>at</Sup>−1)/(e<Sup>at</Sup>+1),  a=2√(gc), b=√(g/c)=u<Sub>t</Sub></div></div>
          <p className="text-xs" style={{ color: C.textDim }}>짧은 시간: x ≈ gt²/2 − cg²t⁴/12.  탑 높이: H = (1/2c)[2log((e<Sup>at_fin</Sup>+1)/2)−at<Sub>fin</Sub>]</p>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>🧮 종단 속도 계산기</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[{ l: "D (m)", v: D, s: setD, st: .0001 }, { l: "ρ_s", v: rS, s: setRS, st: 10 }, { l: "ρ_f", v: rF, s: setRF, st: .1 }, { l: "μ (Pa·s)", v: mu, s: setMu, st: 1e-6 }].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.l}</label><input type="number" value={p.v} step={p.st} onChange={e => p.s(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[{ l: "u_t", v: r.ut < .01 ? r.ut.toExponential(3) : r.ut.toFixed(4), u: "m/s", c: C.accent }, { l: "C_D", v: r.CD < 1 ? r.CD.toFixed(4) : r.CD.toFixed(2), c: C.cyan }, { l: "Re", v: r.Re < 1 ? r.Re.toFixed(3) : Math.round(r.Re).toLocaleString(), c: C.green }, { l: "Ar", v: Ar < 100 ? Ar.toFixed(1) : Math.round(Ar).toLocaleString(), c: C.orange }].map((m, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: C.bg }}><div className="text-xs" style={{ color: C.textDim }}>{m.l}</div><div className="text-lg font-bold" style={{ color: m.c }}>{m.v}</div>{m.u && <div className="text-xs" style={{ color: C.textDim }}>{m.u}</div>}</div>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-2" style={{ color: C.green }}>📌 산업 적용</h3>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.7 }}>Prilling(요소·유황), Spray drying(우유·커피·세제), Shot peening(강), Granulation tower, Nuclear fuel pellet(UO₂).</p>
      </div>
    </div>
  );
}

// ═══════════════ PBR + FLOW FIELD SIMULATOR ═══════════════
function PBRTab() {
  const [u0, sU] = useState(.02); const [L, sL] = useState(2); const [Dp, sD] = useState(.003); const [eps, sE] = useState(.4); const [rho, sR] = useState(998); const [mu, sM] = useState(.001);
  const r = useMemo(() => ergunDP(u0, L, Dp, eps, rho, mu), [u0, L, Dp, eps, rho, mu]);
  const bk = r.dP > 0 ? r.visc / r.dP * 100 : 0;
  const kappa = darcyK(Dp, eps);
  // ── PBR Flow Field Canvas ──
  const fRef = useRef(null);
  const [fDp, fSD] = useState(.005); const [fEps, fSE] = useState(.4); const [fPsi, fSP] = useState(1.0); const [fDP, fSDP] = useState(5000); const [fMu, fSM] = useState(.001);
  const fRes = useMemo(() => { const De = fDp * fPsi, k = darcyK(De, fEps), u_ = (k / fMu) * (fDP / 1); return { k, u0: u_, um: u_ / fEps, erg: ergunDP(u_, 1, De, fEps, 998, fMu) }; }, [fDp, fEps, fPsi, fDP, fMu]);

  useEffect(() => {
    const cv = fRef.current; if (!cv) return; const ctx = cv.getContext("2d");
    const W = cv.width = 560, H = cv.height = 240; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const NX = 40, NY = 16, cW = W / NX, cH = H / NY;
    const seed = Math.floor(fDp * 1e4 + fEps * 100 + fPsi * 10);
    const sr = i => { let x = Math.sin(seed * 9301 + i * 49297 + 233280) * 49297; return x - Math.floor(x); };
    const eF = []; for (let j = 0; j < NY; j++) { eF[j] = []; for (let i = 0; i < NX; i++) { const n = (sr(j * NX + i) - .5) * .15; const w = Math.min(j, NY - 1 - j) / (NY / 2); eF[j][i] = Math.max(.15, Math.min(.85, fEps + n + (1 - w) * .08)); } }
    const uF = []; let uMax = 0;
    for (let j = 0; j < NY; j++) { uF[j] = []; for (let i = 0; i < NX; i++) { uF[j][i] = (darcyK(fDp * fPsi, eF[j][i]) / fMu) * (fDP / 1); if (uF[j][i] > uMax) uMax = uF[j][i]; } }
    if (!uMax) uMax = 1;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const pN = 1 - i / (NX - 1); ctx.fillStyle = `rgba(${Math.round(55 + 200 * pN)},${Math.round(90 + 80 * (1 - pN))},${Math.round(220 - 180 * pN)},.45)`; ctx.fillRect(i * cW, j * cH, cW + .5, cH + .5); }
    const pR = Math.max(1.5, Math.min(6, cW * (1 - fEps) * .5));
    ctx.fillStyle = "rgba(255,255,255,.35)";
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const np = Math.round((1 - eF[j][i]) * 2.5); for (let p = 0; p < np; p++) { ctx.beginPath(); ctx.arc(i * cW + sr(j * NX * 3 + i * 3 + p) * cW, j * cH + sr(j * NX * 3 + i * 3 + p + 1000) * cH, pR * (fPsi < .9 ? .7 + .3 * sr(p * i + j) : 1), 0, Math.PI * 2); ctx.fill(); } }
    for (let j = 1; j < NY - 1; j += 2) for (let i = 1; i < NX - 1; i += 3) {
      const uN = uF[j][i] / uMax, len = uN * cW * 2;
      const cx = i * cW + cW / 2, cy = j * cH + cH / 2;
      const ang = (eF[Math.min(j + 1, NY - 1)][i] - eF[Math.max(j - 1, 0)][i]) * 2;
      const ex = cx + len * Math.cos(ang), ey = cy + len * Math.sin(ang);
      ctx.strokeStyle = `hsla(${Math.round(220 - 180 * uN)},${80 + 20 * uN}%,55%,.8)`; ctx.lineWidth = 1 + uN * 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
      const hl = 2.5 + uN * 2.5, ha = Math.atan2(ey - cy, ex - cx);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ha - .4), ey - hl * Math.sin(ha - .4)); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ha + .4), ey - hl * Math.sin(ha + .4)); ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("유입 →", 30, H - 4); ctx.fillText("→ 유출", W - 40, H - 4);
  }, [fDp, fEps, fPsi, fDP, fMu]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.cyan }}>충전층 반응기 (PBR) — Ergun & Darcy</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>Pore Model 유도</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}>a<Sub>v</Sub> = 6/D<Sub>p</Sub>,  D<Sub>e</Sub> = 4ε/((1−ε)a<Sub>v</Sub>),  u<Sub>m</Sub> = u₀/ε</div>
          <div className="p-2 rounded font-mono text-xs" style={{ background: `${C.cyan}15`, color: C.cyan }}>Ergun: −ΔP·D<Sub>p</Sub>·ε³/(ρu₀²L(1−ε)) = 150/Re + 1.75</div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.green }}>🧮 Ergun ΔP 계산기</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[{ l: "u₀ (m/s)", v: u0, s: sU, st: .001 }, { l: "L (m)", v: L, s: sL, st: .1 }, { l: "D_p (m)", v: Dp, s: sD, st: .0005 }, { l: "ε", v: eps, s: sE, st: .01 }, { l: "ρ (kg/m³)", v: rho, s: sR, st: 1 }, { l: "μ (Pa·s)", v: mu, s: sM, st: .0001 }].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.l}</label><input type="number" value={p.v} step={p.st} onChange={e => p.s(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>))}
        </div>
        <div className="grid grid-cols-4 gap-3 mb-3">
          {[{ l: "−ΔP", v: r.dP < 1e3 ? r.dP.toFixed(1) : (r.dP / 1e3).toFixed(2), u: r.dP < 1e3 ? "Pa" : "kPa", c: C.accent }, { l: "Re_p", v: r.Re < 1 ? r.Re.toFixed(3) : r.Re.toFixed(1), c: C.cyan }, { l: "κ (m²)", v: kappa.toExponential(2), c: C.green }, { l: "Viscous", v: bk.toFixed(1) + "%", c: C.purple }].map((m, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: C.bg }}><div className="text-xs" style={{ color: C.textDim }}>{m.l}</div><div className="text-lg font-bold" style={{ color: m.c }}>{m.v}</div>{m.u && <div className="text-xs" style={{ color: C.textDim }}>{m.u}</div>}</div>))}
        </div>
        <div className="h-5 flex rounded overflow-hidden" style={{ border: `1px solid ${C.border}` }}><div style={{ width: `${bk}%`, background: C.cyan, transition: "width .3s" }} /><div style={{ flex: 1, background: C.orange }} /></div>
        <div className="flex justify-between text-xs mt-1" style={{ color: C.textDim }}><span>Blake-Kozeny (점성)</span><span>Burke-Plummer (관성)</span></div>
      </div>
      {/* ── PBR Flow Field Simulator ── */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.accent}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.accent }}>🔬 유동장 시뮬레이터 — Darcy's Law</h3>
        <p className="text-xs mb-3" style={{ color: C.textDim }}>화살표 = 국소 Darcy 유속, 배경 = 압력장 (파랑=고압). Wall effect 반영.</p>
        <canvas ref={fRef} className="w-full rounded-lg" style={{ maxWidth: 560 }} />
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div><label className="text-xs block mb-1" style={{ color: C.textDim }}>D_p (m)</label><input type="range" min={-3.3} max={-1.5} step={.01} value={Math.log10(fDp)} onChange={e => fSD(Math.pow(10, +e.target.value))} className="w-full" style={{ accentColor: C.accent }} /><span className="text-xs font-mono" style={{ color: C.accent }}>{fDp.toFixed(4)}</span></div>
          <div><label className="text-xs block mb-1" style={{ color: C.textDim }}>ε</label><input type="range" min={.2} max={.75} step={.01} value={fEps} onChange={e => fSE(+e.target.value)} className="w-full" style={{ accentColor: C.green }} /><span className="text-xs font-mono" style={{ color: C.green }}>{fEps.toFixed(2)}</span></div>
          <div><label className="text-xs block mb-1" style={{ color: C.textDim }}>ψ (sphericity)</label><input type="range" min={.3} max={1} step={.01} value={fPsi} onChange={e => fSP(+e.target.value)} className="w-full" style={{ accentColor: C.orange }} /><span className="text-xs font-mono" style={{ color: C.orange }}>{fPsi.toFixed(2)}</span></div>
        </div>
        <div className="flex gap-3 mt-2 p-2 rounded-lg" style={{ background: C.bg }}>
          <div className="text-center flex-1"><div className="text-xs" style={{ color: C.textDim }}>u₀</div><div className="text-sm font-bold" style={{ color: C.accent }}>{fRes.u0 < .01 ? fRes.u0.toExponential(2) : fRes.u0.toFixed(4)} m/s</div></div>
          <div className="text-center flex-1"><div className="text-xs" style={{ color: C.textDim }}>κ</div><div className="text-sm font-bold" style={{ color: C.green }}>{fRes.k.toExponential(2)} m²</div></div>
          <div className="text-center flex-1"><div className="text-xs" style={{ color: C.textDim }}>Re<Sub>p</Sub></div><div className="text-sm font-bold" style={{ color: C.cyan }}>{fRes.erg.Re < 1 ? fRes.erg.Re.toFixed(3) : fRes.erg.Re.toFixed(1)}</div></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.purple}33` }}><h3 className="font-bold mb-2" style={{ color: C.purple }}>Darcy's Law</h3><div className="p-2 rounded font-mono text-xs" style={{ background: C.bg, color: C.purple }}>u₀ = −(κ/η)(dp/dx)</div><p className="text-sm mt-2" style={{ color: C.text }}>Re~1 극한. κ=D<Sub>p</Sub>²ε³/150(1−ε)².</p></div>
        <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.danger}33` }}><h3 className="font-bold mb-2" style={{ color: C.danger }}>여과 (Filtration)</h3><p className="text-sm" style={{ color: C.text }}>L(t)∝√t, V<Sub>filtrate</Sub>∝√t. 정압 여과.</p></div>
      </div>
    </div>
  );
}

// ═══════════════ DISTILLATION + TRAY SCHEMATIC ═══════════════
function DistillTab() {
  const [Lf, sLf] = useState(.005); const [Ww, sWw] = useState(.5); const [Dw, sDw] = useState(.05); const [dl, sDl] = useState(.025); const [cd, sCd] = useState(.62);
  const d = Math.pow(9 * Lf * Lf / (8 * G * cd * cd * Ww * Ww), 1 / 3);
  const vD = Lf / (Ww * dl), hV = vD * vD / (2 * G), h = d + Dw + hV;
  const H_ = Math.max(h + d + Dw, 2 * (d + Dw) + hV);
  // ── Tray schematic canvas ──
  const tRef = useRef(null);
  useEffect(() => {
    const cv = tRef.current; if (!cv) return; const ctx = cv.getContext("2d");
    const W = cv.width = 480, H = cv.height = 300; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const cL = 60, cR = 340, tY1 = 80, tY2 = 220, dcW = 50;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cL, 10); ctx.lineTo(cL, H - 10); ctx.moveTo(cR, 10); ctx.lineTo(cR, H - 10); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = "#64748b";
    ctx.beginPath(); ctx.moveTo(cL, tY1); ctx.lineTo(cR - dcW, tY1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cL + dcW, tY2); ctx.lineTo(cR, tY2); ctx.stroke();
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cR - dcW, tY1); ctx.lineTo(cR - dcW, tY2 + 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cL + dcW, 10); ctx.lineTo(cL + dcW, tY1 + 15); ctx.stroke();
    const wH = Math.min(30, Dw * 500);
    ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cR - dcW - 4, tY1); ctx.lineTo(cR - dcW - 4, tY1 - wH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cL + dcW + 4, tY2); ctx.lineTo(cL + dcW + 4, tY2 - wH); ctx.stroke();
    const lH = wH + Math.min(18, d * 800);
    ctx.fillStyle = "rgba(6,182,212,.2)";
    ctx.fillRect(cL + 1, tY1 - lH, cR - dcW - 5 - cL, lH);
    ctx.fillRect(cL + dcW + 5, tY2 - lH, cR - cL - dcW - 6, lH);
    const dcLH = Math.min(tY2 - tY1 - 5, h * 600);
    ctx.fillStyle = "rgba(6,182,212,.35)";
    ctx.fillRect(cR - dcW + 1, tY1, dcW - 2, dcLH);
    ctx.fillStyle = "rgba(249,115,22,.35)";
    for (let bx = cL + 25; bx < cR - dcW - 8; bx += 22) for (let by = tY1 - lH + 4; by < tY1 - 2; by += 10) { ctx.beginPath(); ctx.arc(bx + (Math.random() - .5) * 6, by, 2.5 + Math.random() * 2.5, 0, Math.PI * 2); ctx.fill(); }
    for (let bx = cL + dcW + 25; bx < cR - 8; bx += 22) for (let by = tY2 - lH + 4; by < tY2 - 2; by += 10) { ctx.beginPath(); ctx.arc(bx + (Math.random() - .5) * 6, by, 2.5 + Math.random() * 2.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.textDim; ctx.font = "10px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`H=${(H_ * 1e3).toFixed(0)}mm`, cR + 10, (tY1 + tY2) / 2);
    ctx.fillStyle = C.orange; ctx.fillText(`d=${(d * 1e3).toFixed(1)}mm`, cR - dcW - 50, tY1 - wH - 6);
    ctx.fillStyle = C.cyan; ctx.fillText(`h=${(h * 1e3).toFixed(1)}mm`, cR - dcW + 3, tY1 + dcLH / 2);
    ctx.fillStyle = "rgba(249,115,22,.6)"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("증기 ↑", (cL + cR - dcW) / 2, tY1 + 45);
    ctx.fillStyle = C.cyan; ctx.fillText("액체 ↓", cR - dcW / 2, tY2 + 12);
  }, [d, h, H_, Dw]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.purple }}>증류탑 트레이 수력학</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.cyan }}>핵심 유도</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <div className="p-2 rounded font-mono text-xs" style={{ background: `${C.purple}15`, color: C.purple }}>d = (9L²/(8gC<Sub>D</Sub>²W²))<Sup>1/3</Sup></div>
          <div className="p-2 rounded font-mono text-xs" style={{ background: C.bg }}><strong style={{ color: C.accent }}>H = 2(d+D) + L²/(2gW²δ²)</strong></div>
        </div>
      </div>
      {/* ── Tray Schematic ── */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.purple}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.purple }}>🔬 트레이 단면 시뮬레이터</h3>
        <p className="text-xs mb-3" style={{ color: C.textDim }}>파라미터 변경 시 증기 버블, 액체 수위, downcomer head가 실시간 갱신됩니다.</p>
        <canvas ref={tRef} className="w-full rounded-lg" style={{ maxWidth: 480 }} />
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>🧮 트레이 설계 계산기</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[{ l: "유량 L (m³/s)", v: Lf, s: sLf, st: .001 }, { l: "Weir 폭 W (m)", v: Ww, s: sWw, st: .01 }, { l: "Weir 높이 D (m)", v: Dw, s: sDw, st: .005 }, { l: "DC gap δ (m)", v: dl, s: sDl, st: .001 }, { l: "C_D", v: cd, s: sCd, st: .01 }].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.l}</label><input type="number" value={p.v} step={p.st} onChange={e => p.s(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[{ l: "깊이 d", v: (d * 1e3).toFixed(1), u: "mm", c: C.purple }, { l: "DC head h", v: (h * 1e3).toFixed(1), u: "mm", c: C.cyan }, { l: "Tray H", v: (H_ * 1e3).toFixed(1), u: "mm", c: C.accent }, { l: "v_DC", v: vD.toFixed(3), u: "m/s", c: C.green }].map((m, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: C.bg }}><div className="text-xs" style={{ color: C.textDim }}>{m.l}</div><div className="text-lg font-bold" style={{ color: m.c }}>{m.v}</div><div className="text-xs" style={{ color: C.textDim }}>{m.u}</div></div>))}
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}><h3 className="font-bold mb-2" style={{ color: C.orange }}>📌 Fractional Distillation</h3><p className="text-sm" style={{ color: C.text, lineHeight: 1.7 }}>원유: Butane → Gasoline → Naphtha → Kerosene → Diesel → Fuel Oil → Residue. McCabe-Thiele, Aspen HYSYS.</p></div>
    </div>
  );
}

// ═══════════════ SEDIMENTATION + PDE ANIMATION ═══════════════
function SedimentTab() {
  const [Dp, sD] = useState(.001); const [rS, sRS] = useState(2500); const [mu, sM] = useState(.001); const [e0, sE0] = useState(.7);
  const { ut, Re: ReP } = useMemo(() => termVel(Dp, rS, 1000, mu), [Dp, rS, mu]);
  const nRZ = rzN(ReP);
  // ── PDE solver ──
  const NZ = 200, zMax = .5, dz = zMax / NZ;
  const [time, setTime] = useState(0); const [playing, setPlaying] = useState(false);
  const animRef = useRef(null); const profRef = useRef(null); const sRef = useRef(null);

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

  // draw
  useEffect(() => {
    const cv = sRef.current; if (!cv || !profRef.current) return; const ctx = cv.getContext("2d");
    const W = cv.width = 560, H = cv.height = 280; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const pr = profRef.current, fi = Math.min(Math.round(time * (pr.length - 1)), pr.length - 1), p = pr[fi];
    const vX = 20, vW = 100, vY = 10, vH = H - 25;
    const pX = 160, pW = W - 180, pY = 10, pH = H - 25;
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5; ctx.strokeRect(vX, vY, vW, vH);
    for (let i = 0; i <= NZ; i++) { const y = vY + (i / NZ) * vH; const sf = 1 - p.eps[i]; const I = Math.min(1, sf * 3); ctx.fillStyle = `rgba(180,200,230,${.05 + I * .8})`; ctx.fillRect(vX + 1, y, vW - 2, vH / NZ + .5); }
    ctx.fillStyle = "rgba(212,83,126,.6)";
    for (let i = 0; i < 60; i++) { const zF = Math.random(); const zI = Math.floor(zF * NZ); const sf = 1 - (p.eps[zI] || e0); if (Math.random() < sf * 2) { ctx.beginPath(); ctx.arc(vX + 4 + Math.random() * (vW - 8), vY + zF * vH, 1.5 + sf * 2, 0, Math.PI * 2); ctx.fill(); } }
    ctx.fillStyle = C.textDim; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText(`t=${p.t.toFixed(1)}s`, vX + vW / 2, H - 3);
    // plot
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pX, pY); ctx.lineTo(pX, pY + pH); ctx.lineTo(pX + pW, pY + pH); ctx.stroke();
    ctx.fillStyle = C.textDim; ctx.font = "9px monospace"; ctx.textAlign = "center";
    for (let e = 0; e <= 1; e += .2) ctx.fillText(e.toFixed(1), pX + e * pW, pY + pH + 12);
    ctx.fillText("ε", pX + pW / 2, H - 1);
    ctx.beginPath(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
    for (let i = 0; i <= NZ; i++) { const x = pX + Math.max(0, Math.min(1, p.eps[i])) * pW, y = pY + (i / NZ) * pH; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = `${C.textDim}44`; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.moveTo(pX + e0 * pW, pY); ctx.lineTo(pX + e0 * pW, pY + pH); ctx.stroke(); ctx.setLineDash([]);
    // ghost
    [.1, .3, .6].map(f => Math.round(f * (pr.length - 1))).filter(gi => gi < fi).forEach(gi => {
      ctx.beginPath(); ctx.strokeStyle = "rgba(6,182,212,.15)"; ctx.lineWidth = 1;
      for (let i = 0; i <= NZ; i++) { const x = pX + Math.max(0, Math.min(1, pr[gi].eps[i])) * pW, y = pY + (i / NZ) * pH; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    });
  }, [time, NZ, e0]);

  useEffect(() => {
    if (!playing) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    let last = performance.now();
    const tick = now => { setTime(prev => { const n = prev + (now - last) / 1000 * .4; last = now; if (n >= 1) { setPlaying(false); return 1; } return n; }); animRef.current = requestAnimationFrame(tick); };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing]);

  const tMax = profRef.current ? profRef.current[profRef.current.length - 1].t : 1;
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.green }}>콜로이드 침강 & Richardson-Zaki</h2>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.cyan }}>유도 과정</h3>
        <div className="space-y-2 text-sm" style={{ color: C.text }}>
          <p>u<Sub>eff</Sub> = u(1−ε), Richardson-Zaki: u = u<Sub>t</Sub>·ε<Sup>n</Sup></p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
            {[["Re<0.2", "n=4.65"], ["0.2<Re<1", "n=4.35Re⁻⁰·⁰³"], ["1<Re<500", "n=4.45Re⁻⁰·¹"], ["Re>500", "n=2.39"]].map(([k, v], i) => (
              <div key={i} className="p-2 rounded" style={{ background: C.bg }}><span style={{ color: C.accent }}>{k}: </span><span style={{ color: C.green }}>{v}</span></div>))}
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.danger}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.danger }}>시공간 PDE</h3>
        <div className="p-3 rounded font-mono text-xs text-center" style={{ background: `${C.danger}15`, color: C.danger }}>u<Sub>t</Sub>ε<Sup>n−1</Sup>[n−(n+1)ε] ∂ε/∂z + ∂ε/∂t = 0</div>
      </div>
      {/* ── PDE Animation ── */}
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.green}33` }}>
        <h3 className="font-bold mb-2" style={{ color: C.green }}>🔬 침강 PDE 시뮬레이터 (FDM Upwind)</h3>
        <p className="text-xs mb-3" style={{ color: C.textDim }}>왼쪽: 용기 내 농도. 오른쪽: ε(z) 프로파일. ▶ 버튼으로 시간 진행.</p>
        <canvas ref={sRef} className="w-full rounded-lg" style={{ maxWidth: 560 }} />
        <div className="flex gap-2 mt-3 items-center">
          <button onClick={() => setPlaying(!playing)} className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: C.green, color: C.bg }}>{playing ? "⏸" : "▶ Play"}</button>
          <button onClick={() => { setPlaying(false); setTime(0); }} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: C.bg, color: C.textDim, border: `1px solid ${C.border}` }}>Reset</button>
          <input type="range" min={0} max={1} step={.005} value={time} onChange={e => { setPlaying(false); setTime(+e.target.value); }} className="flex-1" style={{ accentColor: C.green }} />
          <span className="text-xs font-mono" style={{ color: C.green }}>{(time * tMax).toFixed(1)}s</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div><label className="text-xs block mb-1" style={{ color: C.textDim }}>D_p (m)</label><input type="range" min={-4} max={-2} step={.01} value={Math.log10(Dp)} onChange={e => { sD(Math.pow(10, +e.target.value)); setTime(0); setPlaying(false); }} className="w-full" style={{ accentColor: C.accent }} /><span className="text-xs font-mono" style={{ color: C.accent }}>{Dp.toFixed(4)}</span></div>
          <div><label className="text-xs block mb-1" style={{ color: C.textDim }}>ε₀ (초기 공극률)</label><input type="range" min={.5} max={.95} step={.01} value={e0} onChange={e => { sE0(+e.target.value); setTime(0); setPlaying(false); }} className="w-full" style={{ accentColor: C.green }} /><span className="text-xs font-mono" style={{ color: C.green }}>{e0.toFixed(2)}</span></div>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: C.accent }}>🧮 침강 파라미터</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[{ l: "D_p (m)", v: Dp, s: sD, st: .0001 }, { l: "ρ_s (kg/m³)", v: rS, s: sRS, st: 10 }, { l: "μ (Pa·s)", v: mu, s: sM, st: .0001 }].map((p, i) => (
            <div key={i}><label className="text-xs block mb-1" style={{ color: C.textDim }}>{p.l}</label><input type="number" value={p.v} step={p.st} onChange={e => { p.s(+e.target.value); setTime(0); setPlaying(false); }} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} /></div>))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[{ l: "u_t", v: ut < .01 ? ut.toExponential(2) : ut.toFixed(4), u: "m/s", c: C.accent }, { l: "Re", v: ReP < 1 ? ReP.toFixed(3) : ReP.toFixed(1), c: C.cyan }, { l: "n (R-Z)", v: nRZ.toFixed(2), c: C.green }, { l: "영역", v: ReP < .2 ? "Stokes" : ReP < 500 ? "Trans." : "Newton", c: C.orange }].map((m, i) => (
            <div key={i} className="p-3 rounded-lg text-center" style={{ background: C.bg }}><div className="text-xs" style={{ color: C.textDim }}>{m.l}</div><div className="text-lg font-bold" style={{ color: m.c }}>{m.v}</div>{m.u && <div className="text-xs" style={{ color: C.textDim }}>{m.u}</div>}</div>))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ PRACTICE ═══════════════
function PracticeTab() {
  const [cur, setCur] = useState(0); const [sel, setSel] = useState(null); const [show, setShow] = useState(false);
  const qs = [
    { q: "C_D = 24/Re가 성립하는 유동 영역은?", o: ["Re < 1 (Stokes)", "1 < Re < 10³", "10³ < Re < 2×10⁵", "Re > 2×10⁵"], a: 0, e: "Stokes 영역(Re<1)에서 C_D=24/Re." },
    { q: "Archimedes 수 Ar의 정의는?", o: ["gρ_fD³|ρ_s−ρ_f|/μ²", "gρ_sD²/μ", "Re²·C_D", "ρ_fgD/μ"], a: 0, e: "Ar=gρ_fD³|ρ_s−ρ_f|/μ²." },
    { q: "Ergun에서 Re≫1일 때 지배항은?", o: ["Blake-Kozeny(150/Re)", "Burke-Plummer(1.75)", "둘 다 동일", "Darcy's law"], a: 1, e: "Re≫1 → Burke-Plummer(관성). ΔP∝u₀²." },
    { q: "Darcy κ의 단위는?", o: ["m²", "Pa·s", "m/s", "무차원"], a: 0, e: "κ=D_p²ε³/150(1−ε)² [m²]." },
    { q: "Francis weir에서 d∝L^?", o: ["L^(2/3)", "L^(1/3)", "L²", "L"], a: 0, e: "d∝L^(2/3)." },
    { q: "R-Z Stokes(Re<0.2) n은?", o: ["2.39", "3.65", "4.65", "1.0"], a: 2, e: "n=4.65(Stokes)." },
    { q: "Shot tower에서 b의 의미는?", o: ["초기속도", "종단속도 u_t", "가속도", "탑 높이"], a: 1, e: "b=√(g/c)=u_t." },
    { q: "구의 sphericity ψ는?", o: ["0.794", "0.874", "0.894", "1.000"], a: 3, e: "구는 ψ=1." },
    { q: "BL separation에 의한 C_D 급감 Re≈?", o: ["1", "10³", "10⁵", "10⁷"], a: 2, e: "Re~10⁵ drag crisis." },
    { q: "D_p를 1/2로 줄이면 κ는?", o: ["1/4", "1/2", "2배", "불변"], a: 0, e: "κ∝D_p². → 1/4." },
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
    { icon: "🏭", title: "Prilling & Shot Tower", f: "Chemical / Metallurgy", c: "용융 액적을 탑에서 자유 낙하 → 구형 고체 입자 대량 생산.", r: "u_t = √(2gDρ_s/(3ρ_fC_D))" },
    { icon: "⚗️", title: "PBR 촉매 반응기", f: "Petrochemical / H₂ / DeNOx", c: "Ergun으로 ΔP 예측. D_p↓→비표면적↑ but ΔP↑↑. κ∝D_p².", r: "Conversion ↑ vs ΔP ↑" },
    { icon: "🔬", title: "증류탑 — 원유 분별", f: "Refinery", c: "McCabe-Thiele로 이론단수, Francis weir로 H. Flooding 방지 핵심.", r: "H = 2(d+D) + L²/(2gW²δ²)" },
    { icon: "🧪", title: "여과 — CMP, 제약, 폐수", f: "Semiconductor / Pharma", c: "Darcy 기반. L∝√t, V∝√t.", r: "V_filtrate ∝ √t" },
    { icon: "🌊", title: "유동층 (FCC, 코팅)", f: "Refinery / Pharma", c: "R-Z로 유동화 속도 결정. FCC는 정유 핵심.", r: "u = u_t·εⁿ" },
    { icon: "🔧", title: "나노입자 DLS 분석", f: "Nanotech / Biotech", c: "Stokes-Einstein D=k_BT/(6πηr)로 DLS 측정.", r: "D = k_BT/(6πηr)" },
  ];
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg,${C.hi},${C.card})`, border: `1px solid ${C.accentDim}` }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.accent }}>화학공학 산업 응용</h2>
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
export default function Week5App() {
  const [tab, setTab] = useState("overview");
  const render = () => { switch (tab) { case "overview": return <OverviewTab />; case "drag": return <DragTab />; case "shot": return <ShotTab />; case "pbr": return <PBRTab />; case "distill": return <DistillTab />; case "sediment": return <SedimentTab />; case "practice": return <PracticeTab />; case "industry": return <IndustryTab />; default: return <OverviewTab />; } };
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
            <div><h1 className="text-lg font-bold" style={{ color: C.accent, fontFamily: "'Outfit',sans-serif" }}>화공유체역학</h1><p className="text-xs" style={{ color: C.textDim }}>Week 5 · Fluid Friction & Drag · SKKU SPMDL</p></div>
            <div className="text-right text-xs" style={{ color: C.textDim }}><div>Prof. S. Joon Kwon</div><div style={{ color: C.accent }}>5주차 학습 도우미</div></div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0" style={{ background: tab === t.id ? C.accent : "transparent", color: tab === t.id ? C.bg : C.textDim, border: `1px solid ${tab === t.id ? C.accent : "transparent"}` }}><span className="hidden md:inline">{t.label}</span><span className="md:hidden">{t.short}</span></button>))}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{render()}</main>
      <footer className="text-center py-6 text-xs" style={{ color: C.textDim, borderTop: `1px solid ${C.border}` }}>
        <p>SKKU 화학공학부 · Smart Process & Materials Design Lab (SPMDL)</p>
        <p className="mt-1" style={{ color: C.accentDim }}>화공유체역학 Week 5 학습 도우미 · 2025 Spring</p>
      </footer>
    </div>
  );
}
