import { db, storage } from "./firebase"
// Sadece tek bir Firestore paketinden import yapıyoruz (Lite olanı kaldırdık)
import { collection, getDocs, query, orderBy, setDoc, doc, deleteDoc } from "firebase/firestore/lite"
// Firebase Storage için eksik importlar eklendi:
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { get, set } from "idb-keyval"

// Tip tanımlamaları
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

export const VESSEL_NAMES = [
  "APRIL", "ARES", "BEAM", "CANAL", "COMET", "DALI", "DODO", "DREAM",
  "FAUN", "FLAT", "GIFT", "IDON", "JUST", "KRONOS", "LAKER", "ZEYNEP", "EMINE"
]

export const DEFAULT_ADMIN: User = {
  id: "admin-001",
  username: "admin",
  password: "admin123",
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  createdAt: new Date().toISOString(),
}

export const STORAGE_KEYS = {
  USERS: "spark_users",
  CURRENT_USER: "spark_current_user",
  INSPECTION_RECORDS: "spark_inspection_records",
  DELETED_IDS: "spark_deleted_record_ids",
}

// Yerel Kayıtları Getiren Yardımcı Fonksiyon
export async function getInspectionRecords(): Promise<InspectionRecord[]> {
  if (typeof window === "undefined") return []
  const records = await get(STORAGE_KEYS.INSPECTION_RECORDS)
  return records ? records : []
}

export async function deleteInspectionRecord(recordId: string): Promise<boolean> {
  if (typeof window === "undefined") return false

  // 1. Adım: Telefonun yerel hafızasından (IndexedDB) sil
  const records = await getInspectionRecords()
  const filtered = records.filter(r => r.id !== recordId)
  await set(STORAGE_KEYS.INSPECTION_RECORDS, filtered)
  console.log(`✅ Kayıt yerel hafızadan (IndexedDB) silindi: ${recordId}`)

  // 1.5. Adım: Silinen ID'yi tombstone listesine ekle (hortlamayı önler)
  const deletedIds: string[] = (await get(STORAGE_KEYS.DELETED_IDS)) || []
  if (!deletedIds.includes(recordId)) {
    deletedIds.push(recordId)
    await set(STORAGE_KEYS.DELETED_IDS, deletedIds)
  }

  // 2. Adım: Eğer o an cihaz internete bağlıysa Firestore bulutundan da sil
  if (navigator.onLine) {
    try {
      await deleteDoc(doc(db, "inspection_records", recordId))
      console.log(`✅ Kayıt buluttan (Firestore) başarıyla silindi: ${recordId}`)
    } catch (error) {
      console.error("Kayıt buluttan silinirken hata oluştu:", error)
      return false
    }
  }

  return true
}
// Kayıttaki Base64 Fotoğrafları Storage'a Yükleme Motoru
async function uploadRecordPhotosToStorage(record: InspectionRecord): Promise<InspectionRecord> {
  const updatedItems = await Promise.all(record.items.map(async (item) => {
    if (!item.photos || item.photos.length === 0) return item;

    const updatedPhotos = await Promise.all(item.photos.map(async (photo: string, index: number) => {
      if (photo.startsWith("data:image/")) {
        try {
          const fileRef = ref(storage, `inspections/${record.id}/item-${item.id}-${index}-${Date.now()}.jpg`);
          await uploadString(fileRef, photo, 'data_url');
          const downloadUrl = await getDownloadURL(fileRef);
          return downloadUrl;
        } catch (error) {
          console.error("Fotoğraf buluta yüklenirken hata oluştu:", error);
          return photo;
        }
      }
      return photo;
    }));

    return { ...item, photos: updatedPhotos };
  }));

  return { ...record, items: updatedItems };
}

// Çevrimdışı Kayıtları Otomatik Eşitleme (Sync Kuyruğu)
export async function syncOfflineRecords() {
  if (typeof window === "undefined" || !navigator.onLine) return;

  const records = await getInspectionRecords();
  for (let record of records) {
    try {
      const fullyUploadedRecord = await uploadRecordPhotosToStorage(record);
      const currentRecords = await getInspectionRecords();
      const idx = currentRecords.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        currentRecords[idx] = fullyUploadedRecord;
        await set(STORAGE_KEYS.INSPECTION_RECORDS, currentRecords);
      }
      await setDoc(doc(db, "inspection_records", record.id), fullyUploadedRecord);
    } catch (error) {
      console.error(`Kayıt senkronizasyon hatası (${record.id}):`, error);
    }
  }
}

// --- KULLANICI YÖNETİMİ (AUTH) FONKSİYONLARI ---

