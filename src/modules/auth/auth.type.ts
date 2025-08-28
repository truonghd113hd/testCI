export interface JwtPayload {
  id: number;
  email: string;
}

export enum USER_TYPE {
  ADMIN = 'admin',
  USER = 'user',
}
