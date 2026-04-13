import React, { useRef, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────
// AnimatedBackground — full-page canvas particle engine for NH-42
//
// Renders behind all dashboard content at z-index 0.
// Supports 8 particle behaviors, FPS monitoring, auto-downgrade,
// prefersReducedMotion, and document.hidden pause.
//
// Particles with `count` maintain a target population (any behavior).
// Particles with `spawnRate` spawn probabilistically per frame.
// ─────────────────────────────────────────────────────────────────

const MAX_PARTICLES = 1000;
const FPS_FLOOR = 20;
const FPS_CHECK_INTERVAL = 1000;
const DOWNGRADE_THRESHOLD_MS = 15000;
const UPGRADE_THRESHOLD_MS = 8000;  // recover tier after sustained good FPS
const FPS_RECOVER = 28;             // FPS above this triggers recovery
const STARTUP_GRACE_MS = 12000;     // skip FPS checks during initial load
const FADE_IN_FRAMES = 20; // frames for new particles to fade in

// ── Helpers ────────────────────────────────────────────────────

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/** Parse "rgba(r,g,b,a)" or hex to {r,g,b} for gradient use */
function parseColor(color) {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const n = hex.length === 3
      ? parseInt(hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2], 16)
      : parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const m = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : { r: 255, g: 255, b: 255 };
}

// ── Particle creation ──────────────────────────────────────────

