import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  const baseStyles = 'bg-[#111428] border border-white/[0.08] rounded-xl p-6 text-slate-100';
  const hoverStyles = hover
    ? 'transition-[border-color,background-color,transform] duration-150 ease-out hover:border-indigo-500/35 hover:bg-[#13172e] hover:-translate-y-0.5'
    : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
