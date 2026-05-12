// src/components/sims/CalenderingSim.jsx
// Calendering pressure profile in two counter-rotating rolls.
//
// Geometry:  h(x) = H + x^2/(2R)   (parabolic approximation of  h = R + H - sqrt(R^2 - x^2))
//                = H (1 + alpha x^2),  alpha = 1/(2 H R)
//
// Reynolds: dp/dx = (3 eta omega / 2 H^3) * (x^2 - x2^2) / (1 + alpha x^2)^3
// BCs:      p(x1) = 0  (entrance),  p(x2) = 0  (sheet leaves)
//
// x1 is set by the entry half-thickness H1: H1 = H (1 + alpha x1^2)  with x1 < 0.
// x2 is found by requiring p(x1) = 0  (Newton on the integrated pressure).

import React, { useMemo, useState } from "react";

const LABELS = {
  en: {
    title: "2.2 Calendering: Pressure Profile in the Nip",
    desc:
      "A polymer melt enters at half-thickness H₁, passes through a nip of half-gap H between two counter-rotating rolls (radius R, angular velocity ω), and leaves at H₂. The exit position x₂ is fixed by requiring p(x₁) = 0 at the upstream contact. Drag the sliders; the pressure spike pulls upstream of the nip — a key driver of the load on the calender frame.",
    R: "Roll radius R [m]",
    H: "Half-gap at nip H [μm]",
    H1: "Entry half-thickness H₁ [μm]",
    eta: "Melt viscosity η [Pa·s]",
    omega: "Angular velocity ω [rad/s]",
    pmax: "Peak pressure p_max",
    x2: "Exit position x₂",
    H2: "Exit half-thickness H₂",
    F: "Roll separating force F (per unit roll length)",
    legend: ["pressure p(x)", "gap profile h(x)", "nip (x=0)"],
  },
  kr: {
    title: "2.2 캘린더링: nip 영역의 압력 분포",
    desc:
      "고분자 용융체가 반-두께 H₁로 진입하여 반-간극 H의 nip을 통과한 후 H₂로 빠져나간다 (롤 반경 R, 각속도 ω). 출구 위치 x₂는 상류 접점에서 p(x₁) = 0 조건으로 결정된다. 슬라이더를 조정해 보라; 압력 피크가 nip의 상류로 이동하는 현상은 캘린더 프레임 하중의 주된 원인이다.",
    R: "롤 반경 R [m]",
    H: "nip 반-간극 H [μm]",
    H1: "진입 반-두께 H₁ [μm]",
    eta: "용융 점성 η [Pa·s]",
    omega: "각속도 ω [rad/s]",
    pmax: "최대 압력 p_max",
    x2: "출구 위치 x₂",
    H2: "출구 반-두께 H₂",
    F: "단위 롤 길이당 분리 하중 F",
    legend: ["압력 p(x)", "간극 분포 h(x)", "nip (x=0)"],
  },
};

// Composite Simpson on a uniform grid
function simpson(ys, dx) {
  const n = ys.length - 1;
  if (n < 2) return 0;
  let s = ys[0] + ys[n];
  for (let i = 1; i < n; i++) s += (i % 2 === 0 ? 2 : 4) * ys[i];
  return (s * dx) / 3;
}

// Evaluate p(x; x2) = integral_{x2}^{x} dp/dxi dxi
// dp/dx = K * (x^2 - x2^2) / (1 + alpha x^2)^3,  K = 3 eta omega / (2 H^3)
function pressureAt(x, x2, K, alpha) {
  const N = 200;
  // integrate from x2 to x (sign handles direction)
  const a = Math.min(x, x2);
  const b = Math.max(x, x2);
  const sign = x >= x2 ? 1 : -1;
  const dx = (b - a) / (N - 1);
  const ys = new Array(N);
  for (let i = 0; i < N; i++) {
    const xi = a + i * dx;
    ys[i] = (K * (xi * xi - x2 * x2)) / Math.pow(1 + alpha * xi * xi, 3);
  }
  return sign * simpson(ys, dx);
}

