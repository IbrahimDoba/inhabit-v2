/**
 * The Inhabit server: sign-in by emailed code (Better Auth) and one cloud save
 * per account. The session is kept in the phone's secure storage.
 */

import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://inhabit-api.dailzero.com';

/** Accounts live in the phone's secure storage, which the web build does not have. */
export const cloudAvailable = Platform.OS !== 'web';

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({ scheme: 'inhabit', storagePrefix: 'inhabit', storage: SecureStore }),
    emailOTPClient(),
  ],
});

export type CloudSave = { data: unknown; version: number; updatedAt: string | null };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const cookie = await authClient.getCookie();
  return fetch(`${API_URL}${path}`, {
    ...init,
    // The session travels in this header; the system cookie jar is not used.
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json', Cookie: cookie, ...init?.headers },
  });
}

export async function fetchSave(): Promise<CloudSave> {
  const response = await request('/v1/save');
  if (!response.ok) throw new ApiError(response.status, 'Could not read the cloud save.');
  return (await response.json()) as CloudSave;
}

export type PutResult =
  | { ok: true; version: number; updatedAt: string }
  /** Another phone saved since `baseVersion`; this is its copy. */
  | { ok: false; newer: CloudSave };

export async function putSave(data: unknown, baseVersion: number): Promise<PutResult> {
  const response = await request('/v1/save', {
    method: 'PUT',
    body: JSON.stringify({ data, baseVersion }),
  });
  const body = await response.json();
  if (response.status === 409) return { ok: false, newer: body as CloudSave };
  if (!response.ok) throw new ApiError(response.status, 'Could not save to the cloud.');
  return { ok: true, version: body.version, updatedAt: body.updatedAt };
}
