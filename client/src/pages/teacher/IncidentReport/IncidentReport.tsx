"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { teacherIncidentReportService } from "../../../services/teacher/incident-report/incident.service"
import type { IncidentReportCreateRequest } from "../../../services/teacher/incident-report/incident.types"
import { teacherFileManagementService } from "../../../services/teacher/file-management/file.service"
import type { TeacherClass } from "../../../services/teacher/file-management/file.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Send, Clock, Users, FileText } from "lucide-react"
import { toast } from "sonner"

export default function IncidentReportPage() {
  const [formData, setFormData] = useState({
    incidentType: "",
    severity: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    location: "",
    classId: "",
    studentsInvolved: "",
    description: "",
    actionsTaken: "",
    witnessesPresent: "",
  })

  const todayStr = new Date().toISOString().split("T")[0]
  const nowHM = new Date().toTimeString().slice(0, 5)
  const [dateError, setDateError] = useState("")
  const [timeError, setTimeError] = useState("")

  const createMutation = useMutation({
    mutationFn: async (payload: IncidentReportCreateRequest) => {
      return await teacherIncidentReportService.createIncidentReport(payload)
    },
    onSuccess: () => {
      toast.success("Thành công", { description: "Báo cáo sự cố đã được gửi đến quản lý" })
      setFormData({
        incidentType: "",
        severity: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
        location: "",
        classId: "",
        studentsInvolved: "",
        description: "",
        actionsTaken: "",
        witnessesPresent: "",
      })
    },
    onError: (err: any) => {
      toast.error("Gửi thất bại", { description: err?.message || "Có lỗi xảy ra" })
    }
  })

  // Load danh sách lớp của giáo viên
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => teacherFileManagementService.getTeacherClasses(),
    staleTime: 5 * 60 * 1000,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Không cho phép ngày/giờ tương lai
    const selectedDateTime = new Date(`${formData.date}T${formData.time}:00`)
    const now = new Date()
    if (selectedDateTime.getTime() > now.getTime()) {
      setDateError("Không được chọn ngày/giờ trong tương lai")
      setTimeError("Không được chọn ngày/giờ trong tương lai")
      toast.error("Lỗi", { description: "Không được chọn ngày/giờ trong tương lai" })
      return
    }

    if (!formData.incidentType || !formData.severity || !formData.description) {
      toast.error("Lỗi", { description: "Vui lòng điền đầy đủ các trường bắt buộc" })
      return
    }

    const payload: IncidentReportCreateRequest = {
      incidentType: formData.incidentType,
      severity: formData.severity,
      date: formData.date,
      time: formData.time,
      location: formData.location || undefined,
      classId: formData.classId || undefined,
      studentsInvolved: formData.studentsInvolved || undefined,
      description: formData.description,
      actionsTaken: formData.actionsTaken || undefined,
      witnessesPresent: formData.witnessesPresent || undefined,
    }

    createMutation.mutate(payload)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return ""
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            Báo cáo sự cố lớp học
          </h1>
          <p className="text-muted-foreground mt-1">Báo cáo các sự cố hoặc vấn đề xảy ra trong lớp học đến quản lý</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type & Severity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Thông tin sự cố
              </CardTitle>
              <CardDescription>Phân loại và mức độ nghiêm trọng của sự cố</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentType">
                    Loại sự cố <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.incidentType}
                    onValueChange={(value) => setFormData({ ...formData, incidentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sự cố" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="behavior">Hành vi học sinh</SelectItem>
                      <SelectItem value="safety">An toàn lớp học</SelectItem>
                      <SelectItem value="facility">Cơ sở vật chất</SelectItem>
                      <SelectItem value="health">Sức khỏe học sinh</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">
                    Mức độ nghiêm trọng <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSeverityColor("low")}>
                            Thấp
                          </Badge>
                          <span className="text-sm text-muted-foreground">- Không cần xử lý ngay</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSeverityColor("medium")}>
                            Trung bình
                          </Badge>
                          <span className="text-sm text-muted-foreground">- Cần theo dõi</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSeverityColor("high")}>
                            Cao
                          </Badge>
                          <span className="text-sm text-muted-foreground">- Cần xử lý sớm</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSeverityColor("critical")}>
                            Nghiêm trọng
                          </Badge>
                          <span className="text-sm text-muted-foreground">- Cần xử lý ngay</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Thời gian & Địa điểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Ngày xảy ra</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    max={todayStr}
                    onChange={(e) => {
                      const value = e.target.value
                      // Nếu chọn ngày tương lai -> giữ ở hôm nay
                      const safeDate = value > todayStr ? todayStr : value
                      // Nếu là hôm nay và giờ đang lớn hơn hiện tại -> hạ về hiện tại
                      const nextTime = safeDate === todayStr && formData.time > nowHM ? nowHM : formData.time
                      setFormData({ ...formData, date: safeDate, time: nextTime })
                      // cập nhật lỗi
                      if (safeDate > todayStr) {
                        setDateError("Không được chọn ngày trong tương lai")
                      } else if (safeDate === todayStr && nextTime > nowHM) {
                        setDateError("Giờ phải nhỏ hơn hiện tại")
                      } else {
                        setDateError("")
                      }
                    }}
                  />
                  {dateError && <p className="text-xs text-red-600 mt-1">{dateError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Giờ xảy ra</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    max={formData.date === todayStr ? nowHM : undefined}
                    onChange={(e) => {
                      const value = e.target.value
                      const safeTime = formData.date === todayStr && value > nowHM ? nowHM : value
                      setFormData({ ...formData, time: safeTime })
                      // cập nhật lỗi
                      if (formData.date === todayStr && value > nowHM) {
                        setTimeError("Giờ không được vượt quá hiện tại")
                      } else {
                        setTimeError("")
                      }
                    }}
                  />
                  {timeError && <p className="text-xs text-red-600 mt-1">{timeError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    placeholder="VD: Phòng 101, Sân trường..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Lớp học</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => setFormData({ ...formData, classId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingClasses ? "Đang tải..." : "Chọn lớp học"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: TeacherClass) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject} {cls.grade ? `(Khối ${cls.grade})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* People Involved */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Người liên quan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentsInvolved">Học sinh liên quan</Label>
                <Input
                  id="studentsInvolved"
                  placeholder="VD: Nguyễn Văn An, Trần Thị Bình..."
                  value={formData.studentsInvolved}
                  onChange={(e) => setFormData({ ...formData, studentsInvolved: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập tên các học sinh liên quan, cách nhau bằng dấu phẩy
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="witnessesPresent">Người chứng kiến</Label>
                <Input
                  id="witnessesPresent"
                  placeholder="VD: Giáo viên Lê Văn C, Học sinh Phạm Thị D..."
                  value={formData.witnessesPresent}
                  onChange={(e) => setFormData({ ...formData, witnessesPresent: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Description & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Mô tả sự cố <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về sự cố đã xảy ra..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Mô tả rõ ràng và chi tiết về sự việc đã xảy ra</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionsTaken">Hành động đã thực hiện</Label>
                <Textarea
                  id="actionsTaken"
                  placeholder="Các hành động bạn đã thực hiện để xử lý tình huống..."
                  rows={4}
                  value={formData.actionsTaken}
                  onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Mô tả các biện pháp bạn đã áp dụng để xử lý sự cố</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Hủy
            </Button>
            <Button type="submit" className="gap-2" disabled={createMutation.isPending || !!dateError || !!timeError}>
              <Send className="w-4 h-4" />
              {createMutation.isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </div>
        </form>
      </div>
  )
}
