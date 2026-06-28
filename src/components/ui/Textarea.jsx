import React from 'react';

const Textarea = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`w-full border border-ds-border-strong rounded-lg text-sm py-2 px-3 placeholder:text-ds-fg-subtle focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent transition-colors duration-150 resize-none ${className}`}
      {...props}
    />
  );
};

export default Textarea;
