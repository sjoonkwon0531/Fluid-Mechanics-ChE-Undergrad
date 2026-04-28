/* ============================================================
   Week11Codes.js
   Raw code samples for Wk11 CFD Intro (FDM)
   - 4 topics: ode, poisson1d, poisson2d, karman (LBM D2Q9)
   - 4 languages: Python, MATLAB, Julia, C++
   These strings are imported by Week11App.jsx > RawCodes tab.
   All code uses minimal external dependencies and is pedagogically clean.
   ============================================================ */

// ============================================================
// 1) 1D ODE — Forward / Backward Euler / Crank-Nicolson
// ============================================================

export const PY_ODE = `"""
Wk11 — 1D ODE solvers (Forward Euler, Backward Euler, Crank-Nicolson)
Solves:  du/dx + g(u) = f(x),  with u(0) given
Uses Newton iteration for implicit methods.

Run:    python wk11_ode_methods.py
Author: Prof. S. Joon Kwon — SPMDL — SKKU
"""
import numpy as np
import matplotlib.pyplot as plt


# -- Problem definition (Example 2 from lecture) -------------
def f(x):    return np.exp(2*x)
def g(u):    return -2*u           # so du/dx = -g(u) + f(x) = 2u + exp(2x)
def dgdu(u): return -2
u0, L, dx = 0.0, 1.0, 0.01
def analytic(x): return x*np.exp(2*x)


# -- Solvers --------------------------------------------------
def forward_euler(u_n, x_n, x_np1, dx):
    return u_n + dx * (f(x_n) - g(u_n))

def newton_solve(F, dF, v_guess, tol=1e-12, maxit=50):
    v = v_guess
    for _ in range(maxit):
        dv = -F(v) / dF(v)
        v += dv
        if abs(dv) < tol: break
    return v

def backward_euler(u_n, x_n, x_np1, dx):
    F  = lambda v: v - u_n - dx * (f(x_np1) - g(v))
    dF = lambda v: 1 + dx * dgdu(v)
    return newton_solve(F, dF, u_n)

def crank_nicolson(u_n, x_n, x_np1, dx):
    F  = lambda v: v - u_n - 0.5*dx*(f(x_n)+f(x_np1) - g(u_n) - g(v))
    dF = lambda v: 1 + 0.5*dx*dgdu(v)
    return newton_solve(F, dF, u_n)


# -- Driver ---------------------------------------------------
def solve(method):
    N = int(round(L/dx))
    xs = np.linspace(0, L, N+1)
    us = np.zeros(N+1); us[0] = u0
    for i in range(N):
        us[i+1] = method(us[i], xs[i], xs[i+1], dx)
    return xs, us


if __name__ == "__main__":
    methods = [("Forward Euler",  forward_euler,  "r--"),
               ("Backward Euler", backward_euler, "g--"),
               ("Crank-Nicolson", crank_nicolson, "b--")]

    plt.figure(figsize=(7,4.5))
    xs_ana = np.linspace(0, L, 400)
    plt.plot(xs_ana, analytic(xs_ana), "k-", lw=2, label="analytic")

    print(f"{'method':18s}  {'L2 error':>12s}  {'Linf error':>12s}")
    for name, m, style in methods:
        xs, us = solve(m)
        err = us - analytic(xs)
        l2  = np.sqrt(np.mean(err**2))
        linf = np.max(np.abs(err))
        print(f"{name:18s}  {l2:12.3e}  {linf:12.3e}")
        plt.plot(xs[::10], us[::10], style, label=name, markersize=4)

    plt.xlabel("x"); plt.ylabel("u(x)")
    plt.legend(); plt.grid(alpha=0.3)
    plt.title("Wk11 — 1D ODE Solvers")
    plt.tight_layout(); plt.show()
`;

export const ML_ODE = `% Wk11 - 1D ODE solvers (Forward / Backward Euler / Crank-Nicolson)
% Solves du/dx + g(u) = f(x) with u(0) given.
% Uses Newton iteration for implicit methods.
%
% Author: Prof. S. Joon Kwon — SPMDL — SKKU
clear; clc; close all;

% Problem (Example 2 from lecture): du/dx = 2u + exp(2x), u(0)=0
f      = @(x) exp(2*x);
g      = @(u) -2*u;          % so du/dx = -g(u)+f
dgdu   = @(u) -2;
u0     = 0;  L = 1;  dx = 0.01;
analytic = @(x) x .* exp(2*x);

methods = {'Forward Euler', 'Backward Euler', 'Crank-Nicolson'};
results = cell(3,1);
errs    = zeros(3,2);

for k = 1:3
    [xs, us] = solveODE(methods{k}, f, g, dgdu, u0, L, dx);
    results{k} = us;
    err = us - analytic(xs);
    errs(k,:) = [sqrt(mean(err.^2)), max(abs(err))];
end

% Print
fprintf('%-18s %12s %12s\\n', 'method', 'L2 err', 'Linf err');
for k = 1:3
    fprintf('%-18s %12.3e %12.3e\\n', methods{k}, errs(k,1), errs(k,2));
end

% Plot
xa = linspace(0,L,400);
figure; hold on; grid on;
plot(xa, analytic(xa), 'k-', 'LineWidth', 2);
styles = {'r--','g--','b--'};
for k = 1:3
    plot(xs(1:10:end), results{k}(1:10:end), styles{k}, 'LineWidth', 1.4);
end
legend(['analytic', methods]); xlabel('x'); ylabel('u(x)');
title('Wk11 — 1D ODE Solvers');

% ----- helpers -----
function [xs, us] = solveODE(method, f, g, dgdu, u0, L, dx)
    N = round(L/dx);
    xs = linspace(0, L, N+1)';
    us = zeros(N+1,1); us(1) = u0;
    for i = 1:N
        switch method
            case 'Forward Euler'
                us(i+1) = us(i) + dx*(f(xs(i)) - g(us(i)));
            case 'Backward Euler'
                Ffun  = @(v) v - us(i) - dx*(f(xs(i+1)) - g(v));
                dFfun = @(v) 1 + dx*dgdu(v);
                us(i+1) = newton(Ffun, dFfun, us(i));
            case 'Crank-Nicolson'
                Ffun  = @(v) v - us(i) - 0.5*dx*(f(xs(i))+f(xs(i+1)) - g(us(i)) - g(v));
                dFfun = @(v) 1 + 0.5*dx*dgdu(v);
                us(i+1) = newton(Ffun, dFfun, us(i));
        end
    end
end
function v = newton(Ffun, dFfun, v)
    for it = 1:50
        dv = -Ffun(v)/dFfun(v);
        v = v + dv;
        if abs(dv) < 1e-12, return; end
    end
end
`;

