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
      className="relative border-b border-slate-200/50 last:border-0 min-h-[50px] flex items-stretch group bg-white"
    >
      {/* Day Number - Left Side */}
      <div 
        className={`w-6 flex items-start justify-center pt-1 text-[11px] font-bold select-none cursor-pointer border-r border-slate-100 bg-slate-50/30 shrink-0 ${daysBirthdays.length > 0 ? 'text-slate-600' : 'text-slate-300 hover:text-blue-400'}`}
        onClick={() => onAddClick(dayIndex, monthIndex)}
      >
        {dayIndex}
      </div>

      {/* Content Area - Vertical Stacking with Full Width/Height */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {daysBirthdays.length > 0 ? (
          <>
            {daysBirthdays.map((b, index) => (
              <div 
                key={b.id} 
                className="relative flex-grow w-full"
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Full Block Item - Grows to fill space */}
                <div className={`
                    cursor-pointer flex items-center gap-2 px-2 w-full h-full transition-all duration-200
                    hover:brightness-95 hover:z-10 relative
                    ${index % 2 === 0 ? 'bg-indigo-50/50' : 'bg-blue-50/50'}
                `}>
                  <img
                    src={`https://unavatar.io/twitter/${b.handle}`}
                    alt={b.name}
                    crossOrigin="anonymous" // CRITICAL FOR SCREENSHOTS
                    className="w-6 h-6 rounded-full bg-white object-cover shadow-sm ring-2 ring-white shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.name}&background=random&size=64`;
                    }}
                  />
                  <span className="text-sm font-semibold text-slate-700 truncate leading-none">
                    {b.name}
                  </span>
                </div>
                
                {/* Tooltip */}
                {hoveredId === b.id && (
                  <UserTooltip birthday={b} onClose={() => setHoveredId(null)} />
                )}
              </div>
            ))}
            
            {/* Invisible Add Trigger at bottom */}
            <div 
               onClick={() => onAddClick(dayIndex, monthIndex)}
               className="absolute bottom-0 left-0 right-0 h-1.5 hover:h-3 hover:bg-blue-100 cursor-pointer z-20 opacity-0 hover:opacity-100 transition-all flex items-center justify-center"
               title="Add another"
            >
               <div className="w-full h-px bg-blue-300"></div>
            </div>
          </>
        ) : (
          /* Empty state - Fills the rest */
          <div 
            className="flex-1 w-full h-full cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors group/empty"
            onClick={() => onAddClick(dayIndex, monthIndex)}
          >
             <i className="fas fa-plus text-[10px] text-slate-300 opacity-0 group-hover/empty:opacity-100 transform scale-75 group-hover/empty:scale-100 transition-all"></i>
          </div>
        )}
      </div>
    </div>
  );
});