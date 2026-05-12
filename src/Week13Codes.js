// Week13Codes.js
// Standalone Python code samples for Week 13 (Turbulence & Lubrication).
// Pattern matches Week11Codes.js — keep raw source as tagged template strings
// so <CodeBlock> can offer copy-to-clipboard and download-as-file.
//
// Author: Prof. S. Joon Kwon, SKKU School of Chemical Engineering

/* eslint-disable */

const CODE_MIXING = `# mixing_length_pipe.py
# Reconstruct the time-averaged axial velocity profile in a pipe
# using Prandtl's mixing-length closure.
#
# Force balance in a fully developed pipe flow (radius a, wall stress tau_w):
#     tau(r) = tau_w * (r/a)              (linear, from Navier-Stokes)
# Mixing length:
#     ell(y) = kappa * y * (1 - y/a)      (Nikuradse correction near pipe center)
# Turbulent + viscous closure (y = a - r):
#     tau = mu * dU/dy + rho * ell^2 * (dU/dy)^2
# Solve the quadratic for dU/dy and integrate from y=0 (no-slip) outward.
#
# Usage:  python mixing_length_pipe.py

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid

# ---- Inputs ----
rho   = 1.0          # density               [kg/m^3]
mu    = 1.0e-5       # dynamic viscosity     [Pa.s]
a     = 0.05         # pipe radius           [m]
u_tau = 0.5          # friction velocity     [m/s]   (= sqrt(tau_w / rho))
kappa = 0.41         # von Karman constant
N     = 5000

tau_w = rho * u_tau**2
y = np.linspace(1e-7, a, N)        # distance from wall
r = a - y
tau = tau_w * (r / a) * 0 + tau_w  # constant-stress assumption for log-law region
# (Use linear profile tau = tau_w * (1 - y/a) for the full radial integration.)
tau = tau_w * (1.0 - y / a)

# Mixing length with Nikuradse damping (avoids singular ell at the center)
ell = kappa * y * (1.0 - y / a)

# Solve quadratic for dU/dy: rho*ell^2*S^2 + mu*S - tau = 0
A = rho * ell**2
B = mu
C = -tau
disc = B**2 - 4.0 * A * C
S = np.where(A > 1e-30,
             (-B + np.sqrt(disc)) / (2.0 * A),
             tau / mu)

U = cumulative_trapezoid(S, y, initial=0.0)

# Wall units
y_plus = rho * u_tau * y / mu
U_plus = U / u_tau

# Reference profiles
vp_visc = y_plus
vp_log  = 5.5 + 2.5 * np.log(np.maximum(y_plus, 1e-3))

fig, ax = plt.subplots(figsize=(6, 4.5))
ax.semilogx(y_plus, U_plus,           label="Mixing length", lw=2)
ax.semilogx(y_plus, vp_visc, '--',    label="$v^+ = y^+$")
ax.semilogx(y_plus, vp_log,  ':',     label="$v^+ = 5.5 + 2.5 \\\\ln y^+$")
ax.set_xlim(1, y_plus.max())
ax.set_ylim(0, 25)
ax.set_xlabel("$y^+$"); ax.set_ylabel("$v^+$")
ax.set_title("Universal velocity profile from mixing length")
ax.grid(True, which="both", ls=":")
ax.legend()
plt.tight_layout()
plt.show()
`;

