import { useState, useEffect, useRef, useCallback } from 'react';

const defaultStats = () => ({ level: 0, isBoiling: false, details: [], online: null, stale: false });

// Global stagger counter — each poller instance gets a unique offset
let _staggerIndex = 0;
const STAGGER_MS = 500;

/**
 * Generic service polling hook — replaces 18+ identical useEffect + useState pairs in App.jsx.
 *
 * @param {Object} config
 * @param {string} config.name              Service name for logging (e.g., 'RADARR')
 * @param {string|string[]} config.url      Single URL or array (Promise.allSettled)
 * @param {Function} config.transform       (data) => stats object. Return `_log: { message, level }` for auto-logging.
 * @param {Function} [config.addLog]        The addLog callback from App.jsx
 * @param {number} [config.interval=30000]  Poll interval in ms
 * @param {boolean} [config.skipHidden=true] Skip poll when document tab is hidden
 * @param {Object} [config.fetchOptions]    Extra fetch() options (e.g., { credentials: 'include' })
 * @param {Function} [config.onSuccess]     Side-effect after success: (data, stats) => void
 * @param {Function} [config.onError]       Custom error: (err, prev) => partial stats to merge; if absent, preserves prev online state for 1 failure
 * @param {string} [config.errorMessage]    Custom error log format; receives err.message. Default: 'Offline: {message}'
 * @param {number} [config.failThreshold=2] Consecutive failures before setting online=false
 * @param {number} [config.timeout]         Abort timeout in ms (default: min(interval * 0.8, 25000))
 * @returns {Object} Current stats — { level, isBoiling, online, details, ... }
 */
export default function useServicePoller({
  name,
  url,
  transform,
  addLog,
  interval = 30000,
  skipHidden = true,
  fetchOptions,
  onSuccess,
  onError,
  errorMessage,
  expectJson = true,
  failThreshold = 2,
  timeout: userTimeout,
}) {
  const [stats, setStats] = useState(defaultStats);

  // Store callbacks in refs to avoid effect churn while always calling latest version
  const callbacksRef = useRef({ transform, addLog, onSuccess, onError, fetchOptions, errorMessage, expectJson, name, failThreshold });
  callbacksRef.current = { transform, addLog, onSuccess, onError, fetchOptions, errorMessage, expectJson, name, failThreshold };

  // Track consecutive failures
  const failCountRef = useRef(0);

  // Stagger offset — assigned once per hook instance
  const staggerRef = useRef((_staggerIndex++) * STAGGER_MS);

  // Compute abort timeout
  const abortTimeout = userTimeout ?? Math.min(interval * 0.8, 25000);

  // Stable URL key for dep array (stringified for arrays)
  const urlKey = Array.isArray(url) ? JSON.stringify(url) : url;

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (skipHidden && document.hidden) return;
      const { transform: xform, addLog: log, onSuccess: onOk, onError: onErr, fetchOptions: opts, errorMessage: errMsg, expectJson: json, name: svcName, failThreshold: threshold } = callbacksRef.current;

      // Abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), abortTimeout);

      try {
        let data;
        const fetchOpts = { ...opts, signal: controller.signal };

        if (Array.isArray(url)) {
          // Multi-URL: Promise.allSettled for partial success handling
          const results = await Promise.allSettled(
            url.map(u => fetch(u, fetchOpts))
          );
          data = await Promise.all(
            results.map(async (r) => {
              if (r.status === 'fulfilled' && r.value.ok) return r.value.json();
              return {};
            })
          );
        } else {
          const res = await fetch(url, fetchOpts);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = json ? await res.json() : { _status: res.status, _ok: true };
        }

        if (cancelled) return;
        clearTimeout(timeoutId);

        // Reset fail count on success
        failCountRef.current = 0;

        const result = xform(data);
        const newStats = { online: true, ...result };
        setStats(newStats);

        // Auto-log if transform returned _log
        if (log && result._log) {
          log(svcName, result._log.message, result._log.level || 'success');
        }

        if (onOk) onOk(data, newStats);
      } catch (err) {
        if (cancelled) return;
        clearTimeout(timeoutId);

        failCountRef.current += 1;
        const consecutiveFails = failCountRef.current;

        if (onErr) {
          // Custom error handler — always called
          setStats(prev => ({ ...prev, ...onErr(err, prev) }));
        } else if (consecutiveFails >= threshold) {
          // Default: only go offline after N consecutive failures
          setStats({ level: 0, isBoiling: false, online: false, details: [] });
        }
        // else: keep previous stats (grace period)

        // Only log on first failure (avoid log spam)
        if (log && consecutiveFails === 1) {
          const msg = errMsg
            ? errMsg.replace('{message}', err.message)
            : `Offline: ${err.message}`;
          log(svcName, msg, 'error');
        }
      }
    };

    // Staggered initial poll to avoid thundering herd
    const staggerTimeout = setTimeout(poll, staggerRef.current);
    const t = setInterval(poll, interval);
    return () => {
      cancelled = true;
      clearTimeout(staggerTimeout);
      clearInterval(t);
    };
  }, [urlKey, interval, skipHidden, abortTimeout]);

  return stats;
}
