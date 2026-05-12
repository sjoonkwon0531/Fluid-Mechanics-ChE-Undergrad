// Week13App.jsx
// Week 13: Turbulent Flow & Lubrication Approximation
// Fluid Mechanics for Chemical Engineering — SKKU, Prof. S. Joon Kwon

import React, { useState } from "react";
import ReynoldsDecompositionSim from "./week13/ReynoldsDecompositionSim.jsx";
import UniversalVelocityProfileSim from "./week13/UniversalVelocityProfileSim.jsx";
import EnergyCascadeSim from "./week13/EnergyCascadeSim.jsx";
import SliderBearingSim from "./week13/SliderBearingSim.jsx";
import CalenderingSim from "./week13/CalenderingSim.jsx";
import CodeBlock from "./week13/CodeBlock.jsx";
import {
  CODE_MIXING,
  CODE_REYNOLDS,
  CODE_CALENDER,
  CODE_KOLMOGOROV,
} from "./Week13Codes.js";
import "./week13.css";

const TEXT = {
  en: {
    title: "Week 13 — Turbulent Flow & The Lubrication Approximation",
    subtitle:
      "Reynolds-averaged equations, mixing-length theory, energy cascade, and 1D thin-film flows",
    toc: "Contents",
    sections: {
      s1: "1. Turbulent Flow: Fluctuations and Reynolds Decomposition",
      s2: "2. Mixing-Length Theory (Prandtl & von Kármán)",
      s3: "3. Universal Velocity Profile & Laminar Sub-layer",
      s4: "4. Energy Cascade and Kolmogorov −5/3 Law",
      s5: "5. Computational Hierarchy: RANS / Hybrid / LES",
      s6: "6. The Lubrication Approximation — Slider/Journal Bearing",
      s7: "7. Polymer Processing: Calendering",
      s8: "8. Standalone Code Samples",
    },
    nextWeek: "→ Week 14: Compressible Flow & Closing Topics",
    prevWeek: "← Week 12: Boundary Layers (Blasius / Falkner–Skan)",
  },
  kr: {
    title: "13주차 — 난류 유동과 윤활 근사",
    subtitle:
      "Reynolds 평균 방정식, 혼합 거리 이론, 에너지 캐스케이드, 1D 박막 유동",
    toc: "목차",
    sections: {
      s1: "1. 난류 유동: 변동과 Reynolds 분해",
      s2: "2. 혼합 거리 이론 (Prandtl & von Kármán)",
      s3: "3. 보편 속도 분포와 층류 부층",
      s4: "4. 에너지 캐스케이드와 Kolmogorov −5/3 법칙",
      s5: "5. 계산 모델 위계: RANS / 하이브리드 / LES",
      s6: "6. 윤활 근사 — 슬라이더/저널 베어링",
      s7: "7. 고분자 가공: 캘린더링",
      s8: "8. 독립 실행형 코드 샘플",
    },
    nextWeek: "→ 14주차: 압축성 유동 및 마무리",
    prevWeek: "← 12주차: 경계층 (Blasius / Falkner–Skan)",
  },
};