const CODE_REYNOLDS = `# reynolds_equation_solver.py
# 1D Reynolds equation for a slider bearing with arbitrary h(x).
#
#     d/dx ( h^3/eta * dp/dx ) = 6 V dh/dx
#
# We solve with a second-order finite-volume / TDMA scheme:
#     a_w p_{i-1} + a_p p_i + a_e p_{i+1} = b_i
# with BCs p(0) = p(L) = p_atm.
#
# Two test profiles are included:
#   (a) linear slider:    h(x) = h_in + (h_out - h_in) * x / L
#   (b) parabolic pocket: h(x) = h_mean + amp * sin(pi x/L)
#
# Usage:  python reynolds_equation_solver.py

import numpy as np
import matplotlib.pyplot as plt

def solve_reynolds(h_func, L=0.05, V=1.0, eta=0.1, N=401, p_amb=0.0):
    x = np.linspace(0.0, L, N)
    dx = x[1] - x[0]
    h  = h_func(x)
    h3 = h**3

    # Face values via arithmetic mean
    h3_e = 0.5 * (h3[1:] + h3[:-1])   # length N-1

    # Build tridiagonal system for interior nodes (1..N-2)
    a = np.zeros(N); b = np.zeros(N); c = np.zeros(N); d = np.zeros(N)
    for i in range(1, N - 1):
        a[i] = h3_e[i-1] / (eta * dx**2)
        c[i] = h3_e[i]   / (eta * dx**2)
        b[i] = -(a[i] + c[i])
        # RHS: 6 V dh/dx using central difference
        dhdx = (h[i+1] - h[i-1]) / (2.0 * dx)
        d[i] = 6.0 * V * dhdx

    # Dirichlet BC at the ends
    b[0]  = 1.0; d[0]  = p_amb
    b[-1] = 1.0; d[-1] = p_amb

    # Thomas algorithm
    cp = np.zeros(N); dp = np.zeros(N)
    cp[0] = c[0] / b[0]; dp[0] = d[0] / b[0]
    for i in range(1, N):
        m = b[i] - a[i] * cp[i-1]
        cp[i] = c[i] / m if i < N - 1 else 0.0
        dp[i] = (d[i] - a[i] * dp[i-1]) / m
    p = np.zeros(N); p[-1] = dp[-1]
    for i in range(N - 2, -1, -1):
        p[i] = dp[i] - cp[i] * p[i+1]
    return x, h, p

# --- Linear slider: compare to the closed-form parabola
L, h_in, h_out, V, eta = 0.05, 1.2e-4, 0.8e-4, 1.0, 0.1
h_lin = lambda x: h_in + (h_out - h_in) * x / L
x, h, p_num = solve_reynolds(h_lin, L=L, V=V, eta=eta)

# Closed-form approximate (using h_mean)
h_m = 0.5 * (h_in + h_out)
dhdx = (h_out - h_in) / L
alpha = -6.0 * eta * V * dhdx
p_approx = alpha * x * (L - x) / (2.0 * h_m**3)

fig, ax = plt.subplots(1, 2, figsize=(10, 4))
ax[0].plot(x*1e3, h*1e6); ax[0].set_xlabel("x [mm]"); ax[0].set_ylabel("h [um]"); ax[0].set_title("Gap profile")
ax[1].plot(x*1e3, p_num,       label="Reynolds eqn (exact)")
ax[1].plot(x*1e3, p_approx, '--', label="Approx (h ~ h_m)")
ax[1].set_xlabel("x [mm]"); ax[1].set_ylabel("p [Pa]"); ax[1].set_title("Pressure")
ax[1].legend(); ax[1].grid(ls=":")
plt.tight_layout(); plt.show()

print(f"Numerical p_max = {p_num.max():.2f} Pa")
print(f"Approx    p_max = {p_approx.max():.2f} Pa  (parabola peaks at L/2)")
print(f"Numerical peak at x/L = {x[np.argmax(p_num)]/L:.3f}")
`;

