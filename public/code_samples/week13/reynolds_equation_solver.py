"""
reynolds_equation_solver.py
===========================
1D Reynolds equation for a slider bearing with arbitrary h(x):

    d/dx ( h^3 / eta * dp/dx ) = 6 V dh/dx

We solve it with a second-order finite-volume / TDMA scheme:
    a_w p_{i-1} + a_p p_i + a_e p_{i+1} = b_i,    p(0) = p(L) = p_amb

Two test profiles are included:
  (a) linear slider:    h(x) = h_in + (h_out - h_in) * x / L     (Rayleigh step's smooth cousin)
  (b) sinusoidal pocket: h(x) = h_mean + amp * sin(pi x/L)

The numerical solution is compared against the closed-form parabolic
approximation that uses h ≈ h_m (constant). Notice the asymmetry in the
exact solution — its peak lies upstream of L/2 toward larger h.

Run:
    python reynolds_equation_solver.py
"""

import numpy as np
import matplotlib.pyplot as plt


# ============================================================== solver ===
def solve_reynolds(h_func, L=0.05, V=1.0, eta=0.1, N=401, p_amb=0.0):
    """Return (x, h, p) on a uniform grid of N points."""
    x = np.linspace(0.0, L, N)
    dx = x[1] - x[0]
    h  = h_func(x)
    h3 = h ** 3

    # Face values via arithmetic mean
    h3_e = 0.5 * (h3[1:] + h3[:-1])

    # Build tridiagonal system
    a = np.zeros(N)
    b = np.zeros(N)
    c = np.zeros(N)
    d = np.zeros(N)

    for i in range(1, N - 1):
        a[i] = h3_e[i - 1] / (eta * dx ** 2)
        c[i] = h3_e[i]     / (eta * dx ** 2)
        b[i] = -(a[i] + c[i])
        dhdx = (h[i + 1] - h[i - 1]) / (2.0 * dx)
        d[i] = 6.0 * V * dhdx

    # Dirichlet BCs
    b[0]  = 1.0; d[0]  = p_amb
    b[-1] = 1.0; d[-1] = p_amb

    # Thomas algorithm
    cp = np.zeros(N); dp = np.zeros(N)
    cp[0] = c[0] / b[0]; dp[0] = d[0] / b[0]
    for i in range(1, N):
        m = b[i] - a[i] * cp[i - 1]
        cp[i] = c[i] / m if i < N - 1 else 0.0
        dp[i] = (d[i] - a[i] * dp[i - 1]) / m
    p = np.zeros(N)
    p[-1] = dp[-1]
    for i in range(N - 2, -1, -1):
        p[i] = dp[i] - cp[i] * p[i + 1]
    return x, h, p


# ============================================================== drivers ===
def run_linear_slider():
    L, h_in, h_out, V, eta = 0.05, 1.2e-4, 0.8e-4, 1.0, 0.1
    h_lin = lambda x: h_in + (h_out - h_in) * x / L
    x, h, p_num = solve_reynolds(h_lin, L=L, V=V, eta=eta)

    h_m = 0.5 * (h_in + h_out)
    dhdx = (h_out - h_in) / L
    alpha = -6.0 * eta * V * dhdx
    p_approx = alpha * x * (L - x) / (2.0 * h_m ** 3)

    fig, ax = plt.subplots(1, 2, figsize=(10, 4))
    ax[0].plot(x * 1e3, h * 1e6)
    ax[0].set_xlabel("x [mm]"); ax[0].set_ylabel("h [um]")
    ax[0].set_title("Gap profile (linear slider)")
    ax[0].grid(ls=":")
    ax[1].plot(x * 1e3, p_num,        label="Reynolds eqn (exact, FDM)")
    ax[1].plot(x * 1e3, p_approx, '--', label="Approx (h $\\approx h_m$)")
    ax[1].set_xlabel("x [mm]"); ax[1].set_ylabel("p [Pa]")
    ax[1].set_title("Pressure: exact vs approximate")
    ax[1].grid(ls=":"); ax[1].legend()
    plt.tight_layout(); plt.show()

    print(f"[linear slider]")
    print(f"  Numerical p_max = {p_num.max():.2f} Pa  at  x/L = {x[np.argmax(p_num)]/L:.3f}")
    print(f"  Approx    p_max = {p_approx.max():.2f} Pa  at  x/L = 0.500 (always)")


def run_sinusoidal_pocket():
    L, h_m, amp, V, eta = 0.05, 1.0e-4, 0.5e-4, 1.0, 0.1
    h_sin = lambda x: h_m + amp * np.sin(np.pi * x / L)
    x, h, p = solve_reynolds(h_sin, L=L, V=V, eta=eta)

    fig, ax = plt.subplots(1, 2, figsize=(10, 4))
    ax[0].plot(x * 1e3, h * 1e6)
    ax[0].set_xlabel("x [mm]"); ax[0].set_ylabel("h [um]")
    ax[0].set_title("Gap profile (sinusoidal pocket)")
    ax[0].grid(ls=":")
    ax[1].plot(x * 1e3, p)
    ax[1].set_xlabel("x [mm]"); ax[1].set_ylabel("p [Pa]")
    ax[1].set_title("Pressure")
    ax[1].grid(ls=":")
    plt.tight_layout(); plt.show()

    print(f"[sinusoidal pocket]")
    print(f"  p_max = {p.max():.2f} Pa, p_min = {p.min():.2f} Pa")
    print(f"  load per depth W = {np.trapz(p, x):.4f} N/m")


if __name__ == "__main__":
    run_linear_slider()
    run_sinusoidal_pocket()
