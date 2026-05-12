"""
mixing_length_pipe.py
=====================
Reconstruct the time-averaged axial velocity profile in a pipe
using Prandtl's mixing-length closure.

Force balance in a fully developed pipe flow (radius a, wall stress tau_w):
    tau(r) = tau_w * (r/a)              (linear, from Navier-Stokes)
Mixing length (with Nikuradse-style center correction):
    ell(y) = kappa * y * (1 - y/a)
Total stress (laminar + turbulent):
    tau = mu * dU/dy + rho * ell^2 * (dU/dy)^2

Solve the quadratic in S = dU/dy at each y, then integrate from y=0
(no-slip) outward. The resulting profile collapses on the universal v+(y+)
curve in wall units.

Run:
    python mixing_length_pipe.py
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid

# ----------------------------------------------------------------- inputs ---
rho   = 1.0          # density               [kg/m^3]
mu    = 1.0e-5       # dynamic viscosity     [Pa.s]
a     = 0.05         # pipe radius           [m]
u_tau = 0.5          # friction velocity     [m/s]   (= sqrt(tau_w / rho))
kappa = 0.41         # von Karman constant
N     = 5000

# ---------------------------------------------------------------- profile ---
tau_w = rho * u_tau**2
y = np.linspace(1e-7, a, N)        # distance from wall
tau = tau_w * (1.0 - y / a)        # linear total stress

# Mixing length with Nikuradse damping (avoids singular ell at the pipe center)
ell = kappa * y * (1.0 - y / a)

# Solve rho*ell^2*S^2 + mu*S - tau = 0 for S = dU/dy
A = rho * ell**2
B = mu
C = -tau
disc = B**2 - 4.0 * A * C
S = np.where(A > 1e-30,
             (-B + np.sqrt(disc)) / (2.0 * A),
             tau / mu)          # near-wall: viscous limit S = tau/mu

U = cumulative_trapezoid(S, y, initial=0.0)

# ------------------------------------------------------------ wall units ---
y_plus = rho * u_tau * y / mu
U_plus = U / u_tau

# Reference profiles
vp_visc = y_plus                       # viscous sub-layer
vp_log  = 5.5 + 2.5 * np.log(np.maximum(y_plus, 1e-3))   # log-law

# ------------------------------------------------------------------ plot ---
fig, ax = plt.subplots(figsize=(6.5, 4.5))
ax.semilogx(y_plus, U_plus,        lw=2,  label="Mixing-length integration")
ax.semilogx(y_plus, vp_visc, '--', label=r"$v^+ = y^+$")
ax.semilogx(y_plus, vp_log,  ':',  label=r"$v^+ = 5.5 + 2.5\,\ln y^+$")
ax.set_xlim(1, y_plus.max())
ax.set_ylim(0, 25)
ax.set_xlabel(r"$y^+$"); ax.set_ylabel(r"$v^+$")
ax.set_title("Universal velocity profile from Prandtl mixing length")
ax.grid(True, which="both", ls=":")
ax.legend()
plt.tight_layout()
plt.show()

# ------------------------------------------------------- bulk diagnostics ---
# Mean centerline velocity and Reynolds number based on the diameter
U_cl  = U[-1]
U_avg = 2.0 / a**2 * np.trapz((a - y) * U, y)   # area-weighted mean in pipe
Re = rho * 2.0 * a * U_avg / mu
print(f"u_tau         = {u_tau:.4f} m/s")
print(f"U_centerline  = {U_cl:.4f} m/s")
print(f"U_avg         = {U_avg:.4f} m/s")
print(f"Re (diameter) = {Re:.2e}")
print(f"u_tau / U_avg = {u_tau / U_avg:.4f}")
print(f"f_F (= 2*(u_tau/U_avg)^2) = {2*(u_tau/U_avg)**2:.5f}")
