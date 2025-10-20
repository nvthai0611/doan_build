import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"

interface StudentData {
    fullName: string
    username: string
    studentCode: string // REQUIRED
    email?: string
    phone?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    birthDate?: string
    address?: string
    grade?: string
    schoolId: string
}

interface StudentFormSectionProps {
    students: StudentData[]
    onStudentsChange: (students: StudentData[]) => void
    errors: Record<string, any>
    onErrorChange: (field: string, value: string) => void
    schools: Array<{ id: string; name: string }>
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
                username: "",
                studentCode: "", // REQUIRED
                email: "",
                phone: "",
                gender: "OTHER",
                birthDate: "",
                address: "",
                grade: undefined,
                schoolId: schools[0]?.id || ""
            }
        ])
    }

    const removeStudent = (index: number) => {
        const newStudents = students.filter((_, i) => i !== index)
        onStudentsChange(newStudents)
        
        // Clear errors for removed student
        const newErrors = { ...errors }
        delete newErrors[`students.${index}`]
        onErrorChange('students', '')
    }

    const updateStudent = (index: number, field: keyof StudentData, value: string) => {
        const newStudents = [...students]
        newStudents[index] = { 
            ...newStudents[index], 
            [field]: value === "" ? undefined : value 
        }
        onStudentsChange(newStudents)

        // Clear error when typing
        if (errors[`students.${index}.${field}`]) {
            onErrorChange(`students.${index}.${field}`, '')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Thông tin học sinh</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Họ tên, Username, Mã học sinh và Trường học là bắt buộc
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={addStudent}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Thêm học sinh
                </Button>
            </div>

            {students.map((student, index) => (
                <div 
                    key={index} 
                    className="p-4 border rounded-lg space-y-4 relative bg-muted/30"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-muted-foreground">
                            Học sinh #{index + 1}
                        </h4>
                        {students.length > 0 && (
                            <Button
                                type="button"
                                onClick={() => removeStudent(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Full Name & Username */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`student-fullName-${index}`}>
                                Họ và tên <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id={`student-fullName-${index}`}
                                value={student.fullName}
                                onChange={(e) => updateStudent(index, 'fullName', e.target.value)}
                                placeholder="Nguyễn Văn B"
                                className={errors[`students.${index}.fullName`] ? "border-red-500" : ""}
                            />
                            {errors[`students.${index}.fullName`] && (
                                <p className="text-sm text-red-500">{errors[`students.${index}.fullName`]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`student-username-${index}`}>
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id={`student-username-${index}`}
                                    value={student.username}
                                    onChange={(e) => updateStudent(index, 'username', e.target.value)}
                                    placeholder="nguyenvanb"
                                    className={errors[`students.${index}.username`] ? "border-red-500" : ""}
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    @student.qne.edu.vn
                                </span>
                            </div>
                            {errors[`students.${index}.username`] && (
                                <p className="text-sm text-red-500">{errors[`students.${index}.username`]}</p>
                            )}
                        </div>
                    </div>

                    {/* Student Code & School */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`student-code-${index}`}>
                                Mã học sinh <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id={`student-code-${index}`}
                                value={student.studentCode}
                                onChange={(e) => updateStudent(index, 'studentCode', e.target.value.toUpperCase())}
                                placeholder="HS001"
                                className={errors[`students.${index}.studentCode`] ? "border-red-500" : ""}
                            />
                            {errors[`students.${index}.studentCode`] && (
                                <p className="text-sm text-red-500">{errors[`students.${index}.studentCode`]}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Chỉ chữ IN HOA và số (VD: HS001, HS002)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`student-school-${index}`}>
                                Trường học <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={student.schoolId}
                                onValueChange={(value) => updateStudent(index, 'schoolId', value)}
                            >
                                <SelectTrigger className={errors[`students.${index}.schoolId`] ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Chọn trường học" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schools.map((school) => (
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

                    {/* Grade */}
                    <div className="space-y-2">
                        <Label htmlFor={`student-grade-${index}`}>
                            Khối lớp <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                        </Label>
                        <Select
                            value={student.grade || "NONE"}
                            onValueChange={(value) => updateStudent(index, 'grade', value === "NONE" ? "" : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn khối" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Chưa chọn</SelectItem>
                                <SelectItem value="6">Lớp 6</SelectItem>
                                <SelectItem value="7">Lớp 7</SelectItem>
                                <SelectItem value="8">Lớp 8</SelectItem>
                                <SelectItem value="9">Lớp 9</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Optional Fields - Phone & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`student-phone-${index}`}>
                                Số điện thoại <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                            </Label>
                            <Input
                                id={`student-phone-${index}`}
                                value={student.phone || ""}
                                onChange={(e) => updateStudent(index, 'phone', e.target.value)}
                                placeholder="0123456789"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`student-gender-${index}`}>
                                Giới tính <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                            </Label>
                            <Select
                                value={student.gender || "OTHER"}
                                onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') => 
                                    updateStudent(index, 'gender', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Nam</SelectItem>
                                    <SelectItem value="FEMALE">Nữ</SelectItem>
                                    <SelectItem value="OTHER">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Birth Date & Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`student-birthDate-${index}`}>
                                Ngày sinh <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                            </Label>
                            <Input
                                id={`student-birthDate-${index}`}
                                type="date"
                                value={student.birthDate || ""}
                                onChange={(e) => updateStudent(index, 'birthDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`student-email-${index}`}>
                                Email <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                            </Label>
                            <Input
                                id={`student-email-${index}`}
                                type="email"
                                value={student.email || ""}
                                onChange={(e) => updateStudent(index, 'email', e.target.value)}
                                placeholder="student@example.com"
                                className={errors[`students.${index}.email`] ? "border-red-500" : ""}
                            />
                            {errors[`students.${index}.email`] && (
                                <p className="text-sm text-red-500">{errors[`students.${index}.email`]}</p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor={`student-address-${index}`}>
                            Địa chỉ <span className="text-muted-foreground text-xs">(Tùy chọn)</span>
                        </Label>
                        <Input
                            id={`student-address-${index}`}
                            value={student.address || ""}
                            onChange={(e) => updateStudent(index, 'address', e.target.value)}
                            placeholder="123 Đường ABC, Quận XYZ"
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}