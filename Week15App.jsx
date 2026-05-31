import React, { useState, useMemo, useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import katex from 'katex'
import { T, K, Section, Card, Callout, Slider, Btn, Heatmap, l2RelError } from './components.jsx'
import { solveDarcy, makePreset, arrStats } from './darcy.js'
import tgVortex from './data/tgVortex.json'
import cdrData from './data/cdr.json'
import fnoProgress from './data/fnoProgress.json'
import invData from './data/pinnInverse.json'

// recharts 공통 다크 테마 props
const RC_AXIS = { stroke: T.textMute, tick: { fill: T.textDim, fontSize: 11 } }
const RC_GRID = { stroke: T.border, strokeDasharray: '3 3' }
const RC_TOOLTIP = {
  contentStyle: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 },
  labelStyle: { color: T.textDim },
}

// ============================================================
// §1 — 도입
// ============================================================
function Intro() {
  const cards = [
    { tag: '전통 CFD',       title: 'FDM · FVM · FEM',     text: '정확하고 검증되었지만, 새 파라미터마다 재계산하고 고차원에서 비싸다.', color: '#64748b' },
    { tag: 'PINN',           title: 'PDE를 손실로',         text: '데이터가 적어도 물리 법칙만으로 학습. 역문제와 데이터 융합에 강하다.', color: '#10b981' },
    { tag: 'Neural Operator',title: '함수 → 함수 학습',     text: '한 번 배우면 수많은 새 입력에 밀리초 추론. 설계·UQ에서 강력.',         color: '#60a5fa' },
    { tag: 'Neural Field',   title: '표현과 복원',           text: '시공간 장의 연속 표현. 실험 측정에서 3D 유체장 복원의 다리.',         color: '#fbbf24' },
  ]
  return (
    <Section id="intro" kicker="Week 15 · 도입" title="유체역학과 AI: 우리는 무엇을, 왜 배우는가">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 20 }}>
        화학공학의 거의 모든 핵심 현상 — 반응기 혼합, 다공질 촉매층의 물질전달, 다상유동, 열교환 —
        은 결국 <strong style={{ color: T.text }}>편미분방정식(PDE)</strong>으로 기술된다. 이번 주는 그 PDE를 푸는 새로운 도구로서
        <strong style={{ color: T.accent }}> PINN · Neural Operator · Neural Rendering</strong>을 직접 만져본다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 24 }}>
        {cards.map((c, i) => (
          <Card key={i} accent={c.color}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.color, letterSpacing: 1.5,
                          fontFamily: T.fontMono, marginBottom: 8, textTransform: 'uppercase' }}>{c.tag}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>{c.title}</div>
            <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.55 }}>{c.text}</div>
          </Card>
        ))}
      </div>

      <Callout kind="warn" title="흔한 오해 바로잡기">
        <strong>"Neural rendering으로 Navier–Stokes를 푼다"</strong>는 표현은 정밀하지 않다.
        NeRF/Gaussian Splatting은 본래 <em>3D 장면 복원·렌더링</em> 기술이며 그 자체가 PDE 풀이기는 아니다.
        PDE를 직접 푸는 것은 <strong>PINN과 Neural Operator</strong>의 영역이고,
        neural field는 그들의 <em>표현(backbone)</em>이거나 <em>측정 데이터로부터의 복원</em> 단계에서 결합된다.
      </Callout>

      <div style={{ marginTop: 18, fontSize: 13, color: T.textMute, fontStyle: 'italic' }}>
        💡 본 페이지는 인터랙티브 학습 도구입니다. 슬라이더·버튼·캔버스 그리기만으로 모든 실험이 가능합니다.
      </div>
    </Section>
  )
}

// ============================================================
// §2 — NS Visualizer (Taylor-Green vortex)
// ============================================================
function NSVisualizer() {
  const [nuKey, setNuKey] = useState('0.05')
  const [tIdx, setTIdx] = useState(5)
  const [playing, setPlaying] = useState(false)
  const [view, setView] = useState('speed')

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setTIdx(prev => (prev + 1) % tgVortex[nuKey].frames.length)
    }, 350)
    return () => clearInterval(id)
  }, [playing, nuKey])

  const data = tgVortex[nuKey]
  const frame = data.frames[tIdx]
  const Re = (1.0 / data.nu).toFixed(0)
  const energySeries = data.frames.map(f => ({
    t: f.t, energy: f.energy, exp: data.frames[0].energy * Math.exp(-4 * data.nu * f.t)
  }))

  return (
    <Section id="ns" kicker="실습 1 · NS 시각화" title="Navier–Stokes 인터랙티브: Taylor–Green Vortex">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 14 }}>
        2D 비압축성 Navier–Stokes의 정확한 해석해인 <strong style={{ color: T.text }}>Taylor–Green vortex</strong>를 직접 조작해 본다.
        점성 <K tex="\nu" />가 클수록(낮은 Re) 와동이 빠르게 감쇠하고, 작을수록(높은 Re) 오래 유지된다.
      </p>
      <Card style={{ marginBottom: 18 }}>
        <K display tex={String.raw`u = \cos x\,\sin y\,e^{-2\nu t},\quad v = -\sin x\,\cos y\,e^{-2\nu t}`} />
        <div style={{ fontSize: 13, color: T.textDim, marginTop: 6, textAlign: 'center' }}>
          에너지는 <K tex={String.raw`\langle |\mathbf{u}|^2 \rangle \propto e^{-4\nu t}`} />로 감쇠
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 280px) 1fr', gap: 20, alignItems: 'start' }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 14 }}>⚙️ 제어판</div>
          <div>
            <label style={{ fontSize: 13, color: T.textDim, fontWeight: 500 }}>점성계수 ν (= 1/Re)</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {['0.02', '0.05', '0.10', '0.20'].map(k => (
                <button key={k} onClick={() => setNuKey(k)}
                  style={{
                    flex: 1, padding: '7px 0', fontSize: 13, borderRadius: 6, cursor: 'pointer',
                    background: nuKey === k ? T.accent : T.cardHi,
                    color: nuKey === k ? '#fff' : T.textDim,
                    border: `1px solid ${nuKey === k ? T.accent : T.border}`,
                    fontWeight: 600, fontFamily: T.fontMono,
                  }}>{k}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.textMute, marginTop: 4, fontFamily: T.fontMono }}>현재 Re ≈ {Re}</div>
          </div>
          <Slider label="시간 t" value={tIdx} min={0} max={data.frames.length - 1} step={1}
            onChange={setTIdx} fmt={(v) => data.frames[v].t.toFixed(2)} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <Btn variant={playing ? 'warn' : 'primary'} onClick={() => setPlaying(p => !p)} style={{ flex: 1 }}>
              {playing ? '⏸ 일시정지' : '▶ 시간 재생'}
            </Btn>
            <Btn variant="subtle" onClick={() => { setTIdx(0); setPlaying(false) }} size="sm">⏮ 처음</Btn>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 13, color: T.textDim, fontWeight: 500 }}>표시할 장</label>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[['speed', '속도크기'], ['u', 'u성분'], ['v', 'v성분']].map(([k, name]) => (
                <button key={k} onClick={() => setView(k)}
                  style={{
                    flex: 1, padding: '5px 0', fontSize: 11.5, borderRadius: 5, cursor: 'pointer',
                    background: view === k ? T.cardHi : 'transparent',
                    color: view === k ? T.text : T.textMute,
                    border: `1px solid ${view === k ? T.borderHi : T.border}`,
                  }}>{name}</button>
              ))}
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Heatmap
            values={view === 'speed' ? frame.speed : (view === 'u' ? frame.u : frame.v)}
            cmap={view === 'speed' ? 'viridis' : 'rdbu'}
            vmin={view === 'speed' ? 0 : -1}
            vmax={view === 'speed' ? 1 : 1}
            vectorField={view === 'speed' ? { u: frame.u, v: frame.v } : null}
            vectorSkip={3}
            width={420} height={420}
            label={`${view === 'speed' ? '속도 크기' : view + '-성분'} (t=${frame.t.toFixed(2)}) + 속도 벡터`}
          />
        </div>
      </div>

      <Card style={{ marginTop: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>📉 평균 운동에너지 감쇠</div>
        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 12 }}>
          이론값(<K tex="e^{-4\nu t}" />)과 시뮬레이션 값이 정확히 일치한다. ν가 작아질수록 감쇠가 느려진다.
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={energySeries} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid {...RC_GRID} />
              <XAxis dataKey="t" {...RC_AXIS} label={{ value: '시간 t', position: 'insideBottomRight', offset: -2, fill: T.textDim, fontSize: 11 }} />
              <YAxis {...RC_AXIS} />
              <Tooltip {...RC_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 12, color: T.textDim }} />
              <Line type="monotone" dataKey="energy" stroke={T.accent} strokeWidth={2.5} dot={{ r: 3, fill: T.accent }} name="시뮬레이션" />
              <Line type="monotone" dataKey="exp" stroke={T.amber} strokeWidth={1.5} dot={false} strokeDasharray="5 4" name="이론 e^(-4νt)" />
              <ReferenceLine x={frame.t} stroke={T.green} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Callout kind="insight" title="여기서 무엇을 보았는가">
        Taylor–Green vortex의 와동 패턴이 ν가 작을수록 오래 유지되는 것을 확인했다.
        다음 섹션부터 이 NS 해석해 없이 — 단 수십 초의 학습으로 — PINN이 동일한 흐름을
        <strong style={{ color: T.text }}> 격자도 데이터도 없이</strong> 어떻게 푸는지 본다.
      </Callout>
    </Section>
  )
}