export const JL_ODE = `# Wk11 - 1D ODE solvers (Forward / Backward Euler / Crank-Nicolson)
# Author: Prof. S. Joon Kwon - SPMDL - SKKU
using Plots
using LinearAlgebra
using Printf

# Problem (Example 2 from lecture)
f(x)     = exp(2x)
g(u)     = -2u                # du/dx = -g(u)+f
dgdu(u)  = -2
u0, L, dx = 0.0, 1.0, 0.01
analytic(x) = x * exp(2x)

function newton_solve(F, dF, v0; tol=1e-12, maxit=50)
    v = v0
    for _ in 1:maxit
        dv = -F(v)/dF(v)
        v += dv
        abs(dv) < tol && break
    end
    return v
end

function solveODE(method::Symbol, f, g, dgdu, u0, L, dx)
    N  = round(Int, L/dx)
    xs = collect(range(0, L, length=N+1))
    us = zeros(N+1); us[1] = u0
    for i in 1:N
        if method == :forward
            us[i+1] = us[i] + dx*(f(xs[i]) - g(us[i]))
        elseif method == :backward
            F  = v -> v - us[i] - dx*(f(xs[i+1]) - g(v))
            dF = v -> 1 + dx*dgdu(v)
            us[i+1] = newton_solve(F, dF, us[i])
        elseif method == :cn
            F  = v -> v - us[i] - 0.5dx*(f(xs[i])+f(xs[i+1]) - g(us[i]) - g(v))
            dF = v -> 1 + 0.5dx*dgdu(v)
            us[i+1] = newton_solve(F, dF, us[i])
        end
    end
    return xs, us
end

methods = [(:forward, "Forward Euler", :red),
           (:backward,"Backward Euler", :green),
           (:cn,      "Crank-Nicolson", :blue)]

plt = plot(0:0.001:L, analytic.(0:0.001:L),
           label="analytic", lw=2, color=:black,
           xlabel="x", ylabel="u(x)", title="Wk11 - 1D ODE Solvers")

@printf "%-18s %12s %12s\\n" "method" "L2 err" "Linf err"
for (sym, name, c) in methods
    xs, us = solveODE(sym, f, g, dgdu, u0, L, dx)
    err = us .- analytic.(xs)
    @printf "%-18s %12.3e %12.3e\\n" name sqrt(mean(err.^2)) maximum(abs.(err))
    plot!(plt, xs[1:10:end], us[1:10:end], label=name, color=c, ls=:dash, lw=1.4)
end
display(plt)
`;

export const CPP_ODE = `// Wk11 - 1D ODE solvers (Forward / Backward Euler / Crank-Nicolson)
// Compile:  g++ -O2 -std=c++17 wk11_ode_methods.cpp -o wk11_ode
// Run:      ./wk11_ode > out.csv
// Author:   Prof. S. Joon Kwon - SPMDL - SKKU
#include <cmath>
#include <cstdio>
#include <vector>
#include <functional>
#include <string>

double f(double x)        { return std::exp(2*x); }
double g(double u)        { return -2*u; }
double dgdu(double)       { return -2; }
double analytic(double x) { return x * std::exp(2*x); }

double newton_solve(std::function<double(double)> F,
                    std::function<double(double)> dF,
                    double v0, double tol=1e-12, int maxit=50) {
    double v = v0;
    for (int k = 0; k < maxit; ++k) {
        double dv = -F(v)/dF(v);
        v += dv;
        if (std::abs(dv) < tol) break;
    }
    return v;
}

std::vector<double> solveODE(const std::string& method,
                             double u0, double L, double dx,
                             std::vector<double>& xs_out) {
    int N = (int)std::round(L/dx);
    xs_out.assign(N+1, 0.0);
    std::vector<double> us(N+1, 0.0);
    us[0] = u0;
    for (int i = 0; i <= N; ++i) xs_out[i] = i*dx;
    for (int i = 0; i < N; ++i) {
        if (method == "forward") {
            us[i+1] = us[i] + dx*(f(xs_out[i]) - g(us[i]));
        } else if (method == "backward") {
            auto F  = [&](double v){ return v - us[i] - dx*(f(xs_out[i+1]) - g(v)); };
            auto dF = [&](double v){ return 1.0 + dx*dgdu(v); };
            us[i+1] = newton_solve(F, dF, us[i]);
        } else if (method == "cn") {
            auto F  = [&](double v){ return v - us[i] - 0.5*dx*(f(xs_out[i])+f(xs_out[i+1]) - g(us[i]) - g(v)); };
            auto dF = [&](double v){ return 1.0 + 0.5*dx*dgdu(v); };
            us[i+1] = newton_solve(F, dF, us[i]);
        }
    }
    return us;
}

int main() {
    double u0 = 0.0, L = 1.0, dx = 0.01;
    std::vector<std::string> methods = {"forward", "backward", "cn"};
    std::printf("# x");
    for (auto& m : methods) std::printf(",%s", m.c_str());
    std::printf(",analytic\\n");

    std::vector<double> xs;
    std::vector<std::vector<double>> all;
    for (auto& m : methods) all.push_back(solveODE(m, u0, L, dx, xs));

    std::printf("# %-18s %12s %12s\\n", "method", "L2 err", "Linf err");
    for (int k = 0; k < 3; ++k) {
        double l2 = 0, linf = 0;
        for (size_t i = 0; i < xs.size(); ++i) {
            double e = all[k][i] - analytic(xs[i]);
            l2 += e*e; linf = std::max(linf, std::abs(e));
        }
        std::printf("# %-18s %12.3e %12.3e\\n", methods[k].c_str(),
                    std::sqrt(l2/xs.size()), linf);
    }
    for (size_t i = 0; i < xs.size(); ++i) {
        std::printf("%g", xs[i]);
        for (int k = 0; k < 3; ++k) std::printf(",%g", all[k][i]);
        std::printf(",%g\\n", analytic(xs[i]));
    }
    return 0;
}
`;


