export declare class UploadMaterialDto {
    classId: string;
    title: string;
    category: string;
    description?: string;
    file: any;
}
export declare class GetMaterialsDto {
    classId?: string;
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
}
export declare class MaterialResponseDto {
    id: number;
    classId: string;
    title: string;
    fileName: string;
    category: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
    description?: string;
    uploadedBy: string;
    uploadedAt: Date;
    downloads: number;
}
