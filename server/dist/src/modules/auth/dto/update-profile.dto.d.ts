export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}
export declare class UpdateProfileDto {
    fullName?: string;
    phone?: string;
    avatar?: string;
    gender?: Gender;
    birthDate?: string;
}
