import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE =
    process.env.EXPO_PUBLIC_API_BASE || "https://leonardocoutinho.dev/api";

const TOKEN_KEY = '@app:accessToken';
const REFRESH_TOKEN_KEY = '@app:refreshToken';
const DOMAIN_KEY = '@app:domain';

let authToken: string | null = null;
let refreshToken: string | null = null;
let domain: string | null = null;

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

export const setToken = async (token: string | null) => {
    authToken = token;
    if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
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

    // Concatenate domain if present
    const fullPath = domain ? `/${domain}${path}` : path;
    const url = `${API_BASE}${fullPath}`;

    console.log(`[HTTP] ${init?.method || 'GET'} ${url}`);

    const res = await fetch(url, {
        headers,
        ...init,
    });

    if (!res.ok) {
        const errorBody = await res.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${res.status}: ${errorBody}`);
    }

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        return (await res.json()) as T;
    }

    return undefined as unknown as T;
}
