// 가변계수 2D Darcy 솔버 (브라우저에서 실시간 실행용, 작은 격자에서만)
//   -∇·(a ∇u) = f,  u|∂Ω = 0
// 조화평균 face 계수, Gauss-Seidel 반복 (sparse linear solver 회피)

export function solveDarcy(a, { f = 1.0, maxIter = 1500, tol = 1e-6 } = {}) {
  const N = a.length
  const h = 1.0 / (N - 1)
  const u = Array.from({ length: N }, () => new Float64Array(N))
  const hm = (p, q) => 2*p*q/(p + q + 1e-12)
  let prev = 0
  for (let it = 0; it < maxIter; it++) {
    let maxDelta = 0, sum = 0
    for (let i = 1; i < N - 1; i++) {
      for (let j = 1; j < N - 1; j++) {
        const aE = hm(a[i][j], a[i+1][j])
        const aW = hm(a[i][j], a[i-1][j])
        const aN = hm(a[i][j], a[i][j+1])
        const aS = hm(a[i][j], a[i][j-1])
        const diag = (aE + aW + aN + aS) / (h*h)
        const rhs = f + (aE*u[i+1][j] + aW*u[i-1][j] + aN*u[i][j+1] + aS*u[i][j-1]) / (h*h)
        const newVal = rhs / diag
        const d = Math.abs(newVal - u[i][j])
        if (d > maxDelta) maxDelta = d
        u[i][j] = newVal
        sum += newVal
      }
    }
    // 수렴 체크 (5번마다)
    if (it % 5 === 0 && it > 10 && maxDelta < tol * (Math.abs(sum)/(N*N) + 1e-9)) {
      return { u, iters: it+1, converged: true }
    }
  }
  return { u, iters: maxIter, converged: false }
}

// 2D 배열을 transpose (필요시)
export function transpose(arr) {
  const n = arr.length, m = arr[0].length
  const r = Array.from({ length: m }, () => new Float64Array(n))
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++)
      r[j][i] = arr[i][j]
  return r
}

// 2D 배열 통계
export function arrStats(a) {
  let mn = Infinity, mx = -Infinity, sum = 0, n = 0
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a[0].length; j++) {
      const v = a[i][j]
      if (v < mn) mn = v
      if (v > mx) mx = v
      sum += v; n++
    }
  return { min: mn, max: mx, mean: sum/n }
}

// 잘 정의된 "프리셋" 투과율 패턴들 (사용자가 클릭으로 로드)
export function makePreset(name, N) {
  const a = Array.from({ length: N }, () => new Float64Array(N))
  const xs = []; for (let i = 0; i < N; i++) xs.push(i/(N-1))
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const x = xs[i], y = xs[j]
      if (name === 'uniform') a[i][j] = 1.0
      else if (name === 'channel') {
        // 가로 채널
        a[i][j] = Math.abs(y - 0.5) < 0.12 ? 5.0 : 0.5
      } else if (name === 'bypass') {
        // 두 갈래 (위/아래)
        a[i][j] = (Math.abs(y - 0.3) < 0.08 || Math.abs(y - 0.75) < 0.08) ? 5.0 : 0.5
      } else if (name === 'lowperm') {
        // 가운데 저투과 obstacle
        const r = Math.hypot(x-0.5, y-0.5)
        a[i][j] = r < 0.18 ? 0.1 : 2.0
      } else if (name === 'fractal') {
        // 무작위 GRF 흉내 (저주파 푸리에 합)
        let v = 0
        for (let k = 0; k < 6; k++) {
          const kx = 1 + 2*Math.floor(2*Math.random())
          const ky = 1 + 2*Math.floor(2*Math.random())
          const ph = Math.random()*2*Math.PI
          v += Math.cos(2*Math.PI*(kx*x+ky*y)+ph)
        }
        v /= Math.sqrt(6)
        a[i][j] = Math.exp(0.8 * v)
      }
    }
  return a
}
