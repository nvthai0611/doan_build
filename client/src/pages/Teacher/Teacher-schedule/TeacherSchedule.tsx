import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react"
import Loading from "../../../components/Loading/LoadingPage"
import { teacherScheduleService } from "../../../services/teacherScheduleService"
import { useNavigate } from "react-router-dom"
import { ScheduleData } from "./utils"

type ViewType = "month" | "week" | "list"

const MONTH_NAMES = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"
] as const

const DAY_NAMES = [
  "Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"
] as const

export default function TeacherSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("month")
  const [schedules, setSchedules] = useState<ScheduleData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [selected, setSelected] = useState<ScheduleData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        setError(null)
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const weekStart = currentDate
          .toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
          .split('/')
          .reverse()
          .join('-');
        const type = viewType === "month" ? "monthly" : viewType === "week" ? "weekly" : "list"
        let data = null;
        if (type === "monthly") {
          data = await teacherScheduleService.getMonthlySchedule(year, month)
        } else if (type === "weekly") {
          data = await teacherScheduleService.getWeeklySchedule(weekStart)
        } else {
          data = await teacherScheduleService.getMonthlySchedule(year, month)
        }
        setSchedules(Array.isArray(data) ? data : (data?.data ?? []))
      } catch (e) {
        console.error(e)
        setError("Không thể tải dữ liệu từ server")
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }
    fetchSchedules()
  }, [currentDate])

  const getDateKey = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, ScheduleData[]>()
    for (const s of schedules) {
      const dateStr = (s.date as any).toString().split('T')[0]
      const list = map.get(dateStr) || []
      list.push(s)
      map.set(dateStr, list)
    }
    return map
  }, [schedules])

  const getEventColor = (type: string) => {
    switch (type) {
      case "regular": return "bg-purple-500 text-white"
      case "exam": return "bg-blue-500 text-white"
      case "makeup": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const handlePrev = () => {
    if(viewType === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if(viewType === "week") {
      setCurrentDate(new Date(getWeekRange().startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000))
    } else if(viewType === "list") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }
  }
  const handleNext = () => {
    if(viewType === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if(viewType === "week") {
      setCurrentDate(new Date(getWeekRange().startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000))
    } else if(viewType === "list") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
  }
  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const openDetail = (s: ScheduleData) => {
    navigate(`/teacher/session-details/${s.id}`);
    return;
  }
  
  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return { startOfWeek, endOfWeek }
  }

  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate])
  const firstDay = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate])
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])
  const emptyDays = useMemo(() => Array.from({ length: firstDay }, (_, i) => i), [firstDay])

  const renderMonthView = () => (
    <Card>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-t-lg">{d}</div>
          ))}

          {emptyDays.map((d) => (
            <div key={`e-${d}`} className="p-2 min-h-[120px] border border-gray-200 bg-gray-50"></div>
          ))}

          {days.map((day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateKey = getDateKey(date)
            const dayList = schedulesByDate.get(dateKey) ?? []
            const isToday = new Date().toDateString() === date.toDateString()
            const hasMultiple = dayList.length > 1

            return (
              <div key={day} className={`p-2 min-h-[120px] border border-gray-200 ${isToday ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isToday ? "text-blue-600 bg-blue-100 px-2 py-1 rounded-full" : "text-gray-900"}`}>{day}</span>
                  <div className="flex items-center space-x-1">
                    {hasMultiple && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">{dayList.length}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {dayList.slice(0, 3).map((s) => (
                    <div key={s.id} className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(s.type)}`} title={`${s.subject} - ${s.className} - ${s.room}`} onClick={() => openDetail(s)}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{s.className}</span>
                      </div>
                      <div className="text-xs opacity-90 truncate">{s.startTime}-{s.endTime}</div>
                    </div>
                  ))}
                  {dayList.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">+{dayList.length - 3} buổi khác</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  const renderWeekView = () => {
    const { startOfWeek, endOfWeek } = getWeekRange()
    const weekDates: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      return d
    })
    const timeSlots = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-0">
          <div className="bg-gray-50 p-2 border-r border-b">
            <div className="text-xs font-medium text-gray-500 text-center">Giờ</div>
          </div>
          {weekDates.map((date, idx) => (
            <div key={idx} className="bg-gray-50 p-2 border-b">
              <div className="text-xs font-medium text-gray-500 text-center">{DAY_NAMES[date.getDay()]}</div>
              <div className="text-sm font-semibold text-gray-900 text-center">{date.getDate()}</div>
            </div>
          ))}

          {timeSlots.map((hour) => (
            <>
              <div key={`h-${hour}`} className="bg-gray-50 p-2 border-r border-b text-xs text-gray-500 text-center">{String(hour).padStart(2,'0')} giờ</div>
              {weekDates.map((date, dayIdx) => {
                const dateKey = getDateKey(date)
                const list = (schedulesByDate.get(dateKey) ?? []).filter(s => parseInt(s.startTime.split(":")[0]) === hour)
                return (
                  <div key={`${hour}-${dayIdx}`} className="min-h-[60px] border-b border-r bg-white hover:bg-gray-50 transition-colors relative">
                    {list.map((s, si) => (
                      <div key={s.id} className={`absolute inset-1 rounded text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(s.type)}`} title={`${s.subject} - ${s.className} - ${s.room}`} onClick={() => openDetail(s)} style={{ top: `${si * 20}px`, height: '36px', fontSize: '12px' }}>
                        <div className="truncate font-medium">{s.className}</div>
                        <div className="truncate opacity-90">{s.startTime}-{s.endTime}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    const monthKeyPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}`
    const list = schedules.filter(s => (s.date as any).toString().startsWith(monthKeyPrefix))
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách buổi dạy - {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có buổi dạy nào trong tháng này</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((s) => (
                <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white" onClick={() => openDetail(s)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{new Date(s.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <Badge className={`${getEventColor(s.type)} px-2 py-1`}>{s.subject}</Badge>
                      <span className="text-sm font-medium">{s.className}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center"><Clock className="w-3 h-3 mr-1" />{s.startTime}-{s.endTime}</div>
                        <div className="text-xs text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" />{s.room}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">Lịch dạy</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={viewType} onValueChange={(v: ViewType) => setViewType(v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="list">Danh sách</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleToday}>Hôm nay</Button>
            </div>
          </div>
          {viewType === "month" && <div className="text-lg text-gray-600">{MONTH_NAMES[currentDate.getMonth()]}, {currentDate.getFullYear()}</div>}
          {viewType === "week" && <div className="text-lg text-gray-600">{getWeekRange().startOfWeek.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })} 
            - {getWeekRange().endOfWeek.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}</div>}
          {viewType === "list" && <div className="text-lg text-gray-600">{MONTH_NAMES[currentDate.getMonth()]}, {currentDate.getFullYear()}</div>}
        </CardHeader>
        <CardContent>
          {error ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="text-orange-700 text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
          {viewType === "month" && renderMonthView()}
          {viewType === "week" && renderWeekView()}
          {viewType === "list" && renderListView()}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{selected.className}</DialogTitle>
                  <Badge className={`${getEventColor(selected.type)} px-3 py-1`}>{selected.subject}</Badge>
                </div>
                <div className="text-sm text-gray-600">{selected.room}</div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-500" /><span className="text-sm"><strong>Ngày diễn ra:</strong> {new Date(selected.date).toLocaleDateString("vi-VN")}</span></div>
                  <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-gray-500" /><span className="text-sm"><strong>Thời gian:</strong> {selected.startTime}-{selected.endTime}</span></div>
                  <div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-500" /><span className="text-sm"><strong>Giáo viên:</strong> {(selected as any).teacherName || "Tôi"}</span></div>
                </div>

                {selected.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Ghi chú:</h4>
                    <p className="text-sm text-gray-600">{selected.notes}</p>
                  </div>
                )}

                {/* Placeholder danh sách HV nếu API có */}
                {(selected as any).students?.length ? (
                  <div>
                    <h4 className="font-semibold mb-3">Học viên ({(selected as any).students.length})</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {(selected as any).students.map((st: any) => (
                        <div key={st.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={st.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">{st.name?.split(" ").map((n: string) => n[0]).join("").slice(0,2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{st.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}