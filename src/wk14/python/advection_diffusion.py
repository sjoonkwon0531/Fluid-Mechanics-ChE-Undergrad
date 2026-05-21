import numpy as np
import matplotlib.pyplot as plt

def transport_1d(L=0.04, nx=400, t_end=20.0,
                 mu_ep=(3.8e-8,3.0e-8,2.4e-8), E=2e4, D=1e-10):
    """Advection-diffusion of electrophoretic bands in a microchannel.
       Each species:  dc/dt + v dc/dx = D d2c/dx2,   v = mu_ep * E
       Upwind advection + central diffusion, explicit Euler (CFL-limited)."""
    dx = L/nx
    x  = np.linspace(0, L, nx)
    species = []
    for k, mu in enumerate(mu_ep):
        c0 = np.exp(-((x-0.002)/3e-4)**2)        # initial injected plug
        species.append([mu, c0])

    v_max = max(mu_ep)*E
    dt = 0.4*min(dx/v_max, dx*dx/(2*D))
    steps = int(t_end/dt)
    for _ in range(steps):
        for s in species:
            mu, c = s
            v = mu*E
            adv = v*(c - np.roll(c, 1))/dx                 # 1st-order upwind
            dif = D*(np.roll(c,-1)-2*c+np.roll(c,1))/dx**2  # central
            c_new = c - dt*adv + dt*dif
            c_new[0] = c_new[-1] = 0.0                      # open ends
            s[1] = c_new
    return x, species

if __name__ == "__main__":
    x, sp = transport_1d()
    cols = ["#2f74c0","#0f9e75","#d8602f"]
    for (mu, c), col in zip(sp, cols):
        plt.plot(x*1e3, c, color=col, lw=2, label=f"mu={mu:.1e}")
    plt.xlabel("position [mm]"); plt.ylabel("concentration")
    plt.title("Electrophoretic separation of 3 DNA fragments")
    plt.legend(); plt.tight_layout(); plt.show()