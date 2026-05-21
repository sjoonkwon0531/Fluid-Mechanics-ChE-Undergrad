import numpy as np
import matplotlib.pyplot as plt

# ---------- MEMS: electrostatic parallel-plate pull-in ----------
def pull_in(k=2.0, A=4e-8, g0=2e-6, eps0=8.854e-12):
    """Find equilibrium deflection vs voltage; report pull-in voltage."""
    V_pi = np.sqrt(8*k*g0**3 / (27*eps0*A))   # classic 1/3 rule
    V = np.linspace(0, 1.3*V_pi, 400)
    x_eq = np.zeros_like(V)
    for i, v in enumerate(V):
        x = 0.0                                # fixed-point iteration
        for _ in range(500):
            F = eps0*A*v**2 / (2*(g0-x)**2)
            x_new = F/k
            if x_new >= g0/3 or v >= V_pi:     # beyond stable branch
                x = g0; break
            x = x_new
        x_eq[i] = min(x, g0)
    return V, x_eq, V_pi

# ---------- NEMS: resonant mass sensing ----------
def resonator(L=3e-6, w=200e-9, t=100e-9, E=1.7e11, rho=2330):
    """Euler-Bernoulli cantilever fundamental frequency + mass responsivity."""
    I = w*t**3/12
    A = w*t
    f0 = (1.875**2/(2*np.pi))*np.sqrt(E*I/(rho*A*L**4))
    m_eff = 0.24*rho*A*L
    R = -f0/(2*m_eff)                  # Hz per kg  (Delta_f = R * Delta_m)
    return f0, m_eff, R

if __name__ == "__main__":
    V, x, Vpi = pull_in()
    print(f"Pull-in voltage = {Vpi:.2f} V")
    f0, meff, R = resonator()
    print(f"f0 = {f0/1e6:.2f} MHz,  responsivity = {R:.3e} Hz/kg")
    print(f"1 attogram (1e-21 kg) shifts f by {abs(R)*1e-21:.2f} Hz")

    fig, ax = plt.subplots(1,2, figsize=(10,4))
    ax[0].plot(V, x*1e6, lw=2); ax[0].axvline(Vpi, ls="--", c="r")
    ax[0].set_xlabel("Voltage [V]"); ax[0].set_ylabel("Deflection [um]")
    ax[0].set_title("MEMS pull-in")
    dm = np.linspace(0, 100e-21, 100)
    ax[1].plot(dm*1e21, R*dm, lw=2)
    ax[1].set_xlabel("Added mass [ag]"); ax[1].set_ylabel("Delta_f [Hz]")
    ax[1].set_title("NEMS mass responsivity")
    plt.tight_layout(); plt.show()