import React, { useState, useEffect, useRef } from 'react';
import { MONTHS } from '../constants';

// --- 100+ Türk Örnek Kişi Veritabanı ---
const TURKISH_EXAMPLES = [
  // Tarihi & Efsanevi
  { name: "Mustafa Kemal Atatürk", handle: "Ataturk" },
  { name: "Barış Manço", handle: "BarisManco" },
  { name: "Kemal Sunal", handle: "kemalsunalcom" },
  { name: "Müslüm Gürses", handle: "MuslumBaba" },
  { name: "Zeki Müren", handle: "ZekiMuren" },
  { name: "Aşık Veysel", handle: "AsikVeysel" },
  { name: "Adile Naşit", handle: "AdileNasit" },
  { name: "Cüneyt Arkın", handle: "cuneytarkin" },
  { name: "Şener Şen", handle: "senersen" },
  { name: "Haluk Bilginer", handle: "halukbilginer" },

  // Müzik
  { name: "Tarkan", handle: "tarkan" },
  { name: "Sezen Aksu", handle: "sezenaksu" },
  { name: "Ajda Pekkan", handle: "AjdaPekkan" },
  { name: "Aleyna Tilki", handle: "aleynatilki" },
  { name: "Ceza", handle: "ceza_ed" },
  { name: "Sagopa Kajmer", handle: "SagopaK" },
  { name: "Hayko Cepkin", handle: "HAYKOCPQN" },
  { name: "Mabel Matiz", handle: "mabelmatiz" },
  { name: "Edis", handle: "edisgorgulu" },
  { name: "Hadise", handle: "Hadise" },
  { name: "Demet Akalın", handle: "DemetAkalin" },
  { name: "Murat Boz", handle: "MuratBoz" },
  { name: "Teoman", handle: "TeomanOfficial" },
  { name: "Sıla Gençoğlu", handle: "silagencoglu" },
  { name: "Kenan Doğulu", handle: "kenandogulu" },
  { name: "Yalın", handle: "YalinOnline" },
  { name: "Sertab Erener", handle: "sertaberener" },
  { name: "Athena Gökhan", handle: "athenaofficial" },
  { name: "Manga", handle: "maNgaMusic" },
  { name: "Duman", handle: "DumanBand" },

  // Komedi & Stand-up
  { name: "Cem Yılmaz", handle: "CMYLMZ" },
  { name: "Ata Demirer", handle: "atademirer" },
  { name: "Tolga Çevik", handle: "TolgaCevik" },
  { name: "Hasan Can Kaya", handle: "kayahasancan" },
  { name: "Doğu Demirkol", handle: "dogudemirkol" },
  { name: "Gülse Birsel", handle: "gulsebirsel" },
  { name: "Feyyaz Yiğit", handle: "feyyazyigit" },
  { name: "Kaan Sekban", handle: "KaanSekban" },
  { name: "Yasemin Sakallıoğlu", handle: "yaseminsakalli" },
  { name: "Gökbakar Şahan", handle: "sgokbakar" },

  // Spor & Futbol
  { name: "Fatih Terim", handle: "fatihterim" },
  { name: "Arda Turan", handle: "ArdaTuran" },
  { name: "Mesut Özil", handle: "M10" },
  { name: "Burak Yılmaz", handle: "yilmazburak17" },
  { name: "Cedi Osman", handle: "cediosman" },
  { name: "Alperen Şengün", handle: "alperennsengun" },
  { name: "Mete Gazoz", handle: "metegazoz" },
  { name: "Eda Erdem", handle: "edaerdem14" },
  { name: "Zehra Güneş", handle: "guneszehra" },
  { name: "Ebrar Karakurt", handle: "karakurtebrar18" },
  { name: "Rıdvan Dilmen", handle: "RidvanDilmen" },
  { name: "Sergen Yalçın", handle: "SergenYalcin" },
  { name: "Volkan Demirel", handle: "1VolkanDEMIREL" },
  { name: "Alex de Souza", handle: "Alex10" },
  { name: "Hagi", handle: "GheorgheHagi10" },

  // İnternet Fenomeni & YouTuber
  { name: "Enes Batur", handle: "enesbatur00" },
  { name: "Orkun Işıtmak", handle: "orkunisitmak" },
  { name: "Barış Özcan", handle: "BarisOzcan" },
  { name: "Ruhi Çenet", handle: "ruhicenet" },
  { name: "Reynmen", handle: "reynmen" },
  { name: "Danla Bilic", handle: "danlabilic" },
  { name: "Jahrein", handle: "jahreindota" },
  { name: "Pqueen", handle: "pqueenn" },
  { name: "Elraenn", handle: "elraenn" },
  { name: "Wtcn", handle: "feritkw" },
  { name: "Kendine Müzisyen", handle: "KendineMuzisyen" },
  { name: "Unlost", handle: "unlostv" },
  { name: "Mithrain", handle: "mithrainn" },
  { name: "Oğuzhan Uğur", handle: "OguzhanUgur" },
  { name: "Berkcan Güven", handle: "berkcanguven" },
  { name: "Efe Uygaç", handle: "efeuygac" },
  { name: "Mertcan Bahar", handle: "mertcanbahar" },
  { name: "Deep Turkish Web", handle: "DeepTurkishWeb" },
  { name: "Kafalar", handle: "kafalarresmi" },
  { name: "Noluyo Ya", handle: "noluyoyaa" },

  // Dizi Karakterleri (Kurgusal Handle) & Meme
  { name: "Polat Alemdar", handle: "kurtlarvadisi" },
  { name: "Bihter Ziyagil", handle: "bihterziyagil" },
  { name: "Firdevs Yöreoğlu", handle: "firdevsyoreoglu" },
  { name: "Behlül Haznedar", handle: "behlul" },
  { name: "İsmail Abi", handle: "ismailabi" },
  { name: "Erdal Bakkal", handle: "erdalbakkal" },
  { name: "Burhan Altıntop", handle: "burhanaltintop" },
  { name: "Gibi Yılmaz", handle: "gibi" },
  { name: "Gibi İlkkan", handle: "ilkkan" },
  { name: "Kuzey Tekinoğlu", handle: "kuzeyguney" },
  { name: "Ramiz Dayı", handle: "ramizdayi" },
  { name: "Ezel Bayraktar", handle: "ezel" },
  { name: "Hürrem Sultan", handle: "muhtesemyuzyil" },
  { name: "Süleyman Çakır", handle: "suleymancakir" },
  { name: "Memati Baş", handle: "memati" },
  
  // Magazin & Şefler
  { name: "Acun Ilıcalı", handle: "acunilicali" },
  { name: "Nusret", handle: "nusr_ett" },
  { name: "CZN Burak", handle: "CznBurak" },
  { name: "Somer Sivrioğlu", handle: "somersivrioglu" },
  { name: "Mehmet Yalçınkaya", handle: "chefmehmet" },
  { name: "Danilo Zanna", handle: "DaniloZanna" },
  { name: "Arda Türkmen", handle: "arda_turkmen" },
  { name: "Vedat Milor", handle: "vedatmilor" },
  { name: "Müge Anlı", handle: "mugeanli" },
  { name: "Esra Erol", handle: "ErolEsra" },

  // Absürt / Viral
  { name: "Ajdar", handle: "ajdar" },
  { name: "Köksal Baba", handle: "koksalbaba" },
  { name: "Çikita Muz", handle: "ajdaranik" },
  { name: "Diyar Pala", handle: "diyarpala" },
  { name: "İsmail YK", handle: "ismailyk" }
];

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
  const [randomExample, setRandomExample] = useState(TURKISH_EXAMPLES[0]);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Modal her açıldığında rastgele bir örnek seç
  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * TURKISH_EXAMPLES.length);
      setRandomExample(TURKISH_EXAMPLES[randomIndex]);
      
      if (nameInputRef.current) {
        setTimeout(() => nameInputRef.current?.focus(), 100);
      }
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

  // Placeholder'ı handle inputuna tıklandığında otomatik doldurmak için yardımcı fonksiyon (opsiyonel UX)
  const applyExample = () => {
      setName(randomExample.name);
      setHandle(randomExample.handle);
  };

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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Add Birthday</h2>
                    <p className="text-emerald-100 text-sm mt-1">Let's celebrate properly!</p>
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
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <i className="fas fa-user"></i>
                </div>
                <input
                    ref={nameInputRef}
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    placeholder={`e.g. ${randomExample.name}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">X (Twitter) Handle</label>
                <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <i className="fab fa-twitter"></i>
                </div>
                <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    placeholder={randomExample.handle}
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                />
                </div>
                <div className="flex justify-between items-start mt-2 ml-1">
                    <p className="text-[11px] text-slate-400">
                        Used to fetch the profile picture automatically.
                    </p>
                    <button 
                        type="button" 
                        onClick={applyExample}
                        className="text-[10px] text-emerald-600 font-medium hover:underline cursor-pointer"
                    >
                        Use Example: {randomExample.name}
                    </button>
                </div>
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
              className="flex-[2] px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
            >
              Save Birthday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};