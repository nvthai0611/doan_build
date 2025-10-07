"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, FileText, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendanceTableProps {
    students: any[]
}

export function AttendanceTable({ students }: AttendanceTableProps) {
    const [attendance, setAttendance] = useState<any>({})

    const handleStatusChange = (studentId: string, status: any) => {
        setAttendance((prev: any) => ({
            ...prev,
            [studentId]: prev[studentId] === status ? null : status,
        }))
    }

    const handleSave = () => {
        console.log("Saving attendance:", attendance)
        // TODO: Implement API call to save attendance
        alert("Đã lưu điểm danh thành công!")
    }

    const getStatusCount = (status: any) => {
        return Object.values(attendance).filter((s: any) => s === status).length
    }

    return (
        <Card className="shadow-xl border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-2xl text-slate-900">Danh sách điểm danh</CardTitle>
                    <div className="flex gap-3">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 px-4 py-2 text-sm font-semibold hover:bg-emerald-200">
                            <Check className="h-4 w-4 mr-1" />
                            Có mặt: {getStatusCount("present")}
                        </Badge>
                        <Badge className="bg-rose-100 text-rose-700 border-rose-300 px-4 py-2 text-sm font-semibold hover:bg-rose-200">
                            <X className="h-4 w-4 mr-1" />
                            Vắng: {getStatusCount("absent")}
                        </Badge>
                        <Badge className="bg-sky-100 text-sky-700 border-sky-300 px-4 py-2 text-sm font-semibold hover:bg-sky-200">
                            <FileText className="h-4 w-4 mr-1" />
                            Có phép: {getStatusCount("excused")}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-3">
                    <div className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 pb-4 border-b-2 border-slate-200 font-semibold text-sm text-slate-600 uppercase tracking-wide">
                        <div>Học sinh</div>
                        <div className="text-center">Có mặt</div>
                        <div className="text-center">Vắng</div>
                        <div className="text-center">Có phép</div>
                    </div>

                    {students.map((student: any) => (
                        <div
                            key={student.id}
                            className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 items-center py-4 px-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        >
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm">
                                    <AvatarImage src="https://picsum.photos/200/300" alt={student.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                        {student.name.split(" ").slice(-1)[0].charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 text-base">{student.name}</span>
                                    <span className="text-sm text-slate-500">
                                        {student.studentCode} • {student.grade}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    variant={attendance[student.id] === "present" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleStatusChange(student.id, "present")}
                                    className={cn(
                                        "w-24 h-10 font-medium transition-all",
                                        attendance[student.id] === "present"
                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                                            : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300",
                                    )}
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    {attendance[student.id] === "present" ? "Có mặt" : ""}
                                </Button>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    variant={attendance[student.id] === "absent" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleStatusChange(student.id, "absent")}
                                    className={cn(
                                        "w-24 h-10 font-medium transition-all",
                                        attendance[student.id] === "absent"
                                            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                                            : "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300",
                                    )}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    {attendance[student.id] === "absent" ? "Vắng" : ""}
                                </Button>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    variant={attendance[student.id] === "excused" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleStatusChange(student.id, "excused")}
                                    className={cn(
                                        "w-24 h-10 font-medium transition-all",
                                        attendance[student.id] === "excused"
                                            ? "bg-sky-600 hover:bg-sky-700 text-white shadow-md"
                                            : "hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300",
                                    )}
                                >
                                    <FileText className="h-4 w-4 mr-1" />
                                    {attendance[student.id] === "excused" ? "Có phép" : ""}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-8 pt-6 border-t-2 border-slate-200">
                    <Button
                        onClick={handleSave}
                        size="lg"
                        className="min-w-40 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        Lưu điểm danh
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
