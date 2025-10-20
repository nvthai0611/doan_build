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
