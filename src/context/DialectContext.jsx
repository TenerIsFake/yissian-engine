import React, { createContext, useContext, useState, useCallback } from 'react';
import { translateToDialect } from '../utils/dialectEngine.js';

const DialectContext = createContext(null);

export function DialectProvider({ children }) {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem('hc-dialect') === '1'
  );

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem('hc-dialect', next ? '1' : '0');
      return next;
    });
  }, []);

  const t = useCallback(
    (str) => (enabled && typeof str === 'string' ? translateToDialect(str) : str),
    [enabled]
  );

  return (
    <DialectContext.Provider value={{ enabled, toggle, t }}>
      {children}
    </DialectContext.Provider>
  );
}

export function useDialect() {
  const ctx = useContext(DialectContext);
  if (!ctx) throw new Error('useDialect must be used within DialectProvider');
  return ctx;
}
