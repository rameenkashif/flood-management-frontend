import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";

// SVG wave path for animation
const WaveSVG = ({ progress, rise }) => {
  // Responsive width/height
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { width, height } = dimensions;
  const waveY = height - rise;
  // Smoother wave: more segments, continuous sine
  const amplitude = 32 + 12 * Math.sin(progress * Math.PI * 2); // bounce
  const segments = 24; // more segments for smoothness
  let d = `M0,${waveY}`;
  let prevX = 0, prevY = waveY;
  for (let i = 1; i <= segments; i++) {
    const x = (width / segments) * i;
    const phase = progress * 2 * Math.PI;
    const y = waveY + amplitude * Math.sin(phase + (i * 2 * Math.PI) / segments);
    const cpx = prevX + (x - prevX) / 2;
    d += ` Q${cpx},${prevY} ${x},${y}`;
    prevX = x;
    prevY = y;
  }
  d += ` V${height} H0 Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: 'absolute', bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00bcd4" />
          <stop offset="100%" stopColor="#2196f3" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="url(#waterGradient)"
        style={{ transition: 'd 0.3s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
};

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0); // 0 to 1, horizontal fill
  const [rise, setRise] = useState(0); // 0 to 900, vertical rise
  const [fadeOut, setFadeOut] = useState(false);
  const [drownLogo, setDrownLogo] = useState(false);
  const requestRef = useRef();

  // Animate wave horizontally, then rise up
  useEffect(() => {
    let start;
    const duration1 = 1200; // ms, horizontal fill
    const duration2 = 1200; // ms, vertical rise
    const totalRise = 900;

    function animateWave(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      if (elapsed < duration1) {
        setProgress(elapsed / duration1);
        setRise(0);
        requestRef.current = requestAnimationFrame(animateWave);
      } else if (elapsed < duration1 + duration2) {
        setProgress(1);
        setRise(((elapsed - duration1) / duration2) * totalRise);
        if ((elapsed - duration1) / duration2 > 0.5) setDrownLogo(true);
        requestRef.current = requestAnimationFrame(animateWave);
      } else {
        setProgress(1);
        setRise(totalRise);
        setDrownLogo(true);
        setTimeout(() => setFadeOut(true), 400);
        setTimeout(() => navigate("/login"), 1100);
      }
    }
    requestRef.current = requestAnimationFrame(animateWave);
    return () => cancelAnimationFrame(requestRef.current);
  }, [navigate]);

  return (
    <div className={`splash-container${fadeOut ? " fade-out" : ""}`}> 
      <img
        src="/floodguard-logo.png.png"
        alt="FloodGuard Logo"
        className={`splash-logo${drownLogo ? " logo-drown" : ""}`}
      />
      <div className="splash-wave">
        <WaveSVG progress={progress} rise={rise} />
      </div>
    </div>
  );
}
