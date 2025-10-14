import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudentGradesTabProps {
  student: any
}

export function StudentGradesTab({ student }: StudentGradesTabProps) {
  const grades = student?.grades || []
  
  // Nhóm điểm theo lớp học
  const gradesByClass = grades.reduce((acc: any, grade: any) => {
    const classId = grade.assessment?.class?.id
    if (!acc[classId]) {
      acc[classId] = {
        class: grade.assessment?.class,
        grades: []
      }
    }
    acc[classId].grades.push(grade)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.keys(gradesByClass).length > 0 ? (
        Object.values(gradesByClass).map((classData: any, index: number) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {classData.class?.subject?.name} - {classData.class?.name}
                </h3>
                <Badge variant="secondary">
                  {classData.grades.length} điểm
                </Badge>
              </div>
              
              <div className="space-y-3">
                {classData.grades.map((grade: any, gradeIndex: number) => (
                  <div key={gradeIndex} className="flex items-center justify-between py-2 px-3 border rounded">
                    <div>
                      <p className="font-medium text-foreground">{grade.assessment?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Loại: {grade.assessment?.type} • Hệ số: {grade.assessment?.weight || 1}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{grade.score}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(grade.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Tính điểm trung bình */}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Điểm trung bình:</span>
                    <span className="text-xl font-bold text-green-600">
                      {(classData.grades.reduce((sum: number, grade: any) => sum + grade.score, 0) / classData.grades.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chưa có điểm số nào</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}