import { createClient } from '@supabase/supabase-js';
import { Birthday } from '../types';

// --- SUPABASE AYARLARI ---
// Kullanıcı tarafından sağlanan bilgiler girildi.

// 1. Project URL
const SUPABASE_URL: string = 'https://lmgjzxlrvqsaawvhbnqh.supabase.co';

// 2. Anon Public Key
// Not: Kullanıcının sağladığı 'sb_publishable_...' anahtarı kullanılıyor.
const SUPABASE_ANON_KEY: string = 'sb_publishable_Z4tlOgwQIe2H5CbPxLgTFw_4NdsVo3W';

let supabase: any;

// Basit doğrulama: Placeholder kontrolü
const isConfigured = 
    SUPABASE_URL !== 'BURAYA_URL_YAPISTIR' && 
    SUPABASE_ANON_KEY !== 'BURAYA_ANON_KEY_YAPISTIR' &&
    SUPABASE_URL.length > 0 &&
    SUPABASE_ANON_KEY.length > 0;

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
      // Tablo yoksa veya erişim hatası varsa kullanıcıyı uyar
      if (error.code === 'PGRST301' || error.code === '42P01') {
        console.warn("İpucu: 'birthdays' tablosunu SQL Editor'de oluşturdunuz mu?");
      }
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
    alert("Supabase ayarları eksik veya hatalı!");
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