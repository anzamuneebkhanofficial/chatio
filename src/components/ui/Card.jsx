import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  const baseStyles = 'bg-background-card border border-white/5 rounded-card p-6';
  const hoverStyles = hover ? 'transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(99,102,241,0.2)]' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
