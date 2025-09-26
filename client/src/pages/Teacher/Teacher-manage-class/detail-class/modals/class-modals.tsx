"use client"

import { EditClassModal } from "./edit-class-modal"
import { EditScheduleModal } from "./edit-schedule-modal"
import { AddStudentModal } from "./add-student-modal"
import { AddTeacherModal } from "./add-teacher-modal"
import { StudentTeacherEditModals } from "./student-teacher-edit-modals"
import { SessionModals } from "./session-modals"
import { TaskModals } from "./task-modals"
import { AssessmentModals } from "./assessment-modals"

interface ClassModalsProps {
  editClassOpen: boolean
  setEditClassOpen: (open: boolean) => void
  editScheduleOpen: boolean
  setEditScheduleOpen: (open: boolean) => void
  addStudentOpen: boolean
  setAddStudentOpen: (open: boolean) => void
  editStudentOpen: boolean
  setEditStudentOpen: (open: boolean) => void
  addTeacherOpen: boolean
  setAddTeacherOpen: (open: boolean) => void
  editTeacherOpen: boolean
  setEditTeacherOpen: (open: boolean) => void
  addSessionOpen: boolean
  setAddSessionOpen: (open: boolean) => void
  editSessionOpen: boolean
  setEditSessionOpen: (open: boolean) => void
  addTaskOpen: boolean
  setAddTaskOpen: (open: boolean) => void
  editTaskOpen: boolean
  setEditTaskOpen: (open: boolean) => void
  addAssessmentOpen: boolean
  setAddAssessmentOpen: (open: boolean) => void
  editAssessmentOpen: boolean
  setEditAssessmentOpen: (open: boolean) => void
  selectedItem: any
  classData: any
}

export function ClassModals(props: ClassModalsProps) {
  return (
    <>
      <EditClassModal open={props.editClassOpen} onOpenChange={props.setEditClassOpen} classData={props.classData} />

      <EditScheduleModal open={props.editScheduleOpen} onOpenChange={props.setEditScheduleOpen} />

      <AddStudentModal open={props.addStudentOpen} onOpenChange={props.setAddStudentOpen} />

      <AddTeacherModal open={props.addTeacherOpen} onOpenChange={props.setAddTeacherOpen} />

      <StudentTeacherEditModals
        editStudentOpen={props.editStudentOpen}
        setEditStudentOpen={props.setEditStudentOpen}
        editTeacherOpen={props.editTeacherOpen}
        setEditTeacherOpen={props.setEditTeacherOpen}
        selectedItem={props.selectedItem}
      />

      <SessionModals
        addSessionOpen={props.addSessionOpen}
        setAddSessionOpen={props.setAddSessionOpen}
        editSessionOpen={props.editSessionOpen}
        setEditSessionOpen={props.setEditSessionOpen}
        selectedItem={props.selectedItem}
      />

      <TaskModals
        addTaskOpen={props.addTaskOpen}
        setAddTaskOpen={props.setAddTaskOpen}
        editTaskOpen={props.editTaskOpen}
        setEditTaskOpen={props.setEditTaskOpen}
        selectedItem={props.selectedItem}
      />

      <AssessmentModals
        addAssessmentOpen={props.addAssessmentOpen}
        setAddAssessmentOpen={props.setAddAssessmentOpen}
        editAssessmentOpen={props.editAssessmentOpen}
        setEditAssessmentOpen={props.setEditAssessmentOpen}
        selectedItem={props.selectedItem}
      />
    </>
  )
}
