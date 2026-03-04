# SKKU Fluid Mechanics — Interactive Study Companion

> **Fluid Mechanics for Chemical Engineering (화공유체역학)**  
> School of Chemical Engineering, Sungkyunkwan University  
> Prof. S. Joon Kwon · 2025 Spring

An interactive web-based learning tool for undergraduate fluid mechanics. Select a week from the landing page to access concept reviews, simulations, and quizzes.

## 📚 Available Weeks

### Week 01 — Introduction to Fluid Mechanics
- Viscosity (Newtonian & non-Newtonian fluids)
- Pressure & Pascal's Law
- Surface Tension & Capillarity
- Continuity Equation

### Week 02 — Mass, Energy & Momentum Balances
- Conservation Laws (Static & Dynamic)
- Energy Balance & Generalized Bernoulli Equation
- Simplified Bernoulli & Fluid Head
- Tank Draining (Torricelli's Theorem)
- Orifice & Pitot Tube Flow Meters

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## ☁️ Deploy to Vercel

1. Push to GitHub
2. Go to vercel.com → Add New Project → Import repo
3. Click Deploy (Vite auto-detected)

## 📁 Project Structure

```
src/
├── main.jsx          # Entry point
├── App.jsx           # Landing page & week router
├── Week1App.jsx      # Week 01 complete app
└── Week2App.jsx      # Week 02 complete app
```

## 📝 License

Educational use for SKKU Chemical Engineering courses.
