import React from 'react';
const Button = ({ children, onClick, variant = 'primary', disabled, className = '', style = {} }) => (
  <button
    className={`button ${variant} ${className}`.trim()}
    onClick={onClick}
    disabled={disabled}
    style={style}
  >
    {children}
  </button>
);
export default Button;