// ============================================================
// §3 — PINN 원리 (CDR 정상해)
// ============================================================
function PINNConcept() {
  const kKeys = Object.keys(cdrData).sort((a, b) => parseFloat(a) - parseFloat(b))
  const [k, setK] = useState(4.0)
  const [showCode, setShowCode] = useState(false)
  const nearestKey = kKeys.reduce((best, k_) =>
    Math.abs(parseFloat(k_) - k) < Math.abs(parseFloat(best) - k) ? k_ : best, kKeys[0])
  const sol = cdrData[nearestKey]
  const chartData = sol.x.map((xi, i) => ({ x: xi, c: sol.c[i] }))

  return (
    <Section id="pinn" kicker="실습 2 · PINN 원리" title="PINN: PDE 잔차를 손실로">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 14 }}>
        촉매 반응이 일어나는 1D 유로의 정상 대류–확산–반응을 생각하자.
        반응속도상수 <K tex="k" />가 바뀌면 농도 분포 <K tex="c(x)" />가 어떻게 바뀌는가?
      </p>

      <Card style={{ marginBottom: 18 }}>
        <K display tex={String.raw`u\,\frac{dc}{dx} = D\,\frac{d^2 c}{dx^2} - k\,c,\qquad c(0)=1,\ c(L)=0`} />
        <div style={{ fontSize: 13, color: T.textDim, marginTop: 10 }}>
          PINN의 핵심 아이디어: 신경망 <K tex={String.raw`c_\theta(x)`} />을 두고, 위 PDE를 만족하도록 학습한다. 손실은:
        </div>
        <K display tex={String.raw`\mathcal{L} = \lambda_r \underbrace{\big\|u\,c_x - D\,c_{xx} + k\,c\big\|^2}_{\text{PDE 잔차}} + \lambda_b \underbrace{\big\|c(0)-1\big\|^2 + \big\|c(L)\big\|^2}_{\text{경계조건}}`} />
        <div style={{ fontSize: 13, color: T.textDim }}>
          공선점에서 도함수는 <strong style={{ color: T.text }}>자동미분</strong>으로 계산된다 — 차분 근사가 아닌 기계 정밀도다.
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 280px) 1fr', gap: 20, alignItems: 'start' }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>⚙️ 반응속도상수 조절</div>
          <Slider label="k (반응속도)" value={k} min={0.5} max={10} step={0.1} onChange={setK} fmt={(v) => v.toFixed(1)} />
          <div style={{ fontSize: 11.5, color: T.textMute, marginTop: 6 }}>
            k가 크면 반응이 빨라 농도가 더 가파르게 감소한다. k=0이면 단순 대류–확산.
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
            <button onClick={() => setShowCode(v => !v)}
              style={{ background: 'transparent', border: 'none', color: T.accent, fontSize: 13, cursor: 'pointer', padding: 0 }}>
              {showCode ? '▼ 의사코드 숨기기' : '▶ PINN 학습 의사코드 보기'}
            </button>
            {showCode && (
              <pre style={{
                marginTop: 8, background: '#0a0e1a', color: '#cbd5e1', fontSize: 11,
                padding: 12, borderRadius: 6, overflow: 'auto', fontFamily: T.fontMono,
                border: `1px solid ${T.border}`, lineHeight: 1.5,
              }}>
{`net   = MLP(1 → 32 → 32 → 1)
opt   = Adam(lr=5e-3)
for epoch in range(8000):
  c    = net(x_collocation)
  c_x  = grad(c,  x)           # 자동미분
  c_xx = grad(c_x, x)
  res  = u*c_x - D*c_xx + k*c  # PDE 잔차
  L = mean(res²) + λ·BC손실
  L.backward()
  opt.step()`}
              </pre>
            )}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>📈 농도장 c(x) — 위 슬라이더로 k 조절</div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid {...RC_GRID} />
                <XAxis dataKey="x" type="number" domain={[0, 1]} {...RC_AXIS}
                  tickFormatter={(v) => v.toFixed(2)}
                  label={{ value: '위치 x', position: 'insideBottom', offset: -8, fill: T.textDim, fontSize: 11 }} />
                <YAxis domain={[0, 1]} {...RC_AXIS}
                  label={{ value: '농도 c(x)', angle: -90, position: 'insideLeft', fill: T.textDim, fontSize: 11 }} />
                <Tooltip {...RC_TOOLTIP} formatter={(v) => v.toFixed(3)} />
                <Line type="monotone" dataKey="c" stroke={T.accent} strokeWidth={2.5} dot={false} name={`c(x) for k=${sol.k}`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11.5, color: T.textMute, marginTop: 8, fontStyle: 'italic' }}>
            ※ 위 곡선은 사전 계산된 정밀 FDM 해. 실제 PINN을 학습시켜도 4–5% 오차로 이와 거의 일치한다.
            진짜 PINN 학습은 §4(실시간 학습)에서 직접 본다.
          </div>
        </Card>
      </div>

      <Callout kind="insight" title="다음 섹션 예고">
        지금까지는 <em>해를 보는</em> 인터랙티브였다. 다음은 PINN이 <strong style={{ color: T.text }}>측정 데이터로부터
        반대로</strong> 알려지지 않은 k를 추정하는 <strong style={{ color: T.text }}>역문제</strong>다.
      </Callout>
    </Section>
  )
}

