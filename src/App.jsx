import { useState } from "react";
import Week1App from "./Week1App.jsx";
import Week2App from "./Week2App.jsx";
import Week3App from "./Week3App.jsx";
import Week4App from "./Week4App.jsx";
import Week5App from "./Week5App.jsx";
import Week6App from "./Week6App.jsx";
import Week8App from "./Week8App.jsx";
import Week9App from "./Week9App.jsx";
import Week10App from "./Week10App.jsx";
import Week11App from "./Week11App.jsx";
import Week12App from "./Week12App.jsx";
import Week13App from "./Week13App.jsx";
import Week1App_EN from "./Week1App.jsx";    // 임시: KR 버전
import Week2App_EN from "./Week2App.jsx";    // 임시: KR 버전
import Week3App_EN from "./Week3App_EN.jsx";
import Week4App_EN from "./Week4App_EN.jsx";

const weeks = {
  KR: [
    { id: 1, title: "Week 01", subtitle: "유체역학 기초", topics: ["점도 & 뉴턴 유체", "압력 & 파스칼의 법칙", "표면장력 & 모세관 현상", "연속 방정식"], color: "#3b82f6" },
    { id: 2, title: "Week 02", subtitle: "질량·에너지·운동량 수지", topics: ["보존법칙 (정적 & 동적)", "에너지 수지 & Bernoulli 방정식", "유체 수두 & Torricelli 정리", "오리피스 & 피토관 유량계"], color: "#0d9488" },
    { id: 3, title: "Week 03", subtitle: "운동량 수지 & 관 내 유체마찰", topics: ["운동량 수지 (힘, 대류, 각운동량)", "Reynolds number & 유동 체계", "층류 & Hagen-Poiseuille 법칙", "마찰소산 & Lumped K.E.", "Wedge CFD (LBM D2Q9)"], color: "#8b5cf6" },
    { id: 4, title: "Week 04", subtitle: "마찰계수, 배관 시스템 & Creeping Flow", topics: ["전단응력 모델 (층류 vs 난류)", "Fanning 마찰계수 & Moody chart", "배관 부속 & 등가길이", "압축성 기체 파이프라인", "d'Alembert 역설 & Stokes 법칙"], color: "#f97316" },
    { id: 5, title: "Week 05", subtitle: "유체 마찰과 항력", topics: ["항력계수 & Drag equation", "종단 속도 & Archimedes 수", "충전층 반응기 (Ergun & Darcy)", "증류탑 트레이 수력학", "콜로이드 침강 (Richardson-Zaki)"], color: "#ec4899" },
    { id: 6, title: "Week 06", subtitle: "미분 방정식 & 벡터 미적분", topics: ["내적 & 외적 (기하학적 의미)", "Gradient ∇f & 선적분", "Divergence ∇·F & Gauss 정리", "Curl ∇×F & Stokes 정리", "원통좌표(CCS) & 구면좌표(SCS)"], color: "#14b8a6" },
    { id: 8, title: "Week 08", subtitle: "유체역학 미분방정식", topics: ["지배방정식 & Lorenz 어트랙터", "대류 미분 D/Dt & 미분 연산자", "연속방정식 단계별 유도", "응력 텐서 (법선 & 전단응력)", "Navier-Stokes 방정식 유도", "직교·원통·구면 좌표계 N-S"], color: "#6366f1" },
    { id: 9, title: "Week 09", subtitle: "점성 유동 문제 풀이", topics: ["Poiseuille · Couette · Mixed flows", "Spin coating & 고분자 가공", "사출성형 (직사각 덕트, RCCS)", "경사면 박막 (Moving substrate)", "환형 다이 (CCS) & log항 해석", "Cone-Plate Rheometer (SCS)"], color: "#00d4ff" },
    { id: 10, title: "Week 10", subtitle: "와도 & Laplace 방정식 (퍼텐셜 유동)", topics: ["비점성 유체 & N-S → Euler", "와도 ζ & Forced vs Free vortex", "2D 미소요소 회전·변형 (Fig 7.2)", "속도 퍼텐셜 φ & 유선함수 ψ", "Laplace 방정식 ∇²φ = ∇²ψ = 0", "실린더 주변 유동 (Sturm-Liouville)", "Superposition & Line source/sink"], color: "#a78bfa" },
    { id: 11, title: "Week 11", subtitle: "전산유체역학(CFD) 입문", topics: ["FDM 이산화 (Forward / Backward / Central)", "Forward / Backward Euler · Crank-Nicolson", "1D Poisson (Thomas 알고리즘)", "2D Poisson (5점 스텐실, NyNx 블록 행렬)", "포텐셜 유동 · 유선 · 압력 분포", "Karman 와류 (Lattice-Boltzmann D2Q9)"], color: "#22d3ee" },
    { id: 12, title: "Week 12", subtitle: "경계층 유동 (Boundary-Layer Flows)", topics: ["BL 개념 · Prandtl 수 · 운동량/열 BL", "Blasius 방정식 (RK4 + shooting)", "Falkner-Skan β-sweep · 박리 임계", "층류 vs 난류 BL · 1/7-power law", "박리 · 후류 · 골프공·날개 trip", "ChemE 응용 6선 (CVD · EUV · HX · PBR · 날개 · Air-intake)"], color: "#f43f5e" },
    { id: 13, title: "Week 13", subtitle: "난류 유동 & 윤활 근사", topics: ["Reynolds 분해 · 시간평균 방정식", "Mixing-Length (Prandtl & von Kármán)", "보편 속도 분포 · 층류 부층", "에너지 캐스케이드 · Kolmogorov −5/3", "RANS · LES · DNS 위계", "슬라이더/저널 베어링 (정확 vs 근사해)", "고분자 가공: Calendering"], color: "#06b6d4" },
  ],
  EN: [
    { id: 1, title: "Week 01", subtitle: "Introduction to Fluid Mechanics", topics: ["Viscosity & Newtonian fluids", "Pressure & Pascal's law", "Surface tension & capillarity", "Continuity equation"], color: "#3b82f6" },
    { id: 2, title: "Week 02", subtitle: "Mass, Energy & Momentum Balances", topics: ["Conservation laws (static & dynamic)", "Energy balance & Bernoulli equation", "Fluid head & Torricelli's theorem", "Orifice & Pitot tube flow meters"], color: "#0d9488" },
    { id: 3, title: "Week 03", subtitle: "Momentum Balance & Fluid Friction in Pipes", topics: ["Momentum balance (force, convection, angular)", "Reynolds number & flow regimes", "Laminar flow & Hagen-Poiseuille law", "Frictional dissipation & lumped K.E.", "Wedge CFD simulation (LBM D2Q9)"], color: "#8b5cf6" },
    { id: 4, title: "Week 04", subtitle: "Friction Factor, Pipe Systems & Creeping Flow", topics: ["Shear stress models (laminar vs turbulent)", "Fanning friction factor & Moody chart", "Pipe fittings & equivalent length", "Compressible gas pipeline flow", "d'Alembert paradox & Stokes law"], color: "#f97316" },
    { id: 5, title: "Week 05", subtitle: "Fluid Friction & Drag", topics: ["Drag coefficient & drag equation", "Terminal velocity & Archimedes number", "Packed bed reactor (Ergun & Darcy)", "Distillation tray hydraulics", "Colloidal sedimentation (Richardson-Zaki)"], color: "#ec4899" },
    { id: 6, title: "Week 06", subtitle: "Differential Equations & Vector Calculus", topics: ["Inner & cross products", "Gradient ∇f & line integrals", "Divergence ∇·F & Gauss theorem", "Curl ∇×F & Stokes theorem", "Cylindrical (CCS) & spherical (SCS) coords"], color: "#14b8a6" },
    { id: 8, title: "Week 08", subtitle: "Differential Equations of Fluid Mechanics", topics: ["Governing equations & Lorenz attractor", "Material derivative D/Dt & operators", "Continuity equation derivation", "Stress tensor (normal & shear)", "Navier-Stokes equation derivation", "N-S in rectangular / cylindrical / spherical"], color: "#6366f1" },
    { id: 9, title: "Week 09", subtitle: "Problems on the Viscous Flow", topics: ["Poiseuille · Couette · Mixed flows", "Spin coating & polymer processing", "Injection molding (rectangular duct, RCCS)", "Inclined film on moving substrate", "Annular die flow (CCS) with log term", "Cone-Plate rheometer (SCS)"], color: "#00d4ff" },
    { id: 10, title: "Week 10", subtitle: "Vorticity & Laplace Equation (Potential Flow)", topics: ["Inviscid fluid & N-S → Euler", "Vorticity ζ & Forced vs Free vortex", "2D element rotation/deformation (Fig 7.2)", "Velocity potential φ & stream function ψ", "Laplace equation ∇²φ = ∇²ψ = 0", "Flow past a cylinder (Sturm-Liouville)", "Superposition & Line source/sink"], color: "#a78bfa" },
    { id: 11, title: "Week 11", subtitle: "Intro to Computational Fluid Dynamics (CFD)", topics: ["FDM discretization (forward / backward / central)", "Forward / Backward Euler · Crank-Nicolson", "1D Poisson (Thomas algorithm)", "2D Poisson (5-point stencil, NyNx block matrix)", "Potential flow · streamlines · pressure", "Karman vortex (Lattice-Boltzmann D2Q9)"], color: "#22d3ee" },
    { id: 12, title: "Week 12", subtitle: "Boundary-Layer Flows", topics: ["BL concept · Prandtl number · momentum / thermal BL", "Blasius equation (RK4 + shooting)", "Falkner-Skan β-sweep · separation threshold", "Laminar vs turbulent BL · 1/7-power law", "Separation · wakes · golf-ball / airfoil tripping", "Six ChemE applications (CVD · EUV · HX · PBR · airfoil · air-intake)"], color: "#f43f5e" },
    { id: 13, title: "Week 13", subtitle: "Turbulent Flow & Lubrication Approximation", topics: ["Reynolds decomposition · RANS equations", "Mixing-length theory (Prandtl & von Kármán)", "Universal velocity profile · laminar sub-layer", "Energy cascade · Kolmogorov −5/3 law", "RANS · LES · DNS hierarchy", "Slider/journal bearing (exact vs approximate)", "Polymer processing: calendering"], color: "#06b6d4" },
  ],
};

