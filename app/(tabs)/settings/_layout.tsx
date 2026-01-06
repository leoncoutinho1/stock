import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerTitle: 'Configurações',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="categories/index" />
            <Stack.Screen name="categories/[id]" />
            <Stack.Screen name="cashiers/index" />
            <Stack.Screen name="cashiers/[id]" />
            <Stack.Screen name="payment-forms/index" />
            <Stack.Screen name="payment-forms/[id]" />
            <Stack.Screen name="checkouts/index" />
            <Stack.Screen name="checkouts/[id]" />
        </Stack>
    );
}
