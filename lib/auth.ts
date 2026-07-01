import { db, storage } from "./firebase"
import { collection, getDocs, query, orderBy, setDoc, doc, deleteDoc } from "firebase/firestore/lite"
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
  password: "admin123", // Kriptolanacak
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  createdAt: new Date().toISOString(),
}

// ENSPEKTÖRLER (Kriptolanarak veritabanına yazılacak)
export const DEFAULT_INSPECTORS: User[] = [
  { id: "user-oktay", username: "oktay.karan", password: "Spark2026*", role: "user", firstName: "Oktay", lastName: "Karan", createdAt: new Date().toISOString() },
  { id: "user-onur", username: "onur.benzet", password: "Spark2026*", role: "user", firstName: "Onur", lastName: "Benzet", createdAt: new Date().toISOString() },
  { id: "user-ertan", username: "ertan.kose", password: "Spark2026*", role: "user", firstName: "Ertan", lastName: "Köse", createdAt: new Date().toISOString() },
  { id: "user-erdem", username: "erdem.gur", password: "Spark2026*", role: "user", firstName: "Erdem", lastName: "Gür", createdAt: new Date().toISOString() },
  { id: "user-ferhat", username: "ferhat.solmaz", password: "Spark2026*", role: "user", firstName: "Ferhat", lastName: "Solmaz", createdAt: new Date().toISOString() }
]

export const STORAGE_KEYS = {
  USERS: "spark_users",
  CURRENT_USER: "spark_current_user",
  INSPECTION_RECORDS: "spark_inspection_records",
  DELETED_IDS: "spark_deleted_record_ids",
  SYNCED_IDS: "spark_synced_record_ids",
}

// --- ŞİFRELEME VE KULLANICI (AUTH) FONKSİYONLARI ---

export async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return password;
  }
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function initializeUsers() {
  if (typeof window === "undefined") return;
  let users = await get(STORAGE_KEYS.USERS);
  if (!users) users = [];

  const defaultUsers = [DEFAULT_ADMIN, ...DEFAULT_INSPECTORS];
  let updated = false;

  for (const defaultUser of defaultUsers) {
    if (!users.find((u: User) => u.username === defaultUser.username)) {
      const hashedPassword = await hashPassword(defaultUser.password);
      users.push({ ...defaultUser, password: hashedPassword });
      updated = true;
    }
  }
  if (updated) await set(STORAGE_KEYS.USERS, users);
}

export async function getUsers(): Promise<User[]> {
  if (typeof window === "undefined") return [DEFAULT_ADMIN]
  const users = await get(STORAGE_KEYS.USERS)
  return users ? users : [DEFAULT_ADMIN]
}

