// src/components/sims/ReynoldsDecompositionSim.jsx
// Interactive: time-averaged velocity v̄ + fluctuation v′
// Demonstrates ⟨v′⟩ = 0 and how the RMS controls turbulence intensity I = v'_rms / v̄

import React, { useMemo, useState, useEffect, useRef } from "react";

const LABELS = {
  en: {
    title: "1.1 Reynolds Decomposition — Live Signal",
    desc:
      "Adjust the mean v̄, RMS of the fluctuation v′, and dominant eddy frequency. The running time-average converges to v̄ and the average fluctuation converges to zero.",
    mean: "Mean v̄ [m/s]",
    rms: "Fluctuation RMS √⟨v′²⟩ [m/s]",
    freq: "Dominant eddy frequency [Hz]",
    window: "Averaging window T [s]",
    intensity: "Turbulence intensity I = v′_rms / v̄",
    legend: ["instantaneous v(t)", "mean v̄", "running ⟨v⟩_T"],
    runavg: "running ⟨v⟩_T",
  },
  kr: {
    title: "1.1 Reynolds 분해 — 실시간 신호",
    desc:
      "평균 v̄, 변동의 RMS √⟨v′²⟩, 지배 와류 진동수를 조정해 보라. 실행 평균은 v̄로 수렴하고 변동의 평균은 0으로 수렴한다.",
    mean: "평균 v̄ [m/s]",
    rms: "변동 RMS √⟨v′²⟩ [m/s]",
    freq: "지배 와류 진동수 [Hz]",
    window: "평균화 윈도우 T [s]",
    intensity: "난류 강도 I = v′_rms / v̄",
    legend: ["순간 v(t)", "평균 v̄", "실행 ⟨v⟩_T"],
    runavg: "실행 ⟨v⟩_T",
  },
};

export default function ReynoldsDecompositionSim({ lang = "en" }) {
  const L = LABELS[lang];
  const [vbar, setVbar] = useState(2.0);
  const [rms, setRms] = useState(0.3);
  const [freq, setFreq] = useState(5);
  const [T, setT] = useState(2.0);

  const N = 600;
  const dt = 0.02;

  // Pre-compute a pseudo-random fluctuation: sum of three sinusoids with random phases
  // (deterministic so the plot is stable when only sliders change)
  const phases = useMemo(() => [0.7, 2.1, 4.3], []);
  const harmonics = useMemo(() => [1.0, 0.6, 0.35], []);
  const data = useMemo(() => {
    const xs = [];
    const v = [];
    const vprime = [];
    for (let i = 0; i < N; i++) {
      const t = i * dt;
      // synthetic v' constructed so its long-term RMS ≈ rms
      const raw =
        harmonics[0] * Math.sin(2 * Math.PI * freq * t + phases[0]) +
        harmonics[1] * Math.sin(2 * Math.PI * freq * 2.3 * t + phases[1]) +
        harmonics[2] * Math.sin(2 * Math.PI * freq * 0.7 * t + phases[2]);
      // RMS of the unscaled sum = sqrt(0.5 * (1 + 0.36 + 0.1225))
      const scale = rms / Math.sqrt(0.5 * (1 + 0.36 + 0.1225));
      const vp = raw * scale;
      vprime.push(vp);
      v.push(vbar + vp);
      xs.push(t);
    }
    // Running average over window T
    const W = Math.max(2, Math.round(T / dt));
    const run = [];
    let sum = 0;
    for (let i = 0; i < N; i++) {
      sum += v[i];
      if (i >= W) sum -= v[i - W];
      const w = Math.min(i + 1, W);
      run.push(sum / w);
    }
    return { xs, v, vprime, run };
  }, [vbar, rms, freq, T, harmonics, phases]);

  // Plot
  const w = 700,
    h = 280,
    padL = 60,
    padR = 20,
    padT = 20,
    padB = 40;
  const tmax = N * dt;
  const vmin = vbar - 3 * rms - 0.2;
  const vmax = vbar + 3 * rms + 0.2;
  const sx = (t) =>
    padL + ((w - padL - padR) * t) / tmax;
  const sy = (val) =>
    padT + ((h - padT - padB) * (vmax - val)) / (vmax - vmin);

  const pathV = data.xs
    .map((t, i) => `${i === 0 ? "M" : "L"}${sx(t).toFixed(1)},${sy(data.v[i]).toFixed(1)}`)
    .join(" ");
  const pathRun = data.xs
    .map((t, i) => `${i === 0 ? "M" : "L"}${sx(t).toFixed(1)},${sy(data.run[i]).toFixed(1)}`)
    .join(" ");

  const I = vbar > 1e-6 ? rms / vbar : 0;

  return (
    <div className="sim-card">
      <h3>{L.title}</h3>
      <p className="sim-desc">{L.desc}</p>

      <div className="sim-controls">
        <Slider label={L.mean} value={vbar} min={0.5} max={5} step={0.05} onChange={setVbar} />
        <Slider label={L.rms} value={rms} min={0.0} max={1.0} step={0.01} onChange={setRms} />
        <Slider label={L.freq} value={freq} min={1} max={20} step={0.5} onChange={setFreq} />
        <Slider label={L.window} value={T} min={0.05} max={5} step={0.05} onChange={setT} />
        <div className="readout">
          {L.intensity}: <strong>{(I * 100).toFixed(1)}%</strong>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="sim-svg">
        {/* Axes */}
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#333" />
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="#333" />

        {/* Mean line v̄ */}
        <line
          x1={padL}
          y1={sy(vbar)}
          x2={w - padR}
          y2={sy(vbar)}
          stroke="#d32f2f"
          strokeWidth={2}
          strokeDasharray="6,4"
        />
        {/* Signal v(t) */}
        <path d={pathV} fill="none" stroke="#1976d2" strokeWidth={1.2} opacity={0.85} />
        {/* Running average */}
        <path d={pathRun} fill="none" stroke="#2e7d32" strokeWidth={2} />

        {/* Axis labels */}
        <text x={(padL + w - padR) / 2} y={h - 8} textAnchor="middle" fontSize="12">
          t [s]
        </text>
        <text
          x={15}
          y={(padT + h - padB) / 2}
          fontSize="12"
          transform={`rotate(-90 15 ${(padT + h - padB) / 2})`}
          textAnchor="middle"
        >
          v [m/s]
        </text>

        {/* Tick labels */}
        <text x={padL} y={h - padB + 14} fontSize="10" textAnchor="middle">0</text>
        <text x={w - padR} y={h - padB + 14} fontSize="10" textAnchor="middle">{tmax.toFixed(1)}</text>
        <text x={padL - 5} y={sy(vmin) + 4} fontSize="10" textAnchor="end">{vmin.toFixed(1)}</text>
        <text x={padL - 5} y={sy(vmax) + 4} fontSize="10" textAnchor="end">{vmax.toFixed(1)}</text>
        <text x={padL - 5} y={sy(vbar) + 4} fontSize="10" textAnchor="end" fill="#d32f2f">
          v̄ = {vbar.toFixed(2)}
        </text>
      </svg>

      <div className="legend">
        <span className="dot" style={{ background: "#1976d2" }}></span> {L.legend[0]} &nbsp;&nbsp;
        <span className="dot" style={{ background: "#d32f2f" }}></span> {L.legend[1]} &nbsp;&nbsp;
        <span className="dot" style={{ background: "#2e7d32" }}></span> {L.legend[2]}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="slider">
      <span>{label}: <strong>{value.toFixed(2)}</strong></span>
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
