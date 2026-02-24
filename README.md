# SKKU Fluid Mechanics — Interactive Study Companion

> **Fluid Mechanics for Chemical Engineering (화공유체역학)**  
> School of Chemical Engineering, Sungkyunkwan University  
> Prof. S. Joon Kwon · 2025 Spring

An interactive web-based learning tool for undergraduate fluid mechanics. Each week's content includes concept reviews, interactive simulations, and practice quizzes.

## 🌊 Week 01 — Introduction to Fluid Mechanics

| Module | Description |
|--------|-------------|
| **Key Concepts** | Viscosity, Pressure, Surface Tension, Continuity Equation |
| **Viscosity Sim** | Couette flow — Newtonian & non-Newtonian velocity profiles |
| **Pressure Sim** | Hydrostatic pressure, Pascal's law, Atmospheric pressure |
| **Surface Tension** | Young-Laplace equation, Contact angle, Capillary rise |
| **Pipe Flow** | Continuity equation calculator for reducing & branching pipes |
| **Practice Quiz** | 8 problems covering all Week 1 topics |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## ☁️ Deploying to Vercel

### Option A — Import from GitHub (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! Your site will be live at `https://your-project.vercel.app`

### Option B — Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel
```

## 📁 Project Structure

```
skku-fluid-mechanics/
├── index.html          # Entry HTML
├── package.json
├── vite.config.js      # Vite configuration
├── src/
│   ├── main.jsx        # React entry point
│   └── App.jsx         # Main application (all Week 01 content)
└── README.md
```

## 🗓 Roadmap

- [x] Week 01 — Introduction (Viscosity, Pressure, Surface Tension)
- [ ] Week 02 — Mass, Energy & Momentum Balances 1
- [ ] Week 03 — Mass, Energy & Momentum Balances 2
- [ ] Week 04 — Fluid Friction in Pipes
- [ ] ...

## 📝 License

Educational use for SKKU Chemical Engineering courses.

## 📬 Contact

Prof. S. Joon Kwon — sjoonkwon@skku.edu
