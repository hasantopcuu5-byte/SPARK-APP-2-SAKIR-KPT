"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LogIn, UserPlus, Trash2, Eye, EyeOff, Edit2, Check, X } from "lucide-react"
import { getUserByUsername, addUser, deleteUser, getUsers, setCurrentUser, initializeUsers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export function AuthScreen({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) {
  const [tab, setTab] = useState<"login" | "admin">("login")
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [inspectorFirstName, setInspectorFirstName] = useState("")
  const [inspectorLastName, setInspectorLastName] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!loginUsername || !loginPassword) {
      setError("Kullanıcı adı ve şifre gereklidir")
      return
    }

    const user = getUserByUsername(loginUsername)
    if (!user) {
      setError("Kullanıcı bulunamadı")
      return
    }

    if (user.password !== loginPassword) {
      setError("Şifre yanlış")
      return
    }

    setCurrentUser(user)
    onAuthSuccess(user)
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!inspectorFirstName || !inspectorLastName || !newUsername || !newPassword) {
      setError("Tüm alanları doldurunuz")
      return
    }

    const existingUser = getUserByUsername(newUsername)
    if (existingUser) {
      setError("Bu kullanıcı adı zaten mevcut")
      return
    }

    const newUser = addUser(newUsername, newPassword, "user", inspectorFirstName, inspectorLastName)
    if (!newUser) {
      setError("Kullanıcı eklenirken hata oluştu")
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
    setEditFirstName("")
    setEditLastName("")
    setEditUsername("")
    setEditPassword("")
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md gap-0 overflow-hidden p-0">
        <div className="border-b bg-navy/10 px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">⚓ SPARK App</h1>
          <p className="text-sm text-muted-foreground">Gemi Denetim Sistemi</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "admin")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="login"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              <LogIn className="mr-2 size-4" />
              Admin Girişi
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              <UserPlus className="mr-2 size-4" />
              Yönetim
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="gap-4 p-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Kullanıcı Adı</label>
                <Input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin"
                  className="h-11 rounded-lg bg-secondary/40"
                  autoComplete="username"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Şifre</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-lg bg-secondary/40 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm font-medium text-status-deficiency">{error}</p>}

              <Button type="submit" className="h-11 rounded-lg bg-navy font-semibold text-white hover:bg-navy/90">
                Giriş Yap
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-gold/10 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Demo Girişi:</p>
              <p>Kullanıcı: <code className="text-gold">admin</code></p>
              <p>Şifre: <code className="text-gold">admin123</code></p>
            </div>
          </TabsContent>

          {/* Admin/Management Tab */}
          <TabsContent value="admin" className="gap-4 p-6">
            <form onSubmit={handleAddUser} className="flex flex-col gap-4 border-b pb-6">
              <h3 className="font-semibold text-foreground">Yeni Enspektör Ekle</h3>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Enspektör Adı</label>
                <Input
                  type="text"
                  value={inspectorFirstName}
                  onChange={(e) => setInspectorFirstName(e.target.value)}
                  placeholder="Adını girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Enspektör Soyadı</label>
                <Input
                  type="text"
                  value={inspectorLastName}
                  onChange={(e) => setInspectorLastName(e.target.value)}
                  placeholder="Soyadını girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Kullanıcı Adı</label>
                <Input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Kullanıcı adı girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Şifre</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-lg bg-secondary/40 pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowNewPassword(true)}
                    onMouseUp={() => setShowNewPassword(false)}
                    onMouseLeave={() => setShowNewPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm font-medium text-status-deficiency">{error}</p>}

              <Button type="submit" className="h-11 rounded-lg bg-status-ok font-semibold text-white hover:bg-status-ok/90">
                Enspektör Ekle
              </Button>
            </form>

            {/* Users List */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-foreground">Kayıtlı Enspektörler</h3>
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {users.filter((u) => u.role === "user").length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz enspektör kaydı bulunmamaktadır.</p>
                ) : (
                  users.filter((u) => u.role === "user").map((u) => (
                    <div key={u.id} className="rounded-lg bg-secondary/30 p-3">
                      {editingId === u.id ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            type="text"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            placeholder="Adı"
                            className="h-9 rounded-lg bg-secondary/60 text-sm"
                          />
                          <Input
                            type="text"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            placeholder="Soyadı"
                            className="h-9 rounded-lg bg-secondary/60 text-sm"
                          />
                          <Input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Kullanıcı adı"
                            className="h-9 rounded-lg bg-secondary/60 text-sm"
                          />
                          <div className="relative">
                            <Input
                              type={showEditPassword ? "text" : "password"}
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="Şifre"
                              className="h-9 rounded-lg bg-secondary/60 text-sm pr-10"
                            />
                            <button
                              type="button"
                              onMouseDown={() => setShowEditPassword(true)}
                              onMouseUp={() => setShowEditPassword(false)}
                              onMouseLeave={() => setShowEditPassword(false)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs hover:text-foreground"
                            >
                              {showEditPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            </button>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-8 flex-1 bg-status-ok text-white hover:bg-status-ok/90"
                            >
                              <Check className="size-3 mr-1" />
                              Kaydet
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 flex-1"
                              onClick={cancelEdit}
                            >
                              <X className="size-3 mr-1" />
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(u)}
                              className="flex size-8 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                              title="Düzenle"
                            >
                              <Edit2 className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="flex size-8 items-center justify-center rounded-lg bg-status-deficiency/20 text-status-deficiency transition-colors hover:bg-status-deficiency/30"
                              title="Sil"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
