export interface AdminIncidentItem {
  id: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  status: string; // PENDING | PROCESSING | RESOLVED
  description: string;
  actionsTaken?: string | null;
  studentsInvolved?: string | null;
  date: string;
  time: string;
  location?: string | null;
  class?: { id: string; name: string } | null;
  reportedBy?: { id: string; user?: { fullName?: string | null } | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminIncidentListResponse {
  data: AdminIncidentItem[];
  message: string;
  meta: { total: number; page: number; limit: number; totalPages: number };
}

