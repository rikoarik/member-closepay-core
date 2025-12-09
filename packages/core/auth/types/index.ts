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
  getSignUpMetadata(companyId: string, userType?: string): Promise<MetadataResponse>;
  getSignUpTags(companyId: string): Promise<TagItem[]>;
  register(data: SignUpData, otp?: string): Promise<SignUpResponse>;
  sendForgotPasswordOtp(email: string): Promise<void>;
  verifyForgotPasswordOtp(email: string, otp: string): Promise<void>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
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

// Sign Up Types
export interface MetadataField {
  key: string;
  display: string;
  typeData?: 'Text' | 'Email' | 'Phone' | 'Date' | 'Datetime' | 'Time' | 'Integer' | 'Numeric' | 'Enum' | 'Flags';
  tag: 'BasicData' | 'AdditionalData';
  isRequired: boolean;
  isVisible: boolean;
  extraData?: string[]; // For Enum and Flags
}

export interface MetadataItem {
  data: MetadataField;
}

export interface MetadataResponse {
  data: {
    items: MetadataItem[];
  };
}

export interface TagItem {
  name: string;
  isSelfRegisterSupported: boolean;
}

export interface SignUpData {
  [key: string]: any;
  additionalData?: Record<string, any>;
  companyId: string;
  confirmPassword?: string;
  otp?: string;
  tags?: string[];
  oAuth?: {
    type: 'google';
    googleAuthId: string;
  } | null;
}

export interface SignUpResponse {
  data: {
    responseType: 'member' | 'token' | 'paid_membership_checkout';
    authData?: {
      authToken: string;
      noId: string;
      securityCode: string;
    };
    link?: string;
  };
}