// ============================================================
// 2) 1D POISSON — Tridiagonal (Thomas algorithm)
// ============================================================

export const PY_P1 = `"""
Wk11 — 1D Poisson equation by FDM with Thomas algorithm
Solves:  d2u/dx2 = f(x),  x in [0,L],  u(0)=uL, u(L)=uR

Tridiagonal stencil: [1, -2, 1] / h^2
Author: Prof. S. Joon Kwon — SPMDL — SKKU
"""
import numpy as np
import matplotlib.pyplot as plt


def thomas(a, b, c, d):
    """Solve tri-diagonal system A·x = d (in-place safe)."""
    n = len(d)
    cp = np.zeros(n); dp = np.zeros(n); x = np.zeros(n)
    cp[0] = c[0] / b[0]
    dp[0] = d[0] / b[0]
    for i in range(1, n):
        m = b[i] - a[i]*cp[i-1]
        cp[i] = c[i]/m
        dp[i] = (d[i] - a[i]*dp[i-1]) / m
    x[-1] = dp[-1]
    for i in range(n-2, -1, -1):
        x[i] = dp[i] - cp[i]*x[i+1]
    return x


def solve_poisson_1d(f_func, L, h, uL, uR):
    Ntot = int(round(L/h))
    N    = Ntot - 1                 # interior unknowns
    xs   = np.linspace(0, L, Ntot+1)
    a = np.ones(N); b = -2*np.ones(N); c = np.ones(N)
    d = np.array([h*h*f_func(x) for x in xs[1:-1]])
    d[0]   -= uL
    d[-1]  -= uR
    u_int = thomas(a, b, c, d)
    u = np.concatenate(([uL], u_int, [uR]))
    return xs, u


# Example: lecture problem
def f(x): return 1.0
L, h = 1.0, 0.01
uL, uR = 2.0, 2.2

xs, u = solve_poisson_1d(f, L, h, uL, uR)

# Analytic: u(x) = x^2/2 - 3x/10 + 2
ua = xs**2/2 - 0.3*xs + 2

plt.figure(figsize=(7,4.5))
plt.plot(xs, ua, 'k-', lw=2, label='analytic')
plt.plot(xs[::10], u[::10], 'bs', markersize=4, label=f'FDM (h={h})')
plt.xlabel('x'); plt.ylabel('u(x)')
plt.title('Wk11 — 1D Poisson')
plt.legend(); plt.grid(alpha=0.3)
plt.tight_layout(); plt.show()

print(f"Linf error = {np.max(np.abs(u-ua)):.3e}")


# Convergence study
print("\\n# Convergence (uniform source)")
print(f"{'h':>8s}  {'Linf err':>12s}  {'ratio':>8s}")
hs = [0.2, 0.1, 0.05, 0.02, 0.01, 0.005]
prev = None
for h in hs:
    xs, u = solve_poisson_1d(f, L, h, uL, uR)
    ua = xs**2/2 - 0.3*xs + 2
    e = np.max(np.abs(u-ua))
    ratio = "—" if prev is None else f"{prev/e:.2f}"
    print(f"{h:>8.4f}  {e:>12.3e}  {ratio:>8s}")
    prev = e
`;

export const ML_P1 = `% Wk11 - 1D Poisson by FDM (Thomas algorithm)
% Author: Prof. S. Joon Kwon - SPMDL - SKKU
clear; clc; close all;

f      = @(x) 1.0 + 0*x;   % uniform source
L  = 1; uL = 2; uR = 2.2;
h  = 0.01;

[xs, u] = solvePoisson1D(f, L, h, uL, uR);
ua = xs.^2/2 - 0.3*xs + 2;

figure;
plot(xs, ua, 'k-', 'LineWidth', 2); hold on; grid on;
plot(xs(1:10:end), u(1:10:end), 'bs', 'MarkerFaceColor', 'b');
xlabel('x'); ylabel('u(x)'); title('Wk11 - 1D Poisson');
legend('analytic', sprintf('FDM (h=%g)', h));
fprintf('Linf error = %.3e\\n', max(abs(u-ua)));

% Convergence study
fprintf('\\n# Convergence\\n');
fprintf('%8s %12s %8s\\n','h','Linf err','ratio');
hs = [0.2 0.1 0.05 0.02 0.01 0.005]; prev = NaN;
for h = hs
    [xs, u] = solvePoisson1D(f, L, h, uL, uR);
    ua = xs.^2/2 - 0.3*xs + 2;
    e = max(abs(u-ua));
    if isnan(prev), s = '-'; else, s = sprintf('%.2f', prev/e); end
    fprintf('%8.4f %12.3e %8s\\n', h, e, s);
    prev = e;
end

% ----- helpers -----
function [xs, u] = solvePoisson1D(f, L, h, uL, uR)
    Ntot = round(L/h);  N = Ntot - 1;
    xs   = linspace(0, L, Ntot+1)';
    a = ones(N,1); b = -2*ones(N,1); c = ones(N,1);
    d = h^2 * f(xs(2:end-1));
    d(1)   = d(1)   - uL;
    d(end) = d(end) - uR;
    uin = thomas(a, b, c, d);
    u   = [uL; uin; uR];
end
function x = thomas(a, b, c, d)
    n = length(d);
    cp = zeros(n,1); dp = zeros(n,1); x = zeros(n,1);
    cp(1) = c(1)/b(1); dp(1) = d(1)/b(1);
    for i = 2:n
        m = b(i) - a(i)*cp(i-1);
        cp(i) = c(i)/m;
        dp(i) = (d(i) - a(i)*dp(i-1))/m;
    end
    x(n) = dp(n);
    for i = n-1:-1:1
        x(i) = dp(i) - cp(i)*x(i+1);
    end
end
`;

