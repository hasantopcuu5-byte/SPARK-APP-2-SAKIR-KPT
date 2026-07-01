"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogIn, Eye, EyeOff } from "lucide-react"
// HATA BURADAYDI: getUserByUsername yerine verifyUser ekledik
import { verifyUser, setCurrentUser, initializeUsers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export function AuthScreen({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) {
  const router = useRouter()
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    initializeUsers()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!loginUsername || !loginPassword) {
      setError("Kullanıcı adı ve şifre gereklidir")
      return
    }

    // Yeni güvenli (kriptolu) doğrulama fonksiyonumuzu kullanıyoruz
    const user = await verifyUser(loginUsername, loginPassword)

    if (!user) {
      setError("Hatalı kullanıcı adı veya şifre")
      return
    }

    await setCurrentUser(user)

    // SİSTEMİN AKILLI YÖNLENDİRMESİ
    if (user.role === "admin") {
      router.push("/adminpage") // Adminse admin paneline at
    } else {
      onAuthSuccess(user) // Enspektörse uygulamayı başlat
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md gap-0 overflow-hidden p-0">
        <div className="flex flex-col items-center border-b bg-navy/10 px-6 py-4 text-center">
          <img src="/spark_logo1.png" alt="Company Logo" className="h-12 w-auto object-contain mb-1" />
          <p className="text-sm text-muted-foreground">Gemi Denetim Sistemi</p>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center text-lg font-semibold text-navy">
            <LogIn className="mr-2 size-5" />
            Sisteme Giriş Yapın
          </div>

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

            {error && <p className="text-sm font-medium text-status-deficiency">{error}</p>}

            <Button type="submit" className="h-11 mt-2 rounded-lg bg-navy font-semibold text-white hover:bg-navy/90">
              Giriş Yap
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}