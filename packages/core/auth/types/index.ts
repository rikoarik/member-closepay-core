/**
 * Core Auth Types
 * Sesuai dengan dokumen section 4.1
 */

export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role?: string;
  permissions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Company {
  id: string;
  name: string;
  segmentId?: string;
  config?: Record<string, any>;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  company: Company;
}

export interface AuthService {
  login(username: string, password: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  getProfile(): Promise<User>;
  refreshToken(): Promise<string>;
  isAuthenticated(): boolean;
}

export interface TokenService {
  getToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  setRefreshToken(refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
  getTokenExpiry(): Promise<number | null>;
  setTokenExpiry(expiresIn: number): Promise<void>;
  isTokenExpired(): Promise<boolean>;
  getTimeUntilExpiry(): Promise<number>;
}