export const JL_P1 = `# Wk11 - 1D Poisson by FDM (Thomas algorithm)
# Author: Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

function thomas!(a::Vector, b::Vector, c::Vector, d::Vector)
    n = length(d)
    cp = similar(c); dp = similar(d); x = similar(d)
    cp[1] = c[1]/b[1]; dp[1] = d[1]/b[1]
    for i in 2:n
        m = b[i] - a[i]*cp[i-1]
        cp[i] = c[i]/m
        dp[i] = (d[i] - a[i]*dp[i-1])/m
    end
    x[n] = dp[n]
    for i in n-1:-1:1
        x[i] = dp[i] - cp[i]*x[i+1]
    end
    return x
end

function solve_poisson_1d(f, L::Float64, h::Float64, uL::Float64, uR::Float64)
    Ntot = round(Int, L/h); N = Ntot - 1
    xs = collect(range(0, L, length=Ntot+1))
    a = ones(N); b = fill(-2.0, N); c = ones(N)
    d = [h^2 * f(x) for x in xs[2:end-1]]
    d[1] -= uL;  d[end] -= uR
    uin = thomas!(a, b, c, d)
    return xs, vcat([uL], uin, [uR])
end

f(x) = 1.0
L, h, uL, uR = 1.0, 0.01, 2.0, 2.2

xs, u = solve_poisson_1d(f, L, h, uL, uR)
ua = xs.^2 ./ 2 .- 0.3 .* xs .+ 2

@printf "Linf error = %.3e\\n" maximum(abs.(u .- ua))

plot(xs, ua, label="analytic", lw=2, color=:black,
     xlabel="x", ylabel="u(x)", title="Wk11 - 1D Poisson")
scatter!(xs[1:10:end], u[1:10:end], label="FDM (h=\$h)", ms=3) |> display

# Convergence
@printf "\\n# Convergence\\n%8s %12s %8s\\n" "h" "Linf err" "ratio"
prev = NaN
for h in [0.2, 0.1, 0.05, 0.02, 0.01, 0.005]
    xs, u = solve_poisson_1d(f, L, h, uL, uR)
    ua = xs.^2 ./ 2 .- 0.3 .* xs .+ 2
    e = maximum(abs.(u .- ua))
    s = isnan(prev) ? "-" : @sprintf("%.2f", prev/e)
    @printf "%8.4f %12.3e %8s\\n" h e s
    prev = e
end
`;

export const CPP_P1 = `// Wk11 - 1D Poisson by FDM (Thomas)
// Compile:  g++ -O2 -std=c++17 wk11_poisson1d.cpp -o wk11_p1
// Run:      ./wk11_p1
// Author:   Prof. S. Joon Kwon - SPMDL - SKKU
#include <cmath>
#include <cstdio>
#include <functional>
#include <vector>

std::vector<double> thomas(std::vector<double> a,
                           std::vector<double> b,
                           std::vector<double> c,
                           std::vector<double> d) {
    int n = d.size();
    std::vector<double> cp(n), dp(n), x(n);
    cp[0] = c[0]/b[0]; dp[0] = d[0]/b[0];
    for (int i = 1; i < n; ++i) {
        double m = b[i] - a[i]*cp[i-1];
        cp[i] = c[i]/m;
        dp[i] = (d[i] - a[i]*dp[i-1])/m;
    }
    x[n-1] = dp[n-1];
    for (int i = n-2; i >= 0; --i) x[i] = dp[i] - cp[i]*x[i+1];
    return x;
}

void solve_poisson_1d(std::function<double(double)> f,
                      double L, double h, double uL, double uR,
                      std::vector<double>& xs, std::vector<double>& u) {
    int Ntot = (int)std::round(L/h), N = Ntot - 1;
    xs.assign(Ntot+1, 0.0);
    for (int i = 0; i <= Ntot; ++i) xs[i] = i*h;
    std::vector<double> a(N,1.0), b(N,-2.0), c(N,1.0), d(N);
    for (int i = 0; i < N; ++i) d[i] = h*h*f(xs[i+1]);
    d[0]   -= uL;
    d[N-1] -= uR;
    auto uin = thomas(a, b, c, d);
    u.assign(Ntot+1, 0.0);
    u[0] = uL; u[Ntot] = uR;
    for (int i = 0; i < N; ++i) u[i+1] = uin[i];
}

int main() {
    auto f = [](double){ return 1.0; };
    double L = 1.0, uL = 2.0, uR = 2.2;
    std::vector<double> hs = {0.2, 0.1, 0.05, 0.02, 0.01, 0.005};
    std::printf("# %8s %12s %8s\\n", "h", "Linf err", "ratio");
    double prev = -1;
    for (double h : hs) {
        std::vector<double> xs, u;
        solve_poisson_1d(f, L, h, uL, uR, xs, u);
        double e = 0;
        for (size_t i = 0; i < xs.size(); ++i) {
            double ua = xs[i]*xs[i]/2 - 0.3*xs[i] + 2;
            e = std::max(e, std::abs(u[i]-ua));
        }
        if (prev < 0) std::printf("  %8.4f %12.3e %8s\\n", h, e, "-");
        else          std::printf("  %8.4f %12.3e %8.2f\\n", h, e, prev/e);
        prev = e;
    }
    return 0;
}
`;


// ============================================================
// 3) 2D POISSON — 5-point stencil with Gauss-Seidel iteration
// ============================================================

