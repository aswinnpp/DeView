export interface ILoginResponseDTO {
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
    refreshTokenHash: string;
}
