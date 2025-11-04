export interface IncidentReportCreateRequest {
  incidentType: string;
  severity: string;
  date: string;     // yyyy-mm-dd
  time: string;     // HH:mm
  location?: string;
  classId?: string;
  studentsInvolved?: string;
  description: string;
  actionsTaken?: string;
  witnessesPresent?: string;
}

export interface IncidentReportItem {
  id: string;
  incidentType: string;
  severity: string;
  date: string;
  time: string;
  location?: string | null;
  description: string;
  actionsTaken?: string | null;
  studentsInvolved?: string | null;
  witnessesPresent?: string | null;
  status: string;
  classId?: string | null;
  class?: { id: string; name: string } | null;
  reportedBy?: { id: string; user?: { fullName?: string | null } | null } | null;
  createdAt: string;
}

export interface IncidentReportListResponse {
  data: IncidentReportItem[];
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
