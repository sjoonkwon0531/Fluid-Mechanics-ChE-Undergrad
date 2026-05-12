# kolmogorov_spectrum.py
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

# ---- Model constants (Pope 2000) ----
C_K   = 1.5     # Kolmogorov constant
p0    = 2.0    # large-scale shape parameter
beta  = 5.2    # dissipation-range exponent
c_L   = 6.78   # large-scale matching constant
c_eta = 0.40   # dissipation matching constant


def spectrum(k, eps, L, eta):
    """Pope (2000) model energy spectrum.

    Parameters
    ----------
    k : array_like
        Wavenumber [1/m].
    eps : float
        Turbulent dissipation rate [m^2/s^3].
    L : float
        Integral length scale [m].
    eta : float
        Kolmogorov length scale [m].
    """
    f_L   = (k * L / np.sqrt((k * L)**2 + c_L))**(5.0/3.0 + p0)
    f_eta = np.exp(-beta * ((k * eta)**4 + c_eta**4)**0.25 + beta * c_eta)
    return C_K * eps**(2.0/3.0) * k**(-5.0/3.0) * f_L * f_eta


def kolmogorov_scale(nu, eps):
    """eta = (nu^3 / eps)^(1/4)."""
    return (nu**3 / eps)**0.25


# ---- Sweep three Reynolds numbers ----
# Fix the integral scale and dissipation rate; let nu (Re) vary so eta shifts.
nu_ref = 1.5e-5   # kinematic viscosity of air at 1 atm [m^2/s]
eps    = 1.0      # dissipation rate [m^2/s^3]
L      = 0.1      # integral length [m]

fig, ax = plt.subplots(figsize=(8, 6))

for Re_L in (1e3, 1e5, 1e7):
    # Definition: Re_L = u' L / nu and u' ~ (eps L)^(1/3)
    # => nu = u' L / Re_L  =>  eta = L / Re_L^(3/4)
    eta = L / Re_L**(3.0 / 4.0)
    k   = np.logspace(np.log10(1.0 / (20 * L)),
                      np.log10(20.0 / eta),
                      800)
    E   = spectrum(k, eps, L, eta)
    ax.loglog(k, E,
              label=fr"Re$_L$ = {Re_L:.0e},  $\eta/L$ = {eta/L:.1e}")

# Pure -5/3 reference line for visual comparison
k_ref = np.logspace(1, 5, 100)
ax.loglog(k_ref, 0.3 * k_ref**(-5.0/3.0), "k--", label=r"$k^{-5/3}$ reference")

# Shade the (approximate) RANS / LES / DNS coverage at Re_L = 1e5
Re_demo = 1e5
eta_demo = L / Re_demo**(3.0/4.0)
k_int    = 1.0 / L
k_kol    = 1.0 / eta_demo
ax.axvspan(1e-2, k_int * 5, alpha=0.06, color="tab:red",
           label=f"RANS-modeled range (Re$_L$={Re_demo:.0e})")
ax.axvspan(k_int * 5, k_kol / 5, alpha=0.06, color="tab:orange",
           label="LES-resolved range")
ax.axvspan(k_kol / 5, k_kol * 10, alpha=0.06, color="tab:green",
           label="DNS-resolved range")

ax.set_xlabel("Wavenumber k [1/m]")
ax.set_ylabel(r"E(k) [m$^3$/s$^2$]")
ax.set_title("Model energy spectrum (Pope 2000) — Kolmogorov $-5/3$ inertial range")
ax.grid(True, which="both", ls=":")
ax.legend(fontsize=9, loc="lower left")
fig.tight_layout()

# ---- Print quick diagnostics ----
print("Kolmogorov spectrum diagnostics")
print("-" * 60)
print(f"  Integral scale L        = {L:.3e}  m")
print(f"  Dissipation rate eps    = {eps:.3e}  m^2/s^3")
print()
for Re_L in (1e3, 1e5, 1e7):
    eta = L / Re_L**(3.0/4.0)
    nu_eff = (eps * eta**4)**0.5  # from eta = (nu^3/eps)^(1/4)
    tau_L = (L**2 / eps)**(1.0/3.0)
    tau_K = (nu_eff / eps)**0.5
    print(f"  Re_L = {Re_L:.0e}:")
    print(f"      eta            = {eta:.3e} m   (L/eta = {L/eta:.2e})")
    print(f"      tau_L / tau_K  = {tau_L/tau_K:.2e}")
    print(f"      DNS grid pts   ~ (L/eta)^3 = {(L/eta)**3:.2e}")
    print()

plt.show()
