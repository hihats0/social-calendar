import React, { useState, useEffect, useMemo } from 'react';
import { Birthday } from './types';
import { MONTHS } from './constants';
import { MonthColumn } from './components/MonthColumn';
import { AddBirthdayModal } from './components/AddBirthdayModal';

// Simple random ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

// Type for view modes
type ViewMode = 'board' | 'accordion';

const App: React.FC = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number } | null>(null);
  
  // New State Variables
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMonthIndex, setExpandedMonthIndex] = useState<number | null>(null); // For accordion mode

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('social-birthday-calendar');
    if (saved) {
      try {
        setBirthdays(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse birthdays", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('social-birthday-calendar', JSON.stringify(birthdays));
  }, [birthdays]);

  // Set current month expanded by default in accordion mode
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    setExpandedMonthIndex(currentMonth);
  }, []);

  const handleDayClick = (day: number, month: number) => {
    setSelectedDate({ day, month });
    setIsModalOpen(true);
  };

  const handleSaveBirthday = (name: string, handle: string, day: number, month: number) => {
    const newBirthday: Birthday = {
      id: generateId(),
      name,
      handle,
      dayIndex: day,
      monthIndex: month,
    };
    setBirthdays(prev => [...prev, newBirthday]);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all calendar entries?")) {
        setBirthdays([]);
    }
  };

  // --- Logic: Filter Birthdays ---
  const filteredBirthdays = useMemo(() => {
    if (!searchQuery) return birthdays;
    return birthdays.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.handle.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [birthdays, searchQuery]);

  // --- Logic: Find Next Birthday ---
  const nextBirthday = useMemo(() => {
    if (birthdays.length === 0) return null;
    
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentDay = today.getDate(); // 1-31

    // Sort birthdays by distance from today
    const sorted = [...birthdays].map(b => {
        // Calculate date for this year
        let bDate = new Date(today.getFullYear(), b.monthIndex, b.dayIndex);
        // If date has passed this year, set to next year
        if (bDate < today && (b.monthIndex !== currentMonth || b.dayIndex !== currentDay)) {
            bDate.setFullYear(today.getFullYear() + 1);
        }
        // Reset time components for accurate comparison
        bDate.setHours(0,0,0,0);
        const todayReset = new Date();
        todayReset.setHours(0,0,0,0);

        const diff = bDate.getTime() - todayReset.getTime();
        const daysAway = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        return { ...b, daysAway };
    }).sort((a, b) => a.daysAway - b.daysAway);

    return sorted[0];
  }, [birthdays]);


  return (
    <div className="min-h-screen text-slate-800 font-sans pb-20 selection:bg-blue-100">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-pink-200/20 rounded-full blur-[80px] mix-blend-multiply animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-header px-6 py-3 mb-6 shadow-sm">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Logo & Stats */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <i className="fas fa-calendar-day"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                        Social Calendar
                        </h1>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">Interactive Birthday Tracker</p>
                    </div>
                </div>
                
                {/* Vertical Divider */}
                <div className="hidden lg:block h-8 w-px bg-slate-200"></div>

                {/* Next Birthday Widget */}
                {nextBirthday ? (
                    <div className="hidden md:flex items-center gap-3 bg-white/60 border border-white rounded-full py-1.5 px-4 shadow-sm">
                        <div className="relative">
                            <img 
                                src={`https://unavatar.io/twitter/${nextBirthday.handle}`} 
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                alt={nextBirthday.name}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full border border-white">
                                {nextBirthday.daysAway === 0 ? 'TODAY' : `${nextBirthday.daysAway}d`}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Next Celebration</span>
                            <span className="text-xs font-semibold text-slate-700">{nextBirthday.name} <span className="font-normal text-slate-400">in {MONTHS[nextBirthday.monthIndex].name}</span></span>
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:block text-xs text-slate-400 italic">No upcoming birthdays set</div>
                )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative group w-full lg:w-64">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-xs"></i>
                    <input 
                        type="text" 
                        placeholder="Search friends..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times-circle text-xs"></i>
                        </button>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                {/* View Toggle */}
                <div className="bg-slate-100/80 p-1 rounded-lg flex gap-1 border border-slate-200">
                    <button 
                        onClick={() => setViewMode('board')}
                        className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${viewMode === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Board View"
                    >
                        <i className="fas fa-border-all text-xs"></i>
                    </button>
                    <button 
                        onClick={() => setViewMode('accordion')}
                        className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${viewMode === 'accordion' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="List View"
                    >
                        <i className="fas fa-list-ul text-xs"></i>
                    </button>
                </div>

                {/* Reset Button */}
                {birthdays.length > 0 && (
                    <button 
                        onClick={handleReset}
                        className="ml-2 text-slate-400 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50"
                        title="Reset Calendar"
                    >
                        <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                )}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6">
        
        {/* View: Board (Grid) */}
        {viewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 animate-in fade-in duration-500">
            {Array.from({ length: 12 }).map((_, index) => (
                <MonthColumn
                    key={index}
                    monthIndex={index}
                    birthdays={filteredBirthdays}
                    onAddClick={handleDayClick}
                    viewMode="board"
                />
            ))}
            </div>
        )}

        {/* View: Accordion (List) */}
        {viewMode === 'accordion' && (
            <div className="max-w-3xl mx-auto flex flex-col gap-2 animate-in slide-in-from-bottom-4 duration-500">
                 {Array.from({ length: 12 }).map((_, index) => (
                    <MonthColumn
                        key={index}
                        monthIndex={index}
                        birthdays={filteredBirthdays}
                        onAddClick={handleDayClick}
                        viewMode="accordion"
                        forceOpen={expandedMonthIndex === index}
                        onToggle={() => setExpandedMonthIndex(expandedMonthIndex === index ? null : index)}
                    />
                ))}
            </div>
        )}

      </main>

      {/* Modal */}
      <AddBirthdayModal
        isOpen={isModalOpen}
        initialDate={selectedDate}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBirthday}
      />
    </div>
  );
};

export default App;