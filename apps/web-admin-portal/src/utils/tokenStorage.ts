const ACCESS_TOKEN_KEY = 'dentalos_admin_access_token';
const REFRESH_TOKEN_KEY = 'dentalos_admin_refresh_token';
const USER_KEY = 'dentalos_admin_user';

type Storage = typeof localStorage | typeof sessionStorage;

function getStorage(persistent: boolean): Storage {
  return persistent ? localStorage : sessionStorage;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string, persistent: boolean = false): void {
    const storage = getStorage(persistent);
    // Clear from both storages first
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    storage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string, persistent: boolean = false): void {
    const storage = getStorage(persistent);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    storage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser<T>(): T | null {
    const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  setUser<T>(user: T, persistent: boolean = false): void {
    const storage = getStorage(persistent);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    storage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};