export default function CalenderingSim({ lang = "en" }) {
  const T = LABELS[lang];

  const [R, setR] = useState(0.15);
  const [H_um, setH_um] = useState(200); // half-gap in μm
  const [H1_um, setH1_um] = useState(500); // entry half-thickness
  const [eta, setEta] = useState(1000); // polymer melt
  const [omega, setOmega] = useState(5);

  const H = H_um * 1e-6;
  const H1 = H1_um * 1e-6;
  const alpha = 1.0 / (2 * H * R);
  const K = (3 * eta * omega) / (2 * Math.pow(H, 3));

  // Entry position x1 from H1 = H (1 + alpha x1^2) -> x1 = -sqrt((H1/H - 1)/alpha)
  const x1 = -Math.sqrt(Math.max(0, (H1 / H - 1) / alpha));

  // Solve for x2 such that p(x1; x2) = 0 by bisection on positive x2 in (0, |x1|)
  const x2 = useMemo(() => {
    const f = (xi2) => pressureAt(x1, xi2, K, alpha);
    let lo = 1e-7;
    let hi = Math.abs(x1);
    let flo = f(lo);
    let fhi = f(hi);
    // ensure sign change
    if (flo * fhi > 0) {
      // search a coarse grid for a sign change
      const NG = 40;
      let found = false;
      for (let i = 1; i < NG; i++) {
        const xt = lo + ((hi - lo) * i) / (NG - 1);
        const ft = f(xt);
        if (ft * flo < 0) {
          hi = xt;
          fhi = ft;
          found = true;
          break;
        }
        flo = ft;
        lo = xt;
      }
      if (!found) return Math.abs(x1) * 0.5; // fallback
    }
    for (let k = 0; k < 60; k++) {
      const mid = 0.5 * (lo + hi);
      const fm = f(mid);
      if (Math.abs(fm) < 1e-9) return mid;
      if (fm * flo < 0) {
        hi = mid;
        fhi = fm;
      } else {
        lo = mid;
        flo = fm;
      }
    }
    return 0.5 * (lo + hi);
  }, [x1, K, alpha]);

  const H2 = H * (1 + alpha * x2 * x2);

  // Build the pressure curve from x1 to x2 (and a bit beyond for context)
  const Npts = 401;
  const x_arr = useMemo(() => {
    const out = new Array(Npts);
    const xstart = x1 * 1.15;
    const xend = x2 * 1.4;
    for (let i = 0; i < Npts; i++) out[i] = xstart + ((xend - xstart) * i) / (Npts - 1);
    return out;
  }, [x1, x2, Npts]);
  const p_arr = useMemo(() => x_arr.map((xi) => pressureAt(xi, x2, K, alpha)), [x_arr, x2, K, alpha]);
  const h_arr = x_arr.map((xi) => H * (1 + alpha * xi * xi));

  // Mask: pressure exists physically only for x1 <= x <= x2
  const inside = x_arr.map((xi) => xi >= x1 && xi <= x2);

  // p_max and integral force
  let pmax = 0,
    xpmax = 0;
  inside.forEach((b, i) => {
    if (b && p_arr[i] > pmax) {
      pmax = p_arr[i];
      xpmax = x_arr[i];
    }
  });
  // Separating force F = integral p(x) dx from x1 to x2 (per unit roll length)
  let F = 0;
  for (let i = 0; i < x_arr.length - 1; i++) {
    if (inside[i] && inside[i + 1]) {
      F += 0.5 * (p_arr[i] + p_arr[i + 1]) * (x_arr[i + 1] - x_arr[i]);
    }
  }

  // Plot
  const w = 720,
    Hplot = 380,
    padL = 70,
    padR = 70,
    padT = 30,
    padB = 50;
  const xmin = x_arr[0],
    xmax = x_arr[x_arr.length - 1];
  const ymax_p = Math.max(1e-6, pmax * 1.15);

  // Two y axes: pressure (left), gap (right)
  const sx = (xi) => padL + ((w - padL - padR) * (xi - xmin)) / (xmax - xmin);
  const sy_p = (pi) => padT + ((Hplot - padT - padB) * (ymax_p - pi)) / ymax_p;
  const hmax_plot = Math.max(...h_arr) * 1.05;
  const sy_h = (hi) => padT + ((Hplot - padT - padB) * (hmax_plot - hi)) / hmax_plot;

  // Pressure path (only inside region)
  const pPath = x_arr
    .map((xi, i) => {
      if (!inside[i]) return null;
      return `${sx(xi).toFixed(1)},${sy_p(Math.max(0, p_arr[i])).toFixed(1)}`;
    })
    .filter(Boolean);
  const pPathStr = pPath.length ? "M" + pPath.join(" L") : "";
  // Gap profile (everywhere)
  const hPathStr = x_arr
    .map((xi, i) => `${i === 0 ? "M" : "L"}${sx(xi).toFixed(1)},${sy_h(h_arr[i]).toFixed(1)}`)
    .join(" ");
  // Bottom mirror for the gap (visual)
  const hMirrorStr = x_arr
    .map((xi, i) => `${i === 0 ? "M" : "L"}${sx(xi).toFixed(1)},${(Hplot - padB - (sy_h(h_arr[i]) - padT)).toFixed(1)}`)
    .join(" ");

  return (
    <div className="sim-card">
      <h3>{T.title}</h3>
      <p className="sim-desc">{T.desc}</p>

      <div className="sim-controls grid-controls">
        <Slider label={T.R} value={R} min={0.02} max={0.5} step={0.005} onChange={setR} />
        <Slider label={T.H} value={H_um} min={50} max={800} step={5} onChange={setH_um} />
        <Slider label={T.H1} value={H1_um} min={H_um * 1.1} max={2000} step={10} onChange={setH1_um} />
        <Slider label={T.eta} value={eta} min={100} max={1e5} step={50} log onChange={setEta} />
        <Slider label={T.omega} value={omega} min={0.5} max={50} step={0.5} onChange={setOmega} />
      </div>

      <div className="sim-readouts">
        <div><span>{T.pmax}:</span> <strong>{pmax.toExponential(3)} Pa</strong></div>
        <div><span>x_pmax:</span> <strong>{(xpmax * 1e3).toFixed(3)} mm</strong></div>
        <div><span>x₁:</span> <strong>{(x1 * 1e3).toFixed(3)} mm</strong></div>
        <div><span>{T.x2}:</span> <strong>{(x2 * 1e3).toFixed(3)} mm</strong></div>
        <div><span>{T.H2}:</span> <strong>{(H2 * 1e6).toFixed(1)} μm</strong></div>
        <div><span>{T.F}:</span> <strong>{F.toExponential(3)} N/m</strong></div>
      </div>

      <svg viewBox={`0 0 ${w} ${Hplot}`} className="sim-svg">
        {/* axes */}
        <line x1={padL} y1={Hplot - padB} x2={w - padR} y2={Hplot - padB} stroke="#333" />
        <line x1={padL} y1={padT} x2={padL} y2={Hplot - padB} stroke="#1976d2" />
        <line x1={w - padR} y1={padT} x2={w - padR} y2={Hplot - padB} stroke="#9c27b0" />

        {/* nip line x=0 */}
        <line x1={sx(0)} y1={padT} x2={sx(0)} y2={Hplot - padB} stroke="#2e7d32" strokeDasharray="4,3" />
        <text x={sx(0) + 4} y={padT + 12} fontSize="11" fill="#2e7d32">nip (x=0)</text>
        {/* x1, x2 markers */}
        <line x1={sx(x1)} y1={padT} x2={sx(x1)} y2={Hplot - padB} stroke="#666" strokeDasharray="3,3" opacity={0.6} />
        <text x={sx(x1)} y={Hplot - padB + 14} fontSize="10" textAnchor="middle">x₁</text>
        <line x1={sx(x2)} y1={padT} x2={sx(x2)} y2={Hplot - padB} stroke="#666" strokeDasharray="3,3" opacity={0.6} />
        <text x={sx(x2)} y={Hplot - padB + 14} fontSize="10" textAnchor="middle">x₂</text>

        {/* gap profile (top & mirrored bottom for visual nip) */}
        <path d={hPathStr} fill="none" stroke="#9c27b0" strokeWidth={2} />

        {/* pressure profile */}
        <path d={pPathStr} fill="none" stroke="#1976d2" strokeWidth={2.5} />

        {/* labels */}
        <text x={(padL + w - padR) / 2} y={Hplot - 12} textAnchor="middle" fontSize="12">x [m]</text>
        <text x={20} y={(padT + Hplot - padB) / 2} fill="#1976d2" textAnchor="middle" fontSize="12"
              transform={`rotate(-90 20 ${(padT + Hplot - padB) / 2})`}>p [Pa]</text>
        <text x={w - 18} y={(padT + Hplot - padB) / 2} fill="#9c27b0" textAnchor="middle" fontSize="12"
              transform={`rotate(90 ${w - 18} ${(padT + Hplot - padB) / 2})`}>h(x) [m]</text>

        {/* tick labels */}
        <text x={padL - 5} y={sy_p(0) + 4} fontSize="10" textAnchor="end" fill="#1976d2">0</text>
        <text x={padL - 5} y={sy_p(ymax_p) + 4} fontSize="10" textAnchor="end" fill="#1976d2">{ymax_p.toExponential(1)}</text>
        <text x={w - padR + 5} y={sy_h(0) + 4} fontSize="10" textAnchor="start" fill="#9c27b0">0</text>
        <text x={w - padR + 5} y={sy_h(hmax_plot) + 4} fontSize="10" textAnchor="start" fill="#9c27b0">{hmax_plot.toExponential(1)}</text>
        <text x={padL} y={Hplot - padB + 14} fontSize="10" textAnchor="middle">{xmin.toExponential(1)}</text>
        <text x={w - padR} y={Hplot - padB + 14} fontSize="10" textAnchor="middle">{xmax.toExponential(1)}</text>

        {/* legend */}
        <g transform={`translate(${padL + 8},${padT + 6})`}>
          <rect width="160" height="44" fill="white" stroke="#ccc" />
          <line x1="8" y1="14" x2="28" y2="14" stroke="#1976d2" strokeWidth="2.5" />
          <text x="34" y="18" fontSize="11">{T.legend[0]}</text>
          <line x1="8" y1="32" x2="28" y2="32" stroke="#9c27b0" strokeWidth="2" />
          <text x="34" y="36" fontSize="11">{T.legend[1]}</text>
        </g>
      </svg>

      <p className="callout">
        {lang === "en"
          ? "Notice that x_pmax sits upstream of the nip (x_pmax < 0). This is the geometric reason calender frames must be massively over-built — the integrated force is enormous, and it pulls the rolls apart at the entry side."
          : "x_pmax가 nip의 상류(x_pmax < 0)에 위치함에 주목하라. 이것이 캘린더 프레임을 과도하게 보강해야 하는 기하학적 이유이다 — 적분 하중이 매우 크고, 입구 쪽에서 롤을 분리시키는 방향으로 작용한다."}
      </p>
    </div>
  );
}

function Slider({ label, value, min, max, step, log, onChange }) {
  if (log) {
    return (
      <label className="slider">
        <span>{label}: <strong>{value.toExponential(2)}</strong></span>
        <input
          type="range"
          min={Math.log10(min)}
          max={Math.log10(max)}
          step={0.02}
          value={Math.log10(value)}
          onChange={(e) => onChange(Math.pow(10, parseFloat(e.target.value)))}
        />
      </label>
    );
  }
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
