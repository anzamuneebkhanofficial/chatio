import React from 'react';
import Link from 'next/link';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  href,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium whitespace-nowrap transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a16] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:translate-y-[1px]';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/20 shadow-sm hover:shadow-indigo-500/20',
    secondary: 'bg-[#111428] text-slate-100 border border-white/10 hover:border-indigo-500/40 hover:bg-[#161a33]',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent',
    destructive: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300',
    outline: 'border border-white/15 text-slate-200 hover:text-white hover:border-white/30 hover:bg-white/[0.04]',
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'h-12 px-6 text-base rounded-xl font-semibold gap-2.5',
  };

  const combinedClasses = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button 
      className={combinedClasses} 
      {...props}
    >
      {children}
    </button>
  );
}
