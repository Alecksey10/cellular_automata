export const API_PREFIX = ""; // api/

export const AUTH_PREFIX =
    `${API_PREFIX}/auth`;

export const AUTH_ENDPOINTS = {
    register: `${AUTH_PREFIX}/register`,
    login: `${AUTH_PREFIX}/login`,
    me: `${AUTH_PREFIX}/me`,
    logout: `${AUTH_PREFIX}/logout`,
} as const;