import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

const WidgetSection = ({ id, label, pinned, collapsed, onToggleCollapse, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !!pinned });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} data-section={id}>
      {/* Drag handle + collapse toggle — only for non-pinned sections */}
      {!pinned && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 4, opacity: 0, transition: 'opacity 0.2s',
          cursor: 'default',
        }}
          className="widget-section-handle"
          onMouseEnter={e => e.currentTarget.style.opacity = 0.6}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: 2 }}
            title="Drag to reorder"
          >
            <GripVertical size={12} color="rgba(255,255,255,0.4)" />
          </span>
          <button
            onClick={() => onToggleCollapse(id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: 0,
            }}
            title={collapsed ? 'Expand section' : 'Collapse section'}
          >
            {collapsed
              ? <ChevronRight size={11} color="rgba(255,255,255,0.4)" />
              : <ChevronDown size={11} color="rgba(255,255,255,0.4)" />
            }
          </button>
          <span style={{
            fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          }}>
            {label}
          </span>
        </div>
      )}
      {!collapsed && children}
    </div>
  );
};

export default WidgetSection;
