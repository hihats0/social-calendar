import React, { useState, useEffect } from 'react';
import { MONTHS } from '../constants';
import { Birthday } from '../types';
import { DayCell } from './DayCell';

interface MonthColumnProps {
  monthIndex: number;
  birthdays: Birthday[];
  onAddClick: (day: number, month: number) => void;
  viewMode: 'board' | 'accordion';
  forceOpen?: boolean; // Used in accordion mode
  onToggle?: () => void; // Used in accordion mode
}

// Optimization: React.memo prevents re-rendering entire months unnecessarily
export const MonthColumn: React.FC<MonthColumnProps> = React.memo(({ 
  monthIndex, 
  birthdays, 
  onAddClick, 
  viewMode,
  forceOpen = true,
  onToggle
}) => {
  const config = MONTHS[monthIndex];
  const daysArray = Array.from({ length: config.days }, (_, i) => i + 1);
  
  // Filter only birthdays for this month to show counts
  const monthBirthdayCount = birthdays.filter(b => b.monthIndex === monthIndex).length;

  const isBoard = viewMode === 'board';
  const isOpen = isBoard || forceOpen;

  return (
    <div 
        className={`
            glass-panel rounded-xl overflow-hidden transition-all duration-300 flex flex-col
            ${isBoard ? 'h-full' : 'w-full mb-3'}
            ${!isBoard && !isOpen ? 'hover:bg-white/80 cursor-pointer' : ''}
        `}
        // Removed heavy hover shadow/transform effects to fix freezing
        onClick={!isBoard && !isOpen && onToggle ? onToggle : undefined}
    >
      {/* Header */}
      <div 
        className={`
            flex items-center justify-between px-4 py-2 bg-gradient-to-r ${config.color} border-b border-white/50
            ${!isBoard && 'cursor-pointer hover:brightness-95 transition-all'}
        `}
        onClick={!isBoard && onToggle ? (e) => { e.stopPropagation(); onToggle(); } : undefined}
      >
        <div className="flex items-center gap-2">
            <h3 className={`font-bold tracking-wide uppercase text-xs ${config.headerColor} drop-shadow-sm`}>
            {config.name}
            </h3>
            {!isBoard && (
                <span className="text-[10px] font-medium text-slate-500 bg-white/50 px-1.5 rounded-full">
                    {monthBirthdayCount}
                </span>
            )}
        </div>
        
        {/* Accordion Chevron */}
        {!isBoard && (
             <div className={`text-slate-400 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                 <i className="fas fa-chevron-down"></i>
             </div>
        )}
        
        {/* Board Mode Decoration */}
        {isBoard && monthBirthdayCount > 0 && (
             <span className="text-[9px] font-bold text-slate-400/80">
                 {monthBirthdayCount}
             </span>
        )}
      </div>

      {/* Grid Cells - Animated Height for Accordion */}
      <div 
        className={`
            flex flex-col bg-white/40
            ${isOpen ? 'opacity-100' : 'hidden opacity-0'}
        `}
        // Removed complex max-height transition to improve performance
      >
        {daysArray.map((day) => (
          <DayCell
            key={`${monthIndex}-${day}`}
            dayIndex={day}
            monthIndex={monthIndex}
            birthdays={birthdays}
            onAddClick={onAddClick}
          />
        ))}
        
        {/* Footer spacer for aesthetic */}
        <div className="h-2 bg-transparent"></div>
      </div>
    </div>
  );
});