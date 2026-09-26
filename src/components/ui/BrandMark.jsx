import React from 'react';

/**
 * BrandMark — Bespoke geometric identity for Chatio by Anza.
 * Replaces generic AI template "Sparkles" icons with a custom, high-precision
 * vector mark representing dual-engine intelligence and RAG vector search.
 */
export function BrandMark({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="15"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.75"
        className="opacity-90"
      />
      <path
        d="M7 17.5V20.5L11 17.5H17.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dynamic vector node points */}
      <circle cx="8" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
      <path
        d="M8 10H16"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="2 2"
        className="opacity-70"
      />
    </svg>
  );
}
