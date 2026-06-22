import { db } from "./firebase"
import { collection, addDoc, getDocs, query, orderBy, setDoc, doc, deleteDoc } from "firebase/firestore/lite"
import { get, set } from "idb-keyval"

// Authentication types and data
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

// Vessel names
export const VESSEL_NAMES = [
  "APRIL",
  "ARES",
  "BEAM",
  "CANAL",
  "COMET",
  "DALI",
  "DODO",
  "DREAM",
  "FAUN",
  "FLAT",
  "GIFT",
  "IDON",
  "JUST",
  "KRONOS",
  "LAKER",
  "ZEYNEP",
  "EMINE",
]

// Default admin user
export const DEFAULT_ADMIN: User = {
  id: "admin-001",
  username: "admin",
  password: "admin123",
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  createdAt: new Date().toISOString(),
}

// Varsayılan Enspektörler
export const DEFAULT_INSPECTORS: User[] = [
  { id: "user-ertan", username: "ertankose", password: "eK92!p", role: "user", firstName: "Ertan", lastName: "Köse", createdAt: new Date().toISOString() },
  { id: "user-onur", username: "onurbenzet", password: "oB47$x", role: "user", firstName: "Onur", lastName: "Benzet", createdAt: new Date().toISOString() },
  { id: "user-oktay", username: "oktaykaran", password: "oK81@m", role: "user", firstName: "Oktay", lastName: "Karan", createdAt: new Date().toISOString() },
  { id: "user-erdem", username: "erdemgur", password: "eG35#v", role: "user", firstName: "Erdem", lastName: "Gür", createdAt: new Date().toISOString() },
  { id: "user-ferhat", username: "ferhatsolmaz", password: "fS68&n", role: "user", firstName: "Ferhat", lastName: "Solmaz", createdAt: new Date().toISOString() }
]

// Local storage keys
export const STORAGE_KEYS = {
  USERS: "spark_users",
  CURRENT_USER: "spark_current_user",
  INSPECTION_RECORDS: "spark_inspection_records",
}

// Initialize users in localStorage
export function initializeUsers() {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS)
  let users: User[] = usersStr ? JSON.parse(usersStr) : []
  
  if (users.length === 0) {
    users.push(DEFAULT_ADMIN)
  }

  let modified = false;
  DEFAULT_INSPECTORS.forEach(inspector => {
    if (!users.find(u => u.username === inspector.username)) {
      users.push(inspector);
      modified = true;
    }
  });

  if (modified || !usersStr) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }
}

// Get all users
export function getUsers(): User[] {
  const users = localStorage.getItem(STORAGE_KEYS.USERS)
  return users ? JSON.parse(users) : [DEFAULT_ADMIN]
}

// Get user by username
export function getUserByUsername(username: string): User | null {
  const users = getUsers()
  return users.find((u) => u.username === username) || null
}

// Add new user
export function addUser(
  username: string,
  password: string,
  role: "admin" | "user" = "user",
  firstName?: string,
  lastName?: string,
): User | null {
  const users = getUsers()
  if (users.find((u) => u.username === username)) {
    return null // User already exists
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
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  return newUser
}

// Delete user
export function deleteUser(userId: string): boolean {
  const users = getUsers()
  const filtered = users.filter((u) => u.id !== userId)
  if (filtered.length === users.length) return false

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered))
  return true
}

// Update user
export function updateUser(userId: string, updates: Partial<User>): boolean {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return false

  users[index] = { ...users[index], ...updates }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  return true
}

// Save inspection record
export async function saveInspectionRecord(
  userId: string,
  username: string,
  vesselName: string,
  captainName: string,
  inspectionDate: string,
  items: any[],
  status: "completed" | "in_progress" = "completed",
  recordId?: string,
  originalCreatedAt?: string
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
    createdAt: originalCreatedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Firebase'e beklemeden yaz (offline ise donmayı engeller)
  setDoc(doc(db, "inspection_records", id), newRecord)
    .then(() => console.log("Document locally written/updated with ID: ", id))
    .catch((e) => console.error("Error adding document: ", e));

  // Lokal depolamayı güncelle
  const records = await getInspectionRecords()
  const existingIndex = records.findIndex(r => r.id === id)
  if (existingIndex >= 0) {
    records[existingIndex] = newRecord
  } else {
    records.push(newRecord)
  }
  await set(STORAGE_KEYS.INSPECTION_RECORDS, JSON.stringify(records))
  
  return newRecord
}

// Delete inspection record
export async function deleteInspectionRecord(recordId: string): Promise<boolean> {
  // Firebase'den sil
  try {
    await deleteDoc(doc(db, "inspection_records", recordId));
    console.log("Document successfully deleted: ", recordId);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }

  // Lokal depolamayı güncelle
  const records = await getInspectionRecords()
  const filtered = records.filter((r) => r.id !== recordId)
  if (filtered.length === records.length) return false

  await set(STORAGE_KEYS.INSPECTION_RECORDS, JSON.stringify(filtered))
  return true
}

// Fetch all inspection records from Firestore
export async function fetchGlobalInspectionRecords(): Promise<InspectionRecord[]> {
  try {
    const q = query(collection(db, "inspection_records"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const recordsMap = new Map<string, InspectionRecord>();
    querySnapshot.forEach((doc) => {
      const data = doc.data() as InspectionRecord;
      // Eğer aynı ID'ye sahip birden fazla kayıt varsa (eski orphaned doc vs.), ilk geleni (en yeniyi) tutarız.
      if (!recordsMap.has(data.id)) {
        recordsMap.set(data.id, data);
      }
    });
    return Array.from(recordsMap.values());
  } catch (error) {
    console.error("Error fetching inspection records:", error);
    // Firebase başarısız olursa lokaldekileri döndür
    return await getInspectionRecords();
  }
}

// Get all inspection records
export async function getInspectionRecords(): Promise<InspectionRecord[]> {
  const recordsStr = await get<string>(STORAGE_KEYS.INSPECTION_RECORDS)
  if (!recordsStr) return []
  
  try {
    const records: InspectionRecord[] = JSON.parse(recordsStr)
    const recordsMap = new Map<string, InspectionRecord>();
    records.forEach(r => {
      if (!recordsMap.has(r.id)) recordsMap.set(r.id, r)
    })
    return Array.from(recordsMap.values());
  } catch (e) {
    return []
  }
}

// Get inspection records by user
export async function getInspectionRecordsByUser(userId: string): Promise<InspectionRecord[]> {
  const records = await getInspectionRecords()
  return records.filter((r) => r.userId === userId)
}

// Get current user
export function getCurrentUser(): User | null {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return user ? JSON.parse(user) : null
}

// Set current user
export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

// Logout
export function logout() {
  setCurrentUser(null)
}
