import { ApiService } from "../../common/api/api-client";
import type { TranscriptFilters, TranscriptResponse } from "./grades.types";

export const studentGradesService = {
  async getTranscript(filters?: TranscriptFilters): Promise<TranscriptResponse> {
    const response = await ApiService.get<TranscriptResponse>("/student/grades/transcript", filters);
    return (response.data as TranscriptResponse) || { entries: [], overview: { cumulativeGpa: 0 } };
  },

  async getAvailableYears(): Promise<string[]> {
    const response = await ApiService.get<string[]>("/student/grades/years");
    return (response.data as string[]) || [];
  },

  async getAvailableTerms(academicYear?: string): Promise<string[]> {
    const params = academicYear ? { academicYear } : undefined;
    const response = await ApiService.get<string[]>("/student/grades/terms", params);
    return (response.data as string[]) || [];
  },

  async getSubjects(academicYear?: string, term?: string): Promise<Array<{ id: string; name: string }>> {
    const params: any = {};
    if (academicYear) params.academicYear = academicYear;
    if (term) params.term = term;
    const response = await ApiService.get<Array<{ id: string; name: string }>>("/student/grades/subjects", params);
    return (response.data as any) || [];
  },

  async getTestTypes(academicYear?: string, term?: string, subjectId?: string): Promise<string[]> {
    const params: any = {};
    if (academicYear) params.academicYear = academicYear;
    if (term) params.term = term;
    if (subjectId) params.subjectId = subjectId;
    const response = await ApiService.get<string[]>("/student/grades/test-types", params);
    return (response.data as string[]) || [];
  },
};



