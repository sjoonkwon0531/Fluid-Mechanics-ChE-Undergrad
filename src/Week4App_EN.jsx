import { useState, useEffect, useRef, useCallback, useMemo } from "react";
const Sub = ({ children }) => <sub className="text-xs">{children}</sub>;
const C = { bg:"#060b18", card:"#0f1729", accent:"#f97316", accentDim:"#c2410c", cyan:"#06b6d4", green:"#22c55e", danger:"#ef4444", purple:"#a78bfa", text:"#e2e8f0", textDim:"#94a3b8", border:"#1a2744", hi:"#1e1b4b" };
const TABS = [
  { id:"overview",  label:"\uD83D\uDCCB Overview",       short:"Intro" },
  { id:"shear",     label:"\uD83D\uDD27 Shear Models",   short:"Shear" },
  { id:"fanning",   label:"\uD83D\uDCCA Fanning & Moody", short:"Moody" },
  { id:"fittings",  label:"\uD83D\uDD29 Pipe Fittings",  short:"Fitt." },
  { id:"turbulent", label:"\uD83C\uDF2A\uFE0F Turbulent Profile", short:"Turb." },
  { id:"compress",  label:"\uD83D\uDCA8 Compressible Gas",short:"Gas" },
  { id:"dalembert", label:"\uD83C\uDFAD d'Alembert",     short:"Parad." },
  { id:"stokes",    label:"\uD83D\uDD2C Stokes Law",     short:"Stokes" },
  { id:"practice",  label:"\u270F\uFE0F Practice",       short:"Quiz" },
  { id:"industry",  label:"\uD83C\uDFED Applications",   short:"Apps" },
];

function OverviewTab(){return(
  <div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
      <h2 className="text-2xl font-bold mb-3" style={{color:C.accent}}>Week 4 — Friction Factor, Pipe Systems & Creeping Flow</h2>
      <p style={{color:C.text,lineHeight:1.8}}>This week starts from the <strong style={{color:C.accent}}>microscopic origin of shear stress</strong> (laminar vs turbulent), then introduces the <strong style={{color:C.cyan}}>Fanning friction factor</strong> and <strong style={{color:C.green}}>Moody chart</strong> for practical pipe design. We cover pipe fitting losses via equivalent length, turbulent velocity profiles (1/n power law), compressible gas pipeline analysis, and supplementary topics: <strong style={{color:C.purple}}>d'Alembert's paradox</strong> and <strong style={{color:C.danger}}>Stokes' law</strong>.</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[{icon:"\uD83D\uDD27",title:"Shear Stress Models",desc:"Laminar \u03C4\u221Du_m vs turbulent \u03C4\u221Du_m\u00B2: microscopic origin",color:C.accent},
        {icon:"\uD83D\uDCCA",title:"Fanning f & Moody",desc:"f_F=16/Re (laminar), Colebrook-White (turbulent), Moody chart",color:C.cyan},
        {icon:"\uD83D\uDD29",title:"Pipe Fittings",desc:"K_L, equivalent length (L/D)_e, valve & elbow loss coefficients",color:C.green},
        {icon:"\uD83D\uDCA8",title:"Compressible Gas",desc:"Isothermal ideal gas pipeline, max velocity (choked flow)",color:C.purple},
      ].map((it,i)=>(<div key={i} className="p-3 rounded-xl hover:scale-[1.02] transition-all" style={{background:C.card,border:`1px solid ${C.border}`}}><div className="text-2xl mb-1">{it.icon}</div><h3 className="font-bold text-xs mb-1" style={{color:it.color}}>{it.title}</h3><p className="text-xs" style={{color:C.textDim}}>{it.desc}</p></div>))}
    </div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-3" style={{color:C.accent}}>Quick Reference</h3>
      <div className="space-y-1.5 text-xs font-mono">
        {[{eq:"f_F = \u03C4_w / (\u00BD\u03C1u_m\u00B2)",label:"Fanning friction factor definition",c:C.accent},
          {eq:"f_F = 16/Re (laminar)",label:"Laminar friction factor",c:C.cyan},
          {eq:"1/\u221Af_F = \u22121.737 ln(0.269\u03B5/D + 1.257/Re\u221Af_F)",label:"Colebrook-White (turbulent)",c:C.green},
          {eq:"\u2131 = 2f_F\u00B7u_m\u00B2\u00B7L/D",label:"Dissipation-friction factor relation",c:C.danger},
          {eq:"\u0394p = K_L\u00B7\u03C1u\u00B2/2, K_L = f_F\u00B7L_eq/D",label:"Fitting pressure loss",c:C.purple},
          {eq:"u/u_C = (y/a)^(1/n)",label:"Turbulent power law profile",c:C.cyan},
          {eq:"F_D = 6\u03C0\u03BCUR",label:"Stokes' law (creeping flow)",c:C.accent},
        ].map((r,i)=>(<div key={i} className="flex items-center gap-3 p-1.5 rounded" style={{background:`${r.c}08`}}><span className="w-72 flex-shrink-0" style={{color:r.c}}>{r.eq}</span><span style={{color:C.textDim}}>{r.label}</span></div>))}
      </div>
    </div>
  </div>
);}

