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
      className="relative border-b border-slate-200/50 last:border-0 min-h-[34px] flex items-start px-2 py-[3px] group transition-colors hover:bg-blue-50/50"
    >
      {/* Day Number - Smaller & Lighter */}
      <div 
        className={`w-5 pt-[2px] text-[10px] font-bold select-none cursor-pointer transition-colors ${daysBirthdays.length > 0 ? 'text-blue-600' : 'text-slate-300 hover:text-blue-400'}`}
        onClick={() => onAddClick(dayIndex, monthIndex)}
      >
        {dayIndex}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-wrap gap-1 min-w-0 items-center">
        {daysBirthdays.length > 0 ? (
          <>
            {daysBirthdays.map((b) => (
              <div 
                key={b.id} 
                className="relative z-10"
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Compact Chip */}
                <div className="group/chip cursor-pointer flex items-center gap-1 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-100 rounded-full pl-0.5 pr-1.5 py-[1px] hover:scale-105 hover:border-blue-200 transition-transform duration-100">
                  <img
                    src={`https://unavatar.io/twitter/${b.handle}`}
                    alt={b.name}
                    className="w-4 h-4 rounded-full bg-slate-100 object-cover ring-1 ring-slate-50"
                    loading="lazy" // Performance optimization
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.name}&background=random&size=32`;
                    }}
                  />
                  <span className="text-[9px] font-medium text-slate-600 truncate max-w-[60px] leading-tight">
                    {b.name.split(' ')[0]}
                  </span>
                </div>
                
                {/* Tooltip */}
                {hoveredId === b.id && (
                  <UserTooltip birthday={b} onClose={() => setHoveredId(null)} />
                )}
              </div>
            ))}
            
            {/* Micro Add Button */}
            <button 
              onClick={() => onAddClick(dayIndex, monthIndex)}
              className="w-4 h-4 rounded-full bg-slate-100/50 text-slate-400 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center text-[8px] transition-colors opacity-0 group-hover:opacity-100 ml-auto"
              title="Add another person"
            >
              <i className="fas fa-plus"></i>
            </button>
          </>
        ) : (
          /* Empty state - Invisible clickable area */
          <div 
            className="flex-1 h-full min-h-[18px] flex items-center"
            onClick={() => onAddClick(dayIndex, monthIndex)}
          >
             {/* Only show + on hover for cleaner look */}
             <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center">
                <span className="text-[9px] text-slate-300 px-2 cursor-pointer hover:text-blue-400">
                   +
                </span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
});