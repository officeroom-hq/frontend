/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL including /api/v1. Defaults to http://localhost:3000/api/v1. */
  readonly VITE_API_URL?: string;
}
