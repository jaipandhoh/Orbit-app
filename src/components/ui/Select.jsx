import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ value, onChange, options = [], placeholder, className = '', ...props }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none w-full border border-ds-border-strong rounded-lg text-sm py-2 pl-3 pr-8 bg-white text-ds-fg placeholder:text-ds-fg-subtle focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent transition-colors duration-150 cursor-pointer ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ds-fg-subtle pointer-events-none" />
    </div>
  );
};

export default Select;
