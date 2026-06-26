import React from 'react';
import { POST_STATUSES } from '../../constants/postStatus';

const COLOR_STYLES = {
  gray:   { dot: 'bg-gray-400',   bg: 'bg-gray-100',  text: 'text-gray-600' },
  blue:   { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  amber:  { dot: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  purple: { dot: 'bg-purple-500', bg: 'bg-purple-50',  text: 'text-purple-700' },
  sky:    { dot: 'bg-sky-500',    bg: 'bg-sky-50',     text: 'text-sky-700' },
  green:  { dot: 'bg-green-500',  bg: 'bg-green-50',   text: 'text-green-700' },
  slate:  { dot: 'bg-slate-500',  bg: 'bg-slate-100',  text: 'text-slate-700' },
};

// Build status-to-style map from the shared POST_STATUSES constant
const statusStyles = {};
POST_STATUSES.forEach((s) => {
  statusStyles[s.value] = COLOR_STYLES[s.color] || COLOR_STYLES.gray;
});

// Non-post statuses used by other entities (campaigns, requests, deliverables)
statusStyles.active    = COLOR_STYLES.green;
statusStyles.planning  = COLOR_STYLES.gray;
statusStyles.completed = COLOR_STYLES.green;
statusStyles.complete  = COLOR_STYLES.green;

const defaultStyle = COLOR_STYLES.gray;

const StatusPill = ({ status, label, className = '' }) => {
  const key = (status || '').toLowerCase();
  const style = statusStyles[key] || defaultStyle;
  const displayLabel = label || POST_STATUSES.find(s => s.value === key)?.label || status || 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {displayLabel}
    </span>
  );
};

export default StatusPill;