function createParticle(pType, w, h, accent) {
  const color = pType.color === 'accent' ? accent : pType.color;
  const size = Array.isArray(pType.size) ? rand(pType.size[0], pType.size[1]) : (pType.size || 2);
  const speed = Array.isArray(pType.speed) ? rand(pType.speed[0], pType.speed[1]) : (pType.speed || 1);
  const lifetime = pType.lifetime === Infinity ? Infinity
    : Array.isArray(pType.lifetime) ? randInt(pType.lifetime[0], pType.lifetime[1])
    : (pType.lifetime || 120);
  const opacity = Array.isArray(pType.opacity) ? rand(pType.opacity[0], pType.opacity[1]) : (pType.opacity || 1);

  // Depth layer (0 = far/slow/dim, 1 = near/bright)
  const depth = pType.depth != null ? pType.depth : rand(0.3, 1.0);

  const p = {
    id: pType.id,
    behavior: pType.behavior,
    render: pType.render || 'dot',
    color,
    _rgb: parseColor(color),
    size: size * (0.6 + depth * 0.4), // far particles are smaller
    baseSize: size,
    speed,
    life: lifetime,
    maxLife: lifetime,
    opacity,
    targetOpacity: opacity,
    fadeIn: FADE_IN_FRAMES,
    depth,
    x: 0, y: 0,
    vx: 0, vy: 0,
    angle: 0,
    trailLength: pType.trailLength || 0,
    trail: [],
    glowRadius: pType.glowRadius || 0,
    tumble: pType.tumble || false,
    tumbleAngle: 0,
    tumbleSpeed: Array.isArray(pType.tumbleSpeed) ? rand(pType.tumbleSpeed[0], pType.tumbleSpeed[1]) : 0,
    twinkleSpeed: Array.isArray(pType.twinkleSpeed) ? rand(pType.twinkleSpeed[0], pType.twinkleSpeed[1]) : 0.02,
    twinklePhase: Math.random() * Math.PI * 2,
    driftAmplitude: pType.driftAmplitude || 30,
    driftFreq: pType.driftFreq || 0.02,
    driftPhase: Math.random() * Math.PI * 2,
    orbitRadius: Array.isArray(pType.orbitRadius) ? rand(pType.orbitRadius[0], pType.orbitRadius[1]) : 50,
    orbitSpeed: pType.orbitSpeed || 0.01,
    orbitCenterX: 0, orbitCenterY: 0,
    waveAmplitude: pType.waveAmplitude || 20,
    waveFreq: pType.waveFreq || 0.05,
    age: 0,
  };

  // Position + velocity based on behavior
  switch (pType.behavior) {
    case 'twinkle':
      p.x = rand(0, w);
      p.y = rand(0, h);
      break;
    case 'linear': {
      const angleDeg = Array.isArray(pType.angle) ? rand(pType.angle[0], pType.angle[1]) : (pType.angle || 225);
      const rad = (angleDeg * Math.PI) / 180;
      p.vx = Math.cos(rad) * speed * (0.5 + depth * 0.5);
      p.vy = Math.sin(rad) * speed * (0.5 + depth * 0.5);
      if (p.vx < 0) p.x = w + 20; else if (p.vx > 0) p.x = -20; else p.x = rand(0, w);
      if (p.vy < 0) p.y = h + 20; else if (p.vy > 0) p.y = -20; else p.y = rand(0, h);
      if (Math.abs(p.vy) > Math.abs(p.vx) && p.vy > 0) { p.y = -20; p.x = rand(0, w); }
      break;
    }
    case 'rise':
      p.x = rand(0, w);
      p.y = rand(0, h);          // scatter across full height for even distribution
      p.vy = -speed * (0.5 + depth * 0.5);
      p.vx = rand(-0.3, 0.3);
      break;
    case 'fall':
      p.x = rand(0, w);
      p.y = rand(0, h);          // scatter across full height for even distribution
      p.vy = speed * (0.5 + depth * 0.5);
      p.vx = rand(-0.5, 0.5) * (pType.wind || 0);
      break;
    case 'drift':
      p.x = pType.direction === 'right' ? -50 : (pType.direction === 'left' ? w + 50 : rand(0, w));
      p.y = rand(h * 0.1, h * 0.9);
      p.vx = pType.direction === 'left' ? -speed * (0.3 + depth * 0.7) : speed * (0.3 + depth * 0.7);
      p.vy = 0;
      break;
    case 'flash':
      p.x = rand(w * 0.05, w * 0.95);
      p.y = rand(h * 0.05, h * 0.95);
      break;
    case 'orbit':
      p.orbitCenterX = rand(w * 0.2, w * 0.8);
      p.orbitCenterY = rand(h * 0.2, h * 0.8);
      p.angle = Math.random() * Math.PI * 2;
      p.orbitSpeed *= (0.5 + depth * 0.5);
      p.x = p.orbitCenterX + Math.cos(p.angle) * p.orbitRadius;
      p.y = p.orbitCenterY + Math.sin(p.angle) * p.orbitRadius;
      break;
    case 'wave':
      p.x = -50;
      p.y = rand(h * 0.2, h * 0.8);
      p.vx = speed * (0.5 + depth * 0.5);
      break;
    case 'curve': {
      const cAngle = Array.isArray(pType.angle) ? rand(pType.angle[0], pType.angle[1]) : 225;
      const cRad = (cAngle * Math.PI) / 180;
      p.vx = Math.cos(cRad) * speed * (0.5 + depth * 0.5);
      p.vy = Math.sin(cRad) * speed * (0.5 + depth * 0.5);
      p.x = p.vx < 0 ? w + 30 : -30;
      p.y = rand(h * 0.1, h * 0.9);
      p.curveFactor = rand(-0.002, 0.002);
      break;
    }
    default:
      p.x = rand(0, w);
      p.y = rand(0, h);
  }

  // Store pType reference for cascade spawning
  p._pType = pType;

  return p;
}

