import React from 'react';

const Input = ({ className = '', icon: Icon, ...props }) => {
  if (Icon) {
    return (
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-fg-subtle" />
        <input
          className={`w-full border border-ds-border-strong rounded-lg text-sm py-2 pl-9 pr-3 placeholder:text-ds-fg-subtle focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent transition-colors duration-150 ${className}`}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={`w-full border border-ds-border-strong rounded-lg text-sm py-2 px-3 placeholder:text-ds-fg-subtle focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent transition-colors duration-150 ${className}`}
      {...props}
    />
  );
};

export default Input;
