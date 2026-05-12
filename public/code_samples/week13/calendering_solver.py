"""
calendering_solver.py
=====================
Solve the calendering pressure profile in the lubrication approximation.

Geometry (each roll of radius R, the rolls counter-rotating with angular vel omega):
    h(x) = R + H - sqrt(R^2 - x^2)  ≈  H (1 + alpha x^2),   alpha = 1/(2 H R)
    h_full(x) = 2 h(x)    (full gap between the two rolls)

Reynolds equation:
    dp/dx = (3 eta omega / 2 H^3) * (x^2 - x2^2) / (1 + alpha x^2)^3
BCs:
    p(x1) = 0   (sheet entrance, half-thickness H1)
    p(x2) = 0   (sheet leaves, half-thickness H2 = H (1 + alpha x2^2))

Entry x1 is set geometrically by H1:
    H1 = H (1 + alpha x1^2)  ⇒  x1 = -sqrt((H1/H - 1)/alpha)
Exit x2 > 0 is found numerically by enforcing p(x1) = 0.

Run:
    python calendering_solver.py
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import quad
from scipy.optimize import brentq


# ----------------------------------------------------------- parameters ---
eta   = 1.0e3    # melt viscosity [Pa.s]
R     = 0.15     # roll radius    [m]
H     = 2.0e-4   # half-gap at nip [m]
H1    = 5.0e-4   # entry half-thickness [m]
omega = 5.0      # angular velocity [rad/s]

alpha  = 1.0 / (2.0 * H * R)
prefac = 3.0 * eta * omega / (2.0 * H ** 3)
x1     = -np.sqrt((H1 / H - 1.0) / alpha)

# ---------------------------------------------- pressure-gradient kernel ---
def dpdx(x, x2):
    return prefac * (x ** 2 - x2 ** 2) / (1.0 + alpha * x ** 2) ** 3

# Pressure at x, integrated from x2 (where p = 0)
def p_at(x, x2):
    val, _ = quad(dpdx, x2, x, args=(x2,), limit=200)
    return val

# Find x2 enforcing p(x1) = 0
def residual(x2):
    return p_at(x1, x2)

# Bracket
xs_scan = np.linspace(1e-7, abs(x1), 60)
signs   = [residual(x) for x in xs_scan]
idx     = next((i for i in range(len(signs) - 1) if signs[i] * signs[i + 1] < 0), None)
if idx is None:
    raise RuntimeError("No sign change in residual; widen H1 or refine grid.")

x2 = brentq(residual, xs_scan[idx], xs_scan[idx + 1])

H2 = H * (1.0 + alpha * x2 ** 2)
print(f"x1  = {x1 * 1e3:+.3f} mm")
print(f"x2  = {x2 * 1e3:+.3f} mm")
print(f"H1  = {H1 * 1e6:.1f} um")
print(f"H2  = {H2 * 1e6:.1f} um  (compression ratio H1/H2 = {H1/H2:.3f})")

# ----------------------------------------------- pressure curve & forces ---
xs = np.linspace(1.2 * x1, 1.5 * x2, 600)
ps = np.array([p_at(x, x2) for x in xs])
# Mask: physical only for x1 <= x <= x2
mask = (xs >= x1) & (xs <= x2)

pmax = ps[mask].max()
xpmax = xs[mask][np.argmax(ps[mask])]
F = np.trapz(ps[mask], xs[mask])   # roll separating force per unit roll length
print(f"p_max = {pmax/1e6:.3f} MPa  at x = {xpmax * 1e3:+.3f} mm")
print(f"Roll separating force F = {F:.3e} N/m")

# ------------------------------------------------------------------ plot ---
fig, ax1 = plt.subplots(figsize=(7, 4.5))
ax1.plot(xs[mask] * 1e3, ps[mask] / 1e6, lw=2, color="tab:blue", label="Pressure p(x)")
ax1.axvline(0, ls=":", c="gray", label="nip (x=0)")
ax1.axvline(x1 * 1e3, ls="--", c="0.6", lw=1)
ax1.axvline(x2 * 1e3, ls="--", c="0.6", lw=1)
ax1.set_xlabel("x [mm]"); ax1.set_ylabel("p [MPa]", color="tab:blue")
ax1.tick_params(axis="y", labelcolor="tab:blue")
ax1.grid(ls=":")

ax2 = ax1.twinx()
ax2.plot(xs * 1e3, (H * (1 + alpha * xs ** 2)) * 1e6, color="tab:purple", lw=1.5, label="h(x)")
ax2.set_ylabel("h [um]", color="tab:purple")
ax2.tick_params(axis="y", labelcolor="tab:purple")

ax1.set_title("Calendering pressure profile (Pope's lubrication approximation)")
plt.tight_layout()
plt.show()
