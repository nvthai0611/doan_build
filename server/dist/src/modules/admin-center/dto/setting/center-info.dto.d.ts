declare class WorkingHourDto {
    fromDay: string;
    toDay: string;
    open: string;
    close: string;
}
declare class CenterInfoDto {
    name: string;
    logo?: string;
    banner?: string;
    description: string;
    slogan?: string;
}
declare class ContactDto {
    phone: string;
    email: string;
    website?: string;
    workingHours: WorkingHourDto[];
}
declare class AddressDto {
    street: string;
    province: string;
    district: string;
    detail: string;
}
export declare class CenterInfoSettingDto {
    centerInfo: CenterInfoDto;
    contact: ContactDto;
    address: AddressDto;
}
export declare class UpdateCenterInfoSettingDto {
    value: CenterInfoSettingDto;
}
export {};
