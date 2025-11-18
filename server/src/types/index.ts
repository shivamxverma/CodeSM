import { Router, Request } from 'express';

export type RouteType = {
  path: string;
  router: Router;
};

export type RequestPart = 'body' | 'query' | 'params';

export interface User {
  userId: string;
  username: string;
  telegramId: string;
  userType: string;
  lastLogin: Date;
  iat: number;
  exp: number;
}

export interface jwtReq extends Request {
  user: User;
}

export interface UserJwtPayload {
  userId: string;
  userType: string;
  lastLogin: Date;
}