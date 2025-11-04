import React, { useState, useEffect } from "react"
import { useAuth } from "../../lib/auth"
import { authService } from "../../services/common/auth/auth.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, Mail, Phone, Shield, Lock, Camera, Calendar, RotateCcw, Eye, EyeOff, VenusAndMars, UserCircle } from "lucide-react"
import { toast } from "sonner"

export function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    avatar: "",
    gender: "",
    birthDate: "",
  })
  const [initialData, setInitialData] = useState({
    fullName: "",
    phone: "",
    avatar: "",
    gender: "",
    birthDate: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (user) {
      const initialFormData = {
        fullName: user.fullName || "",
        phone: user.phone || "",
        avatar: (user as any).avatar || "",
        gender: (user as any).gender || "",
        birthDate: (user as any).birthDate 
          ? new Date((user as any).birthDate).toISOString().split('T')[0]
          : "",
      }
      setFormData(initialFormData)
      setInitialData(initialFormData)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setProfileError("")
    setProfileSuccess("")

    try {
      // Chỉ gửi các field có giá trị (không phải empty string hoặc undefined)
      const updateData: any = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        avatar: formData.avatar.trim(),
        gender: formData.gender?.trim(),
        birthDate: formData.birthDate?.trim(),
      }
      
      if (formData.fullName && formData.fullName.trim()) {
        updateData.fullName = formData.fullName.trim()
      }
      
      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim()
      }
      
      if (formData.avatar && formData.avatar.trim()) {
        updateData.avatar = formData.avatar.trim()
      }
      
      // Gender chỉ gửi nếu là một trong các giá trị hợp lệ và không phải empty string
      const validGenders = ['MALE', 'FEMALE', 'OTHER']
      const trimmedGender = formData.gender?.trim()
      if (trimmedGender && trimmedGender !== '' && validGenders.includes(trimmedGender)) {
        updateData.gender = trimmedGender
      }
      // KHÔNG gửi gender nếu không có giá trị hợp lệ
      
      // BirthDate chỉ gửi nếu có giá trị hợp lệ (không phải empty string)
      const trimmedBirthDate = formData.birthDate?.trim()
      if (trimmedBirthDate && trimmedBirthDate !== '') {
        updateData.birthDate = trimmedBirthDate
      }
      // KHÔNG gửi birthDate nếu không có giá trị

      await authService.updateProfile(updateData)
      toast.success("Cập nhật profile thành công")
      // Cập nhật initialData sau khi submit thành công
      setInitialData(formData)
    } catch (err: any) {
      console.log(err) // Debug log
      toast.error("cập nhật profile thất bại")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialData)
    setProfileError("")
    setProfileSuccess("")
    toast.info("Đã khôi phục dữ liệu ban đầu")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const oldPassword = formData.get("oldPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp")
      setPasswordLoading(false)
      return
    }

    try {
      await authService.changePassword({
        oldPassword,
        newPassword,
      })
      toast.success("Đổi mật khẩu thành công")
      form.reset()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Đổi mật khẩu thất bại"
      setPasswordError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý tài khoản</CardTitle>
          <CardDescription>
            Cập nhật thông tin cá nhân và thay đổi mật khẩu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Đổi mật khẩu
              </TabsTrigger>
            </TabsList>

            {/* Tab Thông tin cá nhân */}
            <TabsContent value="profile" className="space-y-4 mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-4 border-b">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={formData.avatar || '/placeholder.svg'}
                          alt="Profile"
                        />
                        <AvatarFallback className="text-lg">
                          {formData.fullName
                            ? formData.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)
                            : user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-primary-foreground" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setFormData({
                                ...formData,
                                avatar: event.target?.result as string,
                              });
                              setIsUploading(false);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <Label
                        htmlFor="avatar-upload"
                        className="cursor-pointer text-sm text-primary hover:text-primary/80"
                      >
                        {isUploading ? 'Đang tải...' : 'Cập nhật ảnh'}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG hoặc GIF. Tối đa 3MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <Input
                      id="fullName"
                      value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Ngày sinh</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            birthDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <VenusAndMars className="h-4 w-4 text-muted-foreground" />
                      </div>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Vai trò</Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="role"
                        value={user.role}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>

                {profileError && (
                  <Alert variant="destructive">
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}

                {profileSuccess && (
                  <Alert>
                    <AlertDescription>{profileSuccess}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Khôi phục
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cập nhật thông tin
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Tab Đổi mật khẩu */}
            <TabsContent value="password" className="space-y-4 mt-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      name="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu cũ"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert>
                    <AlertDescription>{passwordSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full"
                >
                  {passwordLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Đổi mật khẩu
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}