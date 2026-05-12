// src/components/sims/EnergyCascadeSim.jsx
// Plots Pope's model spectrum (Pope, "Turbulent Flows" 2000, eq. 6.246)
// with user-adjustable Re_L and integral scale L; overlays the bands resolved
// by RANS / hybrid / LES / DNS so students see *what each model gives up*.

import React, { useMemo, useState } from "react";

const LABELS = {
  en: {
    title: "1.4 Energy Cascade & Kolmogorov −5/3 Law",
    desc:
      "The model spectrum E(k) = C_K ε^(2/3) k^(−5/3) f_L(kL) f_η(kη) with Pope's roll-off functions. Sliders set the turbulence Reynolds number Re_L = u'L/ν and the integral scale L. The shaded bands show what each computational approach must resolve directly versus model.",
    ReL: "Re_L = u′ L / ν",
    L: "Integral length L [m]",
    bands: ["RANS: all scales modeled", "Hybrid: above wave-marker", "LES: above wave-marker", "DNS: must resolve to η"],
    legend: ["E(k)", "k⁻⁵/³ asymptote", "k_I (integral)", "k_K = 1/η"],
  },
  kr: {
    title: "1.4 에너지 캐스케이드와 Kolmogorov −5/3 법칙",
    desc:
      "모델 스펙트럼 E(k) = C_K ε^(2/3) k^(−5/3) f_L(kL) f_η(kη). 슬라이더로 Re_L = u′L/ν과 적분 척도 L을 조정한다. 음영 영역은 각 수치 기법이 직접 해석해야 하는 범위 vs 모델링해야 하는 범위를 나타낸다.",
    ReL: "Re_L = u′ L / ν",
    L: "적분 길이 L [m]",
    bands: ["RANS: 전 척도 모델링", "Hybrid: 화살표 위", "LES: 화살표 위", "DNS: η까지 해석"],
    legend: ["E(k)", "k⁻⁵/³ 점근선", "k_I (적분)", "k_K = 1/η"],
  },
};

const C_K = 1.5;
const p0 = 2.0;
const beta = 5.2;
const c_L_const = 6.78;
const c_eta = 0.40;

function E_of_k(k, eps, L, eta) {
  const kL = k * L;
  const kEta = k * eta;
  const fL = Math.pow(kL / Math.sqrt(kL * kL + c_L_const), 5.0 / 3.0 + p0);
  const fE = Math.exp(-beta * (Math.pow(Math.pow(kEta, 4) + Math.pow(c_eta, 4), 0.25) - c_eta));
  return C_K * Math.pow(eps, 2.0 / 3.0) * Math.pow(k, -5.0 / 3.0) * fL * fE;
}

