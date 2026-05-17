import { apiRequest } from './api';

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
};

type LoginResponse = {
  accessToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
};

export async function loginRequest(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export async function fetchAuthMe(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', { token });
}
