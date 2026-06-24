import React from 'react';

const variants = {
  primary: 'bg-ds-accent text-white hover:bg-green-600',
  secondary: 'bg-white text-ds-fg border border-ds-border-strong hover:bg-ds-bg-subtle',
  ghost: 'text-ds-fg hover:bg-ds-bg-subtle',
  danger: 'text-red-600 bg-white border border-ds-border-strong hover:bg-red-50',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
