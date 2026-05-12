// src/components/sims/UniversalVelocityProfileSim.jsx
// Interactive: universal velocity profile (law of the wall).
// User adjusts Reynolds number; sub-layer thickness y+ = 11.63 is fixed,
// but its physical thickness delta_lam/D changes with Re via Blasius correlation.

import React, { useMemo, useState } from "react";

const LABELS = {
  en: {
    title: "1.3 Universal Velocity Profile in Wall Units",
    desc:
      "The mixing-length model collapses all wall-bounded Newtonian turbulence onto v⁺ = f(y⁺). Adjust the pipe Reynolds number to see how the dimensionless sub-layer cap y⁺ ≈ 11.63 corresponds to a shrinking physical δ_lam/D as Re grows.",
    re: "Reynolds number Re",
    showAll: "Show buffer and overlap fits",
    sublayer: "Laminar sub-layer δ_lam/D",
    fanning: "Fanning friction factor f_F (Blasius)",
    captions: {
      visc: "viscous: v⁺ = y⁺",
      log: "log-law: v⁺ = 5.5 + 2.5 ln y⁺",
      buf: "buffer (Spalding fit)",
      crossing: "y⁺ ≈ 11.63 (linear–log crossing)",
    },
  },
  kr: {
    title: "1.3 벽 단위에서의 보편 속도 분포",
    desc:
      "혼합 거리 이론은 모든 Newtonian 벽 부착 난류를 v⁺ = f(y⁺)로 통합한다. Re를 조절하여 무차원 부층 경계 y⁺ ≈ 11.63이 Re 증가에 따라 물리적 δ_lam/D 감소로 나타나는 것을 확인하라.",
    re: "Reynolds 수 Re",
    showAll: "버퍼 및 중첩 영역 표시",
    sublayer: "층류 부층 δ_lam/D",
    fanning: "Fanning 마찰 계수 f_F (Blasius)",
    captions: {
      visc: "점성: v⁺ = y⁺",
      log: "로그: v⁺ = 5.5 + 2.5 ln y⁺",
      buf: "버퍼 (Spalding fit)",
      crossing: "y⁺ ≈ 11.63 (선형–로그 교차점)",
    },
  },
};

