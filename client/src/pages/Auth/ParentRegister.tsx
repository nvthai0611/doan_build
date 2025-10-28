import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, CheckCircle, Calendar, UserPlus, X, Baby, AlertCircle } from "lucide-react"
import { authService } from "../../services/common/auth/auth.service"
import { useToast } from "../../hooks/use-toast"

interface Child {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
}

export function ParentRegister() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    birthDate: "",
    gender: "",
  })
  const [children, setChildren] = useState<Child[]>([
    { id: crypto.randomUUID(), fullName: "", dateOfBirth: "", gender: "" }
  ])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleGenderChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    })
  }

  const addChild = () => {
    setChildren([...children, { id: crypto.randomUUID(), fullName: "", dateOfBirth: "", gender: "" }])
  }

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(children.filter(child => child.id !== id))
    }
  }

  const updateChild = (id: string, field: keyof Omit<Child, 'id'>, value: string) => {
    setChildren(children.map(child => 
      child.id === id ? { ...child, [field]: value } : child
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (!formData.gender) {
      setError("Vui lòng chọn giới tính")
      return
    }

    if (!formData.birthDate) {
      setError("Vui lòng nhập ngày sinh")
      return
    }

    // Validate children
    if (children.length === 0) {
      setError("Vui lòng thêm ít nhất 1 con")
      return
    }

    const invalidChild = children.find(child => !child.fullName || !child.dateOfBirth || !child.gender)
    if (invalidChild) {
      setError("Vui lòng điền đầy đủ thông tin cho tất cả các con")
      return
    }

    setLoading(true)

    try {
      const result = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        children: children.map(({ id, ...child }) => child), // Remove id before sending
      })

      setSuccess(true)
      setError("")
      
      // Show success toast
      toast({
        title: "Đăng ký thành công!",
        description: `Đã tạo tài khoản cho bạn và ${children.length} con. Đang chuyển đến trang đăng nhập...`,
        variant: "default",
      })
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth/login/family")
      }, 2000)
    } catch (err: any) {
      console.error("Registration error:", err)
      
      const errorMessage = err.response?.message || err.message || "Đăng ký thất bại. Vui lòng thử lại."
      const errorDetails = err.response?.error || ""
      
      setError(errorMessage)
      
      // Show error toast
      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Log chi tiết lỗi để debug
      if (err.response?.data) {
        console.error("Server error response:", err.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Gradient Background - Blue/Cyan Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyem0wIDJ2MjBjNS41MjMgMCAxMC00LjQ3NyAxMC0xMFMzNi41MjMgMTYgMzYgMTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating Orbs - Blue/Cyan */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-sky-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/auth/login/family")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-slate-900/90 transition-all shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-2xl my-8">
        {/* Glass Morphism Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transform transition-all duration-500">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Đăng ký
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tạo tài khoản phụ huynh mới
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="mb-5 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                Đăng ký thành công! Đang chuyển đến trang đăng nhập...
              </AlertDescription>
            </Alert>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Full Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name Input */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tên tài khoản <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="username123"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Row 2: Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Birth Date & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Birth Date Input */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày sinh <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Gender Select */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Giới tính <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.gender} onValueChange={handleGenderChange} required>
                  <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all">
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

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-slate-700 my-6"></div>

            {/* Children Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-blue-600" />
                  <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Thông tin con <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Button
                  type="button"
                  onClick={addChild}
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Thêm con
                </Button>
              </div>

              {/* Children List */}
              <div className="space-y-3">
                {children.map((child, index) => (
                  <div 
                    key={child.id} 
                    className="p-4 border-2 border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50/30 dark:bg-blue-950/10 space-y-3"
                  >
                    {/* Child Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Con {index + 1}
                      </h4>
                      {children.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChild(child.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Child Name */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">
                        Họ và tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Ví dụ: Nguyễn Văn B"
                        value={child.fullName}
                        onChange={(e) => updateChild(child.id, 'fullName', e.target.value)}
                        required
                        className="h-10 bg-white dark:bg-slate-800"
                      />
                    </div>

                    {/* Child Birth Date & Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Ngày sinh <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={child.dateOfBirth}
                          onChange={(e) => updateChild(child.id, 'dateOfBirth', e.target.value)}
                          required
                          className="h-10 bg-white dark:bg-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Giới tính <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={child.gender} 
                          onValueChange={(value) => updateChild(child.id, 'gender', value)}
                          required
                        >
                          <SelectTrigger className="h-10 bg-white dark:bg-slate-800">
                            <SelectValue placeholder="Chọn" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Nam</SelectItem>
                            <SelectItem value="FEMALE">Nữ</SelectItem>
                            <SelectItem value="OTHER">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                * Vui lòng thêm ít nhất 1 con. Bạn có thể thêm nhiều con bằng cách nhấn "Thêm con".
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="rounded-xl border-red-500 bg-red-50 dark:bg-red-950/30 animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                type="button"
                onClick={() => navigate("/auth/login/family")}
                variant="outline"
                className="h-11 rounded-xl border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
                className="h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Thành công!
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          © 2025 QNEdu. All rights reserved.
        </p>
      </div>
    </div>
  )
}
