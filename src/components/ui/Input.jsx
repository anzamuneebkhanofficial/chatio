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
      className={`flex h-10 w-full rounded-xl border border-white/10 bg-[#0d1020] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-[border-color,box-shadow] duration-150 ease-out hover:border-white/20 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
});