export default function EnergyCascadeSim({ lang = "en" }) {
  const L_text = LABELS[lang];
  const [ReL, setReL] = useState(1e5);
  const [Lscale, setLscale] = useState(0.1);

  // From Re_L = u'L/nu and assuming u'^3 / L ~ eps, plus we set u' = 1 m/s for visualization
  // -> nu = u'L/Re_L
  const u_prime = 1.0;
  const eps = Math.pow(u_prime, 3) / Lscale;
  const nu = (u_prime * Lscale) / ReL;
  const eta = Math.pow(Math.pow(nu, 3) / eps, 0.25);
  const kI = 1.0 / Lscale;
  const kK = 1.0 / eta;

  // Build the spectrum on log-k grid
  const N = 400;
  const k_lo = 0.01 * kI;
  const k_hi = 30 * kK;
  const data = useMemo(() => {
    const ks = [];
    const Es = [];
    for (let i = 0; i < N; i++) {
      const lk = Math.log10(k_lo) + ((Math.log10(k_hi) - Math.log10(k_lo)) * i) / (N - 1);
      const k = Math.pow(10, lk);
      ks.push(k);
      Es.push(E_of_k(k, eps, Lscale, eta));
    }
    return { ks, Es };
  }, [ReL, Lscale, eps, eta, k_lo, k_hi]);

  // Plot
  const w = 720,
    h = 360,
    padL = 70,
    padR = 30,
    padT = 30,
    padB = 50;
  const xmin = Math.log10(k_lo),
    xmax = Math.log10(k_hi);
  const Emax = Math.max(...data.Es);
  const Emin = 1e-12 * Emax;
  const ymin = Math.log10(Emin),
    ymax = Math.log10(Emax) + 0.5;
  const sx = (lk) => padL + ((w - padL - padR) * (lk - xmin)) / (xmax - xmin);
  const sy = (lE) => padT + ((h - padT - padB) * (ymax - lE)) / (ymax - ymin);

  const path = data.ks
    .map((k, i) => {
      const X = sx(Math.log10(k));
      const Y = sy(Math.log10(Math.max(Emin, data.Es[i])));
      return `${i === 0 ? "M" : "L"}${X.toFixed(1)},${Y.toFixed(1)}`;
    })
    .join(" ");

  // -5/3 reference line through E at k = 3 kI (decade above integral)
  const k_ref = 3 * kI;
  const E_ref = E_of_k(k_ref, eps, Lscale, eta);
  const refLine = [];
  for (let i = 0; i < 60; i++) {
    const lk = Math.log10(k_ref) - 0.5 + (3.0 * i) / 59;
    const k = Math.pow(10, lk);
    const Eline = E_ref * Math.pow(k / k_ref, -5.0 / 3.0);
    refLine.push([lk, Math.log10(Eline)]);
  }
  const refPath = refLine
    .map(([X, Y], i) => `${i === 0 ? "M" : "L"}${sx(X).toFixed(1)},${sy(Y).toFixed(1)}`)
    .join(" ");

  // Band markers
  // LES cutoff approx at 10 * kI (resolves down to ~10x integral), DNS goes to kK
  const k_LES = 10 * kI;
  const k_RANS = kI / 3; // models everything from large scales down

  return (
    <div className="sim-card">
      <h3>{L_text.title}</h3>
      <p className="sim-desc">{L_text.desc}</p>

      <div className="sim-controls">
        <Slider
          label={L_text.ReL}
          value={ReL}
          min={1e3}
          max={1e8}
          log
          onChange={setReL}
          fmt={(v) => v.toExponential(2)}
        />
        <Slider
          label={L_text.L}
          value={Lscale}
          min={0.001}
          max={1.0}
          log
          step={0.01}
          onChange={setLscale}
          fmt={(v) => v.toExponential(2)}
        />
        <div className="readout">
          η = <strong>{eta.toExponential(2)}</strong> m, &nbsp; L/η ={" "}
          <strong>{(Lscale / eta).toExponential(2)}</strong>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="sim-svg">
        {/* Shaded LES band (between k_LES and kK) */}
        <rect
          x={sx(Math.log10(k_LES))}
          y={padT}
          width={sx(Math.log10(kK)) - sx(Math.log10(k_LES))}
          height={h - padT - padB}
          fill="#1976d2"
          opacity={0.06}
        />
        {/* Shaded "modeled" band for RANS = the whole spectrum */}
        <rect
          x={padL}
          y={padT}
          width={sx(Math.log10(kK)) - padL}
          height={h - padT - padB}
          fill="#d32f2f"
          opacity={0.03}
        />

        {/* axes */}
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#333" />
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="#333" />

        {/* kI marker */}
        <line x1={sx(Math.log10(kI))} y1={padT} x2={sx(Math.log10(kI))} y2={h - padB} stroke="#2e7d32" strokeDasharray="4,3" />
        <text x={sx(Math.log10(kI)) + 4} y={padT + 12} fontSize="11" fill="#2e7d32">k_I</text>
        {/* kK marker */}
        <line x1={sx(Math.log10(kK))} y1={padT} x2={sx(Math.log10(kK))} y2={h - padB} stroke="#7b1fa2" strokeDasharray="4,3" />
        <text x={sx(Math.log10(kK)) - 6} y={padT + 12} fontSize="11" fill="#7b1fa2" textAnchor="end">k_K = 1/η</text>

        {/* spectrum */}
        <path d={path} fill="none" stroke="#1976d2" strokeWidth={2.5} />
        {/* -5/3 line */}
        <path d={refPath} fill="none" stroke="#000" strokeWidth={1.2} strokeDasharray="6,4" />

        {/* axis labels & ticks */}
        <text x={(padL + w - padR) / 2} y={h - 12} textAnchor="middle" fontSize="13">log₁₀ k  [1/m]</text>
        <text
          x={15}
          y={(padT + h - padB) / 2}
          textAnchor="middle"
          fontSize="13"
          transform={`rotate(-90 15 ${(padT + h - padB) / 2})`}
        >
          log₁₀ E(k)
        </text>

        {/* x ticks */}
        {[xmin, (xmin + xmax) / 2, xmax].map((xv, i) => (
          <text
            key={i}
            x={sx(xv)}
            y={h - padB + 16}
            textAnchor="middle"
            fontSize="11"
          >
            {xv.toFixed(1)}
          </text>
        ))}
        {/* y ticks */}
        {[ymin, (ymin + ymax) / 2, ymax].map((yv, i) => (
          <text
            key={i}
            x={padL - 6}
            y={sy(yv) + 4}
            textAnchor="end"
            fontSize="11"
          >
            {yv.toFixed(1)}
          </text>
        ))}

        {/* Band labels */}
        <text x={padL + 8} y={h - padB - 8} fontSize="11" fill="#d32f2f">{L_text.bands[0]}</text>
        <text x={sx(Math.log10(k_LES)) + 4} y={h - padB - 8} fontSize="11" fill="#1976d2">{L_text.bands[2]}</text>
      </svg>

      <p className="callout">
        {lang === "en"
          ? `At Re_L = ${ReL.toExponential(1)}, L/η ≈ ${(Lscale / eta).toExponential(2)}. A DNS in 3D would need ~Re_L^(9/4) ≈ ${Math.pow(ReL, 9 / 4).toExponential(1)} grid–time samples to resolve down to η. That is why everyone except academics runs RANS or LES.`
          : `Re_L = ${ReL.toExponential(1)}일 때 L/η ≈ ${(Lscale / eta).toExponential(2)}. 3D DNS는 η까지 해석하기 위해 약 Re_L^(9/4) ≈ ${Math.pow(ReL, 9 / 4).toExponential(1)} 격자–시간 샘플이 필요하다. 학계 외에는 RANS나 LES를 쓰는 이유이다.`}
      </p>
    </div>
  );
}

function Slider({ label, value, min, max, step, log, onChange, fmt }) {
  const display = fmt ? fmt(value) : value.toFixed(2);
  if (log) {
    const lmin = Math.log10(min),
      lmax = Math.log10(max);
    return (
      <label className="slider">
        <span>{label}: <strong>{display}</strong></span>
        <input
          type="range"
          min={lmin}
          max={lmax}
          step={0.02}
          value={Math.log10(value)}
          onChange={(e) => onChange(Math.pow(10, parseFloat(e.target.value)))}
        />
      </label>
    );
  }
  return (
    <label className="slider">
      <span>{label}: <strong>{display}</strong></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}
