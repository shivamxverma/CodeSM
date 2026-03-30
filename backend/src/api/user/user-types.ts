export interface EmailPasswordRegisterRequest {
    username: string,
    email: string,
    password: string
}

export interface RegisterResponse {
    success: boolean;
    message: string;
}