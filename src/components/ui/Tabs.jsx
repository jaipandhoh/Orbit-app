import React from 'react';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 cursor-pointer ${
              isActive
                ? 'border-ds-accent text-ds-accent'
                : 'border-transparent text-ds-fg-muted hover:text-ds-fg hover:border-gray-300'
            }`}
          >
            {tab.label}
            {tab.count != null && (
              <span className={`ml-1.5 text-xs ${isActive ? 'text-ds-accent' : 'text-ds-fg-subtle'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