export const PY_P2 = `"""
Wk11 — 2D Poisson by FDM (5-point stencil)
Domain: (0,Lx) x (0,Ly), Dirichlet u=0 on all boundaries
Solver: Gauss-Seidel iteration (relaxation)

For larger problems, replace with sparse direct solver (scipy.sparse.linalg.spsolve)
or conjugate-gradient (CG) — both work since A is SPD.

Author: Prof. S. Joon Kwon — SPMDL — SKKU
"""
import numpy as np
import matplotlib.pyplot as plt


def gauss_seidel_2d(Nx, Ny, hx, hy, f_field, max_iter=20000, tol=1e-7):
    u = np.zeros((Ny, Nx))
    hx2, hy2 = hx*hx, hy*hy
    denom = 2*(hx2 + hy2)
    for it in range(max_iter):
        u_old = u.copy()
        # interior update (vectorized via slicing — Jacobi-like; easy to read)
        u[1:-1,1:-1] = (
            hy2*(u[1:-1,2:] + u[1:-1,:-2]) +
            hx2*(u[2:,1:-1] + u[:-2,1:-1]) -
            hx2*hy2*f_field[1:-1,1:-1]
        ) / denom
        if it % 100 == 0:
            res = np.max(np.abs(u - u_old))
            if res < tol:
                print(f"converged in {it} iters (res={res:.2e})")
                break
    else:
        print(f"max_iter={max_iter} reached, res={res:.2e}")
    return u


# Lecture example: 2 sin(3πx) cos(5πy) on (0,1) x (0,2)
Lx, Ly = 1.0, 2.0
h = 0.02
Nx = int(round(Lx/h)) + 1
Ny = int(round(Ly/h)) + 1
hx, hy = Lx/(Nx-1), Ly/(Ny-1)
xs = np.linspace(0, Lx, Nx)
ys = np.linspace(0, Ly, Ny)
X, Y = np.meshgrid(xs, ys)
f_field = 2*np.sin(3*np.pi*X) * np.cos(5*np.pi*Y)

u = gauss_seidel_2d(Nx, Ny, hx, hy, f_field)

fig, ax = plt.subplots(1, 2, figsize=(9, 4.5))
im0 = ax[0].imshow(f_field, extent=[0,Lx,0,Ly], origin='lower', cmap='RdBu_r')
ax[0].set_title('source f(x,y)')
plt.colorbar(im0, ax=ax[0], shrink=0.8)
im1 = ax[1].imshow(u, extent=[0,Lx,0,Ly], origin='lower', cmap='RdBu_r')
ax[1].set_title('solution u(x,y)')
plt.colorbar(im1, ax=ax[1], shrink=0.8)
for a in ax:
    a.set_xlabel('x'); a.set_ylabel('y')
plt.suptitle('Wk11 — 2D Poisson, ∇²u = f(x,y)')
plt.tight_layout(); plt.show()
`;

export const ML_P2 = `% Wk11 - 2D Poisson by FDM (5-point stencil), Gauss-Seidel
% Author: Prof. S. Joon Kwon - SPMDL - SKKU
clear; clc; close all;

Lx = 1; Ly = 2; h = 0.02;
Nx = round(Lx/h) + 1; Ny = round(Ly/h) + 1;
hx = Lx/(Nx-1); hy = Ly/(Ny-1);

xs = linspace(0, Lx, Nx); ys = linspace(0, Ly, Ny);
[X, Y] = meshgrid(xs, ys);
fF = 2*sin(3*pi*X) .* cos(5*pi*Y);

u = zeros(Ny, Nx);
hx2 = hx^2; hy2 = hy^2; denom = 2*(hx2 + hy2);
for it = 1:20000
    u_old = u;
    u(2:end-1, 2:end-1) = ( ...
        hy2*(u(2:end-1, 3:end) + u(2:end-1, 1:end-2)) + ...
        hx2*(u(3:end, 2:end-1) + u(1:end-2, 2:end-1)) - ...
        hx2*hy2*fF(2:end-1, 2:end-1)) / denom;
    if mod(it, 100) == 0
        res = max(abs(u(:)-u_old(:)));
        if res < 1e-7
            fprintf('converged in %d iters (res=%.2e)\\n', it, res);
            break;
        end
    end
end

figure;
subplot(1,2,1); imagesc(xs, ys, fF); axis xy; colorbar;
title('source f(x,y)'); xlabel('x'); ylabel('y');
subplot(1,2,2); imagesc(xs, ys, u); axis xy; colorbar;
title('solution u(x,y)'); xlabel('x'); ylabel('y');
sgtitle('Wk11 - 2D Poisson');
`;

export const JL_P2 = `# Wk11 - 2D Poisson by FDM, Gauss-Seidel
# Author: Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, Printf

function gauss_seidel_2d(Nx, Ny, hx, hy, fF; max_iter=20000, tol=1e-7)
    u = zeros(Ny, Nx)
    hx2 = hx^2; hy2 = hy^2; denom = 2*(hx2 + hy2)
    for it in 1:max_iter
        u_old = copy(u)
        @inbounds for j in 2:Ny-1, i in 2:Nx-1
            u[j,i] = (hy2*(u[j,i+1] + u[j,i-1]) +
                      hx2*(u[j+1,i] + u[j-1,i]) -
                      hx2*hy2*fF[j,i]) / denom
        end
        if it % 100 == 0
            res = maximum(abs.(u .- u_old))
            if res < tol
                @printf "converged in %d iters (res=%.2e)\\n" it res
                break
            end
        end
    end
    return u
end

Lx, Ly, h = 1.0, 2.0, 0.02
Nx = round(Int, Lx/h) + 1
Ny = round(Int, Ly/h) + 1
hx, hy = Lx/(Nx-1), Ly/(Ny-1)

xs = collect(range(0, Lx, length=Nx))
ys = collect(range(0, Ly, length=Ny))
fF = [2*sin(3π*x) * cos(5π*y) for y in ys, x in xs]

u = gauss_seidel_2d(Nx, Ny, hx, hy, fF)

p1 = heatmap(xs, ys, fF, title="source f", xlabel="x", ylabel="y", c=:RdBu_11)
p2 = heatmap(xs, ys, u,  title="u(x,y)",   xlabel="x", ylabel="y", c=:RdBu_11)
plot(p1, p2, layout=(1,2), size=(900, 450)) |> display
`;

