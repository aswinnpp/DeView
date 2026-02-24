export interface IRegisterUserRequestDTO {
    fullName: string;
    email: string;
    password: string;
    role: 'candidate' | 'company';
    companyId?: string;
}
