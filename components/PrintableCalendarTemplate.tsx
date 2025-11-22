import React from 'react';
import { Birthday } from '../types';

interface PrintableCalendarTemplateProps {
  birthdays: Birthday[];
  id: string;
}

const MONTH_STYLES = [
  { name: 'JANUARY', color: 'text-[#A52A2A]' },   // Red/Brown
  { name: 'FEBRUARY', color: 'text-[#BA55D3]' },  // Orchid
  { name: 'MARCH', color: 'text-[#4B0082]' },    // Indigo
  { name: 'APRIL', color: 'text-[#008080]' },    // Teal
  { name: 'MAY', color: 'text-[#00CED1]' },      // Dark Turquoise
  { name: 'JUNE', color: 'text-[#000080]' },     // Navy
  { name: 'JULY', color: 'text-[#2E8B57]' },     // Sea Green
  { name: 'AUGUST', color: 'text-[#D2691E]' },   // Chocolate
  { name: 'SEPTEMBER', color: 'text-[#8B0000]' }, // Dark Red
  { name: 'OCTOBER', color: 'text-[#800080]' },  // Purple
  { name: 'NOVEMBER', color: 'text-[#4682B4]' }, // Steel Blue
  { name: 'DECEMBER', color: 'text-[#228B22]' }, // Forest Green
];

export const PrintableCalendarTemplate: React.FC<PrintableCalendarTemplateProps> = ({ birthdays, id }) => {
  
  const renderMonthBlock = (monthIndex: number) => {
    const style = MONTH_STYLES[monthIndex];
    const daysInMonth = new Date(2024, monthIndex + 1, 0).getDate();
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <div className="flex flex-col border-r border-slate-900 last:border-r-0">
        {/* Month Header */}
        <div className="h-10 flex items-center justify-center border-b border-slate-900 bg-white">
          <span className={`font-serif font-bold tracking-wider text-lg ${style.color}`}>
            {style.name}
          </span>
        </div>

        {/* Days Grid */}
        {days.map((day) => {
          // Is this day valid for this month?
          const isValidDay = day <= daysInMonth;
          
          // Get birthdays for this specific day
          const daysBirthdays = birthdays.filter(
            b => b.monthIndex === monthIndex && b.dayIndex === day
          );

          return (
            <div 
              key={day} 
              className={`
                h-[28px] flex items-center border-b border-slate-900 last:border-b-0 relative px-1
                ${!isValidDay ? 'bg-[#EBE9E5]' : 'bg-white'} 
              `}
            >
               {/* Day Number */}
              {isValidDay && (
                <div className="w-6 shrink-0 text-[11px] font-bold text-black font-sans">
                  {day}
                </div>
              )}

              {/* Birthday Content */}
              {isValidDay && daysBirthdays.length > 0 && (
                <div className="flex-1 flex items-center overflow-hidden h-full">
                   {daysBirthdays.map((b, idx) => (
                     <div key={b.id} className="flex items-center mr-2 min-w-0 shrink-0">
                        {/* 
                           CRITICAL FIX FOR SCREENSHOTS:
                           1. Use wsrv.nl proxy to ensure CORS headers are present (Twitter/Unavatar often fail CORS in canvas).
                           2. crossorigin="anonymous" allows the canvas to read the image data.
                           3. width/height attributes help the renderer allocate space immediately.
                        */}
                        <img 
                          src={`https://wsrv.nl/?url=unavatar.io/twitter/${b.handle}&w=64&h=64&output=png`}
                          crossOrigin="anonymous"
                          width="20"
                          height="20"
                          className="w-5 h-5 rounded-full border border-slate-300 mr-1.5 bg-slate-100 block object-cover"
                          alt="" 
                          loading="eager"
                          onError={(e) => {
                            // Fallback to UI Avatars if proxy fails
                             (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.name}&background=random&size=64&format=png`;
                          }}
                        />
                        <span className="text-[10px] font-bold text-black font-sans leading-none pt-0.5 whitespace-nowrap">
                          {b.name}
                        </span>
                     </div>
                   ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper for Rainbow Title
  const renderRainbowTitle = () => {
    const text = "BIRTHDAY CALENDAR";
    const colors = [
      'text-[#FF0000]', 'text-[#FF7F00]', 'text-[#CCCC00]', 'text-[#008000]', 
      'text-[#0000FF]', 'text-[#4B0082]', 'text-[#9400D3]'
    ];
    
    return (
      <h1 className="text-6xl font-black text-center tracking-widest mb-8 font-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.05)' }}>
        {text.split('').map((char, i) => (
          <span key={i} className={colors[i % colors.length]}>
            {char}
          </span>
        ))}
      </h1>
    );
  };

  return (
    <div 
      id={id}
      className="bg-white p-12 mx-auto shadow-2xl"
      // Explicit width is safer for canvas export
      style={{ width: '1600px', minWidth: '1600px', fontFamily: "Arial, Helvetica, sans-serif" }}
    >
        {/* Main Title */}
        <div className="flex justify-center py-4">
            {renderRainbowTitle()}
        </div>

        {/* Calendar Container - Border Wrapper */}
        <div className="border-2 border-slate-900">
            
            {/* Top Half: Jan - June */}
            <div className="grid grid-cols-6 border-b-2 border-slate-900 divide-x divide-slate-900">
                {Array.from({ length: 6 }).map((_, i) => (
                    <React.Fragment key={i}>
                        {renderMonthBlock(i)}
                    </React.Fragment>
                ))}
            </div>

            {/* Spacer / Divider */}
            <div className="h-8 bg-[#f0f0f0] border-b-2 border-slate-900"></div>

            {/* Bottom Half: July - Dec */}
            <div className="grid grid-cols-6 divide-x divide-slate-900">
                {Array.from({ length: 6 }).map((_, i) => (
                    <React.Fragment key={i + 6}>
                        {renderMonthBlock(i + 6)}
                    </React.Fragment>
                ))}
            </div>
        </div>

        <div className="mt-6 text-right text-slate-400 text-sm font-medium italic">
            Social Birthday Calendar • Generated with AI
        </div>
    </div>
  );
};