export const CPP_P2 = `// Wk11 - 2D Poisson by FDM, Gauss-Seidel
// Compile:  g++ -O2 -std=c++17 wk11_poisson2d.cpp -o wk11_p2
// Output:   PGM image (open in any viewer)
// Author:   Prof. S. Joon Kwon - SPMDL - SKKU
#include <cmath>
#include <cstdio>
#include <vector>
#include <fstream>

int main() {
    const double Lx = 1.0, Ly = 2.0, h = 0.02;
    const int Nx = (int)std::round(Lx/h) + 1;
    const int Ny = (int)std::round(Ly/h) + 1;
    const double hx = Lx/(Nx-1), hy = Ly/(Ny-1);
    const double hx2 = hx*hx, hy2 = hy*hy, denom = 2*(hx2 + hy2);
    const double pi = 3.141592653589793;

    std::vector<double> u(Nx*Ny, 0.0), f(Nx*Ny);
    for (int j = 0; j < Ny; ++j)
        for (int i = 0; i < Nx; ++i)
            f[j*Nx + i] = 2*std::sin(3*pi*i*hx) * std::cos(5*pi*j*hy);

    int max_iter = 20000;
    double tol = 1e-7;
    for (int it = 0; it < max_iter; ++it) {
        double res = 0;
        for (int j = 1; j < Ny-1; ++j)
            for (int i = 1; i < Nx-1; ++i) {
                int idx = j*Nx + i;
                double old = u[idx];
                u[idx] = (hy2*(u[idx-1] + u[idx+1]) +
                          hx2*(u[idx-Nx] + u[idx+Nx]) -
                          hx2*hy2*f[idx]) / denom;
                res = std::max(res, std::abs(u[idx] - old));
            }
        if (it % 100 == 0 && res < tol) {
            std::printf("converged in %d iters (res=%.2e)\\n", it, res);
            break;
        }
    }

    // Output PGM (ascii)
    std::ofstream out("solution.pgm");
    out << "P2\\n" << Nx << " " << Ny << "\\n255\\n";
    double mn = 1e30, mx = -1e30;
    for (double v : u) { mn = std::min(mn, v); mx = std::max(mx, v); }
    for (int j = Ny-1; j >= 0; --j) {
        for (int i = 0; i < Nx; ++i) {
            int g = (int)((u[j*Nx+i] - mn) / (mx - mn) * 255.0);
            out << g << " ";
        }
        out << "\\n";
    }
    std::printf("wrote solution.pgm  (range: %.3e .. %.3e)\\n", mn, mx);
    return 0;
}
`;


// ============================================================
// 4) KARMAN VORTEX — Lattice-Boltzmann (D2Q9)
// ============================================================

export const PY_LBM = `"""
Wk11 — Karman vortex shedding via Lattice Boltzmann (D2Q9)
Solves: incompressible flow past a circular cylinder.
Visualizes vorticity to reveal vortex shedding.

Run:    python wk11_karman_lbm.py
Author: Prof. S. Joon Kwon — SPMDL — SKKU
"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import animation

# D2Q9 lattice
NX, NY = 400, 100
RHO0 = 1.0
U0   = 0.04
RE   = 200.0
R    = 8                       # cylinder radius
CX, CY = NX//4, NY//2
NU   = U0 * (2*R) / RE
TAU  = 3*NU + 0.5
OMEGA = 1.0/TAU

# velocity sets
W  = np.array([4/9] + [1/9]*4 + [1/36]*4)
EX = np.array([0, 1, 0, -1, 0, 1, -1, -1, 1])
EY = np.array([0, 0, 1, 0, -1, 1, 1, -1, -1])
OPP = np.array([0, 3, 4, 1, 2, 7, 8, 5, 6])

# obstacle
Y, X = np.meshgrid(np.arange(NY), np.arange(NX), indexing='ij')
obstacle = ((X - CX)**2 + (Y - CY)**2) <= R*R

def equilibrium(rho, ux, uy):
    cu = 3 * (EX[:,None,None]*ux + EY[:,None,None]*uy)
    u2 = ux**2 + uy**2
    return rho * W[:,None,None] * (1 + cu + 0.5*cu*cu - 1.5*u2)

# init
rho = np.ones((NY, NX)) * RHO0
ux  = np.ones((NY, NX)) * U0
uy  = np.zeros((NY, NX))
f   = equilibrium(rho, ux, uy)

def step(f):
    # streaming
    f_new = np.empty_like(f)
    for q in range(9):
        f_new[q] = np.roll(f[q], shift=(EY[q], EX[q]), axis=(0,1))
    # bounce-back at obstacle
    for q in range(9):
        f_new[q][obstacle] = f[OPP[q]][obstacle]
    # macroscopic
    rho = f_new.sum(axis=0)
    ux  = (f_new * EX[:,None,None]).sum(axis=0) / rho
    uy  = (f_new * EY[:,None,None]).sum(axis=0) / rho
    # inlet (impose u=U0)
    ux[:,0] = U0;  uy[:,0] = 0;  rho[:,0] = RHO0
    f_new[:,:,0] = equilibrium(rho[:,0:1], ux[:,0:1], uy[:,0:1])[:,:,0]
    # outlet (zero gradient)
    f_new[:,:,-1] = f_new[:,:,-2]
    # collision
    feq = equilibrium(rho, ux, uy)
    f_new += -OMEGA * (f_new - feq)
    return f_new, ux, uy

# Run + animate
fig, ax = plt.subplots(figsize=(10, 3))
ux = np.zeros((NY, NX)); uy = np.zeros((NY, NX))
im = ax.imshow(np.zeros((NY, NX)), origin='lower', cmap='RdBu_r',
               vmin=-0.05, vmax=0.05)
ax.set_title("Vorticity ω")
plt.colorbar(im, ax=ax, shrink=0.7)

def update(frame):
    global f, ux, uy
    for _ in range(20):
        f, ux, uy = step(f)
    omega = np.zeros_like(ux)
    omega[1:-1,1:-1] = (uy[1:-1,2:] - uy[1:-1,:-2])/2 - (ux[2:,1:-1] - ux[:-2,1:-1])/2
    omega[obstacle] = np.nan
    im.set_data(omega)
    return [im]

ani = animation.FuncAnimation(fig, update, frames=200, interval=30, blit=False)
plt.show()
# To save: ani.save("karman.mp4", fps=30)
`;

