import { apiClient } from "../../../utils/clientAxios";

export class CloudinaryUploadService {
  /**
   * Upload single image to Cloudinary
   * @param file - File or Blob to upload
   * @param filename - Optional filename
   * @param folder - Optional subfolder (e.g., 'teachers', 'students', 'contracts')
   */
  static async uploadImage(
    file: File | Blob,
    filename?: string, 
    folder?: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      
      // Convert Blob to File if needed
      if (file instanceof Blob && !(file instanceof File)) {
        const newFile = new File([file], filename || 'contract-image.jpg', { type: file.type });
        formData.append('file', newFile);
      } else {
        formData.append('file', file);
      }
      
      const response = await apiClient.post(
        "/cloudinary/upload-single",
        formData,
        {
          contentType: "multipart/form-data"
        }
      )
      
      console.log('Cloudinary response:', response);
      
      // Try different response structures
      const responseData = response.data as any;
      const url = responseData?.data?.url || responseData?.url;
      
      if (!url) {
        console.error('Cannot find URL in response:', response);
        throw new Error('No URL found in Cloudinary response');
      }

      return url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Cannot upload image to Cloudinary');
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * @param files - Array of files or blobs
   * @param filenames - Optional array of filenames
   * @param folder - Optional subfolder (e.g., 'teachers', 'students')
   */
  static async uploadMultipleImages(
    files: (File | Blob)[],
    filenames?: string[],
    folder?: string
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const filename = filenames?.[index];
      return this.uploadImage(file, filename, folder);
    });

    return Promise.all(uploadPromises);
  }
}
