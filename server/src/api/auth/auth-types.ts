export interface UserType {
    _id : string,
    username : string,
    email : string,
    fullName : string,
    role : string,
    refreshToken : string
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAuthResponse {
  subOrgId: string;
  isNewUser: boolean;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
}

