import type { Api } from './types';
import { mockApi } from './mocks';
import { officeMockApi } from './mocks.office';

/**
 * The single place components get data from.
 * Mock mode: mockApi + officeMockApi. To connect the REST backend, implement each
 * method with `request()` from ./client.ts and export that object here instead.
 * Components do not change.
 */
export const api: Api = { ...mockApi, ...officeMockApi };

export type * from './types';
