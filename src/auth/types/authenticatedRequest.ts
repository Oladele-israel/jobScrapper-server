import { Request } from 'express';

interface AuthenticatedUser {
  sub: string;
  email: string;
  refreshToken: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
