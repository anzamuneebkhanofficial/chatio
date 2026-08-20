import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input 
      ref={ref}
      spellCheck={false}
      autoComplete="off"
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      className={`flex h-10 w-full rounded-button border border-white/10 bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
});
