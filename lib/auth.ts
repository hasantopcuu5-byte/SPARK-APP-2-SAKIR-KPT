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
  status: "completed" | "draft"
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

// Local storage keys
export const STORAGE_KEYS = {
  USERS: "spark_users",
  CURRENT_USER: "spark_current_user",
  INSPECTION_RECORDS: "spark_inspection_records",
}

// Initialize users in localStorage
export function initializeUsers() {
  const users = localStorage.getItem(STORAGE_KEYS.USERS)
  if (!users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_ADMIN]))
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
export function saveInspectionRecord(
  userId: string,
  username: string,
  vesselName: string,
  captainName: string,
  inspectionDate: string,
  items: any[],
): InspectionRecord {
  const records = getInspectionRecords()

  const newRecord: InspectionRecord = {
    id: `inspection-${Date.now()}`,
    userId,
    username,
    vesselName,
    captainName,
    inspectionDate,
    status: "completed",
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  records.push(newRecord)
  localStorage.setItem(STORAGE_KEYS.INSPECTION_RECORDS, JSON.stringify(records))
  return newRecord
}

// Get all inspection records
export function getInspectionRecords(): InspectionRecord[] {
  const records = localStorage.getItem(STORAGE_KEYS.INSPECTION_RECORDS)
  return records ? JSON.parse(records) : []
}

// Get inspection records by user
export function getInspectionRecordsByUser(userId: string): InspectionRecord[] {
  const records = getInspectionRecords()
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
