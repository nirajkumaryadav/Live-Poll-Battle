import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseClass = 'button';
  const variantClass = variant !== 'primary' ? `button-${variant}` : '';
  const loadingClass = isLoading ? 'button-loading' : '';
  const fullClassName = `${baseClass} ${variantClass} ${loadingClass} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={fullClassName}
      {...props}
    >
      {isLoading ? <span className="loading-spinner">{children}</span> : children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'outline', 'danger', 'success']),
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  className: PropTypes.string
};

export default Button;