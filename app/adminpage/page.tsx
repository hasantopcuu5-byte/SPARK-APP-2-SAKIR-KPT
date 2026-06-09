"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus, Trash2, Eye, EyeOff, Edit2, Check, X } from "lucide-react"
import { addUser, deleteUser, getUsers, initializeUsers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState("")

  // Yeni Ekleme Stateleri
  const [inspectorFirstName, setInspectorFirstName] = useState("")
  const [inspectorLastName, setInspectorLastName] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Düzenleme Stateleri
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [showEditPassword, setShowEditPassword] = useState(false)

  useEffect(() => {
    initializeUsers()
    setUsers(getUsers())
  }, [])

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!inspectorFirstName || !inspectorLastName || !newUsername || !newPassword) {
      setError("Tüm alanları doldurunuz")
      return
    }

    const newUser = addUser(newUsername, newPassword, "user", inspectorFirstName, inspectorLastName)
    if (!newUser) {
      setError("Kullanıcı adı zaten var veya bir hata oluştu")
      return
    }

    setUsers(getUsers())
    setInspectorFirstName("")
    setInspectorLastName("")
    setNewUsername("")
    setNewPassword("")
  }

  const handleDeleteUser = (userId: string) => {
    if (deleteUser(userId)) {
      setUsers(getUsers())
      setEditingId(null)
    }
  }

  const startEdit = (user: User) => {
    setEditingId(user.id)
    setEditFirstName(user.firstName || "")
    setEditLastName(user.lastName || "")
    setEditUsername(user.username)
    setEditPassword(user.password)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Üst Kısım */}
      <header className="sticky top-0 z-40 bg-navy text-navy-foreground shadow-lg px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={() => router.push("/")}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-bold">Yönetim Paneli (Admin)</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
        
        {/* Enspektör Ekleme Kartı */}
        <Card className="p-5 shadow-sm">
          <form onSubmit={handleAddUser} className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Yeni Enspektör Ekle</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Adı</label>
                <Input value={inspectorFirstName} onChange={(e) => setInspectorFirstName(e.target.value)} placeholder="Örn: Hasan" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Soyadı</label>
                <Input value={inspectorLastName} onChange={(e) => setInspectorLastName(e.target.value)} placeholder="Örn: Topcu" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Sisteme Giriş Adı</label>
                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Örn: hasan.topcu" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Giriş Şifresi</label>
                <div className="relative">
                  <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
                  <button type="button" onMouseDown={() => setShowNewPassword(true)} onMouseUp={() => setShowNewPassword(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-status-deficiency">{error}</p>}

            <Button type="submit" className="mt-2 bg-status-ok text-white hover:bg-status-ok/90">
              <UserPlus className="size-4 mr-2" />
              Kaydet
            </Button>
          </form>
        </Card>

        {/* Kayıtlı Enspektörler Listesi */}
        <Card className="p-5 shadow-sm flex flex-col gap-3">
          <h3 className="font-semibold text-foreground border-b pb-2">Kayıtlı Enspektörler</h3>
          
          <div className="flex flex-col gap-2">
            {users.filter((u) => u.role === "user").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz kayıtlı enspektör yok.</p>
            ) : (
              users.filter((u) => u.role === "user").map((u) => (
                <div key={u.id} className="rounded-lg border bg-secondary/20 p-3">
                  {editingId === u.id ? (
                    <div className="flex flex-col gap-2">
                      <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="Adı" className="h-9 text-sm" />
                      <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Soyadı" className="h-9 text-sm" />
                      <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Kullanıcı Adı" className="h-9 text-sm" />
                      <Input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Şifre" className="h-9 text-sm" />
                      
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" className="flex-1 bg-status-ok hover:bg-status-ok/90">
                          <Check className="size-3 mr-1" /> Güncelle
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="flex-1" onClick={cancelEdit}>
                          <X className="size-3 mr-1" /> İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">Kullanıcı Adı: {u.username}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(u)} className="text-muted-foreground hover:text-foreground">
                          <Edit2 className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="text-status-deficiency hover:bg-status-deficiency/10">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

      </main>
    </div>
  )
}
