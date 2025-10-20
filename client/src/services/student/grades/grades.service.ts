import { ApiService } from "../../common/api/api-client";
import type { TranscriptFilters, TranscriptResponse } from "./grades.types";

export const studentGradesService = {
  async getTranscript(filters?: TranscriptFilters): Promise<TranscriptResponse> {
    // Chỉ gửi các tham số có giá trị thực sự
    const params: any = {};
    if (filters?.classId) params.classId = filters.classId;
    if (filters?.testType) params.testType = filters.testType;
    const response = await ApiService.get<TranscriptResponse>("/student/grades/transcript", params);
    return (response.data as TranscriptResponse) || { entries: [], overview: { cumulativeGpa: 0 } };
  },
  
  async getAvailableClasses(): Promise<Array<{ id: string; name: string; academicYear?: string; subjectName?: string }>> {
    const response = await ApiService.get<Array<{ id: string; name: string; academicYear?: string; subjectName?: string }>>("/student/grades/classes");
    return (response.data as any) || [];
  },

  async getTestTypes(classId?: string): Promise<string[]> {
    const params: any = {};
    if (classId) params.classId = classId;
    const response = await ApiService.get<string[]>("/student/grades/test-types", params);
    return (response.data as string[]) || [];
  },

  async getOverview(): Promise<any> {
    const response = await ApiService.get<any>("/student/grades/overview");
    return response.data || {};
  },
};



