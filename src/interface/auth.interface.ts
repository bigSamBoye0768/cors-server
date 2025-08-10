export interface RegisterDto {
    username?: string | undefined;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phoneNumber?: string;
    ipAddress?: string;
}
export interface LoginDto {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
}
