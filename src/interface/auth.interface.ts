export interface RegisterDto {
    username?: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phoneNumber?: string;
    userAgent?: string;
    ipAddress?: string;
}
export interface LoginDto {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
}
