import { clearAuth, getRefreshToken, getToken, http, initializeAuth, setDomain, setRefreshToken, setToken } from './client';
import { TokenDto } from './types';

export const authApi = {
    // Initialize auth from storage
    initialize: initializeAuth,

    // Login
    login: async (email: string, password: string, domain: string) => {
        // We set the domain temporarily for the login request if needed, 
        // but the main change is passing it in the body.
        await setDomain(domain);
        const result = await http<TokenDto>(`/login/authenticate`, {
            method: "POST",
            body: JSON.stringify({ email, password, tenant: domain }),
        });

        if (result.accessToken && result.refreshToken) {
            await setToken(result.accessToken);
            await setRefreshToken(result.refreshToken);
        }

        return result;
    },

    // Register
    register: async (email: string, password: string, domain: string) => {
        await setDomain(domain);
        const result = await http<TokenDto>(`/login/register`, {
            method: "POST",
            body: JSON.stringify({ email, password, tenant: domain }),
        });

        if (result.accessToken && result.refreshToken) {
            await setToken(result.accessToken);
            await setRefreshToken(result.refreshToken);
        }

        return result;
    },

    // Refresh token
    refreshToken: async () => {
        const accessToken = getToken();
        const refreshToken = getRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new Error('No tokens available');
        }

        const result = await http<TokenDto>(`/login/refresh`, {
            method: "POST",
            body: JSON.stringify({
                accessToken,
                refreshToken
            }),
        });

        if (result.accessToken && result.refreshToken) {
            await setToken(result.accessToken);
            await setRefreshToken(result.refreshToken);
        }

        return result;
    },

    // Logout
    logout: async () => {
        await clearAuth();
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!getToken() && !!getRefreshToken();
    },

    // Get current token
    getToken,

    // Get refresh token
    getRefreshToken,
};
