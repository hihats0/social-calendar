import React, { useState, useEffect, useRef } from 'react';
import { MONTHS } from '../constants';

interface AddBirthdayModalProps {
  isOpen: boolean;
  initialDate: { day: number; month: number } | null;
  onClose: () => void;
  onSave: (name: string, handle: string, day: number, month: number) => void;
}

export const AddBirthdayModal: React.FC<AddBirthdayModalProps> = ({ isOpen, initialDate, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
    if (isOpen) {
      setName('');
      setHandle('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !initialDate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!handle.trim()) {
      setError('Please enter a Twitter handle');
      return;
    }

    const cleanHandle = handle.trim().replace(/^@/, '').replace(/https?:\/\/x\.com\//, '').replace(/https?:\/\/twitter\.com\//, '');
    
    onSave(name, cleanHandle, initialDate.day, initialDate.month);
    onClose();
  };

  const monthName = MONTHS[initialDate.month].name;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Decorative Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Add Birthday</h2>
                    <p className="text-blue-100 text-sm mt-1">Let's celebrate properly!</p>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Date Display */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Day</span>
                <span className="text-xl font-bold text-slate-800">{initialDate.day}</span>
             </div>
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Selected</p>
                <p className="text-lg font-semibold text-slate-700">{monthName}</p>
             </div>
          </div>

          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">Full Name</label>
                <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <i className="fas fa-user"></i>
                </div>
                <input
                    ref={nameInputRef}
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    placeholder="e.g. Taylor Swift"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">X (Twitter) Handle</label>
                <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <i className="fab fa-twitter"></i>
                </div>
                <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    placeholder="taylorswift13"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 ml-1">
                    Used to fetch the profile picture automatically.
                </p>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              Save Birthday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};