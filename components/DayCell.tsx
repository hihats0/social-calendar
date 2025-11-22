import React, { useState } from 'react';
import { Birthday } from '../types';
import { UserTooltip } from './UserTooltip';

interface DayCellProps {
  dayIndex: number;
  monthIndex: number;
  birthdays: Birthday[];
  onAddClick: (day: number, month: number) => void;
}

// Optimization: React.memo prevents this cell from re-rendering if props haven't changed
export const DayCell: React.FC<DayCellProps> = React.memo(({ dayIndex, monthIndex, birthdays, onAddClick }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter birthdays for this specific day
  const daysBirthdays = birthdays.filter(
    (b) => b.dayIndex === dayIndex && b.monthIndex === monthIndex
  );

  return (
    <div 
      className="relative border-b border-slate-200/50 last:border-0 min-h-[40px] flex items-stretch px-1 py-1 group transition-colors hover:bg-blue-50/50"
    >
      {/* Day Number - Compact */}
      <div 
        className={`w-5 pt-[2px] text-[10px] font-bold select-none cursor-pointer transition-colors shrink-0 mr-1 ${daysBirthdays.length > 0 ? 'text-blue-600' : 'text-slate-300 hover:text-blue-400'}`}
        onClick={() => onAddClick(dayIndex, monthIndex)}
      >
        {dayIndex}
      </div>

      {/* Content Area - Full Width Stacking */}
      <div className="flex-1 flex flex-col gap-0.5 min-w-0 justify-center">
        {daysBirthdays.length > 0 ? (
          <>
            {daysBirthdays.map((b) => (
              <div 
                key={b.id} 
                className="relative z-10 w-full"
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Full Width Bar Style */}
                <div className="group/chip cursor-pointer flex items-center gap-2 bg-white hover:bg-blue-50 shadow-sm border border-slate-100 rounded-md pl-1 pr-2 py-1 w-full transition-all duration-200">
                  <img
                    src={`https://unavatar.io/twitter/${b.handle}`}
                    alt={b.name}
                    className="w-5 h-5 rounded-full bg-slate-100 object-cover ring-1 ring-slate-100 shrink-0"
                    // Removed loading="lazy" to fix screenshot issues
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.name}&background=random&size=32`;
                    }}
                  />
                  <span className="text-[10px] font-semibold text-slate-700 truncate leading-tight">
                    {b.name}
                  </span>
                </div>
                
                {/* Tooltip */}
                {hoveredId === b.id && (
                  <UserTooltip birthday={b} onClose={() => setHoveredId(null)} />
                )}
              </div>
            ))}
            
            {/* Subtle Add Button at bottom of stack (only visible on hover) */}
            <button 
              onClick={() => onAddClick(dayIndex, monthIndex)}
              className="w-full h-3 mt-0.5 rounded-sm bg-slate-100/50 text-slate-400 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center text-[8px] transition-colors opacity-0 group-hover:opacity-100"
              title="Add another person"
            >
              <i className="fas fa-plus"></i>
            </button>
          </>
        ) : (
          /* Empty state - Invisible clickable area that fills the rest */
          <div 
            className="flex-1 h-full min-h-[24px] flex items-center"
            onClick={() => onAddClick(dayIndex, monthIndex)}
          >
             <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-slate-50/30 rounded-md">
                <i className="fas fa-plus text-[8px] text-slate-300"></i>
             </div>
          </div>
        )}
      </div>
    </div>
  );
});