export default function Week13App() {
  const [lang, setLang] = useState("en");
  const t = TEXT[lang];

  return (
    <div className="week-page">
      <header className="week-header">
        <div className="lang-toggle">
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            className={lang === "kr" ? "active" : ""}
            onClick={() => setLang("kr")}
          >
            KR
          </button>
        </div>
        <h1>{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <nav className="toc">
        <h3>{t.toc}</h3>
        <ol>
          {Object.entries(t.sections).map(([k, v]) => (
            <li key={k}>
              <a href={`#${k}`}>{v}</a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ===================== Section 1 ===================== */}
      <section id="s1">
        <h2>{t.sections.s1}</h2>
        {lang === "en" ? <SectionOneEN /> : <SectionOneKR />}
        <ReynoldsDecompositionSim lang={lang} />
      </section>

      {/* ===================== Section 2 ===================== */}
      <section id="s2">
        <h2>{t.sections.s2}</h2>
        {lang === "en" ? <SectionTwoEN /> : <SectionTwoKR />}
      </section>

      {/* ===================== Section 3 ===================== */}
      <section id="s3">
        <h2>{t.sections.s3}</h2>
        {lang === "en" ? <SectionThreeEN /> : <SectionThreeKR />}
        <UniversalVelocityProfileSim lang={lang} />
      </section>

      {/* ===================== Section 4 ===================== */}
      <section id="s4">
        <h2>{t.sections.s4}</h2>
        {lang === "en" ? <SectionFourEN /> : <SectionFourKR />}
        <EnergyCascadeSim lang={lang} />
      </section>

      {/* ===================== Section 5 ===================== */}
      <section id="s5">
        <h2>{t.sections.s5}</h2>
        {lang === "en" ? <SectionFiveEN /> : <SectionFiveKR />}
      </section>

      {/* ===================== Section 6 ===================== */}
      <section id="s6">
        <h2>{t.sections.s6}</h2>
        {lang === "en" ? <SectionSixEN /> : <SectionSixKR />}
        <SliderBearingSim lang={lang} />
      </section>

      {/* ===================== Section 7 ===================== */}
      <section id="s7">
        <h2>{t.sections.s7}</h2>
        {lang === "en" ? <SectionSevenEN /> : <SectionSevenKR />}
        <CalenderingSim lang={lang} />
      </section>

      {/* ===================== Section 8: Code Samples ===================== */}
      <section id="s8">
        <h2>{t.sections.s8}</h2>
        {lang === "en" ? <SectionEightEN /> : <SectionEightKR />}
      </section>

      <footer className="week-nav">
        <button
          type="button"
          className="back-home-btn"
          onClick={() =>
            window.__backToHome ? window.__backToHome() : window.history.back()
          }
        >
          {lang === "kr" ? "← 메인으로" : "← Back to Home"}
        </button>
        <span className="nav-meta">{t.prevWeek}</span>
        <span className="nav-meta">{t.nextWeek}</span>
      </footer>
    </div>
  );
}

/* ===========================================================
   ENGLISH SECTIONS
   =========================================================== */

function SectionOneEN() {
  return (
    <div className="prose">
      <p>
        For sufficiently large Reynolds numbers, smooth laminar solutions of the
        Navier–Stokes equations become unstable. Rotational eddies appear in the
        high-shear region near the wall, then cascade down to progressively
        smaller eddies where viscosity dissipates kinetic energy into heat. The
        velocity and pressure fields are no longer smooth in time, so we
        decompose them as
      </p>
      <div className="math">
        v<sub>i</sub> = v̄<sub>i</sub> + v′<sub>i</sub>,&nbsp; p = p̄ + p′,
        &nbsp; (i = x, y, z)
      </div>
      <p>
        with the experimental observation that the relative fluctuation
        |v′<sub>i</sub>|/|v̄<sub>i</sub>| ~ 0.01–0.1 in shear flows. Time averages
        satisfy
      </p>
      <div className="math">
        ⟨v′<sub>i</sub>⟩ = ⟨p′⟩ = 0,&nbsp; ⟨v<sub>i</sub>⟩ = v̄<sub>i</sub>.
      </div>
      <p>
        Applying this to the Cauchy momentum equation and time-averaging
        produces new flux terms — the <strong>Reynolds stresses</strong> ρ⟨v′
        <sub>i</sub>v′<sub>j</sub>⟩ — which have no universal closure. All
        turbulence modeling is essentially the search for a closure for these
        terms.
      </p>
      <div className="math block">
        ρ&nbsp;∂v̄<sub>x</sub>/∂t + ρ(v̄<sub>x</sub>∂<sub>x</sub> + v̄
        <sub>y</sub>∂<sub>y</sub> + v̄<sub>z</sub>∂<sub>z</sub>)v̄<sub>x</sub> = −
        ∂p̄/∂x + ∂(τ̄<sub>xx</sub> − ρ⟨v′<sub>x</sub>v′<sub>x</sub>⟩)/∂x +
        ∂(τ̄<sub>yx</sub> − ρ⟨v′<sub>x</sub>v′<sub>y</sub>⟩)/∂y + … + ρg
        <sub>x</sub>
      </div>
      <p className="callout">
        <strong>Key insight.</strong> The fluctuation correlations are not
        closed by the conservation equations themselves. There is{" "}
        <em>no universal turbulence law</em> — only models.
      </p>
    </div>
  );
}

function SectionTwoEN() {
  return (
    <div className="prose">
      <p>
        Prandtl proposed an analogy: just as molecular momentum transport is
        carried over a mean free path, turbulent momentum is carried over a{" "}
        <strong>mixing length</strong> λ that represents the maximum distance
        over which an eddy preserves its identity. Considering the turbulent
        flux of <em>x</em>-momentum through the <em>x–z</em> plane,
      </p>
      <div className="math block">
        Ṁ = v′<sub>y</sub>(ρv̄<sub>x</sub> − λ&nbsp;d(ρv̄<sub>x</sub>)/dy)
        &nbsp;⟹&nbsp; ⟨Ṁ⟩ = − ν<sub>T</sub>·d(ρv̄<sub>x</sub>)/dy
      </div>
      <p>
        where ν<sub>T</sub> ≡ ⟨λ v′<sub>y</sub>⟩ is the{" "}
        <strong>eddy kinematic viscosity</strong>. Using a correlation
        coefficient R between v′<sub>x</sub> and v′<sub>y</sub>, and Prandtl's
        ansatz that |v′| scales as λ |dv̄<sub>x</sub>/dy|, the turbulent shear
        stress becomes the celebrated
      </p>
      <div className="math block">
        τ<sup>t</sup><sub>yz</sub> = ρℓ² |dv̄<sub>x</sub>/dy| · dv̄<sub>x</sub>
        /dy,&nbsp;&nbsp; ℓ ≡ R<sup>1/2</sup> λ&nbsp;(Prandtl mixing length).
      </div>

      <h3>Two closures for ℓ(y)</h3>
      <p>
        <strong>Prandtl:</strong> near a wall, eddies have more freedom the
        further they are from it, so ℓ = κy with κ ≈ 0.4. Setting τ<sup>t</sup>
        ≈ τ<sub>W</sub> (constant-stress layer) gives, by integration,
      </p>
      <div className="math block">
        v̄<sub>z</sub> ≈ (1/κ)·√(τ<sub>W</sub>/ρ)·log y + c.
      </div>
      <p>
        <strong>von Kármán:</strong> assume ℓ = (dv̄/dy)/|d²v̄/dy²|·κ
        <sup>−1</sup>. Algebra reduces to the same logarithmic profile,
        confirming Prandtl's result via a different closure.
      </p>
    </div>
  );
}

function SectionThreeEN() {
  return (
    <div className="prose">
      <p>
        Introduce wall units using the <strong>friction velocity</strong> u
        <sub>*</sub> ≡ √(τ<sub>W</sub>/ρ):
      </p>
      <div className="math block">
        y⁺ ≡ ρy u<sub>*</sub>/η,&nbsp;&nbsp; v⁺<sub>z</sub> ≡ v̄<sub>z</sub>/u
        <sub>*</sub>.
      </div>
      <p>The mixing-length result collapses, for all Newtonian wall-bounded turbulent flows, onto a single curve — the <strong>universal velocity profile</strong>:</p>
      <div className="math block">
        Viscous sublayer (y⁺ ≲ 5):&nbsp; v⁺ = y⁺ <br />
        Buffer (5 ≲ y⁺ ≲ 30):&nbsp; v⁺ ≈ −3.05 + 5.0 ln y⁺ <br />
        Log-law region (y⁺ ≳ 30):&nbsp; v⁺ = 5.5 + 2.5 ln y⁺
      </div>
      <p>
        The crossover between linear and logarithmic branches at v⁺ = y⁺ ⇒ y⁺ ≈
        11.63 gives the thickness of the laminar sub-layer:
      </p>
      <div className="math block">
        δ<sub>lam</sub>/D = 16.4/(Re √f<sub>F</sub>) ≈ 58.3 Re<sup>−7/8</sup>
        &nbsp;(using Blasius f<sub>F</sub> ≈ 0.0790 Re<sup>−1/4</sup>).
      </div>
      <p className="callout">
        <strong>Why this matters.</strong> Wall-bounded turbulence models
        (k–ε, k–ω) all require <em>wall functions</em> that reproduce this
        universal profile in the first off-wall cell. If your CFD mesh
        straddles y⁺ ≈ 11 without proper wall treatment, the results in that
        cell are physically meaningless.
      </p>
    </div>
  );
}

function SectionFourEN() {
  return (
    <div className="prose">
      <p>
        Kolmogorov (1941) postulated that for high-Re turbulence, away from
        boundaries, energy is injected at the large (integral) scale L,
        cascades through the inertial subrange, and is dissipated at the
        Kolmogorov scale η. Dimensional analysis on the two governing
        quantities ε (dissipation rate) and k (wavenumber) gives the famous
      </p>
      <div className="math block">E(k) = C<sub>K</sub> ε<sup>2/3</sup> k<sup>−5/3</sup>&nbsp;(C<sub>K</sub> ≈ 1.5)</div>
      <p>Key scales:</p>
      <ul>
        <li>Integral length L ~ k<sup>3/2</sup>/ε</li>
        <li>Kolmogorov length η = (ν³/ε)<sup>1/4</sup></li>
        <li>Integral time τ<sub>L</sub> ~ k/ε</li>
        <li>Kolmogorov time τ<sub>η</sub> = (ν/ε)<sup>1/2</sup></li>
        <li>Scale separation L/η ~ Re<sub>L</sub><sup>3/4</sup> — explains why DNS cost scales like Re<sup>9/4</sup> per time step (3D + temporal resolution).</li>
      </ul>
    </div>
  );
}

function SectionFiveEN() {
  return (
    <div className="prose">
      <p>
        Increasing fidelity (and cost) of turbulence modeling:
      </p>
      <ol>
        <li>
          <strong>RANS (Reynolds-Averaged Navier–Stokes).</strong> All scales
          modeled. One-equation (Spalart–Allmaras), two-equation (k–ε, k–ω,
          SST), three-equation (v²–f), seven-equation Reynolds Stress Models.
          Cheapest; suitable for steady industrial design.
        </li>
        <li>
          <strong>Hybrid RANS/LES.</strong> RANS near walls, LES in the bulk:
          DES, DDES, IDDES, SAS, WMLES, Zonal LES. Compromise between cost and
          unsteady fidelity.
        </li>
        <li>
          <strong>LES (Large Eddy Simulation).</strong> Resolves the large
          (geometry-dependent) eddies; models only the sub-grid scales
          (Smagorinsky, Germano dynamic). Required for accurate unsteady
          predictions, mixing, combustion.
        </li>
        <li>
          <strong>DNS (Direct Numerical Simulation).</strong> Resolves down to
          η. Research only, limited to modest Re.
        </li>
      </ol>
    </div>
  );
}

function SectionSixEN() {
  return (
    <div className="prose">
      <p>
        Lubrication flows are flows in a thin film where one length scale (the
        gap h) is much smaller than the streamwise scale (L). The four standard
        assumptions are:
      </p>
      <ol>
        <li>One dominant velocity component (v<sub>x</sub>).</li>
        <li>Pressure depends only on the streamwise coordinate: p = p(x).</li>
        <li>Inertial and gravitational terms are negligible vs. pressure and viscous forces.</li>
        <li>No flow in the third direction.</li>
      </ol>
      <p>
        Under these assumptions the Navier–Stokes equation collapses to
      </p>
      <div className="math block">dp/dx = η ∂²v<sub>x</sub>/∂y².</div>
      <p>
        With BCs v<sub>x</sub>(0)=0 and v<sub>x</sub>(h)=V (slider with moving
        top wall),
      </p>
      <div className="math block">
        v<sub>x</sub>(y) = yV/h + (1/2η)·(dp/dx)·y(y−h)
      </div>
      <p>
        — i.e., Couette + Poiseuille. Imposing mass conservation (Q
        independent of x) yields the <strong>Reynolds equation</strong>:
      </p>
      <div className="math block">
        d/dx (h³/η · dp/dx) = 6V · dh/dx
      </div>
      <p>
        For a linear slider h(x), with η = const and dh/dx = const, letting α
        ≡ −6ηV·(dh/dx) and replacing h(x) by its mean h<sub>m</sub> gives the
        approximate parabolic pressure:
      </p>
      <div className="math block">
        p(x) ≈ α x (L − x) / (2 h<sub>m</sub>³),&nbsp; p<sub>max</sub> = α L²
        /(8 h<sub>m</sub>³)&nbsp;at x = L/2.
      </div>
      <p>
        The exact integration retains h(x)<sup>3</sup> and shifts p
        <sub>max</sub> upstream of L/2 (toward the inlet, where h is largest).
        Both are explored in the interactive plot below. The mean pressure
        p<sub>m</sub> = (2/3) p<sub>max</sub> sets the load-carrying capacity
        per unit depth:
      </p>
      <div className="math block">
        W = α L³ sin φ / (12 h<sub>m</sub>³).
      </div>
      <p className="callout">
        <strong>Flow reversal.</strong> For x ≤ L/2 the Poiseuille contribution
        opposes the Couette drag, so a reverse-flow zone exists for y &lt; y
        <sub>C</sub> = h − 2η h<sub>m</sub>³ V / [α h (L/2 − x)]. For x &gt; L/2
        the two contributions reinforce — no reversal.
      </p>
    </div>
  );
}

function SectionSevenEN() {
  return (
    <div className="prose">
      <p>
        Calendering forces a heat-softened polymer melt through the gap between
        two counter-rotating rolls (each of radius R, angular velocity ω).
        Geometrically, the half-gap profile h(x) for small x/R is
      </p>
      <div className="math block">
        h(x) = R + H − √(R² − x²) ≈ H(1 + α x²),&nbsp; α ≡ 1/(2HR)
      </div>
      <p>
        where 2H is the minimum gap at the nip (x = 0). Applying the
        lubrication approximation with symmetry BC at y = 0 and Couette BC
        v<sub>x</sub>(h) = Rω,
      </p>
      <div className="math block">
        v<sub>x</sub>(y) = (1/2η)(dp/dx)(y² − h²) + Rω
      </div>
      <p>
        and Q = 2H₂Rω = 2h(Rω − h²/3η · dp/dx) gives
      </p>
      <div className="math block">
        dp/dx = (3ηRω(h − H₂))/h³ = (3ηω)/(2H³) · (x² − x₂²)/(1 + αx²)³
      </div>
      <p>
        Integrating with p(x₁) = 0 (sheet entry) determines x₂ and the full
        pressure profile. The leave-off point x₂ controls the final sheet
        half-thickness H₂. Adjust ω, H, R in the simulator to see how the nip
        pressure changes.
      </p>
    </div>
  );
}

function SectionEightEN() {
  return (
    <div className="prose">
      <p>
        Four standalone Python scripts let you reproduce every result here
        from scratch. Click to expand each, then download or paste into a
        local Python 3.10+ environment with numpy, scipy, and matplotlib.
      </p>
      <CodeBlock
        title="1. mixing_length_pipe.py — Prandtl mixing length in a pipe"
        language="python"
        code={CODE_MIXING}
      />
      <CodeBlock
        title="2. reynolds_equation_solver.py — 1D Reynolds equation, FDM"
        language="python"
        code={CODE_REYNOLDS}
      />
      <CodeBlock
        title="3. calendering_solver.py — Calendering pressure integration"
        language="python"
        code={CODE_CALENDER}
      />
      <CodeBlock
        title="4. kolmogorov_spectrum.py — Synthetic −5/3 spectrum"
        language="python"
        code={CODE_KOLMOGOROV}
      />
    </div>
  );
}

/* ===========================================================
   KOREAN SECTIONS (parallel content)
   =========================================================== */

function SectionOneKR() {
  return (
    <div className="prose">
      <p>
        Reynolds 수가 충분히 크면 Navier–Stokes 방정식의 매끄러운 층류 해가
        불안정해진다. 벽 근처 고전단 영역에서 회전 와류가 형성되고, 이는 점점
        작은 와류로 분해되며 점성에 의해 운동에너지가 열로 소산된다. 속도와
        압력장은 더 이상 시간에 대해 매끄럽지 않으므로 다음과 같이 분해한다:
      </p>
      <div className="math">
        v<sub>i</sub> = v̄<sub>i</sub> + v′<sub>i</sub>,&nbsp; p = p̄ + p′
      </div>
      <p>
        실험적으로 |v′<sub>i</sub>|/|v̄<sub>i</sub>| ~ 0.01–0.1 정도이며, 시간
        평균은 ⟨v′<sub>i</sub>⟩ = ⟨p′⟩ = 0을 만족한다. 이를 Cauchy 운동량
        방정식에 대입하여 시간 평균하면 추가 항인{" "}
        <strong>Reynolds 응력</strong> ρ⟨v′<sub>i</sub>v′<sub>j</sub>⟩가
        등장하며, 이에 대한 보편적인 닫힘 관계는 존재하지 않는다.
      </p>
      <p className="callout">
        <strong>핵심.</strong> 변동 항의 상관관계는 보존 방정식만으로는 닫히지
        않는다. <em>난류에 대한 보편 법칙은 없으며, 오직 모델만이 존재한다.</em>
      </p>
    </div>
  );
}

function SectionTwoKR() {
  return (
    <div className="prose">
      <p>
        Prandtl은 다음과 같이 유추했다. 분자 운동량이 평균 자유 행로(mean free
        path)에 걸쳐 전달되듯, 난류 운동량은 <strong>혼합 거리(mixing length)</strong>{" "}
        λ에 걸쳐 전달된다고 본다. λ는 와류가 자신의 정체성을 유지할 수 있는
        최대 거리이다. x–z 평면을 통한 x 방향 운동량의 난류 플럭스로부터
      </p>
      <div className="math block">
        ⟨Ṁ⟩ = −ν<sub>T</sub> · d(ρv̄<sub>x</sub>)/dy,&nbsp; ν<sub>T</sub> ≡ ⟨λ
        v′<sub>y</sub>⟩
      </div>
      <p>
        가 얻어지며, ν<sub>T</sub>는 <strong>와점성 계수(eddy viscosity)</strong>다.
        v′<sub>x</sub>와 v′<sub>y</sub> 사이 상관계수 R을 도입하고 |v′| ~ λ
        |dv̄/dy|로 놓으면 유명한 결과
      </p>
      <div className="math block">
        τ<sup>t</sup><sub>yz</sub> = ρℓ² |dv̄<sub>x</sub>/dy| · dv̄<sub>x</sub>/dy,&nbsp; ℓ
        ≡ R<sup>1/2</sup>λ
      </div>
      <p>
        를 얻는다. ℓ에 대한 두 가지 닫힘은 다음과 같다:
      </p>
      <h3>두 가지 닫힘</h3>
      <p>
        <strong>Prandtl:</strong> 벽에서 멀어질수록 와류의 자유도가 증가하므로 ℓ
        = κy, κ ≈ 0.4. 일정 응력 가정 τ<sup>t</sup> ≈ τ<sub>W</sub>로부터
        로그 분포가 유도된다.
      </p>
      <p>
        <strong>von Kármán:</strong> ℓ = (dv̄/dy)/|d²v̄/dy²| · κ<sup>−1</sup>로
        가정해도 동일한 로그 분포가 유도된다 — 서로 다른 닫힘이 같은 결과를
        주는 매우 흥미로운 사실이다.
      </p>
    </div>
  );
}

function SectionThreeKR() {
  return (
    <div className="prose">
      <p>
        <strong>마찰 속도</strong> u<sub>*</sub> ≡ √(τ<sub>W</sub>/ρ)와 무차원
        변수
      </p>
      <div className="math block">
        y⁺ ≡ ρy u<sub>*</sub>/η,&nbsp; v⁺ ≡ v̄/u<sub>*</sub>
      </div>
      <p>
        를 도입하면 모든 Newtonian 벽 부착 난류가 단일 곡선 — <strong>보편
        속도 분포</strong> — 위로 모인다:
      </p>
      <div className="math block">
        점성 부층 (y⁺ ≲ 5): v⁺ = y⁺ <br />
        버퍼층 (5 ≲ y⁺ ≲ 30): v⁺ ≈ −3.05 + 5.0 ln y⁺ <br />
        로그 영역 (y⁺ ≳ 30): v⁺ = 5.5 + 2.5 ln y⁺
      </div>
      <p>
        선형/로그 가지의 교차점 v⁺ = y⁺ ⇒ y⁺ ≈ 11.63에서 층류 부층 두께는
      </p>
      <div className="math block">
        δ<sub>lam</sub>/D = 16.4/(Re √f<sub>F</sub>) ≈ 58.3 Re<sup>−7/8</sup>
      </div>
      <p className="callout">
        <strong>왜 중요한가.</strong> k–ε, k–ω 등 벽 부착 난류 모델은 모두 첫
        셀에서 이 보편 분포를 재현하는 <em>벽 함수(wall function)</em>를
        요구한다. CFD 메쉬가 y⁺ ≈ 11 근처를 벽 처리 없이 가로지르면 그 셀의
        결과는 물리적으로 무의미하다.
      </p>
    </div>
  );
}

function SectionFourKR() {
  return (
    <div className="prose">
      <p>
        Kolmogorov(1941)는 충분히 큰 Re의 난류에서 에너지가 적분 척도 L에서
        주입되어 관성 영역(inertial subrange)을 따라 캐스케이드한 후 Kolmogorov
        척도 η에서 소산된다고 보았다. ε(소산률)과 k(파수)에 대한 차원 해석으로
        부터
      </p>
      <div className="math block">
        E(k) = C<sub>K</sub> ε<sup>2/3</sup> k<sup>−5/3</sup>&nbsp;(C<sub>K</sub>
        ≈ 1.5)
      </div>
      <p>주요 척도:</p>
      <ul>
        <li>적분 길이 L ~ k<sup>3/2</sup>/ε</li>
        <li>Kolmogorov 길이 η = (ν³/ε)<sup>1/4</sup></li>
        <li>적분 시간 τ<sub>L</sub> ~ k/ε</li>
        <li>Kolmogorov 시간 τ<sub>η</sub> = (ν/ε)<sup>1/2</sup></li>
        <li>척도 분리 L/η ~ Re<sub>L</sub><sup>3/4</sup> — DNS 비용이 시간 스텝당 Re<sup>9/4</sup>로 증가하는 이유.</li>
      </ul>
    </div>
  );
}

function SectionFiveKR() {
  return (
    <div className="prose">
      <p>난류 모델의 정확도(와 비용)는 다음 순서로 증가한다:</p>
      <ol>
        <li>
          <strong>RANS.</strong> 모든 척도를 모델링. 1-eqn (Spalart–Allmaras),
          2-eqn (k–ε, k–ω, SST), 3-eqn (v²–f), 7-eqn Reynolds Stress Model.
          정상상태 산업 설계에 적합.
        </li>
        <li>
          <strong>Hybrid RANS/LES.</strong> 벽 근처는 RANS, 본류는 LES — DES,
          DDES, IDDES, SAS, WMLES, Zonal LES. 비용과 비정상성 정확도의 절충.
        </li>
        <li>
          <strong>LES.</strong> 큰 와류는 직접 해석, sub-grid만 모델링
          (Smagorinsky, Germano dynamic). 비정상 혼합·연소 문제에 필수.
        </li>
        <li>
          <strong>DNS.</strong> η까지 직접 해석. 연구용, 낮은 Re에 한정.
        </li>
      </ol>
    </div>
  );
}

function SectionSixKR() {
  return (
    <div className="prose">
      <p>
        윤활 유동(lubrication flow)은 박막에서의 유동으로, 막 두께 h가 흐름
        방향 길이 L에 비해 훨씬 작다. 네 가지 표준 가정:
      </p>
      <ol>
        <li>한 방향 속도(v<sub>x</sub>)가 지배적이다.</li>
        <li>압력은 흐름 방향에만 의존: p = p(x).</li>
        <li>관성·중력 항이 압력·점성 항에 비해 무시 가능하다.</li>
        <li>제3 방향 흐름이 없다.</li>
      </ol>
      <p>이 조건에서 Navier–Stokes 방정식은</p>
      <div className="math block">dp/dx = η ∂²v<sub>x</sub>/∂y²</div>
      <p>로 단순화되며, BC v<sub>x</sub>(0)=0, v<sub>x</sub>(h)=V로부터</p>
      <div className="math block">
        v<sub>x</sub>(y) = yV/h + (1/2η)(dp/dx) y(y−h)
      </div>
      <p>
        — Couette + Poiseuille 흐름이다. 질량 보존 (Q가 x에 무관)을 부과하면{" "}
        <strong>Reynolds 방정식</strong>:
      </p>
      <div className="math block">d/dx(h³/η · dp/dx) = 6V · dh/dx</div>
      <p>
        선형 슬라이더 h(x)에서 η, dh/dx 일정 가정 후 α ≡ −6ηV·(dh/dx)와 평균
        간격 h<sub>m</sub> 사용 시 근사 압력 분포는 포물선:
      </p>
      <div className="math block">
        p(x) ≈ α x(L−x)/(2 h<sub>m</sub>³),&nbsp; p<sub>max</sub> = αL²/(8h
        <sub>m</sub>³)&nbsp;at x = L/2.
      </div>
      <p>
        정확 적분은 h(x)³를 그대로 유지하여 p<sub>max</sub>를 입구 쪽(h가 큰
        쪽)으로 이동시킨다. 평균 압력 p<sub>m</sub> = (2/3) p<sub>max</sub>이며
        단위 깊이당 지지 하중은
      </p>
      <div className="math block">W = αL³ sinφ / (12 h<sub>m</sub>³)</div>
      <p className="callout">
        <strong>역류 영역.</strong> x ≤ L/2에서는 Poiseuille 성분이 Couette
        견인과 반대이므로 y &lt; y<sub>C</sub> = h − 2η h<sub>m</sub>³V/[α h(L/2 −
        x)]에서 역류가 발생한다. x &gt; L/2에서는 두 성분이 같은 방향이라 역류
        없음.
      </p>
    </div>
  );
}

function SectionSevenKR() {
  return (
    <div className="prose">
      <p>
        캘린더링은 가열 연화된 고분자 용융체를 한 쌍의 역회전 롤(반경 R, 각속도
        ω) 사이로 통과시켜 연속 시트를 성형하는 공정이다. 작은 x/R에 대한
        반-간극 분포는
      </p>
      <div className="math block">
        h(x) = R + H − √(R² − x²) ≈ H(1 + αx²),&nbsp; α ≡ 1/(2HR)
      </div>
      <p>
        여기서 2H는 nip(x = 0)에서의 최소 간극이다. 윤활 근사와 대칭 BC(y=0),
        Couette BC v<sub>x</sub>(h) = Rω를 적용하면
      </p>
      <div className="math block">
        v<sub>x</sub>(y) = (1/2η)(dp/dx)(y² − h²) + Rω
      </div>
      <p>
        그리고 Q = 2H₂Rω = 2h(Rω − h²/3η · dp/dx)로부터
      </p>
      <div className="math block">
        dp/dx = 3ηRω(h − H₂)/h³ = (3ηω)/(2H³) · (x² − x₂²)/(1 + αx²)³
      </div>
      <p>
        p(x₁) = 0 (시트 진입)으로 적분하면 x₂와 전체 압력 분포가 결정된다.
        시뮬레이터에서 ω, H, R를 조정하여 nip 압력의 변화를 관찰하라.
      </p>
    </div>
  );
}

function SectionEightKR() {
  return (
    <div className="prose">
      <p>
        본 강의의 모든 결과를 처음부터 재현할 수 있는 네 개의 독립 실행형 Python
        스크립트. 각 블록을 펼쳐 다운로드하거나 numpy/scipy/matplotlib가 설치된
        Python 3.10+ 환경에 붙여 넣어 실행하라.
      </p>
      <CodeBlock
        title="1. mixing_length_pipe.py — 파이프에서의 Prandtl 혼합 거리"
        language="python"
        code={CODE_MIXING}
      />
      <CodeBlock
        title="2. reynolds_equation_solver.py — 1D Reynolds 방정식 FDM"
        language="python"
        code={CODE_REYNOLDS}
      />
      <CodeBlock
        title="3. calendering_solver.py — 캘린더링 압력 적분"
        language="python"
        code={CODE_CALENDER}
      />
      <CodeBlock
        title="4. kolmogorov_spectrum.py — −5/3 합성 스펙트럼"
        language="python"
        code={CODE_KOLMOGOROV}
      />
    </div>
  );
}
