"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LogIn, UserPlus, Trash2, Eye, EyeOff } from "lucide-react"
import { getUserByUsername, addUser, deleteUser, getUsers, setCurrentUser, initializeUsers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export function AuthScreen({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) {
  const [tab, setTab] = useState<"login" | "admin">("login")
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [error, setError] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  useEffect(() => {
    initializeUsers()
    setUsers(getUsers())
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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

    if (!newUsername || !newPassword) {
      setError("Kullanıcı adı ve şifre gereklidir")
      return
    }

    if (adminPassword !== "admin123") {
      setError("Admin şifresi yanlış")
      return
    }

    const newUser = addUser(newUsername, newPassword, "user")
    if (!newUser) {
      setError("Bu kullanıcı adı zaten mevcut")
      return
    }

    setUsers(getUsers())
    setNewUsername("")
    setNewPassword("")
    setAdminPassword("")
  }

  const handleDeleteUser = (userId: string) => {
    if (deleteUser(userId)) {
      setUsers(getUsers())
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md gap-0 overflow-hidden p-0">
        <div className="border-b bg-navy/10 px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">SPARK App</h1>
          <p className="text-sm text-muted-foreground">Gemi Denetim Sistemi</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "admin")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="login"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              <LogIn className="mr-2 size-4" />
              Giriş
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              <UserPlus className="mr-2 size-4" />
              Admin
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
                  placeholder="Kullanıcı adınızı girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Şifre</label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
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

          {/* Admin Tab */}
          <TabsContent value="admin" className="gap-4 p-6">
            <form onSubmit={handleAddUser} className="flex flex-col gap-4 border-b pb-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Admin Şifresi</label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin şifresini girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Yeni Kullanıcı Adı</label>
                <Input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Kullanıcı adını girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Şifre</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Şifreyi girin"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              {error && <p className="text-sm font-medium text-status-deficiency">{error}</p>}

              <Button type="submit" className="h-11 rounded-lg bg-status-ok font-semibold text-white hover:bg-status-ok/90">
                Kullanıcı Ekle
              </Button>
            </form>

            {/* Users List */}
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-foreground">Mevcut Kullanıcılar</h3>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{u.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.role === "admin" ? "🔐 Admin" : "👤 Kullanıcı"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            [u.id]: !prev[u.id],
                          }))
                        }
                        className="flex size-8 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {showPasswords[u.id] ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                      {showPasswords[u.id] && (
                        <span className="text-xs font-mono text-muted-foreground">{u.password}</span>
                      )}
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="flex size-8 items-center justify-center rounded-lg bg-status-deficiency/20 text-status-deficiency transition-colors hover:bg-status-deficiency/30"
                          title="Kullanıcıyı Sil"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
