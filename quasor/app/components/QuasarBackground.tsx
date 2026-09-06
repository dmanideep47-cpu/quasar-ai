"use client";

import { useEffect, useRef } from "react";

type Particle = {
  armAngle: number;
  radius: number;
  orbitSpeed: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: { r: number; g: number; b: number };
  trail: { x: number; y: number }[];
};

type AmbientStar = {
  angle: number;
  radius: number;
  orbitSpeed: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: { r: number; g: number; b: number };
  trail: { x: number; y: number }[];
};

const PALETTE = [
  { r: 255, g: 255, b: 255 }, // Core White
  { r: 180, g: 225, b: 255 }, // High-energy Cyan
  { r: 160, g: 120, b: 255 }, // Violet Plasma
  { r: 255, g: 180, b: 220 }, // Cosmic Pink
  { r: 255, g: 215, b: 130 }, // Accretion Gold
];

type AnimationState = "idle" | "collapsing" | "collapsed";
type Props = { animationState?: AnimationState };

export default function AstraQuasarBackground({ animationState = "idle" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frameId = 0;
    let time = 0;

    const pointer = { x: -1000, y: -1000, active: false };
    const core = { x: 0, y: 0 };
    const particles: Particle[] = [];
    const ambientStars: AmbientStar[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      core.x = width / 2;
      core.y = height / 2;
    };

    const initParticles = () => {
      particles.length = 0;
      ambientStars.length = 0;

      const isMobile = width < 700;
      const spiralCount = isMobile ? 1400 : 3000;
      const starCount = isMobile ? 700 : 1600;
      const armCount = 2;

      const maxCanvasRadius = Math.hypot(width, height) * 0.65;

      // 1. DYNAMIC AMBIENT STARS & CLUSTERS
      for (let i = 0; i < starCount; i++) {
        const radius = Math.pow(Math.random(), 0.8) * maxCanvasRadius;
        ambientStars.push({
          angle: Math.random() * Math.PI * 2,
          radius,
          orbitSpeed: (0.00012 + (1 - radius / maxCanvasRadius) * 0.00035) * (Math.random() > 0.5 ? 1 : 1.05),
          size: Math.random() < 0.88 ? 0.4 + Math.random() * 1.0 : 1.4 + Math.random() * 1.6,
          baseAlpha: 0.15 + Math.random() * 0.7,
          twinkleSpeed: 0.008 + Math.random() * 0.025,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          trail: [],
        });
      }

      // 2. MAIN ACCRETION SPIRAL PARTICLES
      for (let i = 0; i < spiralCount; i++) {
        const arm = i % armCount;
        const armOffset = (arm * Math.PI * 2) / armCount;

        const maxRadius = Math.min(width, height) * 0.5;
        const norm = Math.pow(Math.random(), 1.8);
        const radius = 8 + norm * maxRadius;

        const spiralAngle = armOffset + (radius / maxRadius) * Math.PI * 3.8;
        const spread = (Math.random() - 0.5) * (0.3 + radius * 0.0018);
        const finalAngle = spiralAngle + spread;

        const isCoreParticle = radius < maxRadius * 0.22;
        const color = isCoreParticle
          ? PALETTE[Math.floor(Math.random() * PALETTE.length)]
          : PALETTE[Math.floor(Math.random() * 4)];

        particles.push({
          armAngle: finalAngle,
          radius,
          orbitSpeed: (0.0005 + (1 - radius / maxRadius) * 0.0014) * (Math.random() > 0.5 ? 1 : 1.05),
          size: Math.random() < 0.85 ? 0.4 + Math.random() * 1.3 : 1.8 + Math.random() * 1.8,
          baseAlpha: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.01 + Math.random() * 0.035,
          twinkleOffset: Math.random() * Math.PI * 2,
          color,
          trail: [],
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Deep space background fill
      ctx.fillStyle = "#010206";
      ctx.fillRect(0, 0, width, height);

      // 1. NEBULA COSMIC CLOUDS
      const neb1 = ctx.createRadialGradient(core.x - 120, core.y - 80, 20, core.x, core.y, width * 0.5);
      neb1.addColorStop(0, "rgba(80, 40, 160, 0.08)");
      neb1.addColorStop(0.5, "rgba(20, 50, 120, 0.04)");
      neb1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // 2. RENDER AMBIENT MOVING STARS
      for (let i = 0; i < ambientStars.length; i++) {
        const star = ambientStars[i];
        star.angle += star.orbitSpeed;

        let sx = core.x + Math.cos(star.angle) * star.radius;
        let sy = core.y + Math.sin(star.angle) * (star.radius * 0.82);

        // Magnetic cursor attraction force
        if (pointer.active) {
          const dx = pointer.x - sx;
          const dy = pointer.y - sy;
          const dist = Math.hypot(dx, dy);
          const maxDist = 200;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 22;
            sx += (dx / dist) * force;
            sy += (dy / dist) * force;

            star.trail.push({ x: sx, y: sy });
            if (star.trail.length > 6) star.trail.shift();
          } else if (star.trail.length > 0) {
            star.trail.shift();
          }
        } else if (star.trail.length > 0) {
          star.trail.shift();
        }

        // Draw motion trails
        if (star.trail.length > 1) {
          ctx.beginPath();
          star.trail.forEach((pt, index) => {
            if (index === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.strokeStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0.3)`;
          ctx.lineWidth = star.size * 0.8;
          ctx.stroke();
        }

        const alphaPulse = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(0.95, star.baseAlpha + alphaPulse));

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${currentAlpha})`;
        ctx.fill();
      }

      // 3. QUASAR ENERGY JETS
      const maxBeamLength = Math.max(width, height) * 0.85;
      ctx.save();
      ctx.translate(core.x, core.y);
      ctx.globalCompositeOperation = "screen";

      const renderJet = (angleOffset: number) => {
        const angle = angleOffset + Math.sin(time * 0.0015) * 0.025;

        const jetGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * maxBeamLength, Math.sin(angle) * maxBeamLength);
        jetGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        jetGrad.addColorStop(0.15, "rgba(180, 225, 255, 0.65)");
        jetGrad.addColorStop(0.4, "rgba(140, 80, 255, 0.22)");
        jetGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle - 0.04) * maxBeamLength, Math.sin(angle - 0.04) * maxBeamLength);
        ctx.lineTo(Math.cos(angle + 0.04) * maxBeamLength, Math.sin(angle + 0.04) * maxBeamLength);
        ctx.closePath();
        ctx.fillStyle = jetGrad;
        ctx.fill();
      };

      renderJet(-Math.PI / 2 - 0.12);
      renderJet(Math.PI / 2 - 0.12);

      ctx.restore();

      // 4. ROTATING SPIRAL PARTICLES
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.armAngle += p.orbitSpeed;

        let px = core.x + Math.cos(p.armAngle) * p.radius;
        let py = core.y + Math.sin(p.armAngle) * (p.radius * 0.58);

        if (pointer.active) {
          const dx = pointer.x - px;
          const dy = pointer.y - py;
          const dist = Math.hypot(dx, dy);
          const maxDist = 200;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 22;
            px += (dx / dist) * force;
            py += (dy / dist) * force;

            p.trail.push({ x: px, y: py });
            if (p.trail.length > 6) p.trail.shift();
          } else if (p.trail.length > 0) {
            p.trail.shift();
          }
        } else if (p.trail.length > 0) {
          p.trail.shift();
        }

        if (p.trail.length > 1) {
          ctx.beginPath();
          p.trail.forEach((pt, index) => {
            if (index === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.3)`;
          ctx.lineWidth = p.size;
          ctx.stroke();
        }

        const alphaPulse = Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.25;
        const currentAlpha = Math.max(0.12, Math.min(1, p.baseAlpha + alphaPulse));

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;

        if (p.size > 1.8) {
          ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.85)`;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // 5. CENTRAL CORE SINGULARITY
      ctx.beginPath();
      ctx.arc(core.x, core.y, 7 + Math.sin(time * 0.035) * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#a0d8ff";
      ctx.shadowBlur = 36;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 6. VIGNETTE OVERLAY
      const vignette = ctx.createRadialGradient(
        core.x,
        core.y,
        Math.min(width, height) * 0.32,
        core.x,
        core.y,
        Math.max(width, height) * 0.78
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(1, 2, 6, 0.75)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      frameId = requestAnimationFrame(render);
    };

    resize();
    initParticles();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div className={`quasar-background-shell galaxy-${animationState}`}>
      <canvas
        ref={canvasRef}
        className="quasar-background"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}