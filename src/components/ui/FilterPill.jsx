import React from 'react';
import { ChevronDown } from 'lucide-react';

const FilterPill = ({ icon: Icon, label, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ds-fg border border-ds-border-strong rounded-lg hover:bg-ds-bg-subtle transition-colors duration-150 cursor-pointer ${className}`}
    >
      {Icon && <Icon size={16} className="text-ds-fg-muted" />}
      {label}
      <ChevronDown size={14} className="text-ds-fg-subtle" />
    </button>
  );
};

export default FilterPill;
