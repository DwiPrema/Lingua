export type UserRole = "student" | "instructor";
export type AuthIntent = "signup" | "login-otp" | null;
export type LoginMethod = "password" | "otp";
export type OtpType = "signup" | "email";

export interface SignUpFormErrors {
    role?: string;
    email?: string;
    password?: string;
    fullname?: string;
    phoneNumber?: string;
    general?: string;
    otp?: string;
}

export type ErrorWithMessage = {
    message: string;
};