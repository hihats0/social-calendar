import { createClient } from '@supabase/supabase-js';
import { Birthday } from '../types';

// --- SUPABASE AYARLARI ---
// Lütfen Supabase panelinden (Settings > API) aldığınız kendi bilgilerinizi tırnak içine yapıştırın.

// 1. Project URL (Örn: https://xxyyzz.supabase.co)
const SUPABASE_URL: string = 'BURAYA_URL_YAPISTIR';

// 2. Anon Public Key (eyJh... ile başlayan ÇOK UZUN şifreli yazı)
// DİKKAT: 'secret' veya 'service_role' key'i ASLA buraya yapıştırma! Sadece 'anon' key.
const SUPABASE_ANON_KEY: string = 'BURAYA_ANON_KEY_YAPISTIR';

let supabase: any;

// Basit doğrulama: Kullanıcı değerleri girmiş mi?
const isConfigured = 
    SUPABASE_URL !== 'BURAYA_URL_YAPISTIR' && 
    SUPABASE_ANON_KEY !== 'BURAYA_ANON_KEY_YAPISTIR' &&
    SUPABASE_URL.includes('supabase.co') &&
    SUPABASE_ANON_KEY.length > 20; // Anon keyler genelde uzundur

if (isConfigured) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase bağlantısı başlatıldı.");
    } catch (e) {
        console.error("Supabase başlatma hatası:", e);
    }
} else {
    console.warn("UYARI: Supabase ayarları eksik! services/supabase.ts dosyasını düzenleyin.");
}

const TABLE_NAME = 'birthdays';

// 1. Check configuration status
export const isSupabaseConfigured = () => isConfigured;

// 2. Real-time Subscription & Initial Fetch
export const subscribeToBirthdays = (callback: (data: Birthday[]) => void) => {
  if (!supabase) return () => {};

  // Fonksiyon: Verileri çekip callback'e gönder
  const fetchAndSend = async () => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error("Supabase Veri Çekme Hatası:", error.message);
    } else if (data) {
      callback(data as Birthday[]);
    }
  };

  // İlk yükleme
  fetchAndSend();

  // Realtime Abonelik
  const channel = supabase
    .channel('public:birthdays')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => {
      // Değişiklik olduğunda veriyi yenile
      fetchAndSend();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// 3. Ekleme
export const addBirthdayToCloud = async (birthday: Omit<Birthday, 'id'>) => {
  if (!supabase) {
    alert("Supabase ayarları yapılmamış! services/supabase.ts dosyasını kontrol et.");
    return;
  }
  const { error } = await supabase
    .from(TABLE_NAME)
    .insert([birthday]);

  if (error) {
    console.error("Ekleme hatası:", error);
    alert("Kaydedilirken hata oluştu: " + error.message);
  }
};

// 4. Silme
export const deleteBirthdayFromCloud = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
    
  if (error) console.error("Silme hatası:", error);
};

// 5. Hepsini Silme (Reset)
export const clearAllBirthdays = async () => {
  if (!supabase) return;
  
  // Tüm kayıtları sil
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); 

  if (error) console.error("Toplu silme hatası:", error);
};