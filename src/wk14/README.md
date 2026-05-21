# Week 14 — Microfluidics, MEMS & NEMS

Interactive learning module for *Fluid Mechanics for Chemical Engineering* (SKKU, SPMDL).
Companion to the Week 14 lecture decks (microfluidics fundamentals, lab-on-a-chip, DNA analysis, fluid logic).

## Contents

Sits inside the course repo at `src/wk14/`:

```
src/wk14/
├── Week14_Microfluidics.html     # self-contained interactive app (no build step)
├── python/
│   ├── channel_flow_fd.py        # 1-D NS: Poiseuille / EOF / Couette (Thomas solver)
│   ├── cavity_psi_omega.py       # 2-D lid-driven cavity (vorticity–streamfunction)
│   ├── advection_diffusion.py    # electrophoretic band transport in a microchannel
│   └── pullin_resonator.py       # MEMS pull-in + NEMS resonant mass sensing
└── README.md
```

## The web app — five tabs

1. **Fundamentals** — Reynolds & Péclet "curse", scaling laws, live diffusion-mixing visualization.
2. **NS Solver** — live finite-difference channel solver (numerical vs analytic) + 2-D lid-driven cavity CFD running in the browser.
3. **Lab-on-a-chip** — digital twin: electrophoretic separation (resolution, peak shift) + serpentine passive micromixer (Dean-vortex mixing index).
4. **MEMS / NEMS** — electrostatic pull-in (1/3 instability), NEMS resonant mass sensor (attogram sensitivity), Knudsen-number regime map.
5. **Raw code** — copy-paste-ready Python for every solver above.

Bilingual Korean / English (toggle, top-right). No dependencies — opens directly in any browser.

## Viewing the interactive app

GitHub shows `.html` as raw source, not a rendered page. To see it live:

- **Vercel (recommended)** — wrap as a React route to match the existing weekly-material navigation:
  ```jsx
  // src/weeks/Week14.jsx
  export default function Week14() {
    return (
      <iframe
        src="/wk14/Week14_Microfluidics.html"
        title="Week 14 — Microfluidics, MEMS & NEMS"
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    );
  }
  ```
  (Place `Week14_Microfluidics.html` under `public/wk14/` so Vite serves it statically.)

- **Quick preview without deploying** — paste the file's GitHub URL after
  `https://htmlpreview.github.io/?` to render it directly from the repo.

- **GitHub Pages** — enable Pages for the repo and the file is served at
  `https://sjoonkwon0531.github.io/Fluid-Mechanics-ChE-Undergrad/src/wk14/Week14_Microfluidics.html`.

## Running the Python labs

```bash
pip install numpy scipy matplotlib
python src/wk14/python/channel_flow_fd.py      # Poiseuille vs EOF vs combined profiles
python src/wk14/python/cavity_psi_omega.py     # converges to steady Re=100 cavity vortex
python src/wk14/python/advection_diffusion.py  # three DNA fragments separating
python src/wk14/python/pullin_resonator.py     # prints V_pull-in, f0, attogram responsivity
```

Verified outputs: cavity converges (~5300 iterations at Re=100, N=51); resonator f₀ ≈ 15 MHz with ~228 Hz/attogram responsivity for a 3 µm Si nanocantilever.

## Suggested student exercises

- Change the channel BCs in `channel_flow_fd.py` to model a **combined pressure + EOF** flow and find the pressure gradient that exactly cancels EOF at the centreline.
- Push `cavity_psi_omega.py` to Re = 400, 1000 and locate the secondary corner vortices.
- Replace the open-end BCs in `advection_diffusion.py` with a **finite detection window** and compute a synthetic electropherogram.
- Use `pullin_resonator.py` to design a cantilever that resolves a single 50 kDa protein (≈ 0.083 ag).
