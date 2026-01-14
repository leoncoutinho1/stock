import { useTheme } from '@/src/contexts/ThemeContext';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
    try {
        const { effectiveColorScheme } = useTheme();
        return effectiveColorScheme;
    } catch (error) {
        // Fallback to React Native's useColorScheme if ThemeProvider is not available
        return useRNColorScheme();
    }
}
