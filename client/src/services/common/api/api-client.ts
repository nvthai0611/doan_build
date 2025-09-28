import { apiClient as originalApiClient } from "../../../utils/clientAxios"
import type { ApiResponse, FileDownloadOptions } from "../types/shared.types"

// Re-export the original apiClient with additional typing
export const apiClient = originalApiClient

// Enhanced API client with common methods
export class ApiService {
  /**
   * Generic GET request
   */
  static async get<T = any>(
    url: string, 
    params?: Record<string, any>, 
    options?: FileDownloadOptions
  ): Promise<ApiResponse<T>> {
    return await apiClient.get<T>(url, params, options)
  }

  /**
   * Generic POST request
   */
  static async post<T = any>(
    url: string, 
    data?: any, 
    options?: FileDownloadOptions
  ): Promise<ApiResponse<T>> {
    return await apiClient.post<T>(url, data, options)
  }

  /**
   * Generic PATCH request
   */
  static async patch<T = any>(
    url: string, 
    data?: any, 
    options?: FileDownloadOptions
  ): Promise<ApiResponse<T>> {
    return await apiClient.patch<T>(url, data, options)
  }

  /**
   * Generic PUT request
   */
  static async put<T = any>(
    url: string, 
    data?: any, 
    options?: FileDownloadOptions
  ): Promise<ApiResponse<T>> {
    return await apiClient.put<T>(url, data, options)
  }

  /**
   * Generic DELETE request
   */
  static async delete(url: string): Promise<ApiResponse<any>> {
    return await apiClient.delete(url)
  }

  /**
   * File upload with FormData
   */
  static async uploadFile<T = any>(
    url: string, 
    file: File, 
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append("file", file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return await apiClient.post<T>(url, formData, {
      contentType: "multipart/form-data"
    })
  }

  /**
   * Download file as Blob
   */
  static async downloadFile(
    url: string, 
    params?: Record<string, any>
  ): Promise<Blob> {
    const response = await apiClient.get(url, params, {
      contentType: "application/octet-stream"
    })
    return response.data as Blob
  }

  /**
   * Download Excel file
   */
  static async downloadExcel(
    url: string, 
    params?: Record<string, any>
  ): Promise<Blob> {
    const response = await apiClient.get(url, params, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })
    return response.data as Blob
  }
}
