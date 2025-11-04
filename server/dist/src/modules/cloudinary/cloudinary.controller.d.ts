import { CloudinaryService } from './cloudinary.service';
export declare class CloudinaryController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    uploadSingle(file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            url: any;
            publicId: any;
            width: any;
            height: any;
        };
        message: string;
    }>;
    uploadMultiple(files: Express.Multer.File[]): Promise<{
        success: boolean;
        data: {
            url: any;
            publicId: any;
            width: any;
            height: any;
        }[];
        message: string;
    }>;
}
