export interface GoogleAuthResponseDTO {
    accessToken: string;
    role: string;
    sessionId: string;
    dashboardUrl: string;
}

export interface GoogleUserDTO {
    email: string;
    name: string;
    sub: string;
}
