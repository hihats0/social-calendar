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

      {/* Content Area */}
      <div className="flex-1 relative min-w-0 p-1.5">
        {daysBirthdays.length > 0 ? (
          <div className="flex flex-col gap-1.5 w-full">
            {daysBirthdays.map((b) => (
              <div 
                key={b.id} 
                className="relative z-0 hover:z-20"
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Chip: Avatar + Name */}
                <div className="flex items-center gap-2 p-1 pr-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group/chip w-fit max-w-full">
                    <div className="w-6 h-6 rounded-full ring-1 ring-slate-100 shadow-sm overflow-hidden bg-slate-100 shrink-0">
                        <img
                          crossOrigin="anonymous"
                          src={`https://unavatar.io/twitter/${b.handle}`}
                          alt={b.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.name}&background=random&size=64`;
                          }}
                        />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 truncate group-hover/chip:text-blue-600 transition-colors leading-tight">
                        {b.name}
                    </span>
                </div>
                
                {/* Tooltip */}
                {hoveredId === b.id && (
                  <UserTooltip birthday={b} onClose={() => setHoveredId(null)} />
                )}
              </div>
            ))}
            
            {/* Add button (invisible filler for easy clicking) */}
             <div 
               onClick={() => onAddClick(dayIndex, monthIndex)}
               className="flex-grow min-h-[10px] cursor-pointer"
               title="Add another person"
            ></div>
          </div>
        ) : (
          /* Empty state - Fills the rest */
          <div 
            className="flex-1 w-full h-full cursor-pointer flex items-center justify-center hover:bg-slate-50/80 transition-colors group/empty min-h-[40px]"
            onClick={() => onAddClick(dayIndex, monthIndex)}
          >
             <i className="fas fa-plus text-xs text-slate-200 opacity-0 group-hover/cell:opacity-100 transition-all transform scale-75 group-hover/cell:scale-100"></i>
          </div>
        )}
      </div>
    </div>
  );
});