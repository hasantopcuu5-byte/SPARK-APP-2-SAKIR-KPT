import { db } from "./firebase"
import { collection, getDocs, query, orderBy, setDoc, doc } from "firebase/firestore/lite"
import { get, set } from "idb-keyval" // Yeni yüklediğimiz IndexedDB kütüphanesi

// Kimlik doğrulama tipleri ve verileri
export type User = {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  firstName?: string
  lastName?: string
  createdAt: string
}

export type InspectionRecord = {
  id: string
  userId: string
  username: string
  vesselName: string
  captainName: string
  inspectionDate: string
  status: "completed" | "in_progress"
  items: any[]
  createdAt: string
  updatedAt: string
}

// Gemi isimleri
export const VESSEL_NAMES = [
  "APRIL", "ARES", "BEAM", "CANAL", "COMET", "DALI", "DODO", "DREAM",
  "FAUN", "FLAT", "GIFT", "IDON", "JUST", "KRONOS", "LAKER", "ZEYNEP", "EMINE"
]

// Varsayılan admin kullanıcısı
export const DEFAULT_ADMIN: User = {
  id: "admin-001",
  username: "admin",
  password: "admin123",
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  createdAt: new Date().toISOString(),
}

// IndexedDB anahtarları
export const STORAGE_KEYS = {
  USERS: "spark_users",
  CURRENT_USER: "spark_current_user",
  INSPECTION_RECORDS: "spark_inspection_records",
}

// Kullanıcıları IndexedDB'de başlatma
export async function initializeUsers() {
  if (typeof window === "undefined") return
  const users = await get(STORAGE_KEYS.USERS)
  if (!users) {
    await set(STORAGE_KEYS.USERS, [DEFAULT_ADMIN])
  }
}

// Tüm kullanıcıları getir
export async function getUsers(): Promise<User[]> {
  if (typeof window === "undefined") return [DEFAULT_ADMIN]
  const users = await get(STORAGE_KEYS.USERS)
  return users ? users : [DEFAULT_ADMIN]
}

// Kullanıcı adına göre ara
export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers()
  return users.find((u) => u.username === username) || null
}

// Yeni kullanıcı ekle
export async function addUser(
  username: string,
  password: string,
  role: "admin" | "user" = "user",
  firstName?: string,
  lastName?: string,
): Promise<User | null> {
  const users = await getUsers()
  if (users.find((u) => u.username === username)) {
    return null
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    password,
    role,
    firstName,
    lastName,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  await set(STORAGE_KEYS.USERS, users)
  return newUser
}

// Kullanıcı sil
export async function deleteUser(userId: string): Promise<boolean> {
  const users = await getUsers()
  const filtered = users.filter((u) => u.id !== userId)
  if (filtered.length === users.length) return false

  await set(STORAGE_KEYS.USERS, filtered)
  return true
}

// Kullanıcı güncelle
export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  const users = await getUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return false

  users[index] = { ...users[index], ...updates }
  await set(STORAGE_KEYS.USERS, users)
  return true
}

// Denetim kaydını kaydet (Çevrimdışı öncelikli)
export async function saveInspectionRecord(
  userId: string,
  username: string,
  vesselName: string,
  captainName: string,
  inspectionDate: string,
  items: any[],
  status: "completed" | "in_progress" = "completed",
  recordId?: string
): Promise<InspectionRecord> {
  const id = recordId || `inspection-${Date.now()}`;

  const newRecord: InspectionRecord = {
    id,
    userId,
    username,
    vesselName,
    captainName,
    inspectionDate,
    status,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // 1. ADIM: Veriyi ANINDA telefonun kendi güvenli hafızasına (IndexedDB) yaz (Arayüz donmaz)
  if (typeof window !== "undefined") {
    const records = await getInspectionRecords()
    const existingIndex = records.findIndex(r => r.id === id)
    if (existingIndex >= 0) {
      newRecord.createdAt = records[existingIndex].createdAt
      records[existingIndex] = newRecord
    } else {
      records.push(newRecord)
    }
    await set(STORAGE_KEYS.INSPECTION_RECORDS, records)
  }

  // 2. ADIM: Eğer internet varsa, Firebase sunucusuna arka planda gönder (Arayüzü bekletmiyoruz!)
  if (typeof window !== "undefined" && navigator.onLine) {
    setDoc(doc(db, "inspection_records", id), newRecord).catch((e) =>
      console.error("Arka plan bulut eşitleme hatası (Sorun değil, internet gelince senkronize olacak):", e)
    );
  }

  return newRecord
}

// Firestore'dan küresel verileri çek
export async function fetchGlobalInspectionRecords(): Promise<InspectionRecord[]> {
  try {
    if (typeof window !== "undefined" && !navigator.onLine) {
      return getInspectionRecords(); // İnternet yoksa direkt lokaldekileri göster
    }
    const q = query(collection(db, "inspection_records"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const records: InspectionRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push(doc.data() as InspectionRecord);
    });
    return records;
  } catch (error) {
    console.error("Firestore veri çekme hatası, yerel hafızaya dönülüyor:", error);
    return getInspectionRecords();
  }
}

// Tüm yerel kayıtları getir
export async function getInspectionRecords(): Promise<InspectionRecord[]> {
  if (typeof window === "undefined") return []
  const records = await get(STORAGE_KEYS.INSPECTION_RECORDS)
  return records ? records : []
}

// Kullanıcıya göre yerel kayıtları filtrele
export async function getInspectionRecordsByUser(userId: string): Promise<InspectionRecord[]> {
  const records = await getInspectionRecords()
  return records.filter((r) => r.userId === userId)
}

// Mevcut giriş yapmış kullanıcıyı getir
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null
  const user = await get(STORAGE_KEYS.CURRENT_USER)
  return user ? user : null
}

// Giriş yapan kullanıcıyı kaydet
export async function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    await set(STORAGE_KEYS.CURRENT_USER, user)
  } else {
    // Çıkış yapıldığında current_user anahtarını temizlemek için null set etmek yerine boş tutabiliriz
    await set(STORAGE_KEYS.CURRENT_USER, null)
  }
}

// Çıkış yap
export async function logout() {
  await setCurrentUser(null)
}