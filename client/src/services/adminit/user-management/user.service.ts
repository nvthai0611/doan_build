import { apiClient } from '@/utils/clientAxios';
import type {
  CreateUserPayload,
  ManagedUser,
  QueryUserParams,
  ResetPasswordPayload,
  ResetPasswordResponse,
  UpdateUserPayload,
  UserDetailResponse,
  UserListResponse,
} from './user.types';

const BASE_URL = '/adminit/user-management';

export const centerOwnerUserService = {
  async getUsers(params?: QueryUserParams): Promise<UserListResponse> {
    const response = await apiClient.get<UserListResponse>(BASE_URL, params);
    return response as unknown as UserListResponse;
  },

  async getUserById(id: string): Promise<UserDetailResponse> {
    const response = await apiClient.get<UserDetailResponse>(`${BASE_URL}/${id}`);
    return response as unknown as UserDetailResponse;
  },

  async createUser(payload: CreateUserPayload): Promise<{ data: ManagedUser; message: string }> {
    const response = await apiClient.post<{ data: ManagedUser; message: string }>(BASE_URL, payload);
    return response as unknown as { data: ManagedUser; message: string };
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<{ data: ManagedUser; message: string }> {
    const response = await apiClient.patch<{ data: ManagedUser; message: string }>(`${BASE_URL}/${id}`, payload);
    return response as unknown as { data: ManagedUser; message: string };
  },

  async toggleStatus(id: string): Promise<{ data: ManagedUser; message: string }> {
    const response = await apiClient.patch<{ data: ManagedUser; message: string }>(`${BASE_URL}/${id}/toggle-status`);
    return response as unknown as { data: ManagedUser; message: string };
  },

  async resetPassword(id: string, payload?: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const response = await apiClient.patch<ResetPasswordResponse>(`${BASE_URL}/${id}/reset-password`, payload);
    return response as unknown as ResetPasswordResponse;
  },

  async checkAvailability(email?: string, username?: string, excludeId?: string | null): Promise<{
    data: {
      emailAvailable: boolean;
      usernameAvailable: boolean;
      emailMessage?: string;
      usernameMessage?: string;
    };
    message: string;
  }> {
    const params: Record<string, string> = {};
    if (email) params.email = email;
    if (username) params.username = username;
    if (excludeId) params.excludeId = excludeId;
    const response = await apiClient.get<{
      data: {
        emailAvailable: boolean;
        usernameAvailable: boolean;
        emailMessage?: string;
        usernameMessage?: string;
      };
      message: string;
    }>(`${BASE_URL}/check-availability`, params);
    return response as unknown as {
      data: {
        emailAvailable: boolean;
        usernameAvailable: boolean;
        emailMessage?: string;
        usernameMessage?: string;
      };
      message: string;
    };
  },
};

