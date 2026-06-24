import React from 'react';

const statusStyles = {
  active: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  drafting: { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' },
  draft: { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' },
  planning: { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' },
  scheduled: { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  published: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  completed: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  complete: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
};

const defaultStyle = { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' };

const StatusPill = ({ status, label, className = '' }) => {
  const key = (status || '').toLowerCase();
  const style = statusStyles[key] || defaultStyle;
  const displayLabel = label || status || 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {displayLabel}
    </span>
  );
};

export default StatusPill;
