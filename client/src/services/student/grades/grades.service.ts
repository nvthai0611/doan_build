import { ApiService } from "../../common/api/api-client";
import type { TranscriptFilters, TranscriptResponse } from "./grades.types";

export const studentGradesService = {
  async getTranscript(filters?: TranscriptFilters): Promise<TranscriptResponse> {
    // Chỉ gửi các tham số có giá trị thực sự
    const params: any = {};
    if (filters?.classId) params.classId = filters.classId;
    if (filters?.testType) params.testType = filters.testType;

    const response = await ApiService.get<any>("/student/grades/transcript", params);

    // Hỗ trợ cả hai dạng:
    // 1) { data: { entries, overview }, message }
    // 2) { success, status, data: { entries, overview }, message }
    const raw = response as any;
    const wrappedData = raw?.data;
    const inner =
      (wrappedData && (wrappedData.data ?? wrappedData)) ??
      raw.data ??
      raw;

    const result: TranscriptResponse =
      (inner as TranscriptResponse) || { entries: [], overview: { cumulativeGpa: 0 } };

    return result;
  },
  
  async getAvailableClasses(): Promise<Array<{ id: string; name: string; academicYear?: string; subjectName?: string }>> {
    const response = await ApiService.get<any>("/student/grades/classes");
    const raw = response as any;
    const classes = raw?.data ?? raw;
    return (classes as any[]) || [];
  },

  async getTestTypes(classId?: string): Promise<string[]> {
    const params: any = {};
    if (classId) params.classId = classId;
    const response = await ApiService.get<any>("/student/grades/test-types", params);
    const raw = response as any;
    const types = raw?.data ?? raw;
    return (types as string[]) || [];
  },

  async getOverview(): Promise<any> {
    const response = await ApiService.get<any>("/student/grades/overview");
    const raw = response as any;
    const overview = raw?.data ?? raw;
    return overview || {};
  },
};