export default function UniversalVelocityProfileSim({ lang = "en" }) {
  const L = LABELS[lang];
  const [Re, setRe] = useState(50000);
  const [showFits, setShowFits] = useState(true);

  // Blasius for Re < 1e5, Petukhov for higher Re (smooth handoff)
  const fF = useMemo(() => {
    if (Re < 1e5) return 0.0790 * Math.pow(Re, -0.25);
    // Petukhov: 1/sqrt(f_F) = 1.77 log10(Re sqrt(f_F)) - 0.601
    // approximate via Colebrook-like iteration
    let f = 0.005;
    for (let i = 0; i < 30; i++) {
      const rhs = 1.77 * Math.log10(Re * Math.sqrt(f)) - 0.601;
      const fnew = 1.0 / (rhs * rhs);
      if (Math.abs(fnew - f) < 1e-8) break;
      f = fnew;
    }
    return f;
  }, [Re]);
  const deltaLamD = 16.4 / (Re * Math.sqrt(fF));

  // log10 y+ from 0 to 3.5
  const N = 400;
  const yPlus = useMemo(
    () => new Array(N).fill(0).map((_, i) => Math.pow(10, 0 + (3.5 * i) / (N - 1))),
    []
  );

  // Three pieces
  const viscous = yPlus.map((y) => y);
  const logLaw = yPlus.map((y) => 5.5 + 2.5 * Math.log(y));
  // Spalding's single composite expression (1961) for the whole wall layer
  // y+ = v+ + e^{-kappa B} [ e^{kappa v+} - 1 - kappa v+ - (kappa v+)^2/2 - (kappa v+)^3/6 ]
  // kappa = 0.41, B = 5.0 -> evaluate v+ given y+ by inversion (Newton)
  const kappa = 0.41,
    B = 5.0;
  const spalding = yPlus.map((y) => {
    let vp = y < 5 ? y : 2.5 * Math.log(y) + 5.5;
    for (let k = 0; k < 30; k++) {
      const term = Math.exp(-kappa * B) * (Math.exp(kappa * vp) - 1 - kappa * vp - 0.5 * (kappa * vp) ** 2 - (kappa * vp) ** 3 / 6);
      const F = vp + term - y;
      const dFdvp =
        1 +
        Math.exp(-kappa * B) *
          (kappa * Math.exp(kappa * vp) - kappa - kappa * kappa * vp - 0.5 * kappa ** 3 * vp ** 2);
      const step = F / dFdvp;
      vp -= step;
      if (Math.abs(step) < 1e-8) break;
    }
    return vp;
  });

  // Plot transformations: log axis for y+, linear for v+
  const w = 720,
    h = 380,
    padL = 60,
    padR = 20,
    padT = 20,
    padB = 50;
  const xmin = 0,
    xmax = 3.5; // log10(y+)
  const ymin = 0,
    ymax = 25;
  const sx = (lyp) => padL + ((w - padL - padR) * (lyp - xmin)) / (xmax - xmin);
  const sy = (vp) => padT + ((h - padT - padB) * (ymax - vp)) / (ymax - ymin);

  const pathFrom = (xs, ys) =>
    xs
      .map((x, i) => {
        const lyp = Math.log10(x);
        const X = sx(lyp);
        const Y = sy(Math.min(ymax, Math.max(0, ys[i])));
        return `${i === 0 ? "M" : "L"}${X.toFixed(1)},${Y.toFixed(1)}`;
      })
      .join(" ");

  // Cap viscous and log fits to the regions where they're valid
  const viscPath = pathFrom(
    yPlus.filter((y) => y <= 8),
    yPlus.filter((y) => y <= 8).map((y) => y)
  );
  const logPath = pathFrom(
    yPlus.filter((y) => y >= 20),
    yPlus.filter((y) => y >= 20).map((y) => 5.5 + 2.5 * Math.log(y))
  );
  const spaldingPath = pathFrom(yPlus, spalding);

  // x-axis ticks at 1, 10, 100, 1000
  const xticks = [1, 10, 100, 1000];
  return (
    <div className="sim-card">
      <h3>{L.title}</h3>
      <p className="sim-desc">{L.desc}</p>

      <div className="sim-controls">
        <Slider
          label={L.re}
          value={Re}
          min={4000}
          max={1e6}
          step={1000}
          log
          onChange={setRe}
          fmt={(v) => v.toExponential(2)}
        />
        <label className="slider" style={{ flexBasis: "200px" }}>
          <input
            type="checkbox"
            checked={showFits}
            onChange={(e) => setShowFits(e.target.checked)}
          />
          &nbsp;{L.showAll}
        </label>
        <div className="readout">
          {L.fanning}: <strong>{fF.toExponential(3)}</strong>
        </div>
        <div className="readout">
          {L.sublayer}: <strong>{deltaLamD.toExponential(3)}</strong>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="sim-svg">
        {/* axes */}
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#333" />
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="#333" />

        {/* y+ = 11.63 vertical line */}
        <line
          x1={sx(Math.log10(11.63))}
          y1={padT}
          x2={sx(Math.log10(11.63))}
          y2={h - padB}
          stroke="#2e7d32"
          strokeWidth={2}
          strokeDasharray="4,3"
        />
        <text x={sx(Math.log10(11.63)) + 4} y={padT + 12} fontSize="11" fill="#2e7d32">
          y⁺ = 11.63
        </text>

        {/* Spalding composite */}
        {showFits && (
          <path d={spaldingPath} fill="none" stroke="#9e9e9e" strokeDasharray="3,3" strokeWidth={1.5} />
        )}
        {/* viscous & log */}
        <path d={viscPath} fill="none" stroke="#1976d2" strokeWidth={2.5} />
        <path d={logPath} fill="none" stroke="#d32f2f" strokeWidth={2.5} />

        {/* x ticks */}
        {xticks.map((xv) => (
          <g key={xv}>
            <line
              x1={sx(Math.log10(xv))}
              y1={h - padB}
              x2={sx(Math.log10(xv))}
              y2={h - padB + 5}
              stroke="#333"
            />
            <text
              x={sx(Math.log10(xv))}
              y={h - padB + 18}
              textAnchor="middle"
              fontSize="11"
            >
              {xv}
            </text>
          </g>
        ))}
        {/* y ticks */}
        {[0, 5, 10, 15, 20, 25].map((yv) => (
          <g key={yv}>
            <line x1={padL - 5} y1={sy(yv)} x2={padL} y2={sy(yv)} stroke="#333" />
            <text x={padL - 8} y={sy(yv) + 4} textAnchor="end" fontSize="11">
              {yv}
            </text>
          </g>
        ))}

        <text x={(padL + w - padR) / 2} y={h - 10} textAnchor="middle" fontSize="13">
          y⁺
        </text>
        <text
          x={15}
          y={(padT + h - padB) / 2}
          textAnchor="middle"
          fontSize="13"
          transform={`rotate(-90 15 ${(padT + h - padB) / 2})`}
        >
          v⁺
        </text>

        {/* legend boxes */}
        <g transform={`translate(${w - 220},${padT + 10})`}>
          <rect width="200" height="68" fill="white" stroke="#ccc" />
          <line x1="8" y1="14" x2="28" y2="14" stroke="#1976d2" strokeWidth="2.5" />
          <text x="34" y="18" fontSize="11">{L.captions.visc}</text>
          <line x1="8" y1="34" x2="28" y2="34" stroke="#d32f2f" strokeWidth="2.5" />
          <text x="34" y="38" fontSize="11">{L.captions.log}</text>
          <line
            x1="8"
            y1="54"
            x2="28"
            y2="54"
            stroke="#9e9e9e"
            strokeDasharray="3,3"
            strokeWidth="1.5"
          />
          <text x="34" y="58" fontSize="11">{L.captions.buf}</text>
        </g>
      </svg>
    </div>
  );
}

function Slider({ label, value, min, max, step, log, onChange, fmt }) {
  const display = fmt ? fmt(value) : value.toFixed(2);
  if (log) {
    // operate on log10 of the value for smoother UX
    const lmin = Math.log10(min),
      lmax = Math.log10(max);
    const lv = Math.log10(value);
    return (
      <label className="slider">
        <span>{label}: <strong>{display}</strong></span>
        <input
          type="range"
          min={lmin}
          max={lmax}
          step={0.01}
          value={lv}
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