const comps = {
  KR: { 1: Week1App, 2: Week2App, 3: Week3App, 4: Week4App, 5: Week5App, 6: Week6App, 8: Week8App, 9: Week9App, 10: Week10App, 11: Week11App, 12: Week12App, 13: Week13App },
  EN: { 1: Week1App_EN, 2: Week2App_EN, 3: Week3App_EN, 4: Week4App_EN, 5: Week5App, 6: Week6App, 8: Week8App, 9: Week9App, 10: Week10App, 11: Week11App, 12: Week12App, 13: Week13App },
};

function LandingPage({ onSelect, lang, onLang }) {
  const wl = weeks[lang];
  return (
    <div style={{ minHeight:"100vh", background:"#070b14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"'DM Sans','Noto Sans KR',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{position:"fixed",top:"-20%",left:"30%",width:500,height:500,background:"radial-gradient(circle,rgba(37,99,235,0.06),transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"-10%",right:"20%",width:400,height:400,background:"radial-gradient(circle,rgba(13,148,136,0.05),transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>

      <div style={{position:"fixed",top:20,right:24,display:"flex",gap:4,background:"#111827",borderRadius:10,padding:4,border:"1px solid #1e293b",zIndex:100}}>
        {[["KR","\uD83C\uDDF0\uD83C\uDDF7 \uD55C\uAD6D\uC5B4"],["EN","\uD83C\uDDFA\uD83C\uDDF8 English"]].map(([k,lb])=>(
          <button key={k} onClick={()=>onLang(k)} style={{padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",background:lang===k?"#2dd4bf":"transparent",color:lang===k?"#070b14":"#64748b",fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",transition:"all 0.2s"}}>{lb}</button>
        ))}
      </div>

      <div style={{textAlign:"center",marginBottom:48,animation:"fadeIn 0.6s ease",position:"relative"}}>
        <div style={{fontSize:13,letterSpacing:5,color:"#2dd4bf",marginBottom:12,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase"}}>Sungkyunkwan University · School of Chemical Engineering</div>
        <h1 style={{fontSize:48,fontWeight:900,lineHeight:1.1,marginBottom:12,fontFamily:"'Space Grotesk',sans-serif",background:"linear-gradient(135deg,#ffffff 20%,#60a5fa 50%,#2dd4bf 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          Fluid Mechanics<br/>for Chemical Engineering
        </h1>
        <p style={{color:"#64748b",fontSize:16,maxWidth:500,margin:"0 auto",lineHeight:1.6}}>
          {lang==="KR"?"인터랙티브 학습 도우미":"Interactive Study Companion"}<br/>Prof. S. Joon Kwon · 2025 Spring Semester
        </p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,maxWidth:1280,width:"100%",position:"relative"}}>
        {wl.map((w,i)=>(
          <button key={w.id} onClick={()=>onSelect(w.id)} style={{background:"#0d1320",border:"1px solid #1a2235",borderRadius:18,padding:"32px 28px",textAlign:"left",cursor:"pointer",transition:"all 0.3s ease",position:"relative",overflow:"hidden",animation:`fadeSlideUp 0.5s ease ${i*0.1}s both`}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=w.color;e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 12px 40px -10px ${w.color}30`}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1a2235";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${w.color},transparent)`}}/>
            <div style={{fontSize:12,fontWeight:700,color:w.color,letterSpacing:2,fontFamily:"'JetBrains Mono',monospace",marginBottom:12,textTransform:"uppercase"}}>{w.title}</div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",marginBottom:16,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.3}}>{w.subtitle}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {w.topics.map((t,j)=>(<div key={j} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#94a3b8",lineHeight:1.4}}><div style={{width:5,height:5,borderRadius:"50%",background:w.color,opacity:0.6,flexShrink:0}}/>{t}</div>))}
            </div>
            <div style={{marginTop:20,display:"flex",alignItems:"center",gap:6,color:w.color,fontSize:13,fontWeight:600}}>
              {lang==="KR"?"학습 시작하기":"Open Study Companion"}<span style={{fontSize:16}}>→</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{marginTop:48,color:"#334155",fontSize:12,fontFamily:"'JetBrains Mono',monospace",textAlign:"center"}}>
        {lang==="KR"?"학기 진행에 따라 매주 업데이트됩니다":"More weeks will be added as the semester progresses"}
      </div>
    </div>
  );
}

export default function App() {
  const [week, setWeek] = useState(null);
  const [lang, setLang] = useState("KR");
  window.__backToHome = () => setWeek(null);
  if (week) { const C = comps[lang]?.[week]; if (C) return <C />; }
  return <LandingPage onSelect={setWeek} lang={lang} onLang={setLang} />;
}
