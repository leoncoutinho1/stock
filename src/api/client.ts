import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE =
    process.env.EXPO_PUBLIC_API_BASE || "https://leonardocoutinho.dev/stock/api";

const TOKEN_KEY = '@app:accessToken';
const REFRESH_TOKEN_KEY = '@app:refreshToken';
const DOMAIN_KEY = '@app:domain';

let authToken: string | null = null;
let refreshToken: string | null = null;
let domain: string | null = null;

// Callback to handle unauthorized access (401)
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
    onUnauthorizedCallback = callback;
};

// Initialize tokens from storage
export const initializeAuth = async () => {
    try {
        const [storedToken, storedRefreshToken, storedDomain] = await Promise.all([
            AsyncStorage.getItem(TOKEN_KEY),
            AsyncStorage.getItem(REFRESH_TOKEN_KEY),
            AsyncStorage.getItem(DOMAIN_KEY),
        ]);

        authToken = storedToken;
        refreshToken = storedRefreshToken;
        domain = storedDomain;
    } catch (error) {
        console.error('Error initializing auth:', error);
    }
};

// Helper to decode base64 for JWT payload
const decodeBase64 = (str: string) => {
    try {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        str = str.replace(/=+$/, '');
        for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++));) {
            buffer = chars.indexOf(buffer);
            if (buffer === -1) continue;
            bs = bc % 4 ? bs * 64 + buffer : buffer;
            if (bc++ % 4) {
                output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
            }
        }
        return output;
    } catch (e) {
        return '';
    }
};

export const setToken = async (token: string | null) => {
    authToken = token;
    if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);

        // Extract tenant from JWT and update domain
        try {
            const parts = token.split('.');
            if (parts.length >= 2) {
                const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                const decoded = JSON.parse(decodeBase64(payload));
                if (decoded && (decoded.tenant || decoded.domain)) {
                    await setDomain(decoded.tenant || decoded.domain);
                }
            }
        } catch (error) {
            console.error('Error decoding token tenant:', error);
        }
    } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
    }
};

export const getToken = () => authToken;

export const setRefreshToken = async (token: string | null) => {
    refreshToken = token;
    if (token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};

export const getRefreshToken = () => refreshToken;

export const setDomain = async (newDomain: string | null) => {
    domain = newDomain;
    if (newDomain) {
        await AsyncStorage.setItem(DOMAIN_KEY, newDomain);
    } else {
        await AsyncStorage.removeItem(DOMAIN_KEY);
    }
};

export const getDomain = () => domain;

export const clearAuth = async () => {
    authToken = null;
    refreshToken = null;
    domain = null;
    await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(DOMAIN_KEY),
    ]);
};

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    // Base URL is used directly, tenant is now in JWT
    const url = `${API_BASE}${path}`;

    console.log(`[HTTP] ${init?.method || 'GET'} ${url}`);

    const res = await fetch(url, {
        headers,
        ...init,
    });

    if (!res.ok) {
        // Check if token is invalid (401 Unauthorized)
        if (res.status === 401) {
            console.log('[HTTP] Token inválido (401) - fazendo logout automático');

            // Clear auth data
            await clearAuth();

            // Call the unauthorized callback if set
            if (onUnauthorizedCallback) {
                onUnauthorizedCallback();
            }

            throw new Error('Token inválido. Você foi deslogado.');
        }

        const errorBody = await res.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${res.status}: ${errorBody}`);
    }

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        return (await res.json()) as T;
    }

    return undefined as unknown as T;
}
