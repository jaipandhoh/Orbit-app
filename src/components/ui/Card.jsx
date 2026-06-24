import React from 'react';

const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-ds-border shadow-sm hover:shadow-md transition-shadow duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