export const ML_LBM = `% Wk11 - Karman vortex via Lattice Boltzmann (D2Q9)
% Author: Prof. S. Joon Kwon - SPMDL - SKKU
clear; clc; close all;

NX = 400; NY = 100; RHO0 = 1.0; U0 = 0.04; RE = 200; R = 8;
CX = round(NX/4); CY = round(NY/2);
NU = U0*(2*R)/RE; TAU = 3*NU + 0.5; OMEGA = 1/TAU;

w   = [4/9 1/9 1/9 1/9 1/9 1/36 1/36 1/36 1/36];
ex  = [0 1 0 -1 0 1 -1 -1 1];
ey  = [0 0 1 0 -1 1 1 -1 -1];
opp = [1 4 5 2 3 8 9 6 7];   % 1-indexed (q=1..9)

[X, Y] = meshgrid(1:NX, 1:NY);
obstacle = ((X-CX).^2 + (Y-CY).^2) <= R^2;

rho = ones(NY, NX) * RHO0;
ux  = ones(NY, NX) * U0;
uy  = zeros(NY, NX);

f = zeros(NY, NX, 9);
for q = 1:9
    cu = 3 * (ex(q)*ux + ey(q)*uy);
    u2 = ux.^2 + uy.^2;
    f(:,:,q) = rho * w(q) .* (1 + cu + 0.5*cu.^2 - 1.5*u2);
end

figure('Position',[100 100 1100 350]);
for it = 1:4000
    % streaming
    f_new = zeros(size(f));
    for q = 1:9
        f_new(:,:,q) = circshift(f(:,:,q), [ey(q) ex(q)]);
    end
    % bounce-back
    for q = 1:9
        tmp = f(:,:,opp(q));
        f_new(:,:,q) = f_new(:,:,q) .* (~obstacle) + tmp .* obstacle;
    end
    % macroscopic
    rho = sum(f_new, 3);
    ux  = zeros(NY, NX); uy = zeros(NY, NX);
    for q = 1:9
        ux = ux + f_new(:,:,q)*ex(q);
        uy = uy + f_new(:,:,q)*ey(q);
    end
    ux = ux ./ rho; uy = uy ./ rho;
    % inlet
    ux(:,1) = U0; uy(:,1) = 0; rho(:,1) = RHO0;
    for q = 1:9
        cu = 3*(ex(q)*U0); u2 = U0^2;
        f_new(:,1,q) = RHO0 * w(q) * (1 + cu + 0.5*cu^2 - 1.5*u2);
    end
    % outlet
    f_new(:,end,:) = f_new(:,end-1,:);
    % collision
    feq = zeros(size(f));
    for q = 1:9
        cu = 3*(ex(q)*ux + ey(q)*uy);
        u2 = ux.^2 + uy.^2;
        feq(:,:,q) = rho * w(q) .* (1 + cu + 0.5*cu.^2 - 1.5*u2);
    end
    f = f_new - OMEGA * (f_new - feq);
    % visualize every 20 steps
    if mod(it, 20) == 0
        omega = zeros(NY, NX);
        omega(2:end-1, 2:end-1) = (uy(2:end-1, 3:end) - uy(2:end-1, 1:end-2))/2 - ...
                                  (ux(3:end, 2:end-1) - ux(1:end-2, 2:end-1))/2;
        omega(obstacle) = NaN;
        imagesc(omega, [-0.05 0.05]); axis equal tight; colormap(redblue);
        title(sprintf('Wk11 LBM — step %d, Re=%g', it, RE));
        drawnow;
    end
end

function c = redblue
    n = 256; c = zeros(n,3);
    for i = 1:n
        t = (i - n/2) / (n/2);
        if t >= 0
            c(i,:) = [1-0.7*t, 1-0.7*t, 1];
        else
            c(i,:) = [1, 1+0.7*t, 1+0.7*t];
        end
    end
end
`;

export const JL_LBM = `# Wk11 - Karman vortex via Lattice Boltzmann (D2Q9)
# Author: Prof. S. Joon Kwon - SPMDL - SKKU
using Plots, LinearAlgebra, Printf

const NX, NY = 400, 100
const RHO0   = 1.0
const U0     = 0.04
const RE     = 200.0
const R      = 8
const CX, CY = NX÷4, NY÷2
const NU     = U0*(2R)/RE
const TAU    = 3NU + 0.5
const OMEGA  = 1/TAU

const W   = [4/9; fill(1/9, 4); fill(1/36, 4)]
const EX  = [0, 1, 0, -1, 0, 1, -1, -1, 1]
const EY  = [0, 0, 1, 0, -1, 1, 1, -1, -1]
const OPP = [1, 4, 5, 2, 3, 8, 9, 6, 7]

obstacle = falses(NY, NX)
for j in 1:NY, i in 1:NX
    obstacle[j,i] = (i-CX)^2 + (j-CY)^2 ≤ R^2
end

function equilibrium!(feq, rho, ux, uy)
    @inbounds for q in 1:9, j in 1:NY, i in 1:NX
        cu = 3*(EX[q]*ux[j,i] + EY[q]*uy[j,i])
        u2 = ux[j,i]^2 + uy[j,i]^2
        feq[j,i,q] = rho[j,i] * W[q] * (1 + cu + 0.5*cu^2 - 1.5*u2)
    end
end

rho = fill(RHO0, NY, NX)
ux  = fill(U0,   NY, NX)
uy  = zeros(NY, NX)
f   = zeros(NY, NX, 9)
equilibrium!(f, rho, ux, uy)
fnew = similar(f)
feq  = similar(f)

anim = @animate for it in 1:2000
    # streaming
    @inbounds for q in 1:9, j in 1:NY, i in 1:NX
        jp = mod1(j - EY[q], NY)
        ip = clamp(i - EX[q], 1, NX)
        if obstacle[jp, ip]
            fnew[j,i,q] = f[j, i, OPP[q]]
        else
            fnew[j,i,q] = f[jp, ip, q]
        end
    end
    # macroscopic
    @inbounds for j in 1:NY, i in 1:NX
        s = 0.0; vx = 0.0; vy = 0.0
        for q in 1:9
            s  += fnew[j,i,q]
            vx += fnew[j,i,q]*EX[q]
            vy += fnew[j,i,q]*EY[q]
        end
        rho[j,i] = s
        ux[j,i]  = vx/s
        uy[j,i]  = vy/s
    end
    # inlet
    @views ux[:,1] .= U0; uy[:,1] .= 0; rho[:,1] .= RHO0
    @inbounds for j in 1:NY, q in 1:9
        cu = 3*EX[q]*U0
        fnew[j,1,q] = RHO0 * W[q] * (1 + cu + 0.5*cu^2 - 1.5*U0^2)
    end
    # outlet
    @views fnew[:,end,:] .= fnew[:,end-1,:]
    # collision
    equilibrium!(feq, rho, ux, uy)
    @. f = fnew - OMEGA * (fnew - feq)
    if it % 20 == 0
        omega = zeros(NY, NX)
        @inbounds for j in 2:NY-1, i in 2:NX-1
            omega[j,i] = (uy[j,i+1]-uy[j,i-1])/2 - (ux[j+1,i]-ux[j-1,i])/2
        end
        omega[obstacle] .= NaN
        heatmap(omega, c=:RdBu_11, clims=(-0.05,0.05),
                title="Wk11 LBM step=\$it Re=\$RE",
                xlabel="x", ylabel="y", aspect_ratio=:equal)
    end
end every 20

mp4(anim, "wk11_karman.mp4", fps=15)
`;

