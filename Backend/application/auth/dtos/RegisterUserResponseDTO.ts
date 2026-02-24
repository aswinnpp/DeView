export interface IUserDTO {
    id: string;
    fullName: string;
    email: string;
    role: string;
}
export interface IRegisterUserResponseDTO {
    message: string;
    email: string;
}