/** Spawn 1-3 child particles — biased toward canvas center to prevent edge clustering */
function spawnCascadeChildren(parent, w, h, accent, particles, maxP) {
  const count = randInt(1, 3);
  for (let c = 0; c < count && particles.length < maxP; c++) {
    const child = createParticle(parent._pType, w, h, accent);
    // Blend parent position 40% toward canvas center to redistribute density
    const cx = w / 2, cy = h / 2;
    child.x = parent.x * 0.6 + cx * 0.4 + rand(-30, 30);
    child.y = parent.y * 0.6 + cy * 0.4 + rand(-30, 30);
    // Clamp to canvas bounds
    child.x = Math.max(0, Math.min(w, child.x));
    child.y = Math.max(0, Math.min(h, child.y));
    // Children are smaller and shorter-lived to prevent explosion
    child.size *= 0.65;
    child.baseSize *= 0.65;
    if (child.life !== Infinity) child.life = Math.floor(child.life * 0.5);
    if (child.maxLife !== Infinity) child.maxLife = Math.floor(child.maxLife * 0.5);
    // Children don't cascade (prevents infinite chains)
    child._cascade = false;
    particles.push(child);
  }
}

// ── Particle update ────────────────────────────────────────────

function updateParticle(p) {
  p.age++;
  if (p.life !== Infinity) p.life--;
  if (p.fadeIn > 0) p.fadeIn--;

  // Fade-in multiplier
  const fadeInMul = p.fadeIn > 0 ? 1 - (p.fadeIn / FADE_IN_FRAMES) : 1;

  switch (p.behavior) {
    case 'twinkle':
      p.opacity = p.targetOpacity * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(p.twinklePhase + p.age * p.twinkleSpeed))) * fadeInMul;
      break;
    case 'linear':
      if (p.trailLength > 0) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailLength) p.trail.shift();
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.tumble) p.tumbleAngle += p.tumbleSpeed;
      p.opacity = p.targetOpacity * fadeInMul;
      break;
    case 'rise':
      p.x += p.vx + Math.sin(p.driftPhase + p.age * p.driftFreq) * 0.3;
      p.y += p.vy;
      // Fade out as it rises (lifecycle fade)
      p.opacity = p.targetOpacity * Math.max(0, 1 - p.age / (p.maxLife * 0.8)) * fadeInMul;
      break;
    case 'fall':
      p.x += p.vx + Math.sin(p.driftPhase + p.age * p.driftFreq) * 0.2;
      p.y += p.vy;
      p.opacity = p.targetOpacity * fadeInMul;
      break;
    case 'drift':
      p.x += p.vx;
      p.y += Math.sin(p.driftPhase + p.age * p.driftFreq) * 0.5;
      p.opacity = p.targetOpacity * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(p.age * 0.008))) * fadeInMul;
      break;
    case 'flash': {
      const progress = p.age / p.maxLife;
      // Smooth ease-in-out flash
      const flash = progress < 0.3
        ? (progress / 0.3) * (progress / 0.3)  // ease-in
        : 1 - ((progress - 0.3) / 0.7) * ((progress - 0.3) / 0.7);  // ease-out
      p.opacity = p.targetOpacity * Math.max(0, flash);
      p.size = p.baseSize * (0.8 + progress * 0.4);
      break;
    }
    case 'orbit':
      p.angle += p.orbitSpeed;
      p.x = p.orbitCenterX + Math.cos(p.angle) * p.orbitRadius;
      p.y = p.orbitCenterY + Math.sin(p.angle) * p.orbitRadius;
      p.opacity = p.targetOpacity * fadeInMul;
      break;
    case 'wave':
      p.x += p.vx;
      p.y += Math.sin(p.age * p.waveFreq) * p.waveAmplitude * 0.02;
      p.opacity = p.targetOpacity * fadeInMul;
      break;
    case 'curve':
      if (p.trailLength > 0) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailLength) p.trail.shift();
      }
      p.vy += p.curveFactor;
      p.x += p.vx;
      p.y += p.vy;
      p.opacity = p.targetOpacity * fadeInMul;
      break;
  }
}

function isOffScreen(p, w, h, margin = 60) {
  return p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin;
}

// ── Particle rendering ─────────────────────────────────────────

