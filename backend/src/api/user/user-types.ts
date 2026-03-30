export interface EmailPasswordRegisterRequest {
    email: string,
    password: string,
    username: string
}

export interface RegisterResponse {
    success: boolean;
    message: string;
}