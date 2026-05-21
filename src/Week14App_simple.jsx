import { useState } from "react";

/**
 * Week 14 — Microfluidics, MEMS & NEMS
 *
 * The Week 14 material is a self-contained interactive HTML app that
 * already lives in the repo at  src/wk14/Week14_Microfluidics.html.
 *
 * This wrapper loads it directly through htmlpreview.github.io, so you
 * do NOT need to copy the HTML into public/. Same "back to home"
 * behaviour (window.__backToHome) as the other weekly components.
 *
 * If you later move the HTML into public/wk14/, just change SRC to
 *   const SRC = "/wk14/Week14_Microfluidics.html";
 */
export default function Week14App() {
  const [loaded, setLoaded] = useState(false);

  const SRC =
    "https://htmlpreview.github.io/?https://raw.githubusercontent.com/" +
    "sjoonkwon0531/Fluid-Mechanics-ChE-Undergrad/main/src/wk14/Week14_Microfluidics.html";

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#070b14" }}>
      <button
        onClick={() => window.__backToHome && window.__backToHome()}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 200,
          padding: "8px 16px", borderRadius: 10, cursor: "pointer",
          background: "rgba(13,19,32,0.92)", color: "#e2e8f0",
          border: "1px solid #1e293b", fontSize: 13, fontWeight: 600,
          fontFamily: "'JetBrains Mono','Noto Sans KR',monospace",
          backdropFilter: "blur(6px)",
        }}
      >
        ← Home
      </button>

      {!loaded && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#64748b", fontFamily: "'JetBrains Mono',monospace", fontSize: 14,
        }}>
          Loading Week 14 — Microfluidics, MEMS &amp; NEMS…
        </div>
      )}

      <iframe
        src={SRC}
        title="Week 14 — Microfluidics, MEMS & NEMS"
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
    </div>
  );
}