export const CPP_LBM = `// Wk11 - Karman vortex via Lattice Boltzmann (D2Q9)
// Compile:  g++ -O3 -std=c++17 wk11_karman_lbm.cpp -o wk11_lbm
// Output:   ASCII frames (PGM) every 100 steps
// Author:   Prof. S. Joon Kwon - SPMDL - SKKU
#include <cmath>
#include <cstdio>
#include <vector>
#include <string>
#include <fstream>

const int NX = 400, NY = 100;
const double RHO0 = 1.0;
const double U0   = 0.04;
const double RE   = 200.0;
const double R    = 8.0;
const int    CX = NX/4, CY = NY/2;
const double NU   = U0*(2*R)/RE;
const double TAU  = 3*NU + 0.5;
const double OMEGA = 1.0/TAU;

const double W[9]  = {4./9, 1./9, 1./9, 1./9, 1./9, 1./36, 1./36, 1./36, 1./36};
const int    EX[9] = {0, 1, 0, -1, 0, 1, -1, -1, 1};
const int    EY[9] = {0, 0, 1, 0, -1, 1, 1, -1, -1};
const int    OPP[9]= {0, 3, 4, 1, 2, 7, 8, 5, 6};

inline int idx(int j, int i, int q) { return (j*NX + i)*9 + q; }
inline int idx2(int j, int i)        { return j*NX + i; }

double feq_local(int q, double rho, double ux, double uy) {
    double cu = 3*(EX[q]*ux + EY[q]*uy);
    double u2 = ux*ux + uy*uy;
    return rho * W[q] * (1 + cu + 0.5*cu*cu - 1.5*u2);
}

int main() {
    std::vector<double> f(NX*NY*9), fnew(NX*NY*9);
    std::vector<double> rho(NX*NY, RHO0), ux(NX*NY, U0), uy(NX*NY, 0.0);
    std::vector<unsigned char> obs(NX*NY, 0);
    for (int j = 0; j < NY; ++j) for (int i = 0; i < NX; ++i)
        if ((i-CX)*(i-CX) + (j-CY)*(j-CY) <= R*R) obs[idx2(j,i)] = 1;
    // init
    for (int j = 0; j < NY; ++j) for (int i = 0; i < NX; ++i) for (int q = 0; q < 9; ++q)
        f[idx(j,i,q)] = feq_local(q, RHO0, U0, 0.0);

    int total_steps = 4000;
    for (int it = 0; it < total_steps; ++it) {
        // streaming + bounce-back
        for (int j = 0; j < NY; ++j) for (int i = 0; i < NX; ++i) {
            for (int q = 0; q < 9; ++q) {
                int jp = ((j - EY[q]) % NY + NY) % NY;
                int ip = i - EX[q];
                if (ip < 0) ip = 0;
                if (ip >= NX) ip = NX - 1;
                if (obs[idx2(jp, ip)])
                    fnew[idx(j,i,q)] = f[idx(j,i,OPP[q])];
                else
                    fnew[idx(j,i,q)] = f[idx(jp,ip,q)];
            }
        }
        // macroscopic
        for (int j = 0; j < NY; ++j) for (int i = 0; i < NX; ++i) {
            int p = idx2(j,i);
            double r = 0, vx = 0, vy = 0;
            for (int q = 0; q < 9; ++q) {
                double fq = fnew[idx(j,i,q)];
                r += fq; vx += fq*EX[q]; vy += fq*EY[q];
            }
            rho[p] = r; ux[p] = vx/r; uy[p] = vy/r;
        }
        // inlet/outlet
        for (int j = 0; j < NY; ++j) {
            int p = idx2(j,0);
            ux[p] = U0; uy[p] = 0; rho[p] = RHO0;
            for (int q = 0; q < 9; ++q)
                fnew[idx(j,0,q)] = feq_local(q, RHO0, U0, 0.0);
            int pe = idx2(j, NX-1), pe1 = idx2(j, NX-2);
            for (int q = 0; q < 9; ++q)
                fnew[idx(j,NX-1,q)] = fnew[idx(j,NX-2,q)];
        }
        // collision
        for (int j = 0; j < NY; ++j) for (int i = 0; i < NX; ++i) {
            int p = idx2(j,i);
            for (int q = 0; q < 9; ++q) {
                double feq = feq_local(q, rho[p], ux[p], uy[p]);
                f[idx(j,i,q)] = fnew[idx(j,i,q)] - OMEGA * (fnew[idx(j,i,q)] - feq);
            }
        }
        // dump every 200 steps
        if (it % 200 == 0) {
            std::vector<double> omega(NX*NY, 0.0);
            for (int j = 1; j < NY-1; ++j) for (int i = 1; i < NX-1; ++i) {
                omega[idx2(j,i)] = (uy[idx2(j,i+1)] - uy[idx2(j,i-1)])/2
                                 - (ux[idx2(j+1,i)] - ux[idx2(j-1,i)])/2;
            }
            char fn[64]; std::snprintf(fn, 64, "frame_%05d.pgm", it);
            std::ofstream out(fn);
            out << "P2\\n" << NX << " " << NY << "\\n255\\n";
            for (int j = NY-1; j >= 0; --j) {
                for (int i = 0; i < NX; ++i) {
                    double v = obs[idx2(j,i)] ? 0.0 : omega[idx2(j,i)];
                    int g = (int)std::round((v + 0.05) / 0.1 * 255);
                    g = std::max(0, std::min(255, g));
                    out << g << " ";
                }
                out << "\\n";
            }
            std::printf("dumped %s\\n", fn);
        }
    }
    return 0;
}
`;