function ShearTab(){return(
  <div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
      <h2 className="text-2xl font-bold mb-2" style={{color:C.accent}}>Microscopic Origin of Shear Stress</h2>
      <p className="text-sm" style={{color:C.textDim}}>Lane-change analogy: momentum exchange between adjacent fluid layers is the essence of shear stress</p>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.cyan}33`}}>
        <h3 className="font-bold mb-3" style={{color:C.cyan}}>Laminar: \u03C4 \u221D u<Sub>m</Sub></h3>
        <div className="space-y-2 text-sm" style={{color:C.text}}>
          <p>Molecular diffusion transfers momentum between adjacent layers A (velocity u_A) and B (velocity u_B):</p>
          <div className="p-2 rounded font-mono text-xs" style={{background:C.bg}}><div>\u03C4 = m\u0307\u00B7\u03B4\u00B7(du/dr) = \u03B7\u00B7(du/dr)</div><div className="mt-1">\u2248 \u03BD\u00B7\u03C1\u00B7(u<Sub>m</Sub>/a)</div></div>
          <p className="text-xs" style={{color:C.textDim}}>\u2192 <strong style={{color:C.cyan}}>\u03C4 \u221D u<Sub>m</Sub></strong> \u2192 \u0394P \u221D Q (1st order)</p>
        </div>
      </div>
      <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.danger}33`}}>
        <h3 className="font-bold mb-3" style={{color:C.danger}}>Turbulent: \u03C4 \u221D u<Sub>m</Sub>\u00B2</h3>
        <div className="space-y-2 text-sm" style={{color:C.text}}>
          <p>Large-scale eddy mixing dominates. Eddy viscosity \u03BD_T replaces molecular viscosity:</p>
          <div className="p-2 rounded font-mono text-xs" style={{background:C.bg}}><div>\u03C4 = (\u03BD+\u03BD_T)\u00B7\u03C1\u00B7(du/dr) \u2248 \u03BD_T\u00B7\u03C1\u00B7(du/dr)</div><div className="mt-1">\u03BD_T \u2248 c\u00B7u<Sub>m</Sub>\u00B7a \u2192 \u03C4 \u2248 c\u00B7\u03C1\u00B7u<Sub>m</Sub>\u00B2</div></div>
          <p className="text-xs" style={{color:C.textDim}}>\u2192 <strong style={{color:C.danger}}>\u03C4 \u221D u<Sub>m</Sub>\u00B2</strong> \u2192 \u0394P \u221D Q\u00B2 (2nd order)</p>
        </div>
      </div>
    </div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-3" style={{color:C.accent}}>Lane-Change Analogy</h3>
      <p className="text-sm" style={{color:C.text,lineHeight:1.7}}>When highway lanes have different speeds, drivers switching from a fast lane to a slow lane increase the slow lane's average speed. This is <strong style={{color:C.cyan}}>momentum transfer</strong> in action. The lane-change probability P_pq = P\u2080 + \u03B1(u_q\u2212u_p)/u_p controls how quickly equilibrium is reached. Higher \u03B1 (lower viscosity) \u2192 faster equilibration. At equilibrium, all lanes have equal density and speed \u2014 this is <strong style={{color:C.accent}}>momentum equilibrium via shear stress</strong>.</p>
    </div>
  </div>
);}

