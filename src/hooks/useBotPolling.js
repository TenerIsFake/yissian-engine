import { useState, useEffect, useRef } from 'react';

const BOT_POLL_MS = 60_000;
const BOT_STAGGER_MS = 2_000;
const BOT_FAIL_THRESHOLD = 2;
const BOT_FETCH_TIMEOUT = 15_000;

export default function useBotPolling(botRegistry, addLog) {
  const [botResults, setBotResults] = useState(
    () => Object.fromEntries(botRegistry.map(b => [b.id, null]))
  );
  const [selectedBot, setSelectedBot] = useState(null);
  const botIntervals = useRef([]);

  // Store latest addLog in ref to avoid stale closure
  const addLogRef = useRef(addLog);
  addLogRef.current = addLog;

  // Store botRegistry in ref — stable across renders
  const registryRef = useRef(botRegistry);
  registryRef.current = botRegistry;

  // Track consecutive failures per bot
  const failCountsRef = useRef({});

  // ── Bot polling (staggered 2s per bot) ──
  useEffect(() => {
    const intervals = botIntervals.current;
    const fetchBot = async (bot, idx) => {
      await new Promise(r => setTimeout(r, idx * BOT_STAGGER_MS));
      const poll = async () => {
        if (document.hidden) return;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), BOT_FETCH_TIMEOUT);
        try {
          const res = await fetch(`/api/media-bot/bots/${bot.id}/recommend`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`${res.status}`);
          const data = await res.json();
          failCountsRef.current[bot.id] = 0;
          setBotResults(prev => ({ ...prev, [bot.id]: data }));
        } catch {
          clearTimeout(timeoutId);
          const fails = (failCountsRef.current[bot.id] || 0) + 1;
          failCountsRef.current[bot.id] = fails;
          if (fails >= BOT_FAIL_THRESHOLD) {
            setBotResults(prev => ({ ...prev, [bot.id]: { ...(prev[bot.id] ?? {}), online: false } }));
          }
          // else: keep previous state (grace period)
        }
      };
      poll();
      intervals.push(setInterval(poll, BOT_POLL_MS));
    };
    registryRef.current.forEach(fetchBot);
    return () => intervals.forEach(clearInterval);
  }, []);

  // ── Bot status summary log (debounced) ──
  const botLogTimer = useRef(null);
  useEffect(() => {
    const registry = registryRef.current;
    const allReported = registry.every(b => botResults[b.id] !== null);
    if (!allReported) return;
    clearTimeout(botLogTimer.current);
    botLogTimer.current = setTimeout(() => {
      const online = registry.filter(b => botResults[b.id]?.online !== false).length;
      const total = registry.length;
      const type = online === total ? 'success' : online >= total / 2 ? 'warn' : 'error';
      addLogRef.current?.('BOTS', `${online}/${total} Online`, type);
    }, 5000);
    return () => clearTimeout(botLogTimer.current);
  }, [botResults]);

  return { botResults, selectedBot, setSelectedBot };
}
