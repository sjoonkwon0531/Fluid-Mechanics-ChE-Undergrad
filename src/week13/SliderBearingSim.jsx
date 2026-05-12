// src/components/sims/SliderBearingSim.jsx
// Solves the 1D Reynolds equation numerically by TDMA and compares against
// the analytical parabolic approximation p(x) ≈ α x(L−x)/(2 h_m³).
// Bottom panel shows the velocity field v_x(x, y) on a colormap, with the
// reverse-flow region (v_x < 0) outlined.
//
// d/dx (h^3/eta · dp/dx) = 6 V dh/dx,   p(0) = p(L) = 0
// v_x(x, y) = yV/h + (1/(2 eta)) (dp/dx) y (y - h)

import React, { useMemo, useState } from "react";

const LABELS = {
  en: {
    title: "2.1 Slider Bearing: Exact vs. Approximate Pressure",
    desc:
      "Solve the Reynolds equation for a linear slider with inlet gap h₁ and outlet gap h₂ < h₁. Compare the exact pressure (TDMA) with the closed-form parabola using h ≈ h_m. The lower panel shows the velocity field; the dashed white curve traces y_C(x) — the locus below which Poiseuille reverses Couette and back-flow occurs.",
    h1: "Inlet gap h₁ [μm]",
    h2: "Outlet gap h₂ [μm]",
    V: "Top-plate speed V [m/s]",
    eta: "Viscosity η [Pa·s]",
    L: "Length L [mm]",
    pmaxExact: "Exact p_max",
    pmaxApprox: "Approx p_max",
    xpeak: "x_peak / L",
    W: "Load capacity W (per unit depth)",
    legend: ["Exact (Reynolds eqn)", "Approx (h≈h_m)"],
    reverse: "reverse-flow boundary y_C",
  },
  kr: {
    title: "2.1 슬라이더 베어링: 정확 vs 근사 압력",
    desc:
      "선형 슬라이더(입구 간극 h₁, 출구 간극 h₂ < h₁)에 대해 Reynolds 방정식을 푼다. TDMA 정확해와 h ≈ h_m 가정의 폐형 포물선 해를 비교한다. 아래 패널은 속도장이며, 흰 점선은 y_C(x) — 이 아래에서 Poiseuille이 Couette을 역전시켜 역류가 발생한다.",
    h1: "입구 간극 h₁ [μm]",
    h2: "출구 간극 h₂ [μm]",
    V: "상판 속도 V [m/s]",
    eta: "점성 η [Pa·s]",
    L: "길이 L [mm]",
    pmaxExact: "정확 p_max",
    pmaxApprox: "근사 p_max",
    xpeak: "x_peak / L",
    W: "단위 깊이당 하중 W",
    legend: ["정확 (Reynolds eqn)", "근사 (h≈h_m)"],
    reverse: "역류 경계 y_C",
  },
};

