import { ProfileService } from '../services/profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getMyProfile(req: any): Promise<{
        data: {
            id: string;
            email: string;
            fullName: string;
            phone: string;
            isActive: boolean;
            studentId: string;
            studentCode: string;
            dateOfBirth: string;
            gender: "male" | "female" | "other" | undefined;
            address: string;
            grade: string;
            school: {
                id: string;
                name: string;
                address: any;
                phone: any;
            } | {
                id: string;
                name: string;
                address?: undefined;
                phone?: undefined;
            };
            enrollments: {
                id: bigint;
                classId: string;
                status: string;
                enrolledAt: string;
                class: {
                    id: string;
                    name: string;
                    subject: string;
                };
            }[];
            parentLinks: {
                id: string;
                parentId: string;
                relation: any;
                primaryContact: boolean;
                parent: {
                    id: string;
                    user: {
                        fullName: string;
                        email: string;
                        phone: string;
                    };
                };
            }[];
        };
        message: string;
    }>;
}
