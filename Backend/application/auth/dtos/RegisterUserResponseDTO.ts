export interface UserDTO {
    id: string;
    fullName: string;
    email: string;
    role: string;
}
export interface RegisterUserResponseDTO {
    message: string;
    email: string;
}
