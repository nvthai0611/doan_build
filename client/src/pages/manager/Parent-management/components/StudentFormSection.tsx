"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface StudentFormSectionProps {
  students: any[]
  onStudentsChange: (students: any[]) => void
  errors: Record<string, string>
  onErrorChange: (field: string, value: string) => void
  schools: any[]
}

export function StudentFormSection({
  students,
  onStudentsChange,
  errors,
  onErrorChange,
  schools
}: StudentFormSectionProps) {
  
  const addStudent = () => {
    onStudentsChange([
      ...students,
      {
        fullName: "",
        gender: "OTHER",
        birthDate: "",
        schoolId: ""
      }
    ])
  }

  const removeStudent = (index: number) => {
    const newStudents = students.filter((_, i) => i !== index)
    onStudentsChange(newStudents)
    
    // Clear errors for removed student
    const errorKeys = Object.keys(errors).filter(key => key.startsWith(`students.${index}`))
    errorKeys.forEach(key => onErrorChange(key, ""))
  }

  const updateStudent = (index: number, field: string, value: string) => {
    const newStudents = [...students]
    newStudents[index] = { ...newStudents[index], [field]: value }
    onStudentsChange(newStudents)
    
    // Clear error for this field
    const errorKey = `students.${index}.${field}`
    if (errors[errorKey]) {
      onErrorChange(errorKey, "")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Thông tin học sinh ({students.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStudent}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm học sinh
        </Button>
      </div>

      {students.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Chưa có học sinh nào. Nhấn "Thêm học sinh" để thêm mới.
        </div>
      )}

      {students.map((student, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <div className="absolute top-4 right-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStudent(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 pr-12">
              <div className="font-medium text-sm text-muted-foreground">
                Học sinh #{index + 1}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor={`student-${index}-fullName`}>
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`student-${index}-fullName`}
                  value={student.fullName}
                  onChange={(e) => updateStudent(index, "fullName", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={errors[`students.${index}.fullName`] ? "border-red-500" : ""}
                />
                {errors[`students.${index}.fullName`] && (
                  <p className="text-sm text-red-500">{errors[`students.${index}.fullName`]}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor={`student-${index}-gender`}>
                    Giới tính <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={student.gender}
                    onValueChange={(value) => updateStudent(index, "gender", value)}
                  >
                    <SelectTrigger className={errors[`students.${index}.gender`] ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors[`students.${index}.gender`] && (
                    <p className="text-sm text-red-500">{errors[`students.${index}.gender`]}</p>
                  )}
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor={`student-${index}-birthDate`}>
                    Ngày sinh <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`student-${index}-birthDate`}
                    type="date"
                    value={student.birthDate}
                    onChange={(e) => updateStudent(index, "birthDate", e.target.value)}
                    className={errors[`students.${index}.birthDate`] ? "border-red-500" : ""}
                  />
                  {errors[`students.${index}.birthDate`] && (
                    <p className="text-sm text-red-500">{errors[`students.${index}.birthDate`]}</p>
                  )}
                </div>

                {/* School */}
                <div className="space-y-2">
                  <Label htmlFor={`student-${index}-school`}>
                    Trường học <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={student.schoolId}
                    onValueChange={(value) => updateStudent(index, "schoolId", value)}
                  >
                    <SelectTrigger className={errors[`students.${index}.schoolId`] ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn trường" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school: any) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`students.${index}.schoolId`] && (
                    <p className="text-sm text-red-500">{errors[`students.${index}.schoolId`]}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}