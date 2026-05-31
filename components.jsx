import React, { useEffect, useMemo, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// 디자인 토큰 (기존 저장소 다크 테마 패턴)
export const T = {
  bg: '#070b14',
  card: '#0d1320',
  cardHi: '#111827',
  border: '#1a2235',
  borderHi: '#2a3550',
  text: '#f1f5f9',
  textDim: '#94a3b8',
  textMute: '#64748b',
  accent: '#a855f7',     // Week 15 메인 색 (보라 / AI 느낌)
  accent2: '#c084fc',
  cyan: '#22d3ee',
  green: '#10b981',
  amber: '#fbbf24',
  red: '#f87171',
  font: "'DM Sans','Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif",
  fontDisplay: "'Space Grotesk','Noto Sans KR',sans-serif",
  fontMono: "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace",
}

export function K({ tex, display = false, color }) {
  const html = useMemo(() => {
    try { return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html' }) }
    catch (e) { return tex }
  }, [tex, display])
  const s = display
    ? { textAlign: 'center', margin: '10px 0', color: color || T.text }
    : { color: color || T.text }
  return display
    ? <div style={s} dangerouslySetInnerHTML={{ __html: html }} />
    : <span style={s} dangerouslySetInnerHTML={{ __html: html }} />
}

export function Section({ id, kicker, title, accent, children }) {
  return (
    <section id={id} style={{
      padding: '64px 24px',
      borderBottom: `1px solid ${T.border}`,
      scrollMarginTop: 80,
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {kicker && (
          <div style={{
            fontSize: 12, letterSpacing: 3, color: accent || T.accent,
            fontFamily: T.fontMono, marginBottom: 10, textTransform: 'uppercase',
            fontWeight: 700,
          }}>{kicker}</div>
        )}
        <h2 style={{
          fontSize: 32, fontWeight: 800, color: T.text,
          fontFamily: T.fontDisplay, marginBottom: 24, lineHeight: 1.2,
        }}>{title}</h2>
        {children}
      </div>
    </section>
  )
}

export function Card({ children, accent, style }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${accent ? T.borderHi : T.border}`,
      borderRadius: 14,
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      ...(accent && { borderTop: `3px solid ${accent}` }),
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Callout({ kind = 'key', title, children }) {
  const palette = {
    key:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  label: '핵심' },
    insight: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  label: '통찰' },
    warn:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  label: '주의' },
  }
  const p = palette[kind]
  return (
    <div style={{
      borderLeft: `3px solid ${p.color}`,
      background: p.bg,
      padding: '14px 18px',
      borderRadius: '0 10px 10px 0',
      margin: '14px 0',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 6,
        fontFamily: T.fontMono, letterSpacing: 1, textTransform: 'uppercase',
      }}>
        {p.label}{title ? ` — ${title}` : ''}
      </div>
      <div style={{ color: T.text, fontSize: 14, lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

export function Slider({ label, value, min, max, step, onChange, suffix, fmt, accent }) {
  const ac = accent || T.accent
  return (
    <div style={{ margin: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: T.textDim, fontWeight: 500 }}>{label}</label>
        <span style={{ fontSize: 14, fontFamily: T.fontMono, color: ac, fontWeight: 700 }}>
          {fmt ? fmt(value) : value}{suffix || ''}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: ac }}
      />
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled, style, size = 'md' }) {
  const variants = {
    primary:   { bg: T.accent,            fg: '#fff',     border: T.accent },
    success:   { bg: T.green,             fg: '#fff',     border: T.green },
    warn:      { bg: T.amber,             fg: '#070b14',  border: T.amber },
    ghost:     { bg: 'transparent',       fg: T.text,     border: T.border },
    subtle:    { bg: T.cardHi,            fg: T.text,     border: T.border },
  }
  const v = variants[variant] || variants.primary
  const padding = size === 'sm' ? '6px 14px' : '9px 18px'
  const fs = size === 'sm' ? 12 : 13.5
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
        borderRadius: 8, padding, fontSize: fs, fontFamily: T.font,
        fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, transition: 'all 0.15s',
        ...style,
      }}
    >{children}</button>
  )
}

export function Heatmap({ values, cmap = 'viridis', width = 280, height = 280,
                         vmin, vmax, vectorField, vectorSkip = 3, label, showColorbar = true }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!canvasRef.current || !values) return
    const Nx = values.length, Ny = values[0].length
    const cmin = vmin !== undefined ? vmin : Math.min(...values.flat())
    const cmax = vmax !== undefined ? vmax : Math.max(...values.flat())
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = width * dpr; cvs.height = height * dpr
    cvs.style.width = width + 'px'; cvs.style.height = height + 'px'
    ctx.scale(dpr, dpr)
    const cw = width / Nx, ch = height / Ny
    for (let i = 0; i < Nx; i++) {
      for (let j = 0; j < Ny; j++) {
        const v = values[i][j]
        const t = (cmax - cmin) > 0 ? (v - cmin) / (cmax - cmin) : 0.5
        ctx.fillStyle = cmapColor(t, cmap)
        ctx.fillRect(i * cw, (Ny - 1 - j) * ch, cw + 0.5, ch + 0.5)
      }
    }
    if (vectorField) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 1
      const { u, v } = vectorField
      const scale = Math.min(cw, ch) * vectorSkip * 0.5
      for (let i = 0; i < Nx; i += vectorSkip) {
        for (let j = 0; j < Ny; j += vectorSkip) {
          const x0 = (i + 0.5) * cw, y0 = (Ny - 1 - j + 0.5) * ch
          const dx = u[i][j] * scale * 0.6, dy = -v[i][j] * scale * 0.6
          ctx.beginPath()
          ctx.moveTo(x0 - dx/2, y0 - dy/2)
          ctx.lineTo(x0 + dx/2, y0 + dy/2)
          ctx.stroke()
          const ang = Math.atan2(dy, dx), ah = 3
          ctx.beginPath()
          ctx.moveTo(x0 + dx/2, y0 + dy/2)
          ctx.lineTo(x0 + dx/2 - ah*Math.cos(ang-0.5), y0 + dy/2 - ah*Math.sin(ang-0.5))
          ctx.lineTo(x0 + dx/2 - ah*Math.cos(ang+0.5), y0 + dy/2 - ah*Math.sin(ang+0.5))
          ctx.closePath(); ctx.fill()
        }
      }
    }
  }, [values, cmap, width, height, vmin, vmax, vectorField, vectorSkip])

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && <div style={{ fontSize: 12, color: T.textDim, marginBottom: 6, fontWeight: 500 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <canvas ref={canvasRef} style={{ borderRadius: 6, border: `1px solid ${T.border}` }} />
        {showColorbar && values && (
          <Colorbar cmap={cmap}
            vmin={vmin ?? Math.min(...values.flat())}
            vmax={vmax ?? Math.max(...values.flat())}
            height={height} />
        )}
      </div>
    </div>
  )
}

function Colorbar({ cmap, vmin, vmax, height }) {
  const ref = useRef(null)
  const w = 14
  useEffect(() => {
    const cvs = ref.current
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = w * dpr; cvs.height = height * dpr
    cvs.style.width = w+'px'; cvs.style.height = height+'px'
    ctx.scale(dpr, dpr)
    for (let j = 0; j < height; j++) {
      const t = 1 - j / (height - 1)
      ctx.fillStyle = cmapColor(t, cmap)
      ctx.fillRect(0, j, w, 1)
    }
  }, [cmap, height])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 10, color: T.textMute, fontFamily: T.fontMono }}>{vmax.toFixed(2)}</span>
      <canvas ref={ref} style={{ borderRadius: 3, border: `1px solid ${T.border}`, margin: '4px 0' }} />
      <span style={{ fontSize: 10, color: T.textMute, fontFamily: T.fontMono }}>{vmin.toFixed(2)}</span>
    </div>
  )
}

function cmapColor(t, name) {
  t = Math.max(0, Math.min(1, t))
  if (name === 'viridis') return viridis(t)
  if (name === 'magma') return magma(t)
  if (name === 'hot') return hot(t)
  if (name === 'rdbu') return rdbu(t)
  if (name === 'plasma') return plasma(t)
  return viridis(t)
}
function lerp(a, b, t) { return a + (b - a) * t }
function rgb(r, g, b) { return `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})` }
function viridis(t) {
  const stops = [[0.267,0.005,0.329],[0.231,0.318,0.545],[0.128,0.567,0.551],[0.369,0.789,0.383],[0.993,0.906,0.144]]
  return interpStops(t, stops)
}
function magma(t) {
  const stops = [[0.001,0.000,0.014],[0.232,0.060,0.438],[0.621,0.215,0.484],[0.949,0.408,0.331],[0.987,0.991,0.749]]
  return interpStops(t, stops)
}
function plasma(t) {
  const stops = [[0.050,0.030,0.530],[0.488,0.024,0.654],[0.795,0.279,0.473],[0.973,0.585,0.252],[0.940,0.975,0.131]]
  return interpStops(t, stops)
}
function hot(t) {
  const stops = [[0.04,0,0],[0.5,0,0],[1,0.4,0],[1,0.85,0.2],[1,1,0.9]]
  return interpStops(t, stops)
}
function rdbu(t) {
  const stops = [[0.13,0.4,0.67],[0.55,0.77,0.86],[0.97,0.97,0.97],[0.96,0.65,0.51],[0.70,0.09,0.17]]
  return interpStops(t, stops)
}
function interpStops(t, stops) {
  const n = stops.length - 1
  const x = t * n, i = Math.floor(x), f = x - i
  const j = Math.min(i + 1, n)
  const a = stops[i], b = stops[j]
  return rgb(lerp(a[0],b[0],f), lerp(a[1],b[1],f), lerp(a[2],b[2],f))
}

export function l2RelError(a, b) {
  let sqDiff = 0, sqB = 0
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      sqDiff += (a[i][j]-b[i][j])**2
      sqB += b[i][j]**2
    }
  }
  return Math.sqrt(sqDiff / (sqB + 1e-12))
}