function FanningTab(){
  const[Re,setRe]=useState(10000);const[epsD,setEpsD]=useState(0.001);const canvasRef=useRef(null);
  const calcFf=useCallback((re,ed)=>{if(re<2300)return 16/re;let ff=0.01;for(let i=0;i<50;i++){const rhs=-1.737*Math.log(0.269*ed+1.257/(re*Math.sqrt(ff)));const fn=1/(rhs*rhs);if(Math.abs(fn-ff)<1e-10)break;ff=fn}return ff},[]);
  const fF=calcFf(Re,epsD);
  useEffect(()=>{const cv=canvasRef.current;if(!cv)return;const ctx=cv.getContext("2d");const W=cv.width=560,H=cv.height=320;ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    const lRMin=2.8,lRMax=7.2,lFMin=Math.log10(0.002),lFMax=Math.log10(0.04),mL=60,mR=20,mT=20,mB=40,pW=W-mL-mR,pH=H-mT-mB;
    const toX=lr=>mL+(lr-lRMin)/(lRMax-lRMin)*pW,toY=lf=>mT+(lFMax-lf)/(lFMax-lFMin)*pH;
    ctx.strokeStyle="#1e293b";ctx.lineWidth=0.5;for(let lr=3;lr<=7;lr++){ctx.beginPath();ctx.moveTo(toX(lr),mT);ctx.lineTo(toX(lr),H-mB);ctx.stroke()}
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();for(let lr=lRMin;lr<=Math.log10(2300);lr+=0.02){const re=Math.pow(10,lr),ff=16/re,x=toX(lr),y=toY(Math.log10(ff));lr===lRMin?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke();
    [0,0.0001,0.0005,0.001,0.005,0.01,0.02,0.04].forEach((ed,idx)=>{ctx.strokeStyle=ed===0?C.green:`rgba(249,115,22,${0.3+0.7*idx/8})`;ctx.lineWidth=ed===epsD?2.5:1;ctx.beginPath();let s=false;for(let lr=Math.log10(4000);lr<=lRMax;lr+=0.03){const re=Math.pow(10,lr),ff=calcFf(re,ed),lf=Math.log10(ff);if(lf<lFMin||lf>lFMax)continue;const x=toX(lr),y=toY(lf);!s?(ctx.moveTo(x,y),s=true):ctx.lineTo(x,y)}ctx.stroke()});
    const lRC=Math.log10(Re),lFC=Math.log10(fF);if(lRC>=lRMin&&lRC<=lRMax&&lFC>=lFMin&&lFC<=lFMax){const cx2=toX(lRC),cy2=toY(lFC);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(cx2,cy2,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.accent;ctx.beginPath();ctx.arc(cx2,cy2,3,0,Math.PI*2);ctx.fill()}
    ctx.fillStyle=C.textDim;ctx.font="10px monospace";ctx.fillText("Re",W/2,H-5);for(let lr=3;lr<=7;lr++)ctx.fillText(`10^${lr}`,toX(lr)-12,H-mB+15);
    ctx.fillStyle=C.cyan;ctx.fillText("Laminar f=16/Re",toX(3.2),toY(Math.log10(16/2000))-8);ctx.fillStyle=C.green;ctx.fillText("Smooth",toX(6.5),toY(Math.log10(calcFf(3e6,0)))-6);
  },[Re,epsD,fF,calcFf]);

  return(<div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
      <h2 className="text-2xl font-bold mb-2" style={{color:C.cyan}}>Fanning Friction Factor & Interactive Moody Chart</h2>
    </div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-2" style={{color:C.accent}}>Definition of f<Sub>F</Sub></h3>
      <div className="p-3 rounded-lg text-center font-mono" style={{background:C.bg,color:C.cyan}}>f<Sub>F</Sub> = \u03C4<Sub>w</Sub> / (\u00BD\u03C1u<Sub>m</Sub>\u00B2) — ratio of wall stress to inertial force per unit area</div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div className="p-2 rounded" style={{background:`${C.cyan}15`}}><span style={{color:C.cyan}}>Laminar:</span> <span style={{color:C.text}}>f<Sub>F</Sub> = 16/Re (circular), 14.227/Re (square)</span></div>
        <div className="p-2 rounded" style={{background:`${C.accent}15`}}><span style={{color:C.accent}}>Turbulent:</span> <span style={{color:C.text}}>Colebrook-White implicit equation (numerical solve)</span></div>
      </div>
    </div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-3" style={{color:C.green}}>Interactive Moody Chart</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div><label className="text-xs block mb-1" style={{color:C.textDim}}>Re (10\u00B2\u201310\u2077)</label><input type="range" min={2.5} max={7} step={0.01} value={Math.log10(Re)} onChange={e=>setRe(Math.pow(10,+e.target.value))} className="w-full" style={{accentColor:C.accent}}/><div className="text-xs font-mono mt-1" style={{color:C.accent}}>Re = {Re<1e5?Re.toFixed(0):Re.toExponential(2)}</div></div>
        <div><label className="text-xs block mb-1" style={{color:C.textDim}}>\u03B5/D (relative roughness)</label><input type="range" min={0} max={0.05} step={0.0001} value={epsD} onChange={e=>setEpsD(+e.target.value)} className="w-full" style={{accentColor:C.green}}/><div className="text-xs font-mono mt-1" style={{color:C.green}}>\u03B5/D = {epsD.toFixed(4)}</div></div>
      </div>
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{maxWidth:560}}/>
      <div className="flex gap-4 mt-3 p-3 rounded-lg" style={{background:C.bg}}>
        <div className="text-center flex-1"><div className="text-xs" style={{color:C.textDim}}>f<Sub>F</Sub></div><div className="text-xl font-bold" style={{color:C.accent}}>{fF.toFixed(5)}</div></div>
        <div className="text-center flex-1"><div className="text-xs" style={{color:C.textDim}}>Regime</div><div className="text-sm font-bold" style={{color:Re<2300?C.cyan:Re>4000?C.danger:C.accent}}>{Re<2300?"Laminar":Re>4000?"Turbulent":"Transition"}</div></div>
        <div className="text-center flex-1"><div className="text-xs" style={{color:C.textDim}}>\u0394h/L (head loss/m)</div><div className="text-sm font-bold" style={{color:C.green}}>2f<Sub>F</Sub>u\u00B2/(gD)</div></div>
      </div>
    </div>
  </div>);
}

function FittingsTab(){
  const[vel,setVel]=useState(2.0);const[rho,setRho]=useState(1000);const[fit,setFit]=useState("std_elbow_90");
  const fits={std_elbow_90:{name:"Standard 90\u00B0 Elbow",LDe:30},square_elbow_90:{name:"Square 90\u00B0 Elbow",LDe:70},elbow_45:{name:"45\u00B0 Elbow",LDe:15},close_return:{name:"Close Return Bend",LDe:75},gate_valve:{name:"Gate Valve (open)",LDe:6.5},globe_valve:{name:"Globe Valve (open)",LDe:330},angle_valve:{name:"Angle Valve (open)",LDe:160},std_tee:{name:"Standard T (side)",LDe:70},sudden_exp:{name:"Sudden Expansion 1:4",LDe:30},sudden_con:{name:"Sudden Contraction 2:1",LDe:11}};
  const sel=fits[fit],fF=0.005,KL=fF*sel.LDe,dp=KL*rho*vel*vel/2;
  return(<div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
      <h2 className="text-2xl font-bold mb-2" style={{color:C.green}}>Pipe Fitting Pressure Loss Calculator</h2>
      <p className="text-sm" style={{color:C.textDim}}>\u0394p = K<Sub>L</Sub>\u00B7\u03C1u\u00B2/2, K<Sub>L</Sub> = f<Sub>F</Sub>\u00B7(L/D)<Sub>e</Sub></p>
    </div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div><label className="text-xs block mb-1" style={{color:C.textDim}}>Fitting Type</label><select value={fit} onChange={e=>setFit(e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`}}>{Object.entries(fits).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select></div>
        <div><label className="text-xs block mb-1" style={{color:C.textDim}}>Velocity u (m/s)</label><input type="number" value={vel} step={0.1} onChange={e=>setVel(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`}}/></div>
        <div><label className="text-xs block mb-1" style={{color:C.textDim}}>Density \u03C1 (kg/m\u00B3)</label><input type="number" value={rho} step={10} onChange={e=>setRho(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`}}/></div>
        <div><label className="text-xs block mb-1" style={{color:C.textDim}}>f<Sub>F</Sub></label><div className="px-2 py-1.5 rounded-lg text-xs" style={{background:C.bg,color:C.accent,border:`1px solid ${C.border}`}}>\u2248 0.005 (typical turb.)</div></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{l:"(L/D)_e",v:sel.LDe,c:C.cyan},{l:"K_L",v:KL.toFixed(4),c:C.green},{l:"\u0394p (Pa)",v:dp.toFixed(1),c:C.accent}].map((m,i)=>(<div key={i} className="p-3 rounded-lg text-center" style={{background:C.bg}}><div className="text-xs" style={{color:C.textDim}}>{m.l}</div><div className="text-lg font-bold" style={{color:m.c}}>{m.v}</div></div>))}
      </div>
    </div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-2" style={{color:C.accent}}>Inlet/Outlet Loss Coefficients K<Sub>L</Sub></h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><h4 className="font-bold text-xs mb-2" style={{color:C.cyan}}>Inlet</h4>
          {[["Reentrant",0.8],["Sharp-edged",0.5],["Slightly rounded",0.2],["Well-rounded",0.04]].map(([n,v],i)=>(<div key={i} className="flex justify-between py-0.5" style={{color:C.text}}><span className="text-xs">{n}</span><span className="text-xs font-mono" style={{color:C.accent}}>{v}</span></div>))}</div>
        <div><h4 className="font-bold text-xs mb-2" style={{color:C.danger}}>Outlet</h4><p className="text-xs" style={{color:C.text}}>All types: K<Sub>L</Sub> = 1.0</p><p className="text-xs mt-1" style={{color:C.textDim}}>All kinetic energy of the fluid is dissipated at the outlet.</p></div>
      </div>
    </div>
  </div>);
}

function TurbulentTab(){
  const[nExp,setNExp]=useState(7);const canvasRef=useRef(null);
  useEffect(()=>{const cv=canvasRef.current;if(!cv)return;const ctx=cv.getContext("2d");const W=cv.width=400,H=cv.height=300;ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    const mL=50,mR=20,mT=20,mB=40,pW=W-mL-mR,pH=H-mT-mB;ctx.strokeStyle=C.textDim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(mL,mT);ctx.lineTo(mL,H-mB);ctx.lineTo(W-mR,H-mB);ctx.stroke();
    ctx.font="10px monospace";ctx.fillStyle=C.textDim;ctx.fillText("u/u_C",W/2,H-5);ctx.fillText("y/a",mL-15,mT+10);
    ctx.strokeStyle=`${C.cyan}80`;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();for(let i=0;i<=100;i++){const ya=i/100,uR=2*ya*(1-ya)*2,x=mL+Math.min(uR,1)*pW,y=H-mB-ya*pH;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=C.accent;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=100;i++){const ya=i/100,uR=Math.pow(ya,1/nExp),x=mL+uR*pW,y=H-mB-ya*pH;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke();
    ctx.fillStyle=`${C.cyan}aa`;ctx.fillText("Laminar (parabolic)",mL+10,H-mB-pH*0.5);ctx.fillStyle=C.accent;ctx.fillText(`Turbulent n=${nExp}`,mL+pW*0.55,mT+30);
  },[nExp]);
  return(<div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
      <h2 className="text-2xl font-bold mb-2" style={{color:C.accent}}>Turbulent Velocity Profile — 1/n Power Law</h2></div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <div className="mb-3"><label className="text-xs mb-1 block" style={{color:C.textDim}}>Exponent n (Re \u2191 \u2192 n \u2191)</label>
        <input type="range" min={4} max={12} step={0.1} value={nExp} onChange={e=>setNExp(+e.target.value)} className="w-full" style={{accentColor:C.accent}}/>
        <div className="text-xs font-mono" style={{color:C.accent}}>n = {nExp} \u2192 u/u_C = (y/a)^(1/{nExp})</div></div>
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{maxWidth:400}}/>
      <div className="mt-3 p-3 rounded-lg text-sm" style={{background:C.bg,color:C.text}}>
        <p><strong style={{color:C.accent}}>Key insight:</strong> Higher n \u2192 flatter profile (flat core, steep near wall). n=7 is typical at Re = 1.1\u00D710\u2075.</p>
        <p className="mt-1"><strong style={{color:C.cyan}}>Laminar sublayer:</strong> \u03B4/D \u2248 62\u00B7Re^(\u22127/8). An extremely thin laminar region exists near the wall even in turbulent flow.</p>
      </div>
    </div>
  </div>);
}

function CompressTab(){return(<div className="space-y-6 animate-fadeIn">
  <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
    <h2 className="text-2xl font-bold mb-2" style={{color:C.purple}}>Compressible Gas Flow in Pipelines</h2>
    <p className="text-sm" style={{color:C.textDim}}>Steady, isothermal, ideal gas — long-distance horizontal pipeline</p></div>
  <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
    <h3 className="font-bold mb-3" style={{color:C.cyan}}>Core Derivation</h3>
    <div className="space-y-3 text-sm" style={{color:C.text}}>
      <div className="p-3 rounded" style={{background:C.bg}}><p className="font-bold text-xs" style={{color:C.accent}}>Starting point (energy + momentum balance):</p><p className="font-mono text-xs mt-1">du/u + dp/(\u03C1u\u00B2) + 2f_F\u00B7dx/D = 0</p></div>
      <div className="p-3 rounded" style={{background:C.bg}}><p className="font-bold text-xs" style={{color:C.accent}}>Ideal gas + isothermal + constant mass flux G=\u03C1u:</p><p className="font-mono text-xs mt-1">du/u = \u2212d\u03C1/\u03C1 = \u2212dp/p</p></div>
      <div className="p-3 rounded" style={{background:`${C.purple}15`}}><p className="font-bold text-xs" style={{color:C.purple}}>Final relation:</p><p className="font-mono text-xs mt-1">4f_FL/D = \u03C1\u2081(p\u2081\u00B2\u2212p\u2082\u00B2)/(G\u00B2p\u2081) + log(p\u2082/p\u2081)\u00B2</p></div>
    </div></div>
  <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
    <h3 className="font-bold mb-3" style={{color:C.danger}}>Choked Flow (Maximum Flow Rate)</h3>
    <p className="text-sm" style={{color:C.text,lineHeight:1.7}}>As outlet pressure p\u2082 decreases, G increases until G_max. Beyond this, flow rate cannot increase further. The exit velocity reaches u\u2082* = \u221A(RT/M_W) — the <strong style={{color:C.danger}}>isothermal speed of sound</strong>. Reducing p\u2082 below p\u2082* causes a <strong style={{color:C.accent}}>shock wave</strong> at the exit while flow rate stays at G_max.</p>
    <div className="mt-2 p-3 rounded font-mono text-xs text-center" style={{background:C.bg,color:C.purple}}>4f_FL/D + 1 = \u2212logX + X, X \u2261 (p\u2081/p\u2082*)\u00B2 — nonlinear equation</div>
  </div>
</div>);}

function DAlembertTab(){return(<div className="space-y-6 animate-fadeIn">
  <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
    <h2 className="text-2xl font-bold mb-2" style={{color:C.purple}}>d'Alembert's Paradox — Why Bernoulli Alone Is Not Enough</h2>
    <p className="text-sm" style={{color:C.textDim}}>The failure of inviscid theory: zero drag on a cylinder?!</p></div>
  <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
    <h3 className="font-bold mb-3" style={{color:C.cyan}}>Derivation</h3>
    <div className="space-y-3 text-sm" style={{color:C.text,lineHeight:1.7}}>
      <p><strong style={{color:C.accent}}>Setup:</strong> Flow around a long cylinder of radius R. Assumptions: incompressible + irrotational.</p>
      <p><strong style={{color:C.cyan}}>Key:</strong> \u2207\u00D7v = 0 \u2192 v = \u2212\u2207\u03C6 (velocity potential exists) + \u2207\u00B7v = 0 \u2192 \u2207\u00B2\u03C6 = 0 (Laplace eq.)</p>
      <p><strong style={{color:C.green}}>Solution:</strong> \u03C6(r,\u03B8) = U(r + R\u00B2/r)cos\u03B8</p>
      <div className="p-2 rounded font-mono text-xs" style={{background:C.bg}}>v_r = U(1 \u2212 R\u00B2/r\u00B2)cos\u03B8, v_\u03B8 = \u2212U(1 + R\u00B2/r\u00B2)sin\u03B8</div>
      <p><strong style={{color:C.accent}}>Bernoulli for pressure:</strong> p(R,\u03B8) = (\u03C1U\u00B2/2)(1 \u2212 4sin\u00B2\u03B8)</p>
      <p><strong style={{color:C.danger}}>Result:</strong> F_x = \u222Ep\u00B7cos\u03B8\u00B7dA = 0, F_y = \u222Ep\u00B7sin\u03B8\u00B7dA = 0</p>
    </div></div>
  <div className="p-4 rounded-xl" style={{background:`${C.danger}10`,border:`1px solid ${C.danger}33`}}>
    <h3 className="font-bold mb-2" style={{color:C.danger}}>The Paradox</h3>
    <p className="text-sm" style={{color:C.text,lineHeight:1.7}}>Theory predicts zero force on the cylinder \u2014 but experiments clearly show drag exists. This is because <strong style={{color:C.accent}}>Bernoulli's equation ignores viscous effects</strong>. In reality, a boundary layer forms near the wall, flow separation occurs, and a wake develops, creating both pressure drag and friction drag.</p>
    <p className="text-sm mt-2 font-bold" style={{color:C.purple}}>Conclusion: The Navier-Stokes equations, which include viscosity and shear stress, are required.</p>
  </div>
</div>);}

function StokesTab(){
  const[R,setR]=useState(0.001);const[mu,setMu]=useState(0.001);const[U,setU]=useState(0.01);const[drho,setDrho]=useState(1500);
  const FD=6*Math.PI*mu*U*R,Re2=(1000*U*2*R)/mu,UT=(2*R*R*drho*9.81)/(9*mu);
  return(<div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
      <h2 className="text-2xl font-bold mb-2" style={{color:C.accent}}>Stokes' Law & Creeping Flow</h2>
      <p className="text-sm" style={{color:C.textDim}}>Re \u226A 1: Flow past a sphere. F_D = 6\u03C0\u03BCUR</p></div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-3" style={{color:C.cyan}}>Stokes Drag Calculator</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[{label:"Radius R (m)",val:R,set:setR,step:0.0001},{label:"Viscosity \u03BC (Pa\u00B7s)",val:mu,set:setMu,step:0.0001},{label:"Velocity U (m/s)",val:U,set:setU,step:0.001},{label:"\u0394\u03C1 (kg/m\u00B3)",val:drho,set:setDrho,step:10}].map((p,i)=>(
          <div key={i}><label className="text-xs block mb-1" style={{color:C.textDim}}>{p.label}</label><input type="number" value={p.val} step={p.step} onChange={e=>p.set(+e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs" style={{background:C.bg,color:C.text,border:`1px solid ${C.border}`}}/></div>))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg text-center" style={{background:C.bg}}><div className="text-xs" style={{color:C.textDim}}>F_D = 6\u03C0\u03BCUR</div><div className="text-lg font-bold" style={{color:C.accent}}>{FD.toExponential(3)} N</div></div>
        <div className="p-3 rounded-lg text-center" style={{background:C.bg}}><div className="text-xs" style={{color:C.textDim}}>Re</div><div className="text-lg font-bold" style={{color:Re2<1?C.green:C.danger}}>{Re2.toFixed(3)}</div><div className="text-xs" style={{color:C.textDim}}>{Re2<1?"\u2713 Creeping flow":"\u26A0 Re > 1"}</div></div>
        <div className="p-3 rounded-lg text-center" style={{background:C.bg}}><div className="text-xs" style={{color:C.textDim}}>Terminal vel. U_T</div><div className="text-lg font-bold" style={{color:C.purple}}>{UT.toExponential(3)} m/s</div></div>
      </div></div>
    <div className="p-4 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-3" style={{color:C.green}}>Key Relations</h3>
      <div className="space-y-2">
        {[{t:"Stokes equation",eq:"\u2207p = \u03BC\u2207\u00B2v (inertia neglected)",n:"Limiting form of N-S at Re \u226A 1"},
          {t:"Sphere flow solution",eq:"\u03C8 = UR\u00B2sin\u00B2\u03B8[\u00BD(r/R)\u00B2\u2212\u00BE(r/R)+\u00BC(R/r)]",n:"Stream function solution"},
          {t:"Stokes' law",eq:"F_D = 6\u03C0\u03BCUR (1/3 pressure + 2/3 shear)",n:"\u03B6 = 6\u03C0\u03BCR (drag coefficient)"},
          {t:"Terminal velocity",eq:"U_T = 2R\u00B2\u0394\u03C1g/(9\u03BC)",n:"Buoyancy = drag equilibrium"},
          {t:"Stokes-Einstein",eq:"D = k_BT/(6\u03C0\u03BCR)",n:"Diffusion-viscosity relation"},
        ].map((r,i)=>(<div key={i} className="p-2 rounded text-xs" style={{background:C.bg}}><span className="font-bold" style={{color:C.accent}}>{r.t}: </span><span className="font-mono" style={{color:C.cyan}}>{r.eq}</span><span className="ml-2" style={{color:C.textDim}}>{r.n}</span></div>))}
      </div></div>
  </div>);
}

function PracticeTab(){
  const[cur,setCur]=useState(0);const[sel,setSel]=useState(null);const[show,setShow]=useState(false);
  const qs=[
    {q:"Definition of Fanning friction factor f_F?",o:["\u03C4_w/(\u00BD\u03C1u_m\u00B2)","\u03C4_w/(\u03C1u_m\u00B2)","\u0394P/(\u00BD\u03C1u_m\u00B2)","16/Re"],a:0,e:"f_F = \u03C4_w/(\u00BD\u03C1u_m\u00B2). Ratio of wall shear stress to inertial force per unit area."},
    {q:"f_F vs Re for laminar flow in a circular pipe?",o:["f_F = 16/Re","f_F = 64/Re","f_F = 8/Re","f_F = Re/16"],a:0,e:"Fanning: f_F = 16/Re. Note: Darcy f_D = 4f_F = 64/Re. Don't confuse them!"},
    {q:"Why is \u03C4 \u221D u_m\u00B2 in turbulent flow?",o:["Eddy viscosity \u03BD_T \u2248 cu_ma","Molecular viscosity increases","Pipe diameter changes","Pressure is quadratic"],a:0,e:"\u03BD_T \u2248 c\u00B7u_m\u00B7a (eddy scaling). \u03C4 \u2248 \u03BD_T\u00B7\u03C1\u00B7(u_m/a) = c\u00B7\u03C1\u00B7u_m\u00B2."},
    {q:"Why is Colebrook-White 'implicit'?",o:["f_F appears on both sides","Re is unknown","\u03B5/D is unknown","L is included"],a:0,e:"1/\u221Af_F = \u22121.737ln(0.269\u03B5/D + 1.257/(Re\u221Af_F)). f_F on both LHS and RHS requires iteration."},
    {q:"(L/D)_e for an open globe valve?",o:["30","70","160","330"],a:3,e:"(L/D)_e = 330. One of the highest equivalent lengths among common fittings."},
    {q:"K_L for a pipe outlet (any shape)?",o:["0.04","0.5","0.8","1.0"],a:3,e:"All outlet shapes: K_L = 1.0. All kinetic energy is dissipated."},
    {q:"In d'Alembert's paradox, the theoretical force on a cylinder is:",o:["6\u03C0\u03BCUR","\u03C1U\u00B2R","0","\u03C0\u03C1U\u00B2R\u00B2"],a:2,e:"Inviscid + irrotational \u2192 Force = 0. Real flow has viscous drag."},
    {q:"In Stokes' law F_D = 6\u03C0\u03BCUR, what fraction comes from pressure vs shear?",o:["1/3 pressure + 2/3 shear","2/3 pressure + 1/3 shear","All shear","All pressure"],a:0,e:"Stokes: 1/3 is pressure drag, 2/3 is shear drag."},
    {q:"Terminal velocity of a sphere U_T = ?",o:["2R\u00B2\u0394\u03C1g/(9\u03BC)","R\u00B2\u0394\u03C1g/(6\u03BC)","4R\u00B2\u0394\u03C1g/(3\u03BC)","R\u0394\u03C1g/\u03BC"],a:0,e:"Buoyancy (4/3)\u03C0R\u00B3\u0394\u03C1g = Stokes drag 6\u03C0\u03BCU_TR \u2192 U_T = 2R\u00B2\u0394\u03C1g/(9\u03BC)."},
    {q:"Laminar sublayer thickness \u03B4/D \u2248 ?",o:["62\u00B7Re^(\u22127/8)","16/Re","Re^(\u22121/2)","1/Re"],a:0,e:"\u03B4/D \u2248 62\u00B7Re^(\u22127/8). Higher Re \u2192 thinner sublayer."},
  ];
  const q=qs[cur];
  return(<div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}>
      <h2 className="text-2xl font-bold mb-2" style={{color:C.accent}}>Practice Problems</h2>
      <div className="flex items-center gap-3"><span className="text-sm" style={{color:C.textDim}}>{cur+1}/{qs.length}</span><div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:C.bg}}><div className="h-full rounded-full transition-all" style={{width:`${((cur+1)/qs.length)*100}%`,background:C.accent}}/></div></div></div>
    <div className="p-5 rounded-xl" style={{background:C.card,border:`1px solid ${C.border}`}}>
      <h3 className="font-bold mb-4" style={{color:C.text}}>{q.q}</h3>
      <div className="space-y-2">{q.o.map((opt,i)=>{let bg=C.bg,bc=C.border;if(show){if(i===q.a){bg=`${C.green}20`;bc=C.green}else if(i===sel){bg=`${C.danger}20`;bc=C.danger}}else if(i===sel){bg=`${C.accent}20`;bc=C.accent}return(<button key={i} onClick={()=>!show&&setSel(i)} className="w-full text-left p-3 rounded-lg text-sm" style={{background:bg,border:`1px solid ${bc}`,color:C.text}}><span className="font-mono mr-2" style={{color:C.accent}}>{String.fromCharCode(65+i)}.</span>{opt}</button>)})}</div>
      {show&&(<div className="mt-4 p-4 rounded-lg animate-fadeIn" style={{background:`${sel===q.a?C.green:C.danger}15`,border:`1px solid ${sel===q.a?C.green:C.danger}40`}}><div className="font-bold mb-1" style={{color:sel===q.a?C.green:C.danger}}>{sel===q.a?"\u2705 Correct!":"\u274C Incorrect"}</div><p className="text-sm" style={{color:C.text}}>{q.e}</p></div>)}
      <div className="flex gap-3 mt-4">{!show?(<button onClick={()=>sel!==null&&setShow(true)} disabled={sel===null} className="px-5 py-2 rounded-lg font-bold text-sm" style={{background:sel!==null?C.accent:C.border,color:sel!==null?C.bg:C.textDim}}>Check Answer</button>):(<button onClick={()=>{setCur((cur+1)%qs.length);setSel(null);setShow(false)}} className="px-5 py-2 rounded-lg font-bold text-sm" style={{background:C.accent,color:C.bg}}>Next \u2192</button>)}<button onClick={()=>{setCur(0);setSel(null);setShow(false)}} className="px-4 py-2 rounded-lg text-sm" style={{background:C.bg,color:C.textDim,border:`1px solid ${C.border}`}}>Reset</button></div>
    </div>
  </div>);
}

function IndustryTab(){
  const[exp,setExp]=useState(null);
  const apps=[
    {icon:"\u26FD",title:"Natural Gas Long-Distance Pipeline",f:"Pipeline Eng.",c:"Compressible gas analysis determines pump station spacing. 4f_FL/D + log(p\u2082/p\u2081)\u00B2 is the core equation.",r:"Choked flow, G_max"},
    {icon:"\uD83C\uDFED",title:"Refinery — Piping System Design",f:"Refinery",c:"Complex piping with hundreds of valves, elbows, tees. Equivalent length (L/D)_e summation gives total pressure loss.",r:"\u03A3K_L, (L/D)_e table"},
    {icon:"\uD83D\uDC8A",title:"Pharma/Food — Sanitary Piping",f:"Pharma/Food",c:"Drawn tubing (\u03B5\u22480.0015mm) for ultra-smooth surfaces. Design uses smooth pipe line on Moody chart.",r:"\u03B5/D \u2192 0, smooth curve"},
    {icon:"\uD83D\uDD2C",title:"Nanoparticle Sedimentation",f:"Nanotech",c:"Colloid/nanoparticle settling velocity and diffusion coefficient predicted by Stokes-Einstein. Theoretical basis for DLS measurements.",r:"D = k_BT/(6\u03C0\u03BCR)"},
    {icon:"\uD83D\uDE80",title:"Rocket Propellant Piping",f:"Aerospace",c:"Cryogenic fuel (LH2, LOX) piping: precision f_F and K_L calculations directly affect engine performance. Minimize pipe bends.",r:"f_F, \u0394h = 2f_F u\u00B2L/(gD)"},
    {icon:"\uD83C\uDFE5",title:"Artificial Heart-Lung Machines",f:"Biomedical",c:"Blood is non-Newtonian (shear-thinning). Stokes flow regime micro-circulation and drag analysis essential for device design.",r:"Creeping flow, F_D=6\u03C0\u03BCUR"},
  ];
  return(<div className="space-y-6 animate-fadeIn">
    <div className="p-5 rounded-2xl" style={{background:`linear-gradient(135deg,${C.hi},${C.card})`,border:`1px solid ${C.accentDim}`}}><h2 className="text-2xl font-bold mb-2" style={{color:C.accent}}>Chemical Engineering Applications</h2></div>
    <div className="space-y-3">{apps.map((a,i)=>(<div key={i} className="rounded-xl overflow-hidden" style={{background:C.card,border:`1px solid ${exp===i?C.accent:C.border}`}}>
      <button onClick={()=>setExp(exp===i?null:i)} className="w-full text-left p-4 flex items-center gap-3"><span className="text-2xl">{a.icon}</span><div className="flex-1"><div className="font-bold text-sm" style={{color:C.text}}>{a.title}</div><div className="text-xs" style={{color:C.textDim}}>{a.f}</div></div><span style={{color:C.accent,transform:exp===i?"rotate(180deg)":"rotate(0)",transition:"transform 0.3s"}}>\u25BC</span></button>
      {exp===i&&(<div className="px-4 pb-4 animate-fadeIn"><p className="text-sm mb-2" style={{color:C.text,lineHeight:1.7}}>{a.c}</p><div className="p-2 rounded-lg" style={{background:`${C.accent}10`}}><span className="text-xs font-bold" style={{color:C.accent}}>Key: </span><span className="text-xs font-mono" style={{color:C.cyan}}>{a.r}</span></div></div>)}
    </div>))}</div>
  </div>);
}

export default function Week4App_EN(){
  const[tab,setTab]=useState("overview");
  const render=()=>{switch(tab){case"overview":return<OverviewTab/>;case"shear":return<ShearTab/>;case"fanning":return<FanningTab/>;case"fittings":return<FittingsTab/>;case"turbulent":return<TurbulentTab/>;case"compress":return<CompressTab/>;case"dalembert":return<DAlembertTab/>;case"stokes":return<StokesTab/>;case"practice":return<PracticeTab/>;case"industry":return<IndustryTab/>;default:return<OverviewTab/>}};
  return(
    <div className="min-h-screen" style={{background:C.bg,color:C.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700;800&display=swap');*{font-family:'Outfit','Noto Sans KR',sans-serif;box-sizing:border-box}.font-mono{font-family:'JetBrains Mono',monospace}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.animate-fadeIn{animation:fadeIn 0.4s ease-out}input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:white;cursor:pointer}input[type="number"]{-moz-appearance:textfield}input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none}select{-webkit-appearance:none}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`}</style>
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{background:`${C.bg}ee`,borderBottom:`1px solid ${C.border}`}}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div><h1 className="text-lg font-bold" style={{color:C.accent,fontFamily:"'Outfit',sans-serif"}}>Fluid Mechanics for ChE</h1><p className="text-xs" style={{color:C.textDim}}>Week 4 · Friction Factor, Pipe Systems & Creeping Flow · SKKU SPMDL</p></div>
            <div className="text-right text-xs" style={{color:C.textDim}}><div>Prof. S. Joon Kwon</div><div style={{color:C.accent}}>Week 4 Study Companion</div></div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">{TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0" style={{background:tab===t.id?C.accent:"transparent",color:tab===t.id?C.bg:C.textDim,border:`1px solid ${tab===t.id?C.accent:"transparent"}`}}><span className="hidden md:inline">{t.label}</span><span className="md:hidden">{t.short}</span></button>))}</div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{render()}</main>
      <footer className="text-center py-6 text-xs" style={{color:C.textDim,borderTop:`1px solid ${C.border}`}}><p>SKKU School of Chemical Engineering · Smart Process & Materials Design Lab (SPMDL)</p><p className="mt-1" style={{color:C.accentDim}}>Fluid Mechanics Week 4 Study Companion · 2025 Spring</p></footer>
    </div>
  );
}