// TDMA solver for tridiagonal system a*p_{i-1} + b*p_i + c*p_{i+1} = d
function tdma(a, b, c, d) {
  const N = b.length;
  const cp = new Array(N);
  const dp = new Array(N);
  cp[0] = c[0] / b[0];
  dp[0] = d[0] / b[0];
  for (let i = 1; i < N; i++) {
    const m = b[i] - a[i] * cp[i - 1];
    cp[i] = i < N - 1 ? c[i] / m : 0.0;
    dp[i] = (d[i] - a[i] * dp[i - 1]) / m;
  }
  const x = new Array(N);
  x[N - 1] = dp[N - 1];
  for (let i = N - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
  return x;
}

function solveBearing({ h1, h2, V, eta, L, N }) {
  const x = new Array(N).fill(0).map((_, i) => (i * L) / (N - 1));
  const dx = x[1] - x[0];
  const h = x.map((xi) => h1 + ((h2 - h1) * xi) / L);
  const h3 = h.map((hi) => hi ** 3);
  const h3_face = new Array(N - 1).fill(0).map((_, i) => 0.5 * (h3[i] + h3[i + 1]));

  const a = new Array(N).fill(0);
  const b = new Array(N).fill(0);
  const c = new Array(N).fill(0);
  const d = new Array(N).fill(0);
  for (let i = 1; i < N - 1; i++) {
    a[i] = h3_face[i - 1] / (eta * dx * dx);
    c[i] = h3_face[i] / (eta * dx * dx);
    b[i] = -(a[i] + c[i]);
    const dhdx = (h[i + 1] - h[i - 1]) / (2 * dx);
    d[i] = 6 * V * dhdx;
  }
  // Dirichlet BCs
  b[0] = 1;
  d[0] = 0;
  b[N - 1] = 1;
  d[N - 1] = 0;

  const p = tdma(a, b, c, d);

  // dp/dx via central diff for the velocity-field plot
  const dpdx = new Array(N).fill(0);
  for (let i = 1; i < N - 1; i++) dpdx[i] = (p[i + 1] - p[i - 1]) / (2 * dx);
  dpdx[0] = (p[1] - p[0]) / dx;
  dpdx[N - 1] = (p[N - 1] - p[N - 2]) / dx;

  return { x, h, p, dpdx };
}

export default function SliderBearingSim({ lang = "en" }) {
  const T = LABELS[lang];

  const [h1, setH1] = useState(120); // μm
  const [h2, setH2] = useState(60); // μm
  const [V, setV] = useState(1.0); // m/s
  const [eta, setEta] = useState(0.1); // Pa s
  const [L, setL] = useState(50); // mm

  // Convert to SI
  const h1_si = h1 * 1e-6;
  const h2_si = h2 * 1e-6;
  const L_si = L * 1e-3;

  const N = 201;
  const sol = useMemo(
    () => solveBearing({ h1: h1_si, h2: h2_si, V, eta, L: L_si, N }),
    [h1_si, h2_si, V, eta, L_si]
  );

  // Approximate parabolic solution
  const hm = 0.5 * (h1_si + h2_si);
  const dhdx_const = (h2_si - h1_si) / L_si;
  const alpha = -6 * eta * V * dhdx_const;
  const p_approx = sol.x.map((xi) => (alpha * xi * (L_si - xi)) / (2 * hm ** 3));

  const pmax_exact = Math.max(...sol.p);
  const idx_peak = sol.p.indexOf(pmax_exact);
  const pmax_approx = (alpha * L_si * L_si) / (8 * hm ** 3);
  const xpeak = sol.x[idx_peak] / L_si;

  // Load capacity W = integral of p dx
  const dx = sol.x[1] - sol.x[0];
  const W = sol.p.reduce((s, pi) => s + pi * dx, 0);

  // ===== Plot 1: pressure vs x =====
  const w1 = 720,
    h_plot = 240,
    padL = 70,
    padR = 30,
    padT = 20,
    padB = 40;
  const xmax_plot = L_si;
  const ymax_plot = Math.max(pmax_exact, pmax_approx) * 1.1 || 1;
  const sx = (xi) => padL + ((w1 - padL - padR) * xi) / xmax_plot;
  const sy = (yi) => padT + ((h_plot - padT - padB) * (ymax_plot - yi)) / ymax_plot;

  const pathExact = sol.x
    .map((xi, i) => `${i === 0 ? "M" : "L"}${sx(xi).toFixed(1)},${sy(sol.p[i]).toFixed(1)}`)
    .join(" ");
  const pathApprox = sol.x
    .map((xi, i) => `${i === 0 ? "M" : "L"}${sx(xi).toFixed(1)},${sy(p_approx[i]).toFixed(1)}`)
    .join(" ");

  // ===== Plot 2: velocity field heatmap =====
  // Build v_x(x_j, eta_j) on a 60 x 40 grid; eta_j = y/h(x).
  const Nx = 80,
    Ny = 40;
  const grid = useMemo(() => {
    const cells = [];
    let vmin = Infinity,
      vmax = -Infinity;
    for (let ix = 0; ix < Nx; ix++) {
      const xi = (ix * L_si) / (Nx - 1);
      // interpolate h, dpdx, p at xi
      const t = (xi / L_si) * (N - 1);
      const i0 = Math.min(N - 2, Math.floor(t));
      const tt = t - i0;
      const h_i = sol.h[i0] + tt * (sol.h[i0 + 1] - sol.h[i0]);
      const dp_i = sol.dpdx[i0] + tt * (sol.dpdx[i0 + 1] - sol.dpdx[i0]);
      const col = [];
      for (let iy = 0; iy < Ny; iy++) {
        const y = (iy * h_i) / (Ny - 1);
        const vx = (y * V) / h_i + (1.0 / (2 * eta)) * dp_i * y * (y - h_i);
        col.push(vx);
        if (vx < vmin) vmin = vx;
        if (vx > vmax) vmax = vx;
      }
      cells.push({ xi, h: h_i, dpdx: dp_i, col });
    }
    return { cells, vmin, vmax };
  }, [sol, V, eta, L_si]);

  const w2 = 720,
    h2_plot = 220,
    pad2L = 70,
    pad2R = 30,
    pad2T = 20,
    pad2B = 40;
  const hmax = Math.max(h1_si, h2_si);
  const sx2 = (xi) => pad2L + ((w2 - pad2L - pad2R) * xi) / L_si;
  const sy2 = (yv) => pad2T + ((h2_plot - pad2T - pad2B) * (hmax - yv)) / hmax;

  // Color: blue (negative) - white (0) - red (positive)
  const vmax_abs = Math.max(Math.abs(grid.vmin), Math.abs(grid.vmax));
  const colorOf = (v) => {
    const t = Math.max(-1, Math.min(1, v / vmax_abs));
    if (t >= 0) {
      const r = 255;
      const g = Math.round(255 - t * 200);
      const b = Math.round(255 - t * 240);
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(255 + t * 240);
      const g = Math.round(255 + t * 200);
      const b = 255;
      return `rgb(${r},${g},${b})`;
    }
  };

  // Cell rects
  const cellRects = [];
  for (let ix = 0; ix < Nx; ix++) {
    const cell = grid.cells[ix];
    const xi = cell.xi;
    const xnext = ix < Nx - 1 ? grid.cells[ix + 1].xi : L_si + (L_si / (Nx - 1));
    const X = sx2(xi);
    const Xn = sx2(xnext);
    for (let iy = 0; iy < Ny - 1; iy++) {
      const y0 = (iy * cell.h) / (Ny - 1);
      const y1 = ((iy + 1) * cell.h) / (Ny - 1);
      const Y = sy2(y1);
      const Yn = sy2(y0);
      const v_mid = 0.5 * (cell.col[iy] + cell.col[iy + 1]);
      cellRects.push(
        <rect
          key={`${ix}-${iy}`}
          x={X}
          y={Y}
          width={Xn - X + 0.5}
          height={Yn - Y + 0.5}
          fill={colorOf(v_mid)}
        />
      );
    }
  }

  // h(x) outline
  const hPath = grid.cells
    .map((c, i) => `${i === 0 ? "M" : "L"}${sx2(c.xi).toFixed(1)},${sy2(c.h).toFixed(1)}`)
    .join(" ") + ` L ${sx2(L_si).toFixed(1)},${sy2(0).toFixed(1)} L ${sx2(0).toFixed(1)},${sy2(0).toFixed(1)} Z`;

  // y_C(x): locus where v_x = 0 for y < h (reverse-flow boundary), only where dp/dx > 0
  const yC_points = [];
  grid.cells.forEach((c) => {
    if (c.dpdx > 0) {
      // v_x(y) = yV/h + dpdx/(2eta) y(y-h) = 0 => y * [V/h + dpdx/(2eta)(y-h)] = 0
      // nontrivial: V/h + dpdx/(2eta)(y - h) = 0 => y = h - 2 eta V / (h dpdx)
      const yC = c.h - (2 * eta * V) / (c.h * c.dpdx);
      if (yC > 0 && yC < c.h) yC_points.push([c.xi, yC]);
    }
  });
  const yCPath = yC_points
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx2(p[0]).toFixed(1)},${sy2(p[1]).toFixed(1)}`)
    .join(" ");

  return (
    <div className="sim-card">
      <h3>{T.title}</h3>
      <p className="sim-desc">{T.desc}</p>

      <div className="sim-controls grid-controls">
        <Slider label={T.h1} value={h1} min={20} max={300} step={5} onChange={setH1} />
        <Slider label={T.h2} value={h2} min={10} max={250} step={5} onChange={setH2} />
        <Slider label={T.V} value={V} min={0.1} max={5} step={0.05} onChange={setV} />
        <Slider label={T.eta} value={eta} min={0.001} max={1.0} step={0.001} onChange={setEta} />
        <Slider label={T.L} value={L} min={10} max={200} step={5} onChange={setL} />
      </div>

      <div className="sim-readouts">
        <div><span>{T.pmaxExact}:</span> <strong>{pmax_exact.toExponential(3)} Pa</strong></div>
        <div><span>{T.pmaxApprox}:</span> <strong>{pmax_approx.toExponential(3)} Pa</strong></div>
        <div><span>{T.xpeak}:</span> <strong>{xpeak.toFixed(3)}</strong></div>
        <div><span>{T.W}:</span> <strong>{W.toExponential(3)} N/m</strong></div>
      </div>

      {/* Pressure plot */}
      <svg viewBox={`0 0 ${w1} ${h_plot}`} className="sim-svg">
        <line x1={padL} y1={h_plot - padB} x2={w1 - padR} y2={h_plot - padB} stroke="#333" />
        <line x1={padL} y1={padT} x2={padL} y2={h_plot - padB} stroke="#333" />
        <path d={pathApprox} stroke="#9e9e9e" strokeWidth={1.8} strokeDasharray="6,4" fill="none" />
        <path d={pathExact} stroke="#1976d2" strokeWidth={2.4} fill="none" />

        <text x={(padL + w1 - padR) / 2} y={h_plot - 10} textAnchor="middle" fontSize="12">x [m]</text>
        <text x={15} y={(padT + h_plot - padB) / 2} textAnchor="middle" fontSize="12"
              transform={`rotate(-90 15 ${(padT + h_plot - padB) / 2})`}>p [Pa]</text>

        <text x={padL} y={h_plot - padB + 14} fontSize="10" textAnchor="middle">0</text>
        <text x={w1 - padR} y={h_plot - padB + 14} fontSize="10" textAnchor="middle">{L_si.toExponential(2)}</text>
        <text x={padL - 5} y={sy(0) + 4} fontSize="10" textAnchor="end">0</text>
        <text x={padL - 5} y={sy(ymax_plot) + 4} fontSize="10" textAnchor="end">{ymax_plot.toExponential(2)}</text>

        <g transform={`translate(${w1 - 230},${padT + 6})`}>
          <rect width="220" height="44" fill="white" stroke="#ccc" />
          <line x1="8" y1="14" x2="28" y2="14" stroke="#1976d2" strokeWidth="2.5" />
          <text x="34" y="18" fontSize="11">{T.legend[0]}</text>
          <line x1="8" y1="32" x2="28" y2="32" stroke="#9e9e9e" strokeWidth="1.8" strokeDasharray="6,4" />
          <text x="34" y="36" fontSize="11">{T.legend[1]}</text>
        </g>
      </svg>

      {/* Velocity field */}
      <svg viewBox={`0 0 ${w2} ${h2_plot}`} className="sim-svg">
        {/* clip to gap region */}
        <defs>
          <clipPath id="gapClip">
            <path d={hPath} />
          </clipPath>
        </defs>
        <g clipPath="url(#gapClip)">{cellRects}</g>
        {/* gap outline */}
        <path d={hPath} fill="none" stroke="#333" strokeWidth={1.5} />
        {/* y_C curve */}
        <path d={yCPath} fill="none" stroke="white" strokeWidth={2} strokeDasharray="5,4" />

        <text x={(pad2L + w2 - pad2R) / 2} y={h2_plot - 10} textAnchor="middle" fontSize="12">x [m]</text>
        <text x={15} y={(pad2T + h2_plot - pad2B) / 2} textAnchor="middle" fontSize="12"
              transform={`rotate(-90 15 ${(pad2T + h2_plot - pad2B) / 2})`}>y [m]</text>

        {/* color legend */}
        <g transform={`translate(${w2 - 200},${pad2T + 6})`}>
          <rect width="190" height="44" fill="rgba(255,255,255,0.9)" stroke="#ccc" />
          <text x="8" y="18" fontSize="11">v_x: blue &lt; 0 &lt; red</text>
          <line x1="8" y1="34" x2="30" y2="34" stroke="white" strokeWidth="2" strokeDasharray="5,4" />
          <text x="36" y="38" fontSize="11" fill="#333">{T.reverse}</text>
        </g>
      </svg>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="slider">
      <span>{label}: <strong>{value.toFixed(3)}</strong></span>
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
