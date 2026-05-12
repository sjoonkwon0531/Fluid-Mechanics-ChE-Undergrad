// src/components/CodeBlock.jsx
// Collapsible code block with copy-to-clipboard and download-as-file buttons.

import React, { useState } from "react";

export default function CodeBlock({ title, language = "python", code }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const onDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // derive filename from title's leading "N. filename.py" pattern
    const m = title.match(/(\w[\w-]*\.\w+)/);
    a.download = m ? m[1] : "snippet.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="codeblock">
      <div className="codeblock-header">
        <button className="codeblock-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span className="codeblock-arrow">{open ? "▾" : "▸"}</span> {title}
        </button>
        <div className="codeblock-actions">
          <button onClick={onCopy} title="Copy">
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={onDownload} title="Download">
            Download
          </button>
        </div>
      </div>
      {open && (
        <pre className={`codeblock-body language-${language}`}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
