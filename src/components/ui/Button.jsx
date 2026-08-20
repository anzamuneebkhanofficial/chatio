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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-indigo-500/20 active:scale-[0.98]',
    secondary: 'bg-background-card text-white border border-white/10 hover:border-primary/50 hover:bg-white/5 active:scale-[0.98]',
    ghost: 'text-text-secondary hover:text-white hover:bg-white/5 active:scale-[0.98]',
    destructive: 'bg-status-error/10 text-status-error hover:bg-status-error/20 active:scale-[0.98]',
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-10 px-4 py-2 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl font-semibold',
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
