export interface EmailPasswordRegisterRequest {
    email: string,
    password: string,
    username: string
}

export interface EmailPasswordLoginRequest {
    email : string,
    password : string
}

export interface GoogleOauthRequest {
    isVerify: boolean;
    code?: string;
    credential?: string;
}

export interface GoogleAuthResponse {
    isNewUser: boolean;
    userId: string;
    accessToken: string;
    refreshToken: string;
    email?: string | null;
    username?: string | null;
    role?: string | null;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface EmailPasswordAuthResponse {
  isNewUser: boolean;
  userId: string;
  accessToken: string;
  refreshToken: string;
  email?: string | null;
  username?: string | null;
  role?: string | null;
}