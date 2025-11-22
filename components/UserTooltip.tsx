import React, { useState } from 'react';
import { Birthday } from '../types';
import { generateBirthdayWish } from '../services/geminiService';

interface UserTooltipProps {
  birthday: Birthday;
  onClose: () => void;
}

export const UserTooltip: React.FC<UserTooltipProps> = ({ birthday, onClose }) => {
  const [wish, setWish] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateWish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    const generatedWish = await generateBirthdayWish(birthday.name, birthday.handle);
    setWish(generatedWish);
    setLoading(false);
  };

  return (
    <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white p-0 animate-in fade-in zoom-in duration-200 overflow-hidden">
      {/* Header Background */}
      <div className="h-16 bg-gradient-to-r from-blue-400 to-purple-500 relative">
        <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
        >
           <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center relative">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full p-1 bg-white shadow-sm mb-2">
          <img 
            crossOrigin="anonymous"
            src={`https://unavatar.io/twitter/${birthday.handle}`} 
            alt={birthday.name}
            className="w-full h-full rounded-full object-cover bg-slate-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${birthday.name}&background=random`;
            }}
          />
        </div>

        <h3 className="font-bold text-slate-800 text-xl leading-tight">{birthday.name}</h3>
        
        <a 
          href={`https://x.com/${birthday.handle}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-600 mb-4 bg-blue-50 px-2 py-0.5 rounded-md mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fab fa-twitter text-xs"></i>
          @{birthday.handle}
        </a>

        {wish ? (
          <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-xl text-sm text-slate-600 italic border border-slate-200/60 shadow-inner text-left">
            <i className="fas fa-quote-left text-slate-300 mr-2 text-xs"></i>
            {wish}
          </div>
        ) : (
          <button 
            onClick={handleGenerateWish}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            {loading ? 'Creating Magic...' : 'Generate AI Wish'}
          </button>
        )}
      </div>
      
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-4 h-4 bg-white transform rotate-45 shadow-xl"></div>
    </div>
  );
};