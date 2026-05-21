import numpy as np
import matplotlib.pyplot as plt

def solve_channel(mode="poise", H=1e-4, N=81, mu=1e-3, rho=1000,
                  dpdx=5e4, u_eo=8e-4, u_wall=1e-3):
    """1-D steady NS between parallel plates via tridiagonal (Thomas) solve.
       mode: 'poise' | 'eof' | 'combo' | 'couette'  """
    dy = H / (N - 1)
    y  = np.linspace(0, H, N)
    a = np.zeros(N); b = np.zeros(N); c = np.zeros(N); d = np.zeros(N)

    wall = u_eo if mode in ("eof", "combo") else 0.0
    src  = dpdx if mode in ("poise", "combo") else 0.0

    for i in range(N):
        if i == 0:               # bottom wall
            b[i] = 1.0; d[i] = wall
        elif i == N - 1:         # top wall (moving for Couette)
            b[i] = 1.0; d[i] = u_wall if mode == "couette" else wall
        else:                    # interior:  mu u'' = -src
            a[i] =  mu/dy**2
            b[i] = -2*mu/dy**2
            c[i] =  mu/dy**2
            d[i] = -src
    u = thomas(a, b, c, d)
    return y, u

def thomas(a, b, c, d):
    n = len(d); cp = np.zeros(n); dp = np.zeros(n); x = np.zeros(n)
    cp[0] = c[0]/b[0]; dp[0] = d[0]/b[0]
    for i in range(1, n):
        m = b[i] - a[i]*cp[i-1]
        cp[i] = c[i]/m
        dp[i] = (d[i] - a[i]*dp[i-1]) / m
    x[-1] = dp[-1]
    for i in range(n-2, -1, -1):
        x[i] = dp[i] - cp[i]*x[i+1]
    return x

if __name__ == "__main__":
    fig, ax = plt.subplots(figsize=(6,4))
    for m in ("poise", "eof", "combo"):
        y, u = solve_channel(mode=m)
        ax.plot(u*1e3, y*1e6, label=m, lw=2)
    ax.set_xlabel("u  [mm/s]"); ax.set_ylabel("y  [um]")
    ax.legend(); ax.set_title("Poiseuille vs EOF (plug) vs combined")
    plt.tight_layout(); plt.show()