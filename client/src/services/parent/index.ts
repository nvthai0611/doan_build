// ===== Parent Services Export =====

// Child Management
export { parentChildService } from './child-management/child.service'
export type {
  Child,
  ChildEnrollment,
  ChildAttendance,
  ChildGrade,
  ChildPayment,
  ChildQueryParams
} from './child-management/child.types'

// Child Classes
export { parentChildClassesService } from './child-classes/child-classes.service'
export type {
  ChildClass as ChildClassInfo,
  ChildClassesResponse,
  ChildClassResponse
} from './child-classes/child-classes.types'

// Communication
export { parentCommunicationService } from './communication/communication.service'
export type {
  Message,
  MessageAttachment,
  CreateMessageRequest,
  MessageQueryParams,
  Notification,
  Announcement
} from './communication/communication.types'

// Materials
export { parentMaterialsService } from './materials/materials.service'
export type {
  ParentMaterial,
  ParentMaterialsResponse,
  GetParentMaterialsParams
} from './materials/materials.types'

// Student Leave Request
export { parentStudentLeaveRequestService } from './student-leave-request/student-leave.service'
export type {
  StudentLeaveRequest,
  CreateStudentLeaveRequestDto,
  UpdateStudentLeaveRequestDto,
  GetStudentLeaveRequestsParams,
  StudentLeaveRequestResponse,
  AffectedSessionDetail,
  ChildClass
} from './student-leave-request/student-leave.types'

// Class Join
export { parentClassJoinService } from './class-join/class-join.service'

// Students
export { parentStudentsService } from './students/students.service'

// Teacher Feedback
export { parentTeacherFeedbackService } from './teacher-feedback/teacherfeedback.service'
export type {
  AvailableTeacher,
  CreateTeacherFeedbackDto,
  TeacherFeedbackItem
} from './teacher-feedback/teacherfeedback.types'