function drawParticle(ctx, p) {
  const alpha = Math.max(0, Math.min(1, p.opacity * (0.5 + p.depth * 0.5)));
  if (alpha < 0.005) return; // skip invisible

  ctx.globalAlpha = alpha;

  switch (p.render) {
    case 'dot': {
      // Soft dot with radial gradient for polish
      const r = p.size;
      if (r > 1.5) {
        const { r: cr, g: cg, b: cb } = p._rgb;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},1)`);
        grad.addColorStop(0.6, `rgba(${cr},${cg},${cb},0.4)`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'trail': {
      // Smooth gradient trail
      if (p.trail.length > 1) {
        const { r: cr, g: cg, b: cb } = p._rgb;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < p.trail.length; i++) {
          const t = i / p.trail.length;
          ctx.globalAlpha = alpha * t * 0.6;
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${t})`;
          ctx.lineWidth = p.size * t;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.stroke();
        }
      }
      // Bright head
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      // Colored halo around head
      ctx.globalAlpha = alpha * 0.4;
      const { r: hr, g: hg, b: hb } = p._rgb;
      const headGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      headGrad.addColorStop(0, `rgba(${hr},${hg},${hb},0.6)`);
      headGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'glow': {
      const { r: gr, g: gg, b: gb } = p._rgb;
      const glowR = p.glowRadius || p.size * 4;
      // Outer glow halo
      ctx.globalAlpha = alpha * 0.2;
      const outerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR * 1.5);
      outerGrad.addColorStop(0, `rgba(${gr},${gg},${gb},0.3)`);
      outerGrad.addColorStop(0.4, `rgba(${gr},${gg},${gb},0.1)`);
      outerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR * 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Inner glow
      ctx.globalAlpha = alpha * 0.5;
      const innerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR * 0.6);
      innerGrad.addColorStop(0, `rgba(${gr},${gg},${gb},0.8)`);
      innerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR * 0.6, 0, Math.PI * 2);
      ctx.fill();
      // Bright core
      ctx.globalAlpha = alpha * 0.9;
      ctx.fillStyle = `rgba(255,255,255,0.9)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'line':
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size * 0.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
      ctx.stroke();
      break;

    case 'shape':
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.tumble) ctx.rotate(p.tumbleAngle);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        const r = p.size * (0.7 + Math.sin(i * 2.5) * 0.3);
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;

    default:
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.globalAlpha = 1;
}

// ── Component ──────────────────────────────────────────────────

const AnimatedBackground = React.memo(function AnimatedBackground({ sceneConfig, tier, accent, liteMode }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    permanentSpawned: false,
    frameId: 0,
    fps: { frames: 0, lastCheck: 0, current: 60, lowSince: 0, highSince: 0, startTime: 0 },
    effectiveTier: tier,
    baseTier: tier,
    paused: false,
    // Track count-based particle populations by id
    countTracking: {},
  });

  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Lite mode ref for animation loop access
  const liteModeRef = useRef(liteMode);
  liteModeRef.current = liteMode;

  // Don't render for T1/T2, reduced motion, or no scene
  const shouldAnimate = sceneConfig && tier >= 3 && !prefersReduced.current;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dprCap = liteModeRef.current ? 1.5 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const state = stateRef.current;
    state.particles = [];
    state.permanentSpawned = false;
    state.effectiveTier = tier;
    state.baseTier = tier;
    state.fps = { frames: 0, lastCheck: 0, current: 60, lowSince: 0, highSince: 0, startTime: 0 };
    state.countTracking = {};

    const onVisibilityChange = () => {
      state.paused = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const tick = (timestamp) => {
      if (state.paused) {
        state.frameId = requestAnimationFrame(tick);
        return;
      }

      const { fps } = state;
      const maxParticles = liteModeRef.current ? 800 : MAX_PARTICLES;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Record start time on first frame
      if (!fps.startTime) fps.startTime = timestamp;

      // FPS tracking
      fps.frames++;
      if (timestamp - fps.lastCheck >= FPS_CHECK_INTERVAL) {
        fps.current = fps.frames;
        fps.frames = 0;
        fps.lastCheck = timestamp;

        // Skip FPS checks during startup grace period (initial load is always heavy)
        if (timestamp - fps.startTime > STARTUP_GRACE_MS) {
          if (fps.current < FPS_FLOOR) {
            fps.highSince = 0;
            if (!fps.lowSince) fps.lowSince = timestamp;
            else if (timestamp - fps.lowSince > DOWNGRADE_THRESHOLD_MS && state.effectiveTier > 3) {
              state.effectiveTier--;
              fps.lowSince = 0;
            }
          } else {
            fps.lowSince = 0;
            // Recovery: if FPS is good and we were downgraded, upgrade back
            if (fps.current >= FPS_RECOVER && state.effectiveTier < state.baseTier) {
              if (!fps.highSince) fps.highSince = timestamp;
              else if (timestamp - fps.highSince > UPGRADE_THRESHOLD_MS) {
                state.effectiveTier++;
                fps.highSince = 0;
              }
            } else {
              fps.highSince = 0;
            }
          }
        }
      }

      const eTier = state.effectiveTier;
      const tierIdx = eTier - 1;

      // Clear with slight persistence for subtle motion blur
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);

      if (sceneConfig.particles) {
        for (const pType of sceneConfig.particles) {
          const pId = pType.id || pType.behavior;

          if (pType.count) {
            // COUNT-BASED: maintain target population
            const targetCount = pType.count[tierIdx] || 0;
            if (!state.countTracking[pId]) state.countTracking[pId] = 0;

            // Count current living particles of this type
            let current = 0;
            for (const p of state.particles) {
              if (p.id === pId) current++;
            }
            state.countTracking[pId] = current;

            // Spawn to maintain target (stagger: max 3 per frame to avoid bursts)
            const deficit = targetCount - current;
            const spawnThisFrame = Math.min(deficit, 3);
            for (let i = 0; i < spawnThisFrame && state.particles.length < maxParticles; i++) {
              state.particles.push(createParticle(pType, w, h, accent));
            }
          } else if (pType.spawnRate) {
            // RATE-BASED: probabilistic spawn
            const rate = pType.spawnRate[tierIdx] || 0;
            if (rate > 0 && Math.random() < rate && state.particles.length < maxParticles) {
              state.particles.push(createParticle(pType, w, h, accent));
            }
          }
        }
      }

      // Use additive blending for glow particles
      ctx.globalCompositeOperation = 'screen';

      // Update + draw (back-to-front by depth for proper layering)
      // Sort periodically (every 60 frames) to avoid per-frame cost
      if (state.particles.length > 0 && fps.frames % 60 === 0) {
        state.particles.sort((a, b) => a.depth - b.depth);
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        updateParticle(p);

        if (p.life <= 0 || (p.life !== Infinity && isOffScreen(p, w, h))) {
          // Cascade: dying particle spawns children (only on natural death, not offscreen)
          if (p.life <= 0 && p._cascade !== false && p._pType?.cascade) {
            spawnCascadeChildren(p, w, h, accent, state.particles, maxParticles);
          }
          state.particles.splice(i, 1);
          continue;
        }

        if (p.life === Infinity && isOffScreen(p, w, h, 200)) {
          state.particles.splice(i, 1);
          continue;
        }

        // Use screen blend for glow/trail, normal for everything else
        if (p.render === 'glow' || p.render === 'trail') {
          ctx.globalCompositeOperation = 'screen';
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }

        drawParticle(ctx, p);
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      state.frameId = requestAnimationFrame(tick);
    };

    state.frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(state.frameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      state.particles = [];
    };
  }, [shouldAnimate, sceneConfig, tier, accent, resizeCanvas]);

  // Trim excess particles and re-scale canvas when lite mode toggles
  useEffect(() => {
    if (!shouldAnimate) return;
    const state = stateRef.current;
    const cap = liteMode ? 200 : MAX_PARTICLES;
    if (state.particles.length > cap) {
      state.particles.length = cap;
    }
    resizeCanvas();
  }, [liteMode, shouldAnimate, resizeCanvas]);

  if (!shouldAnimate) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
});

export default AnimatedBackground;