export async function verifyUser(username: string, plainPassword: string): Promise<User | null> {
  const users = await getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return null;

  const hashedInput = await hashPassword(plainPassword);
  if (user.password === hashedInput) return user;

  return null;
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

// --- RAPOR KAYIT VE ÇEKME FONKSİYONLARI ---

export async function getInspectionRecords(): Promise<InspectionRecord[]> {
  if (typeof window === "undefined") return []
  const records = await get(STORAGE_KEYS.INSPECTION_RECORDS)
  return records ? records : []
}

export async function deleteInspectionRecord(recordId: string): Promise<boolean> {
  if (typeof window === "undefined") return false
  const records = await getInspectionRecords()
  const filtered = records.filter(r => r.id !== recordId)
  await set(STORAGE_KEYS.INSPECTION_RECORDS, filtered)

  const deletedIds: string[] = (await get(STORAGE_KEYS.DELETED_IDS)) || []
  if (!deletedIds.includes(recordId)) {
    deletedIds.push(recordId)
    await set(STORAGE_KEYS.DELETED_IDS, deletedIds)
  }

  if (navigator.onLine) {
    try {
      await deleteDoc(doc(db, "inspection_records", recordId))
    } catch (error) {
      console.error("Kayıt buluttan silinirken hata oluştu:", error)
      return false
    }
  }
  return true
}

async function uploadRecordPhotosToStorage(record: InspectionRecord): Promise<InspectionRecord> {
  const updatedItems = await Promise.all(record.items.map(async (item) => {
    if (!item.photos || item.photos.length === 0) return item;
    const updatedPhotos = await Promise.all(item.photos.map(async (photo: string) => {
      if (photo.startsWith("data:image/")) {
        try {
          const base64Data = photo.split(',')[1];
          const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
          if (!apiKey) return photo;
          const formData = new FormData();
          formData.append("image", base64Data);
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
          const data = await response.json();
          if (data && data.success) return data.data.url;
          return photo;
        } catch (error) {
          return photo;
        }
      }
      return photo;
    }));
    return { ...item, photos: updatedPhotos };
  }));
  return { ...record, items: updatedItems };
}

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

export async function saveInspectionRecord(
  userId: string, username: string, vesselName: string, captainName: string, inspectionDate: string, items: any[], status: "completed" | "in_progress" = "completed", recordId?: string
): Promise<{ record: InspectionRecord; cloudSuccess: boolean; error?: any }> {
  const id = recordId || `inspection-${Date.now()}`;
  let newRecord: InspectionRecord = {
    id, userId, username, vesselName, captainName, inspectionDate, status, items,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    const records = await getInspectionRecords()
    const existingIndex = records.findIndex(r => r.id === id)
    if (existingIndex >= 0) {
      newRecord.createdAt = records[existingIndex].createdAt
      records[existingIndex] = newRecord
    } else records.push(newRecord)
    await set(STORAGE_KEYS.INSPECTION_RECORDS, records)
  }

  if (typeof window !== "undefined" && navigator.onLine) {
    try {
      const uploadPromise = async () => {
        const fullyUploadedRecord = await uploadRecordPhotosToStorage(newRecord);
        const records = await getInspectionRecords()
        const idx = records.findIndex(r => r.id === id)
        if (idx >= 0) {
          records[idx] = fullyUploadedRecord;
          await set(STORAGE_KEYS.INSPECTION_RECORDS, records);
          await setDoc(doc(db, "inspection_records", id), fullyUploadedRecord);
        } else {
          try { await deleteDoc(doc(db, "inspection_records", id)) } catch (_) { }
        }
      };
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Zaman aşımı.")), 15000));
      await Promise.race([uploadPromise(), timeoutPromise]);
    } catch (e) {
      return { record: newRecord, cloudSuccess: false, error: e };
    }
  }
  return { record: newRecord, cloudSuccess: true };
}

export async function fetchGlobalInspectionRecords(): Promise<InspectionRecord[]> {
  try {
    if (typeof window !== "undefined" && !navigator.onLine) return getInspectionRecords();
    const q = query(collection(db, "inspection_records"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const records: InspectionRecord[] = [];
    querySnapshot.forEach((doc) => { records.push(doc.data() as InspectionRecord); });

    if (typeof window !== "undefined") {
      const deletedIds: string[] = (await get(STORAGE_KEYS.DELETED_IDS)) || []
      const syncedIdsArray: string[] = (await get(STORAGE_KEYS.SYNCED_IDS)) || []
      const syncedIds = new Set(syncedIdsArray)
      const localRecords = await getInspectionRecords()

      const merged = records.map(firestoreRecord => {
        syncedIds.add(firestoreRecord.id)
        const localRecord = localRecords.find(r => r.id === firestoreRecord.id)
        if (localRecord && new Date(localRecord.updatedAt).getTime() > new Date(firestoreRecord.updatedAt).getTime()) {
          return localRecord
        }
        return firestoreRecord
      })

      const firestoreIds = new Set(records.map(r => r.id))
      const offlineOnly = localRecords.filter(r => {
        if (firestoreIds.has(r.id)) return false;
        if (deletedIds.includes(r.id)) return false;
        if (syncedIds.has(r.id)) return false;
        return true;
      })

      const finalRecords = [...merged, ...offlineOnly].filter(r => !deletedIds.includes(r.id))
      await set(STORAGE_KEYS.SYNCED_IDS, Array.from(syncedIds))
      await set(STORAGE_KEYS.INSPECTION_RECORDS, finalRecords)
      return finalRecords
    }
    return records;
  } catch (error) {
    return getInspectionRecords();
  }
}

export async function getInspectionRecordsByUser(userId: string): Promise<InspectionRecord[]> {
  const records = await getInspectionRecords()
  return records.filter((r) => r.userId === userId)
}