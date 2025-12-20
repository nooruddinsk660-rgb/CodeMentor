import React from "react";

/**
 * CodeCube
 * Simple CSS 3D cube with code snippets on each face.
 * Uses only CSS transforms (lightweight, performs well).
 */
export default function CodeCube({ size = 220 }) {
  const cubeStyle = {
    ["--cube-size"]: `${size}px`,
  };

  const codeSamples = {
    front: `// Quick review
function sum(a,b){
  return a + b;
}`,
    right: `// ESLint hint
// prefer const over let where possible
const data = fetch('/api')`,
    left: `// Tip: name functions
const formatDate = (d) => new Date(d).toLocaleString()`,
    back: `// Performance
useMemo(() => compute(), [deps])`,
    top: `// Roadmap
- Data Structures
- System Design
- Security`,
    bottom: `// Congrats!
Deployed ✅`
  };

  const face = (name, txt) => (
    <div className={`cube-face face-${name}`} key={name}>
      <pre className="face-pre" aria-hidden>
        {txt}
      </pre>
    </div>
  );

  return (
    <div className="cube-viewport inline-block" style={cubeStyle} aria-hidden>
      <div className="code-cube">
        {face("front", codeSamples.front)}
        {face("right", codeSamples.right)}
        {face("left", codeSamples.left)}
        {face("back", codeSamples.back)}
        {face("top", codeSamples.top)}
        {face("bottom", codeSamples.bottom)}
      </div>
    </div>
  );
}
