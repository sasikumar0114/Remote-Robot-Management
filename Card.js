import React from 'react';

const Card = ({ title, children, footer }) => (
  <div className="card">
    {title && <h3>{title}</h3>}
    {children}
    {footer && <div className="card-footer">{footer}</div>}
  </div>
);

export default Card;