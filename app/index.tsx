import { authApi } from '@/src/api/auth';
import { setOnUnauthorized } from '@/src/api/client';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const router = useRouter();
    const segments = useSegments();
    const [isReady, setIsReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Configure unauthorized callback
            setOnUnauthorized(() => {
                console.log('[App] Unauthorized callback triggered - redirecting to login');
                setIsAuthenticated(false);
                router.replace('/login');
            });

            // Initialize auth from storage
            await authApi.initialize();

            // Check if user is authenticated
            const authenticated = authApi.isAuthenticated();
            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('Error initializing app:', error);
            setIsAuthenticated(false);
        } finally {
            setIsReady(true);
        }
    };

    useEffect(() => {
        if (!isReady) return;

        const inAuthGroup = segments[0] === '(tabs)';

        if (isAuthenticated && !inAuthGroup) {
            // Redirect to products page if authenticated
            router.replace('/(tabs)/products');
        } else if (!isAuthenticated && inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/login');
        } else if (!isAuthenticated && segments.length <= 1) {
            // Initial load - redirect to login
            router.replace('/login');
        } else if (isAuthenticated && segments.length <= 1) {
            // Initial load - redirect to products
            router.replace('/(tabs)/products');
        }
    }, [isReady, isAuthenticated, segments]);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // Return loading while redirecting
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
}