const CODE_CALENDER = `# calendering_solver.py
# Solve the calendering pressure profile in the lubrication approximation.
#
# Geometry:  h(x) = H (1 + alpha x^2),  alpha = 1/(2 H R)
# Reynolds: dp/dx = (3 eta omega / 2 H^3) * (x^2 - x2^2) / (1 + alpha x^2)^3
# BCs:      p(x1) = 0  (entrance),  p(x2) = 0  (sheet leaves the rollers)
#
# The leave-off point x2 is determined by mass balance:
#     Q = 2 H2 R omega = 2 H (1 + alpha x2^2) R omega
# so H2 = H (1 + alpha x2^2). Conventionally x2 is chosen to enforce p(x1)=0;
# this script sweeps x2 and finds the value that satisfies the upstream BC.
#
# Usage:  python calendering_solver.py

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import quad
from scipy.optimize import brentq

# ---- Inputs (SI) ----
eta   = 1.0e3    # melt viscosity [Pa.s]   (typical polymer melt)
R     = 0.15     # roll radius    [m]
H     = 2.0e-4   # half-nip gap   [m]
omega = 5.0      # angular vel    [rad/s]

alpha = 1.0 / (2.0 * H * R)
prefac = 3.0 * eta * omega / (2.0 * H**3)

def dpdx(x, x2):
    return prefac * (x**2 - x2**2) / (1.0 + alpha * x**2)**3

# Pressure relative to x2 (where p=0 by definition)
def p_at(x, x2):
    val, _ = quad(dpdx, x2, x, args=(x2,), limit=200)
    return val

# Entry point x1 is geometrically known if H1 is specified.
H1 = 5.0e-4
x1 = -np.sqrt((H1 - H) * 2.0 * R * (1.0 - 0.5 * (H1 - H) / R))  # leading-order, x1 < 0

# Find x2 such that p(x1) = 0
def residual(x2):
    return p_at(x1, x2)

# Sweep to locate sign change
xs = np.linspace(1e-6, np.sqrt(H1 * 2 * R), 30)
sgn = [residual(x) for x in xs]
ix = next((i for i in range(len(sgn)-1) if sgn[i]*sgn[i+1] < 0), None)
x2 = brentq(residual, xs[ix], xs[ix+1])
print(f"x1 = {x1*1e3:.3f} mm,  x2 = {x2*1e3:.3f} mm")
print(f"H2 = {H*(1+alpha*x2**2)*1e6:.2f} um")

# Pressure profile
xs = np.linspace(x1, x2, 500)
ps = np.array([p_at(x, x2) for x in xs])

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(xs*1e3, ps/1e6, lw=2)
ax.axvline(0, ls=":", c="gray", label="nip (x=0)")
ax.axhline(0, ls=":", c="gray")
ax.set_xlabel("x [mm]"); ax.set_ylabel("p [MPa]")
ax.set_title("Calendering pressure profile")
ax.legend(); ax.grid(ls=":")
plt.tight_layout(); plt.show()
`;

const CODE_KOLMOGOROV = `# kolmogorov_spectrum.py
# Synthetic energy spectrum following Kolmogorov's -5/3 law.
# Demonstrates: integral, inertial, and dissipation ranges, and how the
# Kolmogorov scale eta separates from the integral scale L as Re grows.
#
# Model: E(k) = C_K * eps^(2/3) * k^(-5/3) * f_L(k L) * f_eta(k eta)
#   f_L   = ( kL / sqrt((kL)^2 + c_L) )^(5/3 + p0)   (low-k roll-off)
#   f_eta = exp(-beta * ( (k eta)^4 + c_eta^4 )^(1/4) + beta c_eta)   (high-k cutoff)
#
# Pope, "Turbulent Flows" (2000), eq. 6.246.
#
# Usage:  python kolmogorov_spectrum.py

import numpy as np
import matplotlib.pyplot as plt

C_K   = 1.5
p0    = 2.0
beta  = 5.2
c_L   = 6.78
c_eta = 0.40

def spectrum(k, eps, L, eta):
    f_L   = (k * L / np.sqrt((k * L)**2 + c_L))**(5.0/3.0 + p0)
    f_eta = np.exp(-beta * ((k * eta)**4 + c_eta**4)**0.25 + beta * c_eta)
    return C_K * eps**(2.0/3.0) * k**(-5.0/3.0) * f_L * f_eta

# Three Reynolds numbers (vary eta with eps held constant -> nu changes)
nu = 1.5e-5
eps = 1.0
L = 0.1
for Re_L in (1e3, 1e5, 1e7):
    eta = L / Re_L**(3.0/4.0)
    k = np.logspace(np.log10(1.0/(20*L)), np.log10(20.0/eta), 800)
    E = spectrum(k, eps, L, eta)
    plt.loglog(k, E, label=f"Re$_L$ = {Re_L:.0e}, $\\\\eta/L$ = {eta/L:.1e}")

k_ref = np.logspace(1, 5, 100)
plt.loglog(k_ref, 0.3 * k_ref**(-5.0/3.0), 'k--', label="$k^{-5/3}$")
plt.xlabel("k [1/m]"); plt.ylabel("E(k) [m^3/s^2]")
plt.title("Model energy spectrum (Pope 2000)")
plt.grid(True, which="both", ls=":"); plt.legend()
plt.tight_layout(); plt.show()
`;

export {
  CODE_MIXING,
  CODE_REYNOLDS,
  CODE_CALENDER,
  CODE_KOLMOGOROV,
};
