import type React from "react"

import { useState } from "react"
import { useAuth } from "../../lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || "Email hoặc mật khẩu không đúng")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập QN Edu System</CardTitle>
          <CardDescription className="text-center">
            Nhập thông tin để truy cập hệ thống quản lý trung tâm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Tài khoản demo:</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Chủ trung tâm:</strong> owner@qne.edu.vn / 123456
              </p>
              <p>
                <strong>Giáo viên:</strong> teacher@qne.edu.vn / 123456
              </p>
              <p>
                <strong>Học sinh:</strong> student@qne.edu.vn / 123456
              </p>
              <p>
                <strong>Phụ huynh:</strong> parent@qne.edu.vn / 123456
              </p>
              <p>
                <strong>Quản trị viên:</strong> admin@qne.edu.vn / 123456
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
