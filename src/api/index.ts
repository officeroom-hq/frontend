import type { Api } from './types';
import { mockApi } from './mocks';
import { officeMockApi } from './mocks.office';
import { authApi } from './auth';

/**
 * The single place components get data from.
 * Auth is wired to the Fastify backend (./auth.ts via ./client.ts, base URL from VITE_API_URL).
 * Everything else still comes from the mocks until its endpoints are wired.
 */
export const api: Api = { ...mockApi, ...officeMockApi, ...authApi };

export type * from './types';
