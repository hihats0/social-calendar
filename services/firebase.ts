import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, writeBatch } from "firebase/firestore";
import { Birthday } from "../types";

// --- FIREBASE KONFIGURASYONU ---
// Lutfen Firebase Console'dan aldiginiz kendi proje ayarlarinizi buraya yapistirin.
// Eger bu alanlari doldurmazsaniz uygulama hata verebilir veya demo modunda calisabilir.
const firebaseConfig = {
  apiKey: "BURAYA_API_KEY_YAPISTIR",
  authDomain: "BURAYA_PROJECT_ID.firebaseapp.com",
  projectId: "BURAYA_PROJECT_ID",
  storageBucket: "BURAYA_PROJECT_ID.appspot.com",
  messagingSenderId: "BURAYA_SENDER_ID",
  appId: "BURAYA_APP_ID"
};

// Initialize Firebase
let db: any;
try {
  // Basit bir kontrol: Eger config doldurulmamissa baslatma
  if (firebaseConfig.apiKey === "BURAYA_API_KEY_YAPISTIR") {
    console.warn("Firebase Config eksik! Lütfen services/firebase.ts dosyasını düzenleyin.");
  } else {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Firebase başlatılamadı:", error);
}

// Koleksiyon adi
const COLLECTION_NAME = "birthdays";

// --- Veritabani Islemleri ---

// 1. Gercek zamanli dinleyici (Live Sync)
export const subscribeToBirthdays = (callback: (data: Birthday[]) => void) => {
  if (!db) return () => {};

  // Isme gore sirali getir
  const q = query(collection(db, COLLECTION_NAME), orderBy("name"));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const birthdays = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Birthday[];
    callback(birthdays);
  }, (error) => {
    console.error("Veri çekme hatası:", error);
  });

  return unsubscribe;
};

// 2. Yeni dogum gunu ekle
export const addBirthdayToCloud = async (birthday: Omit<Birthday, 'id'>) => {
  if (!db) {
    alert("Veritabanı bağlantısı yok! Lütfen firebase.ts dosyasını yapılandırın.");
    return;
  }
  try {
    await addDoc(collection(db, COLLECTION_NAME), birthday);
  } catch (error) {
    console.error("Ekleme hatası:", error);
    alert("Kaydedilirken bir hata oluştu.");
  }
};

// 3. Dogum gunu sil (Opsiyonel kullanim icin)
export const deleteBirthdayFromCloud = async (id: string) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Silme hatası:", error);
  }
};

// 4. Tüm verileri sil (Reset butonu icin)
export const clearAllBirthdays = async () => {
  if (!db) return;
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    
    // Firestore'da toplu silme islemi (Batch)
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("Toplu silme hatası:", error);
  }
};

export const isFirebaseConfigured = () => {
    return db !== undefined;
};