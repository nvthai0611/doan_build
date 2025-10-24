export interface CreateSessionRequestDto {
  classId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  roomId?: string;
  reason: string;
  notes?: string;
  requestType: 'makeup_session' | 'extra_session';
}

export interface SessionRequestResponse {
  id: string;
  requestType: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  notes?: string;
  status: string;
  createdAt: Date;
  approvedAt?: Date;
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
  };
  room?: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    user: {
      fullName: string;
    };
  };
  createdByUser: {
    id: string;
    fullName: string;
  };
  approvedByUser?: {
    id: string;
    fullName: string;
  };
}

export interface SessionRequestFilters {
  page?: number;
  limit?: number;
  status?: string;
  requestType?: string;
}

export interface SessionRequestListResponse {
  data: SessionRequestResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
