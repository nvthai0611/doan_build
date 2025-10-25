export interface ScheduleChangeResponse {
  id: string;
  classId: string;
  originalDate: string;
  originalTime: string;
  newDate: string;
  newTime: string;
  newRoomId?: string;
  reason: string;
  status: string;
  requestedBy: string;
  requestedAt: Date;
  processedAt?: Date;
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
  };
  newRoom?: {
    id: string;
    name: string;
  };
}

export interface ScheduleChangeFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface ScheduleChangeListResponse {
  data: ScheduleChangeResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
