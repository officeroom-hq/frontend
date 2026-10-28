/** Artificial latency so loading states are exercised in mock mode. */
export const delay = <T,>(value: T, ms = 280): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const fail = <T = never,>(message: string, ms = 350): Promise<T> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
