import numpy as np
import matplotlib.pyplot as plt

def lid_driven_cavity(Re=100, N=41, n_steps=20000, tol=1e-5):
    """2-D incompressible NS, vorticity-streamfunction (psi-omega) form.
       Top lid slides at U=1; explicit time march to steady state."""
    h   = 1.0/(N-1)
    nu  = 1.0/Re                      # U=L=1  =>  nu = 1/Re
    dt  = 0.2*min(h*h/(4*nu), h)      # stability
    psi = np.zeros((N, N))
    w   = np.zeros((N, N))

    for it in range(n_steps):
        # 1) Poisson solve  laplacian(psi) = -w  (Jacobi sweeps)
        for _ in range(30):
            psi[1:-1,1:-1] = 0.25*(psi[2:,1:-1]+psi[:-2,1:-1]
                                  +psi[1:-1,2:]+psi[1:-1,:-2]
                                  +h*h*w[1:-1,1:-1])
        # 2) vorticity boundary conditions (Thom's formula)
        w[:, -1] = -2*psi[:, -2]/h**2 - 2*1.0/h     # moving lid (top)
        w[:,  0] = -2*psi[:,  1]/h**2
        w[0,  :] = -2*psi[1,  :]/h**2
        w[-1, :] = -2*psi[-2, :]/h**2
        # 3) vorticity transport  dw/dt + u.grad w = nu lap w
        u =  (psi[1:-1,2:]-psi[1:-1,:-2])/(2*h)
        v = -(psi[2:,1:-1]-psi[:-2,1:-1])/(2*h)
        conv = (u*(w[2:,1:-1]-w[:-2,1:-1])/(2*h)
               +v*(w[1:-1,2:]-w[1:-1,:-2])/(2*h))
        diff = nu*(w[2:,1:-1]+w[:-2,1:-1]+w[1:-1,2:]+w[1:-1,:-2]
                   -4*w[1:-1,1:-1])/h**2
        w_new = w.copy()
        w_new[1:-1,1:-1] = w[1:-1,1:-1] + dt*(-conv + diff)
        if np.max(np.abs(w_new-w)) < tol:
            print(f"converged at it={it}"); w = w_new; break
        w = w_new
    return psi, w

if __name__ == "__main__":
    psi, w = lid_driven_cavity(Re=100, N=51)
    plt.contourf(psi.T, 30, cmap="viridis"); plt.colorbar(label="psi")
    plt.title("Lid-driven cavity, Re=100"); plt.axis("equal"); plt.show()