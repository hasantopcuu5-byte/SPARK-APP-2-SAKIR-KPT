"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react"
import { getUserByUsername, setCurrentUser, initializeUsers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export function AuthScreen({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "admin">("login")
  
  // Kullanıcı Girişi için
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Admin Girişi için
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  
  const [error, setError] = useState("")

  useEffect(() => {
    initializeUsers()
  }, [])

  // Kullanıcı Giriş İşlemi
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!loginUsername || !loginPassword) {
      setError("Kullanıcı adı ve şifre gereklidir")
      return
    }

    const user = getUserByUsername(loginUsername)
    if (!user || user.password !== loginPassword) {
      setError("Hatalı kullanıcı adı veya şifre")
      return
    }

    setCurrentUser(user)
    onAuthSuccess(user)
  }

  // Admin Giriş İşlemi (Yeni Sayfaya Yönlendirir)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Admin şifresini şimdilik admin / 1234 yaptık. Değiştirebilirsin.
    if (adminUsername === "admin" && adminPassword === "1234") {
      router.push("/adminpage")
    } else {
      setError("Hatalı admin kullanıcı adı veya şifre")
    }
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
            {/* Sekme İsimleri Değişti */}
            <TabsTrigger
              value="login"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              <LogIn className="mr-2 size-4" />
              Kullanıcı Girişi
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent"
            >
              <UserPlus className="mr-2 size-4" />
              Admin Girişi
            </TabsTrigger>
          </TabsList>

          {/* KULLANICI GİRİŞİ BÖLÜMÜ */}
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-lg bg-secondary/40 pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && tab === "login" && <p className="text-sm font-medium text-status-deficiency">{error}</p>}

              <Button type="submit" className="h-11 rounded-lg bg-navy font-semibold text-white hover:bg-navy/90">
                Giriş Yap
              </Button>
            </form>
          </TabsContent>

          {/* ADMİN GİRİŞİ BÖLÜMÜ (YENİ) */}
          <TabsContent value="admin" className="gap-4 p-6">
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Kullanıcı Adı</label>
                <Input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Admin kullanıcı adı"
                  className="h-11 rounded-lg bg-secondary/40"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Şifre</label>
                <div className="relative">
                  <Input
                    type={showAdminPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-lg bg-secondary/40 pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowAdminPassword(true)}
                    onMouseUp={() => setShowAdminPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAdminPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && tab === "admin" && <p className="text-sm font-medium text-status-deficiency">{error}</p>}

              <Button type="submit" className="h-11 rounded-lg bg-gold font-semibold text-navy-foreground hover:bg-gold/90">
                Giriş Yap
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
