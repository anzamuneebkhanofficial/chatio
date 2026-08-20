import React, { useState } from 'react';

export function Tabs({ tabs, defaultTab, className = '' }) {
  const [active, setActive] = useState(defaultTab || tabs[0].id);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex space-x-1 rounded-button bg-background-primary p-1 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`w-full rounded-md py-2 text-sm font-medium leading-5 transition-colors
              ${active === tab.id 
                ? 'bg-background-card text-white shadow-sm ring-1 ring-white/10' 
                : 'text-text-secondary hover:bg-white/[0.02] hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${active === tab.id ? 'block' : 'hidden'} focus:outline-none`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
