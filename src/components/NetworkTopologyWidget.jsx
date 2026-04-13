import React, { useRef, useEffect, useCallback } from 'react';
import { TOPOLOGY_NODES, TOPOLOGY_EDGES, EDGE_COLORS, SERVER_LABELS } from '../data/serviceTopology.js';

const MONO = 'monospace';

// Map service health to node colors
function nodeColor(stats) {
  if (!stats || !stats.online) return 'rgba(107,114,128,0.6)';  // gray — offline/no data
  if (stats.level >= 95) return '#ef4444';   // red — critical
  if (stats.level >= 80) return '#f59e0b';   // amber — warning
  return '#4ade80';                           // green — healthy
}

function nodeGlow(stats) {
  if (!stats || !stats.online) return null;
  if (stats.level >= 95) return 'rgba(239,68,68,0.4)';
  return null;
}

export default function NetworkTopologyWidget({ statsMap = {}, onNodeClick }) {
  const canvasRef = useRef(null);
  const hoveredRef = useRef(null);
  const frameRef = useRef(null);
  const pulseRef = useRef(0);

  // Scale factor: canvas uses fixed coordinates, we scale to fill container
  const CANVAS_W = 540;
  const CANVAS_H = 400;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const scaleX = rect.width / CANVAS_W;
    const scaleY = rect.height / CANVAS_H;
    const sx = (x) => x * scaleX;
    const sy = (y) => y * scaleY;

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Background clusters
    const drawCluster = (label, x1, y1, x2, y2) => {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(sx(x1), sy(y1), sx(x2 - x1), sy(y2 - y1), 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = `9px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(label, sx((x1 + x2) / 2), sy(y1) + 14);
    };

    drawCluster(SERVER_LABELS.srv1, 5, 30, 310, 390);
    drawCluster(SERVER_LABELS.srv2, 390, 30, 535, 340);

    // Edges
    const nodeMap = {};
    for (const n of TOPOLOGY_NODES) nodeMap[n.id] = n;

    const hovered = hoveredRef.current;

    for (const edge of TOPOLOGY_EDGES) {
      const from = nodeMap[edge.from];
      const to = nodeMap[edge.to];
      if (!from || !to) continue;

      const isHighlighted = hovered && (hovered === edge.from || hovered === edge.to);
      const color = EDGE_COLORS[edge.type] || '#666';

      ctx.beginPath();
      ctx.strokeStyle = isHighlighted ? color : color.replace(')', ',0.25)').replace('rgb', 'rgba');
      ctx.lineWidth = isHighlighted ? 2 : 1;

      // Curved edge for cross-server, straight for same-server
      if (from.server !== to.server) {
        const mx = sx((from.x + to.x) / 2);
        const my = sy(Math.min(from.y, to.y) - 20);
        ctx.moveTo(sx(from.x), sy(from.y));
        ctx.quadraticCurveTo(mx, my, sx(to.x), sy(to.y));
      } else {
        ctx.moveTo(sx(from.x), sy(from.y));
        ctx.lineTo(sx(to.x), sy(to.y));
      }
      ctx.stroke();
    }

    // Nodes
    const pulse = Math.sin(pulseRef.current) * 0.3 + 0.7;

    for (const node of TOPOLOGY_NODES) {
      const stats = statsMap[node.id];
      const color = nodeColor(stats);
      const glow = nodeGlow(stats);
      const isHovered = hovered === node.id;
      const r = isHovered ? 10 : 7;

      // Glow for unhealthy
      if (glow) {
        ctx.beginPath();
        ctx.arc(sx(node.x), sy(node.y), r + 6, 0, Math.PI * 2);
        ctx.fillStyle = glow.replace(/[\d.]+\)$/, `${pulse * 0.4})`);
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(sx(node.x), sy(node.y), r, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? color : color.replace(')', ',0.8)').replace('rgb', 'rgba').replace('#', '');
      ctx.fillStyle = color;
      ctx.globalAlpha = isHovered ? 1 : 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)';
      ctx.font = `${isHovered ? 8 : 7}px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, sx(node.x), sy(node.y) + r + 10);
    }

    // Edge legend
    const legendY = rect.height - 14;
    ctx.font = `7px ${MONO}`;
    ctx.textAlign = 'left';
    const legends = [
      { label: 'NETWORK', color: EDGE_COLORS.network },
      { label: 'API', color: EDGE_COLORS.api },
      { label: 'DOWNLOAD', color: EDGE_COLORS.download },
    ];
    let lx = 8;
    for (const l of legends) {
      ctx.fillStyle = l.color;
      ctx.fillRect(lx, legendY - 4, 8, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(l.label, lx + 11, legendY);
      lx += ctx.measureText(l.label).width + 22;
    }

    pulseRef.current += 0.05;
    frameRef.current = requestAnimationFrame(draw);
  }, [statsMap]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [draw]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * CANVAS_W;
    const my = (e.clientY - rect.top) / rect.height * CANVAS_H;

    let found = null;
    for (const node of TOPOLOGY_NODES) {
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy < 225) { found = node.id; break; }
    }
    hoveredRef.current = found;
    canvas.style.cursor = found ? 'pointer' : 'default';
  }, []);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !onNodeClick) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * CANVAS_W;
    const my = (e.clientY - rect.top) / rect.height * CANVAS_H;

    for (const node of TOPOLOGY_NODES) {
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy < 225) { onNodeClick(node.id); break; }
    }
  }, [onNodeClick]);

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
        ◆ NETWORK TOPOLOGY ◆
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 360, borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
    </div>
  );
}