// ============================================================
// §4 — PINN 역문제
// ============================================================
function PINNInverse() {
  const [nMeas, setNMeas] = useState(8)
  const [noise, setNoise] = useState(2)
  const [showConv, setShowConv] = useState(true)
  const trueSol = cdrData["4.0"]
  const measurements = useMemo(() => {
    const N = trueSol.x.length
    const meas = []
    for (let i = 0; i < nMeas; i++) {
      const idx = Math.round((N - 1) * (i + 1) / (nMeas + 1))
      const r = Math.sin((i + 1) * 137.5) * (noise / 100)
      meas.push({ x: trueSol.x[idx], c: trueSol.c[idx] * (1 + r) })
    }
    return meas
  }, [nMeas, noise, trueSol])

  const trueCurve = trueSol.x.map((xi, i) => ({ x: xi, true: trueSol.c[i] }))
  const combined = trueCurve.map(d => ({ ...d, meas: null }))
  measurements.forEach(m => combined.push({ x: m.x, true: null, meas: m.c }))
  combined.sort((a, b) => a.x - b.x)

  const convData = invData.epochs.map((ep, i) => ({
    epoch: ep, k_est: invData.k_est[i], k_true: invData.k_true
  }))

  return (
    <Section id="inverse" kicker="실습 2 · 역문제" title="역문제: 측정에서 미지의 k를 추정">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 14 }}>
        현실의 곤경: 반응속도상수 <K tex="k" />를 모르고, 농도는 듬성한 측정점에서 노이즈를 안고 측정된다.
        PINN은 미지 <K tex="k" />를 학습 변수로 두어 농도장 복원과 파라미터 추정을 <strong style={{ color: T.text }}>동시에</strong> 해낸다.
      </p>

      <Card style={{ marginBottom: 18, background: '#050811', borderColor: T.borderHi }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent2, letterSpacing: 1.5, fontFamily: T.fontMono, marginBottom: 8, textTransform: 'uppercase' }}>
          PINN 역문제의 핵심 한 줄
        </div>
        <pre style={{ fontSize: 12, color: '#cbd5e1', fontFamily: T.fontMono, margin: 0, overflow: 'auto', lineHeight: 1.5 }}>
{`log_k = nn.Parameter(0.0)  # k = exp(log_k) > 0, 학습 변수
opt = Adam(list(net.parameters()) + [log_k], lr=5e-3)  # 함께 최적화!`}
        </pre>
        <div style={{ fontSize: 12, color: T.textMute, marginTop: 8, fontStyle: 'italic' }}>
          이 한 줄로 신경망 가중치와 미지 k를 동시에 학습한다.
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 280px) 1fr', gap: 20, alignItems: 'start' }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>⚙️ 측정 시나리오</div>
          <Slider label="측정점 개수" value={nMeas} min={3} max={15} step={1} onChange={setNMeas} suffix="개" />
          <Slider label="측정 노이즈" value={noise} min={0} max={10} step={0.5} onChange={setNoise} suffix="%" fmt={(v) => v.toFixed(1)} />
          <div style={{ fontSize: 11.5, color: T.textMute, marginTop: 6, marginBottom: 14, lineHeight: 1.5 }}>
            측정점이 적거나 노이즈가 크면 k 식별이 어려워진다(= identifiability 문제).
          </div>
          <Btn variant="subtle" onClick={() => setShowConv(v => !v)} style={{ width: '100%' }}>
            {showConv ? 'k 수렴 차트 숨기기' : 'k 수렴 차트 보기'}
          </Btn>
        </Card>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>📉 농도장 복원</div>
          <div style={{ fontSize: 12, color: T.textMute, marginBottom: 8 }}>
            회색: 참 농도장 · 빨간 점: 측정 · PINN은 이로부터 거의 동일한 곡선과 k≈4를 복원한다.
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={combined} margin={{ top: 10, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid {...RC_GRID} />
                <XAxis dataKey="x" type="number" domain={[0, 1]} {...RC_AXIS}
                  tickFormatter={(v) => v.toFixed(2)}
                  label={{ value: '위치 x', position: 'insideBottom', offset: -8, fill: T.textDim, fontSize: 11 }} />
                <YAxis domain={[0, 1.1]} {...RC_AXIS} />
                <Tooltip {...RC_TOOLTIP} />
                <Line type="monotone" dataKey="true" stroke="#94a3b8" strokeWidth={2} dot={false} name="참 농도장" connectNulls />
                <Line type="monotone" dataKey="meas" stroke="#f87171" strokeWidth={0} dot={{ r: 5, fill: '#f87171' }} name="측정 (noisy)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {showConv && (
        <Card style={{ marginTop: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>🎯 미지 파라미터 k 수렴</div>
          <div style={{ fontSize: 13, color: T.textDim, marginBottom: 10 }}>
            초기 추정 k=1에서 시작해 학습 진행과 함께 참값 k=4로 수렴한다.
            8점 측정 + 2% 노이즈 조건에서 최종 오차는 약 1.6%.
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={convData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid {...RC_GRID} />
                <XAxis dataKey="epoch" {...RC_AXIS} label={{ value: 'epoch', position: 'insideBottom', offset: -5, fill: T.textDim, fontSize: 11 }} />
                <YAxis domain={[0, 5]} {...RC_AXIS}
                  label={{ value: 'k 추정', angle: -90, position: 'insideLeft', fill: T.textDim, fontSize: 11 }} />
                <Tooltip {...RC_TOOLTIP} />
                <Line type="monotone" dataKey="k_est" stroke={T.green} strokeWidth={2.5} dot={{ r: 3, fill: T.green }} name="PINN 추정 k" />
                <Line type="monotone" dataKey="k_true" stroke={T.red} strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="참값 k=4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Callout kind="key" title="이것이 PINN의 진짜 강점이다">
        순방향 풀이만 보면 이 선형 ODE는 전통 방법이 압도적으로 빠르다. 그러나{' '}
        <strong style={{ color: T.text }}>미지 파라미터를 데이터로부터 추정</strong>하는 역문제에서는 다르다.
        PINN은 추가 코드 거의 없이(k를 변수로 선언하는 한 줄) 농도장 복원과 파라미터 추정을 동시에 해낸다.
        화공에서 이는 PIV/PLIF 데이터로부터 압력·속도장 복원, 반응 데이터로부터 속도상수·활성화에너지 추정으로 직결된다.
      </Callout>
    </Section>
  )
}

// ============================================================
// §5 — PINN 실시간 학습 (TF.js로 1D Poisson)
// ============================================================
function PINNLive() {
  const [training, setTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [hist, setHist] = useState([])
  const [predCurve, setPredCurve] = useState(null)
  const modelRef = useRef(null)
  const stopRef = useRef(false)
  const [lr, setLr] = useState(0.01)
  const [width, setWidth] = useState(20)
  const [maxEpochs, setMaxEpochs] = useState(150)

  const trueCurve = useMemo(() => {
    const arr = []
    for (let i = 0; i <= 50; i++) {
      const x = i / 50
      arr.push({ x, true: Math.sin(Math.PI * x), pred: 0 })
    }
    return arr
  }, [])

  function createModel(width) {
    const m = tf.sequential()
    m.add(tf.layers.dense({ units: width, activation: 'tanh', inputShape: [1] }))
    m.add(tf.layers.dense({ units: width, activation: 'tanh' }))
    m.add(tf.layers.dense({ units: 1, activation: 'linear' }))
    return m
  }

  async function train() {
    setTraining(true); stopRef.current = false; setEpoch(0); setHist([])
    const model = createModel(width); modelRef.current = model
    const opt = tf.train.adam(lr)
    const Nc = 64
    const xs = Array.from({ length: Nc }, (_, i) => (i + 0.5) / Nc)
    const fdH = 1 / 200
    const x_coll = tf.tensor2d(xs.map(x => [x]))
    const x_left = tf.tensor2d(xs.map(x => [x - fdH]))
    const x_right = tf.tensor2d(xs.map(x => [x + fdH]))
    const x_bc = tf.tensor2d([[0], [1]])
    const u_bc = tf.tensor2d([[0], [0]])
    const trueRhs = tf.tensor2d(xs.map(x => [-Math.PI * Math.PI * Math.sin(Math.PI * x)]))

    const newHist = []
    for (let ep = 1; ep <= maxEpochs; ep++) {
      if (stopRef.current) break
      const lossT = opt.minimize(() => {
        return tf.tidy(() => {
          const u_c = model.apply(x_coll)
          const u_l = model.apply(x_left)
          const u_r = model.apply(x_right)
          const u_xx = u_r.sub(u_c.mul(2)).add(u_l).div(fdH * fdH)
          const residual = u_xx.sub(trueRhs)
          const L_pde = residual.square().mean()
          const u_pred_bc = model.apply(x_bc)
          const L_bc = u_pred_bc.sub(u_bc).square().mean()
          return L_pde.add(L_bc.mul(50))
        })
      }, true)
      const lossVal = (await lossT.data())[0]
      lossT.dispose()
      newHist.push({ epoch: ep, loss: lossVal })
      if (ep % 5 === 0 || ep === maxEpochs) {
        setEpoch(ep)
        setHist([...newHist])
        const xt = tf.tensor2d(trueCurve.map(d => [d.x]))
        const yt = model.predict(xt)
        const yp = await yt.data()
        const newCurve = trueCurve.map((d, i) => ({ x: d.x, true: d.true, pred: yp[i] }))
        setPredCurve(newCurve)
        xt.dispose(); yt.dispose()
        await new Promise(r => setTimeout(r, 0))
      }
    }
    x_coll.dispose(); x_left.dispose(); x_right.dispose()
    x_bc.dispose(); u_bc.dispose(); trueRhs.dispose()
    setTraining(false)
  }
  function stop() { stopRef.current = true }
  function reset() {
    stopRef.current = true
    setEpoch(0); setHist([]); setPredCurve(null)
    if (modelRef.current) { modelRef.current.dispose(); modelRef.current = null }
  }

  const finalErr = predCurve ? Math.sqrt(
    predCurve.reduce((s, d) => s + (d.pred - d.true) ** 2, 0) /
    predCurve.reduce((s, d) => s + d.true ** 2, 0)
  ) : null

  return (
    <Section id="live" kicker="실습 3 · 실시간 학습" title="브라우저에서 진짜 PINN 학습시키기">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 14 }}>
        <strong style={{ color: T.text }}>지금 이 페이지에서</strong> 실제 PINN을 학습시켜 보자. 영역 [0,1]에서{' '}
        <K tex={String.raw`u''(x) = -\pi^2 \sin(\pi x),\ u(0)=u(1)=0`} />
        의 해(<K tex={String.raw`\sin(\pi x)`} />)를 신경망이 찾아간다. TensorFlow.js가 브라우저에서 직접 학습한다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 280px) 1fr', gap: 20, alignItems: 'start' }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>⚙️ 학습 설정</div>
          <Slider label="학습률 (lr)" value={lr} min={0.001} max={0.05} step={0.001} onChange={setLr} fmt={(v) => v.toFixed(3)} />
          <Slider label="은닉층 너비" value={width} min={8} max={48} step={4} onChange={setWidth} suffix=" units" />
          <Slider label="최대 epoch" value={maxEpochs} min={50} max={500} step={50} onChange={setMaxEpochs} />

          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {!training ? (
              <Btn variant="success" onClick={train} style={{ flex: 1 }}>▶ 학습 시작</Btn>
            ) : (
              <Btn variant="warn" onClick={stop} style={{ flex: 1 }}>⏸ 정지</Btn>
            )}
            <Btn variant="subtle" onClick={reset} disabled={training} size="sm">↻ 리셋</Btn>
          </div>

          <div style={{ marginTop: 14, fontSize: 12, color: T.textDim, lineHeight: 1.8 }}>
            <div>현재 epoch: <span style={{ fontFamily: T.fontMono, color: T.text, fontWeight: 700 }}>{epoch} / {maxEpochs}</span></div>
            {hist.length > 0 && (
              <div>최근 손실: <span style={{ fontFamily: T.fontMono, color: T.text, fontWeight: 700 }}>{hist[hist.length - 1].loss.toExponential(2)}</span></div>
            )}
            {finalErr !== null && (
              <div>해석해 대비 상대 L₂: <span style={{ fontFamily: T.fontMono, color: T.green, fontWeight: 700 }}>{(finalErr * 100).toFixed(2)}%</span></div>
            )}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>📈 신경망 예측 vs 해석해</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={predCurve || trueCurve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid {...RC_GRID} />
                <XAxis dataKey="x" type="number" domain={[0, 1]} {...RC_AXIS} tickFormatter={(v) => v.toFixed(2)} />
                <YAxis domain={[-0.1, 1.1]} {...RC_AXIS} />
                <Tooltip {...RC_TOOLTIP} formatter={(v) => v == null ? '-' : v.toFixed(3)} />
                <Legend wrapperStyle={{ fontSize: 12, color: T.textDim }} />
                <Line type="monotone" dataKey="true" stroke="#94a3b8" strokeWidth={2.5} dot={false} name="해석해 sin(πx)" />
                {predCurve && <Line type="monotone" dataKey="pred" stroke={T.accent} strokeWidth={2.5} dot={false} name={`PINN 예측 (epoch ${epoch})`} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6, marginTop: 14 }}>📉 학습 손실</div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={hist} margin={{ top: 5, right: 20, bottom: 15, left: 0 }}>
                <CartesianGrid {...RC_GRID} />
                <XAxis dataKey="epoch" {...RC_AXIS} />
                <YAxis scale="log" domain={['auto', 'auto']} {...RC_AXIS} tickFormatter={(v) => v.toExponential(0)} />
                <Tooltip {...RC_TOOLTIP} formatter={(v) => v.toExponential(2)} />
                <Line type="monotone" dataKey="loss" stroke={T.accent} strokeWidth={2} dot={false} name="loss" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Callout kind="insight" title="당신이 본 것">
        에폭 0에서 신경망은 무작위 초기 가중치 — 곡선이 거의 0 또는 무의미한 모양이었다.
        에폭이 진행되면서 <strong style={{ color: T.text }}>PDE 잔차 손실</strong>이 신경망을 정답으로 끌어당겼다.
        격자도, 학습 데이터도 없이 오직 PDE 방정식의 만족만으로 해가 학습됐다. 이것이 PINN의 본질이다.
        <div style={{ marginTop: 8, fontSize: 12, color: T.textMute, fontStyle: 'italic' }}>
          ※ 본 브라우저 데모는 안정적인 학습을 위해 u″(x)를 유한차분(h=0.005)으로 근사한다.
          연구용 PINN은 자동미분으로 정확히 계산하며, 두 결과는 거의 동일하다.
        </div>
      </Callout>
    </Section>
  )
}

// ============================================================
// §6 — Darcy 인터랙티브 (Neural Operator)
// ============================================================
function DarcyOperator() {
  const N = 25
  const [perm, setPerm] = useState(() => makePreset('channel', N))
  const [pressure, setPressure] = useState(null)
  const [solving, setSolving] = useState(false)
  const [solveTime, setSolveTime] = useState(null)
  const [brushVal, setBrushVal] = useState(5.0)
  const [brushSize, setBrushSize] = useState(1)
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    let t = setTimeout(async () => {
      setSolving(true)
      const t0 = performance.now()
      await new Promise(r => setTimeout(r, 10))
      const { u } = solveDarcy(perm, { maxIter: 800, tol: 1e-5 })
      const dt = performance.now() - t0
      setSolveTime({ ms: dt })
      setPressure(u.map(row => Array.from(row)))
      setSolving(false)
    }, 250)
    return () => clearTimeout(t)
  }, [perm])

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const w = 280, h = 280
    cvs.width = w * 1.5; cvs.height = h * 1.5
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    const ctx = cvs.getContext('2d')
    ctx.scale(1.5, 1.5)
    const vmin = 0.1, vmax = 6.0
    const cw = w / N, ch = h / N
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const v = perm[i][j]
        const t = Math.max(0, Math.min(1, (v - vmin) / (vmax - vmin)))
        // plasma-like
        const r = Math.round(255 * (0.05 + 0.93 * Math.pow(t, 0.8)))
        const g = Math.round(255 * (0.03 + 0.95 * Math.pow(t, 2)))
        const b = Math.round(255 * (0.53 - 0.39 * t))
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(i * cw, (N - 1 - j) * ch, cw + 0.5, ch + 0.5)
      }
  }, [perm])

  function cellAt(evt) {
    const cvs = canvasRef.current
    const rect = cvs.getBoundingClientRect()
    const x = evt.clientX - rect.left, y = evt.clientY - rect.top
    const i = Math.floor(x / (rect.width / N))
    const j = (N - 1) - Math.floor(y / (rect.height / N))
    return [i, j]
  }
  function paint(i, j) {
    setPerm(prev => {
      const next = prev.map(row => Float64Array.from(row))
      for (let di = -brushSize + 1; di < brushSize; di++)
        for (let dj = -brushSize + 1; dj < brushSize; dj++) {
          const ii = i + di, jj = j + dj
          if (ii >= 0 && ii < N && jj >= 0 && jj < N) next[ii][jj] = brushVal
        }
      return next
    })
  }
  const onMouseDown = (e) => { const [i, j] = cellAt(e); paint(i, j); setDrawing(true) }
  const onMouseMove = (e) => { if (drawing) { const [i, j] = cellAt(e); paint(i, j) } }
  const onMouseUp = () => setDrawing(false)
  const pStats = pressure ? arrStats(pressure) : null

  return (
    <Section id="darcy" kicker="실습 4 · Neural Operator" title="Darcy 흐름: 투과율장 → 압력장 학습">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 14 }}>
        다공질 매체(촉매 충전층, 멤브레인, 지하 대수층)의 압력 분포는 투과율장 <K tex={String.raw`a(\mathbf{x})`} />에 따라 결정된다.
      </p>
      <Card style={{ marginBottom: 18 }}>
        <K display tex={String.raw`-\nabla\cdot\big(a(\mathbf{x})\,\nabla u(\mathbf{x})\big) = f,\qquad u\big|_{\partial\Omega}=0`} />
        <div style={{ fontSize: 13, color: T.textDim, marginTop: 8 }}>
          왼쪽 캔버스에 마우스로 투과율 패턴을 직접 그려보자.
          <strong style={{ color: '#fbbf24' }}> 밝은 색</strong>은 고투과,
          <strong style={{ color: '#7c3aed' }}> 어두운 색</strong>은 저투과 영역이다.
          오른쪽에 즉시 압력장이 계산된다.
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ textAlign: 'center', fontSize: 13, color: T.textDim, fontWeight: 500, marginBottom: 8 }}>
            투과율 a(x) — 직접 그려보세요
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <canvas ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{ cursor: 'crosshair', borderRadius: 6, border: `1px solid ${T.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>붓 값</label>
            <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
              {[{ v: 0.1, name: '저(0.1)', c: '#5b21b6' },
                { v: 1.0, name: '중(1)', c: '#10b981' },
                { v: 5.0, name: '고(5)', c: '#fbbf24' }].map(b => (
                <button key={b.v} onClick={() => setBrushVal(b.v)}
                  style={{
                    flex: 1, padding: '7px 0', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                    background: b.c, color: b.v === 5.0 ? '#000' : '#fff',
                    border: `2px solid ${brushVal === b.v ? T.accent : 'transparent'}`,
                    fontWeight: 700, opacity: brushVal === b.v ? 1 : 0.75,
                  }}>{b.name}</button>
              ))}
            </div>
          </div>
          <Slider label="붓 크기" value={brushSize} min={1} max={4} step={1} onChange={setBrushSize} suffix="×" />
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>프리셋 패턴</label>
            <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
              {[['uniform', '균일'], ['channel', '채널'], ['bypass', '병렬 채널'],
                ['lowperm', '저투과 장애물'], ['fractal', '무작위']].map(([k, name]) => (
                <button key={k} onClick={() => setPerm(makePreset(k, N))}
                  style={{
                    padding: '5px 11px', fontSize: 11.5, borderRadius: 5, cursor: 'pointer',
                    background: T.cardHi, color: T.textDim,
                    border: `1px solid ${T.border}`, fontWeight: 500,
                  }}>{name}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ textAlign: 'center', fontSize: 13, color: T.textDim, fontWeight: 500, marginBottom: 8 }}>
            압력장 u(x) {solving && <span style={{ color: T.amber, marginLeft: 6 }}>계산 중...</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {pressure && <Heatmap values={pressure} cmap="magma" width={280} height={280} />}
          </div>
          {pStats && solveTime && (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11.5 }}>
              <div style={{ padding: 8, background: T.cardHi, borderRadius: 6, border: `1px solid ${T.border}` }}>
                <div style={{ color: T.textMute }}>최대 압력</div>
                <div style={{ fontFamily: T.fontMono, fontWeight: 700, color: T.accent2 }}>{pStats.max.toFixed(4)}</div>
              </div>
              <div style={{ padding: 8, background: T.cardHi, borderRadius: 6, border: `1px solid ${T.border}` }}>
                <div style={{ color: T.textMute }}>평균 압력</div>
                <div style={{ fontFamily: T.fontMono, fontWeight: 700, color: T.accent2 }}>{pStats.mean.toFixed(4)}</div>
              </div>
              <div style={{ padding: 8, background: T.cardHi, borderRadius: 6, border: `1px solid ${T.border}` }}>
                <div style={{ color: T.textMute }}>계산 시간 (FDM)</div>
                <div style={{ fontFamily: T.fontMono, fontWeight: 700, color: T.text }}>{solveTime.ms.toFixed(1)} ms</div>
              </div>
              <div style={{ padding: 8, background: 'rgba(16,185,129,0.1)', borderRadius: 6, border: `1px solid ${T.green}` }}>
                <div style={{ color: T.green }}>FNO 추론 (가정)</div>
                <div style={{ fontFamily: T.fontMono, fontWeight: 700, color: T.green }}>~ 2 ms <span style={{ fontSize: 10 }}>({(solveTime.ms / 2).toFixed(0)}× 빠름)</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Card style={{ marginTop: 22, background: T.cardHi }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>🧠 학습된 FNO가 하는 일</div>
        <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.7 }}>
          이 페이지에서는 정직성을 위해 <strong style={{ color: T.text }}>실제 FDM 솔버</strong>가 돌고 있다(브라우저 JS, ~25×25 격자).
          하지만 학습된 <strong style={{ color: T.accent }}>FNO(Fourier Neural Operator)</strong>는 같은 입출력 관계를{' '}
          <strong style={{ color: T.text }}>이산화 없이, 격자 해상도와 무관하게</strong> 학습한다.
          본 강의에서는 49×49 격자 + 900개 학습 샘플로 학습한 FNO가 평균{' '}
          <strong style={{ color: T.green }}>4.85% 상대 L₂ 오차</strong>로 압력장을 추론했고,
          단일 추론은 GPU에서 수 ms로 완료된다.
        </div>
        <div style={{ marginTop: 14, height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={fnoProgress.epochs.map((ep, i) => ({
              epoch: ep, train: fnoProgress.train_l2[i], test: fnoProgress.test_l2[i]
            }))}>
              <CartesianGrid {...RC_GRID} />
              <XAxis dataKey="epoch" {...RC_AXIS} />
              <YAxis scale="log" domain={[0.04, 0.5]} {...RC_AXIS} tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip {...RC_TOOLTIP} formatter={(v) => v.toFixed(4)} />
              <Legend wrapperStyle={{ fontSize: 12, color: T.textDim }} />
              <Line type="monotone" dataKey="train" stroke={T.accent} strokeWidth={2} dot={{ r: 2, fill: T.accent }} name="학습 오차" />
              <Line type="monotone" dataKey="test" stroke={T.green} strokeWidth={2} dot={{ r: 2, fill: T.green }} name="테스트 오차" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 11.5, color: T.textMute, marginTop: 8, fontStyle: 'italic' }}>
          ※ Neural Operator의 핵심: 학습 후에는 <strong>새로운 a(x)에 즉시 추론</strong>한다. 설계 탐색·최적화·UQ에서 강력하다.
        </div>
      </Card>
    </Section>
  )
}

// ============================================================
// §7 — Neural Rendering / Neural Field
// ============================================================
function NeuralRendering() {
  const [nViews, setNViews] = useState(8)
  const trueField = useMemo(() => {
    const N = 20
    const arr = Array.from({ length: N }, () => new Float64Array(N))
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const x = (i - N/2) / N, y = (j - N/2) / N
        arr[i][j] = 1.5 * Math.exp(-(x*x + y*y) / 0.04) + 0.6 * Math.exp(-((x-0.2)**2 + (y+0.1)**2) / 0.02)
      }
    return arr
  }, [])
  const reconstructed = useMemo(() => {
    const N = trueField.length
    const noiseLevel = 0.8 / Math.sqrt(nViews)
    const arr = Array.from({ length: N }, () => new Float64Array(N))
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const r = Math.sin(i * 4.7 + j * 3.1 + nViews) * Math.cos(i * 7.3 - j * 2.9)
        arr[i][j] = Math.max(0, trueField[i][j] + r * noiseLevel * 0.5)
      }
    return arr
  }, [nViews, trueField])
  const errArr = useMemo(() =>
    trueField.map((row, i) => row.map((v, j) => Math.abs(v - reconstructed[i][j]))),
    [reconstructed, trueField]
  )
  const errL2 = l2RelError(reconstructed.map(r => [...r]), trueField.map(r => [...r]))

  const apps = [
    { title: '단층촬영 (흡수/방출)', desc: '여러 각도의 시선 적분(line-of-sight)에서 화염의 3D 온도·화학종 농도장 복원', color: '#fbbf24' },
    { title: '연기·기포 가시화',     desc: '다시점 영상에서 동적 밀도장 복원 (NS 비압축성 제약 결합)',                       color: '#60a5fa' },
    { title: 'PIV / PLIF',           desc: '입자 영상에서 속도·스칼라장 복원 (PINN 역문제의 광학 확장)',                       color: '#10b981' },
    { title: '다공질 기하 복원',     desc: '3D Gaussian Splatting으로 복잡 기하 빠르게 복원 → CFD 전처리(격자)',              color: '#a855f7' },
  ]

  return (
    <Section id="render" kicker="실습 5 · Neural Field" title="실험 측정에서 3D 유체장 복원">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 18 }}>
        화학공학 광학 측정의 다수는 <strong style={{ color: T.text }}>"희소 투영 → 3D 장"</strong>의 역문제다.
        Neural field는 시공간 장을 연속 함수로 표현하고, 측정과 물리 제약을 결합해 복원한다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 22 }}>
        {apps.map((a, i) => (
          <Card key={i} accent={a.color}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>{a.desc}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>🔬 인터랙티브: 측정 시점 수와 복원 품질</div>
        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 14 }}>
          몇 개의 측정 시점(view)으로 3D 장을 복원할 수 있을까? 시점이 많을수록 노이즈가 줄어든다.
        </div>
        <Slider label="측정 시점 수" value={nViews} min={2} max={32} step={1} onChange={setNViews} suffix=" views" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16, justifyItems: 'center' }}>
          <Heatmap values={trueField} cmap="viridis" width={180} height={180} label="실제 (3D 장)" vmin={0} vmax={1.6} />
          <Heatmap values={reconstructed} cmap="viridis" width={180} height={180} label="복원 (neural field)" vmin={0} vmax={1.6} />
          <Heatmap values={errArr} cmap="hot" width={180} height={180} label={`복원 오차 (rel L₂ = ${(errL2 * 100).toFixed(1)}%)`} vmin={0} vmax={0.6} />
        </div>
        <div style={{ fontSize: 11.5, color: T.textMute, marginTop: 14, fontStyle: 'italic' }}>
          ※ 토이 시뮬레이션: 실제로는 NS 비압축성·시간 일관성 제약을 결합해 훨씬 적은 시점에서도 정확한 복원이 가능하다.
        </div>
      </Card>

      <Callout kind="warn" title="표현이 풀이를 보장하지 않는다">
        Neural field/Gaussian Splatting은 강력한 표현·복원 도구이지만, 그 자체가 PDE를 푸는 것은 아니다.
        물리적 타당성은 결합된 PINN/NS 제약의 품질에 달려 있다. 항상 "어디까지가 데이터 적합이고
        어디부터가 물리 외삽인가"를 구분해야 한다.
      </Callout>
    </Section>
  )
}

// ============================================================
// §8 — 방법 선택 가이드
// ============================================================
function MethodGuide() {
  const [answers, setAnswers] = useState({ q1: null, q2: null, q3: null })
  const Q = [
    { id: 'q1', text: '문제 유형은?', opts: [
      { v: 'forward',     label: '정해 풀이 (forward)' },
      { v: 'inverse',     label: '미지 파라미터/장 추정 (inverse)' },
      { v: 'repeated',    label: '같은 PDE를 수많은 입력으로 반복' },
      { v: 'reconstruct', label: '실험 측정에서 3D 장 복원' },
    ]},
    { id: 'q2', text: '데이터는?', opts: [
      { v: 'physics_only',  label: '물리법칙만 알려져 있음' },
      { v: 'sparse_meas',   label: '듬성한 측정 + 물리법칙' },
      { v: 'lots_of_data',  label: '대규모 시뮬레이션 데이터' },
      { v: 'images',        label: '카메라/광학 영상' },
    ]},
    { id: 'q3', text: '핵심 제약은?', opts: [
      { v: 'accuracy',  label: '정확도가 최우선' },
      { v: 'speed',     label: '추론 속도가 최우선' },
      { v: 'few_runs',  label: '한 번만 풀면 됨' },
      { v: 'flexible',  label: '복잡 기하/희소 센서' },
    ]},
  ]
  function recommend(a) {
    if (a.q1 === 'inverse') return {
      name: 'PINN (역문제)', color: T.green,
      reason: '미지 파라미터/장 추정 + 측정 데이터 + 물리법칙 결합이 PINN의 정의적 강점이다. k 같은 미지 변수를 학습 변수로 두고 한 손실로 해결.'
    }
    if (a.q1 === 'reconstruct' || a.q2 === 'images') return {
      name: 'Neural Field + 물리 제약', color: T.amber,
      reason: 'NeRF/Gaussian Splatting 기반 신경장에 NS 비압축성·시간 일관성 같은 물리 제약을 결합. 광학 측정 → 3D 장 복원.'
    }
    if (a.q1 === 'repeated' || a.q3 === 'speed') {
      if (a.q3 === 'flexible') return {
        name: 'DeepONet', color: '#60a5fa',
        reason: '복잡 기하·희소 센서에서 강하다. branch-trunk 구조가 좌표/센서 위치 입력을 유연하게 처리.'
      }
      return {
        name: 'Fourier Neural Operator (FNO)', color: '#60a5fa',
        reason: '같은 PDE를 수많은 입력으로 반복할 때 압도적. 한 번 학습 후 새 입력에 ms 단위 추론. 격자 해상도 무관.'
      }
    }
    if (a.q3 === 'accuracy' || a.q3 === 'few_runs') return {
      name: '전통 CFD (FVM / FEM)', color: T.textMute,
      reason: '정확도 보증과 산업 검증 측면에서 여전히 최강. 한 번만 풀고 끝나는 문제라면 AI 도입 효용은 작다.'
    }
    if (a.q2 === 'physics_only') return {
      name: 'PINN', color: T.green,
      reason: '데이터 없이도 PDE만으로 학습 가능. 단, 고Re·복잡 영역에서는 한계가 있어 인과적 학습 등 추가 기법 필요.'
    }
    return null
  }
  const rec = (answers.q1 && answers.q2 && answers.q3) ? recommend(answers) : null

  return (
    <Section id="guide" kicker="종합" title="방법 선택 가이드: 어떤 도구를 쓸까?">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 18 }}>
        세 가지 질문에 답하면 당신의 상황에 가장 맞는 도구를 추천한다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {Q.map(q => (
          <Card key={q.id}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 10 }}>{q.text}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {q.opts.map(o => (
                <button key={o.v}
                  onClick={() => setAnswers(a => ({ ...a, [q.id]: o.v }))}
                  style={{
                    textAlign: 'left', padding: '8px 12px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
                    background: answers[q.id] === o.v ? T.accent : T.cardHi,
                    color: answers[q.id] === o.v ? '#fff' : T.textDim,
                    border: `1px solid ${answers[q.id] === o.v ? T.accent : T.border}`,
                    fontWeight: answers[q.id] === o.v ? 600 : 500,
                  }}>
                  {o.label}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {rec && (
        <div style={{
          marginTop: 24, borderLeft: `4px solid ${rec.color}`,
          background: 'rgba(168,85,247,0.08)', padding: 22, borderRadius: '0 12px 12px 0',
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, fontWeight: 700, color: rec.color, marginBottom: 4, fontFamily: T.fontMono, textTransform: 'uppercase' }}>
            추천 도구
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: rec.color, marginBottom: 10, fontFamily: T.fontDisplay }}>{rec.name}</div>
          <div style={{ fontSize: 14, color: T.text, lineHeight: 1.65 }}>{rec.reason}</div>
        </div>
      )}
      {!rec && (
        <div style={{ marginTop: 24, textAlign: 'center', color: T.textMute, fontStyle: 'italic' }}>
          위 세 가지를 모두 선택하면 추천이 나타납니다.
        </div>
      )}
    </Section>
  )
}

// ============================================================
// §9 — 퀴즈
// ============================================================
function Quiz() {
  const questions = [
    { q: 'PINN(Physics-Informed Neural Network)의 핵심 아이디어는?',
      opts: ['대량의 시뮬레이션 데이터에 신경망을 회귀시키는 것',
        'PDE 잔차를 손실 함수에 직접 넣어, 신경망이 PDE를 만족하도록 학습시키는 것',
        '신경망을 격자 위 값으로 보고 차분으로 미분을 계산하는 것',
        'PINN은 격자가 필요하므로 FDM보다 항상 느리다'],
      correct: 1,
      explain: 'PINN은 PDE 자체를 손실로 정의해 격자 없이도 학습한다. 도함수는 자동미분으로 정확히 계산된다.' },
    { q: 'PINN이 빛나는 가장 대표적인 상황은?',
      opts: ['단일 인스턴스의 정밀 정해를 빠르게 얻는 것',
        '미지 파라미터/장을 측정 데이터와 함께 동시에 추정하는 역문제',
        '난류의 매우 작은 스케일을 직접 시뮬레이션',
        '데이터가 전혀 없는 경우에는 PINN을 사용할 수 없다'],
      correct: 1,
      explain: '순방향 문제에서는 전통 솔버가 종종 더 빠르고 정확하다. PINN의 진짜 강점은 듬성한 측정 + 지배방정식으로 미지의 것을 복원하는 역문제다.' },
    { q: 'Neural Operator(FNO·DeepONet)와 PINN의 가장 큰 차이는?',
      opts: ['Neural Operator는 PDE를 풀지 못한다',
        'Neural Operator는 한 번의 PDE 인스턴스를 푸는 반면, PINN은 함수→함수 사상을 학습한다',
        'PINN은 한 인스턴스를 풀고, Neural Operator는 입력→해 함수의 연산자를 학습해 새 입력에 즉시 추론한다',
        '둘은 완전히 같은 방법론이다'],
      correct: 2,
      explain: 'PINN은 한 PDE의 해를 학습한다(새 입력이면 재학습). Neural Operator는 연산자 자체를 학습해 학습 후 수많은 새 입력에 ms 단위로 추론한다.' },
    { q: '"Neural Rendering(NeRF/Gaussian Splatting)으로 Navier–Stokes를 푼다"는 표현은?',
      opts: ['정확하다 — Neural Rendering은 PDE 풀이의 표준 방법이다',
        '정확하지 않다 — Neural rendering은 본래 3D 장면 복원·표현 기술이지 PDE 풀이기가 아니다',
        '정확하다 — NeRF는 PDE를 학습하도록 설계되었다',
        'Gaussian Splatting만 NS를 풀 수 있고 NeRF는 못 푼다'],
      correct: 1,
      explain: 'Neural rendering은 표현·복원 도구다. PDE 풀이는 PINN/Neural Operator의 영역이고, neural field는 그들의 backbone이거나 측정→복원 단계에서 결합된다.' },
    { q: '2D 비압축성 Navier–Stokes를 PINN으로 풀 때, 비압축성 ∇·u=0을 가장 안정적으로 강제하는 방법은?',
      opts: ['비압축성 조건을 손실 항으로 추가하기',
        '스트림함수 ψ를 도입해 u=∂ψ/∂y, v=−∂ψ/∂x로 정의 → 비압축성이 자동 만족',
        '신경망 입력에 시간 t를 빼버리기',
        '비압축성은 무시해도 PINN이 알아서 만족시킨다'],
      correct: 1,
      explain: '스트림함수 정식화로 비압축성이 구조적으로 만족된다. 본 강의 NS PINN 실습이 이 방법으로 3.74% 오차 달성.' },
    { q: 'Neural Operator surrogate를 UQ(불확실성 정량화)에 쓸 때 주의해야 할 점은?',
      opts: ['Surrogate는 전통 솔버보다 항상 더 정확하므로 검증이 불필요하다',
        'Surrogate는 출력을 매끄럽게 만드는 경향이 있어, 평균은 맞아도 분산을 과소추정할 수 있다',
        'Surrogate는 평균을 맞추지 못한다',
        '학습 시 사용한 격자 해상도에서만 평가해야 한다'],
      correct: 1,
      explain: '본 강의 실습 3: FNO-MC가 FDM-MC와 평균은 0.6% 일치했지만 표준편차는 절반으로 과소추정. 꼬리 위험(tail risk)을 과소평가하니 제어변량 같은 보정이 필요하다.' },
  ]
  const [picked, setPicked] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const score = submitted ? questions.reduce((s, q, i) => s + (picked[i] === q.correct ? 1 : 0), 0) : 0

  return (
    <Section id="quiz" kicker="확인 학습" title="개념 정리 퀴즈">
      <p style={{ color: T.textDim, lineHeight: 1.7, fontSize: 15, marginBottom: 22 }}>
        이번 주 핵심 개념을 점검해 보자. 모든 문제에 답한 후 채점하기를 누른다.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, i) => {
          const cardStyle = submitted
            ? (picked[i] === q.correct
                ? { borderColor: T.green, background: 'rgba(16,185,129,0.06)' }
                : { borderColor: T.red, background: 'rgba(248,113,113,0.06)' })
            : {}
          return (
            <Card key={i} style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>
                문제 {i+1}. {q.q}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.opts.map((opt, j) => {
                  const sel = picked[i] === j
                  const correct = q.correct === j
                  let bg = T.cardHi, fg = T.textDim, bc = T.border, fw = 500
                  if (submitted) {
                    if (correct) { bg = 'rgba(16,185,129,0.18)'; fg = '#a7f3d0'; bc = T.green; fw = 700 }
                    else if (sel) { bg = 'rgba(248,113,113,0.18)'; fg = '#fecaca'; bc = T.red }
                  } else if (sel) { bg = T.accent; fg = '#fff'; bc = T.accent; fw = 600 }
                  return (
                    <button key={j}
                      onClick={() => !submitted && setPicked(p => ({ ...p, [i]: j }))}
                      disabled={submitted}
                      style={{
                        textAlign: 'left', padding: '9px 14px', fontSize: 13, borderRadius: 6,
                        cursor: submitted ? 'default' : 'pointer',
                        background: bg, color: fg, border: `1px solid ${bc}`, fontWeight: fw,
                        fontFamily: T.font,
                      }}>
                      {submitted && correct && '✓ '}
                      {submitted && sel && !correct && '✗ '}
                      {opt}
                    </button>
                  )
                })}
              </div>
              {submitted && (
                <div style={{
                  marginTop: 12, fontSize: 13, color: T.textDim, lineHeight: 1.6,
                  background: T.cardHi, padding: 12, borderRadius: 6, border: `1px solid ${T.border}`,
                }}>
                  <strong style={{ color: T.text }}>해설.</strong> {q.explain}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {!submitted ? (
          <Btn variant="primary" onClick={() => setSubmitted(true)}
            disabled={Object.keys(picked).length < questions.length}>
            채점하기 ({Object.keys(picked).length}/{questions.length} 응답)
          </Btn>
        ) : (
          <>
            <div style={{
              padding: '14px 22px', borderRadius: 10, fontWeight: 800, fontSize: 17,
              fontFamily: T.fontDisplay,
              background: score === questions.length ? 'rgba(16,185,129,0.15)' :
                          score >= questions.length-1 ? 'rgba(96,165,250,0.15)' :
                          score >= questions.length/2 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
              color:      score === questions.length ? '#34d399' :
                          score >= questions.length-1 ? '#60a5fa' :
                          score >= questions.length/2 ? '#fbbf24' : '#f87171',
              border: `1px solid ${score === questions.length ? T.green : score >= questions.length-1 ? '#60a5fa' : score >= questions.length/2 ? T.amber : T.red}`,
            }}>
              점수: {score} / {questions.length}
              {score === questions.length && ' 🎉 완벽!'}
              {score === questions.length-1 && ' 👏 매우 잘했어요'}
              {score >= questions.length/2 && score < questions.length-1 && ' 잘 했어요'}
              {score < questions.length/2 && ' 다시 한 번 복습해 보세요'}
            </div>
            <Btn variant="subtle" onClick={() => { setPicked({}); setSubmitted(false) }}>다시 풀기</Btn>
          </>
        )}
      </div>
    </Section>
  )
}

// ============================================================
// MAIN LAYOUT — 기존 저장소 패턴 (다크, window.__backToHome)
// ============================================================
const SECTIONS = [
  { id: 'intro',   label: '도입' },
  { id: 'ns',      label: '① NS 시각화' },
  { id: 'pinn',    label: '② PINN 원리' },
  { id: 'inverse', label: '③ 역문제' },
  { id: 'live',    label: '④ 실시간 학습' },
  { id: 'darcy',   label: '⑤ Neural Operator' },
  { id: 'render',  label: '⑥ Neural Field' },
  { id: 'guide',   label: '⑦ 방법 가이드' },
  { id: 'quiz',    label: '⑧ 퀴즈' },
]

export default function Week15App() {
  const [active, setActive] = useState('intro')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      color: T.text,
      fontFamily: T.font,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .katex { color: ${T.text} !important; font-size: 1.05em !important; }
        .katex-display { margin: 0.5em 0 !important; }
      `}</style>

      {/* Header */}
      <header style={{
        background: '#050811',
        borderBottom: `1px solid ${T.border}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, letterSpacing: 2, fontFamily: T.fontMono, textTransform: 'uppercase', fontWeight: 700 }}>
              Week 15 · 화공유체역학
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay, marginTop: 2 }}>
              유체역학 × AI: PINN · Neural Operator · Neural Rendering
            </div>
          </div>
          <button onClick={() => window.__backToHome && window.__backToHome()}
            style={{
              background: 'transparent', border: `1px solid ${T.border}`,
              color: T.textDim, padding: '7px 14px', borderRadius: 8, fontSize: 12,
              cursor: 'pointer', fontFamily: T.font,
            }}>
            ← 강의 홈
          </button>
        </div>
        {/* 섹션 탭 */}
        <nav style={{ borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 4, padding: '8px 0', fontSize: 12.5 }}>
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`}
                  style={{
                    whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 6, textDecoration: 'none',
                    background: active === s.id ? T.accent : 'transparent',
                    color: active === s.id ? '#fff' : T.textDim,
                    fontWeight: active === s.id ? 700 : 500,
                    transition: 'all 0.15s',
                  }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main>
        <Intro />
        <NSVisualizer />
        <PINNConcept />
        <PINNInverse />
        <PINNLive />
        <DarcyOperator />
        <NeuralRendering />
        <MethodGuide />
        <Quiz />
      </main>

      <footer style={{
        background: '#050811', borderTop: `1px solid ${T.border}`,
        padding: '24px', textAlign: 'center', color: T.textMute, fontSize: 13,
        fontFamily: T.font,
      }}>
        Week 15 · 화공유체역학 인터랙티브 학습 노트 · SKKU School of Chemical Engineering
      </footer>
    </div>
  )
}
