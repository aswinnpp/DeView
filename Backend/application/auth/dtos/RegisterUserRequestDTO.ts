export interface RegisterUserRequestDTO {
    fullName: string;
    email: string;
    password: string;
    role: 'candidate' | 'company';
    companyName?: string;
}
