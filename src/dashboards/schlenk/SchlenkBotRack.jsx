import React from 'react';
import GlasswareRender from './GlasswareRender.jsx';
import CardTierOverlay from './CardTierOverlay.jsx';
import { BOT_GLASSWARE } from './serviceGlassware.js';
import { getElementColor } from './elementColors.js';
import { getShape } from './glasswareRegistry.js';
import { ZONES } from './zoneLayout.js';
import { getTierFromStatus } from './tierFromStatus.js';

/**
 * BOTS zone — renders 20 NMR tubes in a row across the bottom of the scene.
 * Each tube is colored by its bot's element compound color.
 *
 * Props:
 *   bots: [{ id, symbol, name, level }] — 20 bots from bot registry
 *   onBotClick: handler
 */
export default function SchlenkBotRack({ bots = [], onBotClick = () => {} }) {
  const zone = ZONES.BOTS;
  const count = Math.max(bots.length, 1);
  const tubeW = Math.min(40, zone.w / count);
  const tubeH = 100;
  const gap = (zone.w - tubeW * count) / (count + 1);

  return (
    <g>
      {bots.map((bot, i) => {
        const x = zone.x + gap + i * (tubeW + gap);
        const y = zone.y + 10;
        const color = getElementColor(bot.symbol || '').color;
        const botShape = getShape(BOT_GLASSWARE);
        const botTier = getTierFromStatus({ stats: bot.stats, zone: 'BOTS', seedId: bot.id || bot.symbol || String(i) });
        return (
          <g
            key={bot.id || bot.symbol || i}
            transform={`translate(${x}, ${y})`}
            onClick={() => onBotClick(bot)}
            style={{ cursor: 'pointer' }}
          >
            <GlasswareRender
              shape={BOT_GLASSWARE}
              width={tubeW}
              height={tubeH}
              fillColor={color}
              fillPercent={bot.level || 40}
              outlineColor="#4FB8D4"
            >
              {/* Element symbol at top of tube */}
              <text
                x={30}
                y={58}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="8"
                fontWeight="bold"
                fill="#fff"
                pointerEvents="none"
              >
                {bot.symbol || '?'}
              </text>
              {/* Bot name below */}
              <text
                x={30}
                y={74}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="5"
                fill="#C0D4DB"
                letterSpacing="0.1em"
                pointerEvents="none"
              >
                {(bot.name || '').slice(0, 8).toUpperCase()}
              </text>
              <CardTierOverlay tier={botTier} shape={botShape} fillColor={color} />
            </GlasswareRender>
          </g>
        );
      })}
    </g>
  );
}