export async function initializeUsers() {
  if (typeof window === "undefined") return
  const users = await get(STORAGE_KEYS.USERS)
  if (!users) {
    await set(STORAGE_KEYS.USERS, [DEFAULT_ADMIN])
  }
}

export async function getUsers(): Promise<User[]> {
  if (typeof window === "undefined") return [DEFAULT_ADMIN]
  const users = await get(STORAGE_KEYS.USERS)
  return users ? users : [DEFAULT_ADMIN]
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers()
  return users.find((u) => u.username === username) || null
}

export async function addUser(username: string, password: string, role: "admin" | "user" = "user", firstName?: string, lastName?: string): Promise<User | null> {
  const users = await getUsers()
  if (users.find((u) => u.username === username)) return null

  const newUser: User = { id: `user-${Date.now()}`, username, password, role, firstName, lastName, createdAt: new Date().toISOString() }
  users.push(newUser)
  await set(STORAGE_KEYS.USERS, users)
  return newUser
}

export async function deleteUser(userId: string): Promise<boolean> {
  const users = await getUsers()
  const filtered = users.filter((u) => u.id !== userId)
  if (filtered.length === users.length) return false
  await set(STORAGE_KEYS.USERS, filtered)
  return true
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  const users = await getUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return false
  users[index] = { ...users[index], ...updates }
  await set(STORAGE_KEYS.USERS, users)
  return true
}

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

  let newRecord: InspectionRecord = {
    id, userId, username, vesselName, captainName, inspectionDate, status, items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

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

  if (typeof window !== "undefined" && navigator.onLine) {
    (async () => {
      try {
        const fullyUploadedRecord = await uploadRecordPhotosToStorage(newRecord);
        const records = await getInspectionRecords()

        // 🌟 KRİTİK KONTROL: Eğer kullanıcı bu süreçte kaydı yerelden sildiyse (idx < 0), buluta yazmayı iptal et!
        const idx = records.findIndex(r => r.id === id)
        if (idx >= 0) {
          records[idx] = fullyUploadedRecord;
          await set(STORAGE_KEYS.INSPECTION_RECORDS, records);
          await setDoc(doc(db, "inspection_records", id), fullyUploadedRecord);
        } else {
          console.log("⚠️ Kayıt silindiği için Firestore'a yazılmadı, Firestore'dan da temizleniyor.");
          try { await deleteDoc(doc(db, "inspection_records", id)) } catch (_) { }
        }
      } catch (e) {
        console.error("Arka plan bulut kaydı hatası:", e);
      }
    })();
  }

  return newRecord
}

export async function fetchGlobalInspectionRecords(): Promise<InspectionRecord[]> {
  try {
    if (typeof window !== "undefined" && !navigator.onLine) {
      return getInspectionRecords();
    }

    const q = query(collection(db, "inspection_records"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const records: InspectionRecord[] = [];
    querySnapshot.forEach((doc) => { records.push(doc.data() as InspectionRecord); });

    if (typeof window !== "undefined") {
      const deletedIds: string[] = (await get(STORAGE_KEYS.DELETED_IDS)) || []

      const localRecords = await getInspectionRecords()
      
      const merged = records.map(firestoreRecord => {
        const localRecord = localRecords.find(r => r.id === firestoreRecord.id)
        if (localRecord) {
          const localTime = new Date(localRecord.updatedAt).getTime()
          const firestoreTime = new Date(firestoreRecord.updatedAt).getTime()
          // If local record is newer (e.g., has unsynced photos), keep local
          if (localTime > firestoreTime) {
            return localRecord
          }
        }
        return firestoreRecord
      })

      const firestoreIds = new Set(records.map(r => r.id))
      const offlineOnly = localRecords.filter(r => !firestoreIds.has(r.id) && !deletedIds.includes(r.id))

      const finalRecords = [...merged, ...offlineOnly].filter(r => !deletedIds.includes(r.id))
      await set(STORAGE_KEYS.INSPECTION_RECORDS, finalRecords)
      return finalRecords
    }

    return records;
  } catch (error) {
    console.error("Veri çekilirken hata, lokale dönülüyor:", error);
    return getInspectionRecords();
  }
}

export async function getInspectionRecordsByUser(userId: string): Promise<InspectionRecord[]> {
  const records = await getInspectionRecords()
  return records.filter((r) => r.userId === userId)
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null
  const user = await get(STORAGE_KEYS.CURRENT_USER)
  return user ? user : null
}

export async function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return
  await set(STORAGE_KEYS.CURRENT_USER, user)
}

export async function logout() {
  await setCurrentUser(null)
}