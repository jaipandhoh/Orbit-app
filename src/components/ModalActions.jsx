import React from 'react';

const ModalActions = ({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryType = 'submit',
  secondaryType = 'button',
  primaryClassName = 'btn-primary flex-1',
  secondaryClassName = 'btn-secondary flex-1',
}) => {
  return (
    <div className="flex gap-3 pt-4">
      <button type={primaryType} onClick={onPrimary} className={primaryClassName}>
        {primaryLabel}
      </button>
      <button type={secondaryType} onClick={onSecondary} className={secondaryClassName}>
        {secondaryLabel}
      </button>
    </div>
  );
};

export default ModalActions;
