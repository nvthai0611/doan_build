declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}
export declare enum RelationshipType {
    FATHER = "FATHER",
    MOTHER = "MOTHER",
    OTHER = "OTHER"
}
export declare class ChildDto {
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    schoolName: string;
    schoolAddress?: string;
}
export declare class RegisterParentDto {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    birthDate?: string;
    relationshipType: RelationshipType;
    children: ChildDto[];
}
export {};
