export type ManagedUserRole =
  | 'admin'
  | 'manager'
  | 'center_owner'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'staff';

export type ManagedUserStatus = 'all' | 'active' | 'inactive';

export type ManagedUserGender = 'MALE' | 'FEMALE' | 'OTHER' | null;

export interface LinkedTeacherInfo {
  id: string;
  teacherCode: string | null;
  schoolName: string | null;
}

export interface LinkedParentInfo {
  id: string;
  relationshipType: string | null;
  studentsCount?: number;
  students?: Array<{
    id: string;
    studentCode: string | null;
    fullName: string | null;
  }>;
}

export interface LinkedStudentInfo {
  id: string;
  studentCode: string | null;
  grade: string | null;
  parent?: {
    id: string;
    relationshipType: string | null;
    fullName: string | null;
  } | null;
}

export interface LinkedEntities {
  teacher: LinkedTeacherInfo | null;
  parent: LinkedParentInfo | null;
  student: LinkedStudentInfo | null;
}

export interface ManagedUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: ManagedUserRole;
  roleDisplayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gender?: ManagedUserGender;
  birthDate?: string | null;
  lastLoginAt?: string | null;
  permissionCount: number;
  linkedEntities: LinkedEntities;
}

export interface ManagedUserSession {
  id: string;
  createdAt: string;
  isActive: boolean;
}

export interface ManagedUserActivity {
  id: string | number;
  action: string;
  tableName?: string;
  recordId?: string | null;
  timestamp: string | null;
}

export interface UserDetail extends ManagedUser {
  sessions: ManagedUserSession[];
  recentActivities: ManagedUserActivity[];
}

export interface UserListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
}

export interface UserFilters {
  roles: Array<{ label: string; value: string }>;
  statuses: ManagedUserStatus[];
  genders: string[];
}

export interface UserListResponse {
  data: ManagedUser[];
  meta: UserListMeta;
  summary: UserSummary;
  filters: UserFilters;
  message: string;
}

export interface UserDetailResponse {
  data: UserDetail;
  message: string;
}

export interface QueryUserParams {
  search?: string;
  status?: ManagedUserStatus;
  role?: ManagedUserRole | 'all';
  roles?: ManagedUserRole[];
  gender?: ManagedUserGender | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'fullName' | 'username' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  username: string;
  phone?: string;
  avatar?: string;
  role: ManagedUserRole;
  password?: string;
  gender?: Exclude<ManagedUserGender, null>;
  birthDate?: string;
  isActive?: boolean;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface ResetPasswordPayload {
  newPassword?: string;
  forceLogout?: boolean;
}

export interface ResetPasswordResponse {
  data: {
    id: string;
    username: string;
    temporaryPassword: string;
  };
  message: string;
}

