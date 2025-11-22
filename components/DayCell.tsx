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
      className="relative border-b border-slate-200/60 last:border-0 min-h-[64px] flex items-stretch bg-white group/cell"
    >
      {/* Day Number - Left Side */}
      <div 
        className={`w-8 flex items-start justify-center pt-2 text-xs font-bold select-none cursor-pointer border-r border-slate-100 bg-slate-50/50 shrink-0 ${daysBirthdays.length > 0 ? 'text-slate-600' : 'text-slate-300 hover:text-blue-400'}`}
        onClick={() => onAddClick(dayIndex, monthIndex)}
      >
        {dayIndex}
      </div>

      {/* Content Area - Vertical Stacking with Full Width/Height */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {daysBirthdays.length > 0 ? (
          <>
            {daysBirthdays.map((b, index) => (
              <div 
                key={b.id} 
                className="relative flex-1 w-full min-h-[32px]" // Ensure minimum height so images don't collapse
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Full Block Item */}
                <div className={`
                    w-full h-full flex items-center px-3 gap-3 transition-all duration-200 cursor-pointer
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    hover:bg-blue-50 border-b border-dashed border-slate-100 last:border-0
                `}>
                  {/* Avatar - Fixed Size & No Shrink */}
                  <div className="relative w-8 h-8 shrink-0 rounded-full overflow-hidden shadow-sm ring-1 ring-slate-200">
                      <img
                        src={`https://unavatar.io/twitter/${b.handle}`}
                        alt={b.name}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        style={{ display: 'block' }} // Fixes some canvas rendering issues
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.name}&background=random&size=64`;
                        }}
                      />
                  </div>
                  
                  {/* Name - Truncated but legible */}
                  <span className="text-sm font-semibold text-slate-700 truncate select-none pt-0.5">
                    {b.name}
                  </span>
                </div>
                
                {/* Tooltip */}
                {hoveredId === b.id && (
                  <UserTooltip birthday={b} onClose={() => setHoveredId(null)} />
                )}
              </div>
            ))}
            
            {/* Minimal Add Button at bottom (only visible on hover) */}
            <div 
               onClick={() => onAddClick(dayIndex, monthIndex)}
               className="absolute bottom-0 left-0 right-0 h-1.5 hover:h-4 hover:bg-blue-100/80 cursor-pointer z-10 opacity-0 hover:opacity-100 transition-all flex items-center justify-center"
               title="Add another person"
            >
               <i className="fas fa-plus text-[8px] text-blue-400"></i>
            </div>
          </>
        ) : (
          /* Empty state - Fills the rest */
          <div 
            className="flex-1 w-full h-full cursor-pointer flex items-center justify-center hover:bg-slate-50/80 transition-colors group/empty"
            onClick={() => onAddClick(dayIndex, monthIndex)}
          >
             <i className="fas fa-plus text-xs text-slate-200 opacity-0 group-hover/cell:opacity-100 transition-all transform scale-75 group-hover/cell:scale-100"></i>
          </div>
        )}
      </div>
    </div>
  );
});