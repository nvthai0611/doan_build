import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Student } from '../types/student'
import { StudentInfoCard } from './StudentDetail/components/StudentInfoCard'
import { StudentParentInfoCard } from './StudentDetail/components/StudentParentInfoCard'
import { StudentScheduleTab } from './StudentDetail/components/StudentScheduleTab'

interface StudentDetailModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (student: Student) => void
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('info')

  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết học viên - {student.user.fullName}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="parent">Phụ huynh</TabsTrigger>
            <TabsTrigger value="schedule">Lớp học</TabsTrigger>
            <TabsTrigger value="grades">Điểm số</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <StudentInfoCard student={student} />
          </TabsContent>

          <TabsContent value="parent" className="space-y-4">
            <StudentParentInfoCard student={student} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <StudentScheduleTab student={student} />
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <div className="text-sm text-gray-600">
              Chương năng xem điểm sẽ được cập nhật
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}