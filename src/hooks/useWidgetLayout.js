import { useState, useCallback, useMemo } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import DEFAULT_LAYOUT from '../data/widgetLayout.js';

const STORAGE_KEY = 'widget-layout-order';
const COLLAPSED_KEY = 'widget-layout-collapsed';

function loadOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Validate: every saved id must exist in DEFAULT_LAYOUT, and vice versa
    const defaultIds = new Set(DEFAULT_LAYOUT.map(w => w.id));
    const savedIds = new Set(saved);
    if (defaultIds.size !== savedIds.size) return null;
    for (const id of defaultIds) if (!savedIds.has(id)) return null;
    return saved;
  } catch { return null; }
}

function loadCollapsed() {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default function useWidgetLayout() {
  const [order, setOrder] = useState(() => loadOrder() || DEFAULT_LAYOUT.map(w => w.id));
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  // Build ordered layout from current order + DEFAULT_LAYOUT metadata
  const layoutMap = useMemo(() => {
    const map = {};
    for (const w of DEFAULT_LAYOUT) map[w.id] = w;
    return map;
  }, []);

  const layout = useMemo(() => {
    // Separate pinned items
    const first = order.filter(id => layoutMap[id]?.pinned === 'first');
    const last = order.filter(id => layoutMap[id]?.pinned === 'last');
    const middle = order.filter(id => !layoutMap[id]?.pinned);
    return [...first, ...middle, ...last].map(id => layoutMap[id]).filter(Boolean);
  }, [order, layoutMap]);

  // Sortable IDs (only non-pinned sections are draggable)
  const sortableIds = useMemo(() => layout.filter(w => !w.pinned).map(w => w.id), [layout]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrder(prev => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleCollapse = useCallback((id) => {
    setCollapsed(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    const defaultOrder = DEFAULT_LAYOUT.map(w => w.id);
    setOrder(defaultOrder);
    setCollapsed({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COLLAPSED_KEY);
  }, []);

  const isCustomized = useMemo(() => {
    const defaultOrder = DEFAULT_LAYOUT.map(w => w.id);
    return JSON.stringify(order) !== JSON.stringify(defaultOrder);
  }, [order]);

  return { layout, sortableIds, handleDragEnd, collapsed, toggleCollapse, resetLayout, isCustomized };
}
