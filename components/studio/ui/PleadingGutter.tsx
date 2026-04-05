/**
 * @file PleadingGutter.tsx
 * @module NomosDesk/Studio/UI
 * @description The classic legal pleading gutter with numbered lines.
 */

import React from 'react';

export const PleadingGutter: React.FC = () => {
  return (
    <div className="flex flex-col items-end pr-3 pt-[1in] select-none">
      {Array.from({ length: 28 }).map((_, i) => (
        <div key={i} className="text-[10pt] font-mono leading-[2.0] text-slate-400/60">
          {i + 1}
        </div>
      ))}
    </div>
  );
};

export default PleadingGutter;
