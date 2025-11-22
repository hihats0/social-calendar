import React, { useState, useEffect, useMemo } from 'react';
import { Birthday } from './types';
import { MONTHS } from './constants';
import { MonthColumn } from './components/MonthColumn';
import { AddBirthdayModal } from './components/AddBirthdayModal';
import { subscribeToBirthdays, addBirthdayToCloud, clearAllBirthdays, isSupabaseConfigured } from './services/supabase';
import html2canvas from 'html2canvas';

// --- LOGO AYARI ---
// Not: Verdiğiniz link (ibb.co/...) bir web sayfasıdır. Kodun çalışması için
// resmin doğrudan linki (genelde .png veya .jpg ile biter) gerekir.
// Örnek doğru link: https://i.ibb.co/wzwPfxR/logo.png
// Şimdilik çalışan bir örnek koyuyorum:
const LOGO_URL = 'https://i.hizliresim.com/ches0mu.png'; 

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
  const [isDbReady, setIsDbReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Initial Setup & Subscription to Cloud
  useEffect(() => {
    // Check configuration
    if (!isSupabaseConfigured()) {
        setIsLoading(false);
        // Fallback to local storage if not configured (optional legacy support)
        const saved = localStorage.getItem('social-birthday-calendar');
        if (saved) setBirthdays(JSON.parse(saved));
        return;
    }

    setIsDbReady(true);
    
    // Subscribe to Real-time updates (Supabase)
    const unsubscribe = subscribeToBirthdays((data) => {
        setBirthdays(data);
        setIsLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

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
    if (isDbReady) {
        addBirthdayToCloud({
            name,
            handle,
            dayIndex: day,
            monthIndex: month
        });
    } else {
        // Legacy Local Save
        const newBirthday: Birthday = {
            id: Math.random().toString(36).substring(2, 15),
            name,
            handle,
            dayIndex: day,
            monthIndex: month,
        };
        const updated = [...birthdays, newBirthday];
        setBirthdays(updated);
        localStorage.setItem('social-birthday-calendar', JSON.stringify(updated));
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to clear ALL calendar entries for EVERYONE? This cannot be undone.")) {
        if (isDbReady) {
            await clearAllBirthdays();
        } else {
            setBirthdays([]);
            localStorage.removeItem('social-birthday-calendar');
        }
    }
  };
  
  const handleDownloadScreenshot = async () => {
      const element = document.getElementById('calendar-grid-container');
      if (!element) return;
      
      setIsDownloading(true);
      
      try {
          // 1. Ensure we are in board mode for the best screenshot
          const previousMode = viewMode;
          if (previousMode !== 'board') setViewMode('board');
          
          // 2. Force a small delay to ensure DOM updates and images render
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 3. Capture with specific settings for high quality and full width
          const canvas = await html2canvas(element, {
              scale: 2, // Higher resolution
              backgroundColor: '#f0f4f8',
              useCORS: true, // Critical for external avatars
              allowTaint: true, // Allow external images
              logging: false,
              width: 1920, // Force desktop width even on mobile
              windowWidth: 1920, // Simulate desktop viewport
              imageTimeout: 30000, // Wait longer for images
              onclone: (clonedDoc) => {
                  // Force the cloned container to be large to prevent squashing
                  const container = clonedDoc.getElementById('calendar-grid-container');
                  if (container) {
                      container.style.width = '1920px';
                      container.style.maxWidth = 'none';
                      container.style.padding = '40px';
                  }
                  // Ensure all images in the clone are eager loaded
                  const images = clonedDoc.getElementsByTagName('img');
                  for (let i = 0; i < images.length; i++) {
                      images[i].loading = "eager";
                  }
              }
          });
          
          const link = document.createElement('a');
          link.download = 'Social-Birthday-Calendar.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
          
          if (previousMode !== 'board') setViewMode(previousMode);
      } catch (err) {
          console.error("Screenshot failed", err);
          alert("Could not create screenshot. Some external images might be blocking it.");
      } finally {
          setIsDownloading(false);
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
      
      {/* Optimized Background: Removed heavy blur animations for performance */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none bg-slate-50/50"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-header px-6 py-3 mb-6 shadow-sm">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Logo & Stats */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-white/50 bg-white flex items-center justify-center">
                        {/* SMART LOGO LOGIC */}
                        {!logoError ? (
                            <img 
                                src={LOGO_URL} 
                                alt="Logo" 
                                className="w-10 h-10 object-contain" 
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <i className="fas fa-birthday-cake text-2xl text-pink-500"></i>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                        Social Calendar
                        </h1>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1 flex items-center gap-1">
                            {isDbReady ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    LIVE CONNECTION
                                </span>
                            ) : (
                                <span className="text-orange-500">LOCAL MODE</span>
                            )}
                        </p>
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
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-slate-200"
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
                    <div className="hidden md:block text-xs text-slate-400 italic">
                        {isLoading ? 'Loading...' : 'No upcoming birthdays'}
                    </div>
                )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative group w-full lg:w-56">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors text-xs"></i>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times-circle text-xs"></i>
                        </button>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                {/* Screenshot Button */}
                <button 
                    onClick={handleDownloadScreenshot}
                    disabled={isDownloading}
                    className="bg-slate-800 text-white hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Download Image"
                >
                    {isDownloading ? (
                        <i className="fas fa-circle-notch fa-spin"></i>
                    ) : (
                        <i className="fas fa-camera"></i>
                    )}
                    <span className="hidden sm:inline">Save Image</span>
                </button>

                {/* View Toggle */}
                <div className="bg-slate-100/80 p-1 rounded-lg flex gap-1 border border-slate-200">
                    <button 
                        onClick={() => setViewMode('board')}
                        className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${viewMode === 'board' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Board View"
                    >
                        <i className="fas fa-border-all text-xs"></i>
                    </button>
                    <button 
                        onClick={() => setViewMode('accordion')}
                        className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${viewMode === 'accordion' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                        title="Reset All"
                    >
                        <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                )}
            </div>
        </div>
        
        {/* Missing Config Warning */}
        {!isDbReady && !isLoading && (
             <div className="max-w-[1800px] mx-auto mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-orange-700 text-xs">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>
                        <strong>Database Disconnected</strong> Changes are only saved to this browser.
                    </span>
                </div>
             </div>
        )}
      </header>

      {/* Main Content - Added explicit width for screenshot reliability */}
      <main className="max-w-[1800px] mx-auto px-6" id="calendar-grid-container">
        
        {/* Loading State */}
        {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-emerald-500"></i>
                <p className="text-sm font-medium">Loading calendar...</p>
            </div>
        )}

        {/* View: Board (Grid) */}
        {!isLoading && viewMode === 'board' && (
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
        {!isLoading && viewMode === 'accordion' && (
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