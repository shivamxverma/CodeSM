import { Router, Request } from 'express';

export type RouteType = {
  path: string;
  router: Router;
};

export type RequestPart = 'body' | 'query' | 'params';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  lastLogin: Date;
}

export interface jwtReq extends Request {
  user: User;
}

export interface UserJwtPayload {
  userId: string;
  lastLogin?: Date;
}