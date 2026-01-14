import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authApi } from '@/src/api/auth';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingItem {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    color: string;
}

export default function SettingsScreen() {
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';
    const textColor = useThemeColor({}, 'text');
    const bgColor = useThemeColor({}, 'background');
    const cardBg = scheme === 'dark' ? '#1f1f1f' : '#FFFFFF';
    const borderColor = scheme === 'dark' ? '#333' : '#E5E5EA';
    const { theme, setTheme } = useTheme();

    const settingsItems: SettingItem[] = [
        {
            title: 'Categorias',
            description: 'Gerenciar categorias de produtos',
            icon: 'pricetags',
            route: '/settings/categories',
            color: '#007AFF',
        },
        {
            title: 'Operadores',
            description: 'Gerenciar operadores de caixa',
            icon: 'person',
            route: '/settings/cashiers',
            color: '#34C759',
        },
        {
            title: 'Formas de Pagamento',
            description: 'Gerenciar formas de pagamento',
            icon: 'card',
            route: '/settings/payment-forms',
            color: '#FF9500',
        },
        {
            title: 'Checkouts',
            description: 'Gerenciar pontos de venda',
            icon: 'storefront',
            route: '/settings/checkouts',
            color: '#5856D6',
        },
    ];

    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return 'sunny';
            case 'dark': return 'moon';
            case 'auto': return 'phone-portrait';
            default: return 'sunny';
        }
    };

    const getThemeLabel = () => {
        switch (theme) {
            case 'light': return 'Claro';
            case 'dark': return 'Escuro';
            case 'auto': return 'Automático';
            default: return 'Automático';
        }
    };

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
        await setTheme(newTheme);
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Deseja realmente sair da aplicação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await authApi.logout();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>Configurações</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Data Section */}
                <Text style={[styles.sectionTitle, { color: textColor, opacity: 0.6 }]}>DADOS</Text>
                {settingsItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.card, { backgroundColor: cardBg, borderColor }]}
                        onPress={() => router.push(item.route as any)}
                    >
                        <View style={[styles.cardIcon, { backgroundColor: item.color + '15' }]}>
                            <Ionicons name={item.icon} size={24} color={item.color} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: textColor }]}>
                                {item.title}
                            </Text>
                            <Text style={[styles.cardDescription, { color: textColor, opacity: 0.6 }]}>
                                {item.description}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={textColor} style={{ opacity: 0.4 }} />
                    </TouchableOpacity>
                ))}

                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: textColor, opacity: 0.6 }]}>APARÊNCIA</Text>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <View style={[styles.cardIcon, { backgroundColor: '#FF9F0A15' }]}>
                        <Ionicons name={getThemeIcon()} size={24} color="#FF9F0A" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, { color: textColor }]}>Tema</Text>
                        <Text style={[styles.cardDescription, { color: textColor, opacity: 0.6 }]}>
                            {getThemeLabel()}
                        </Text>
                    </View>
                    <View style={styles.themeButtons}>
                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                { backgroundColor: theme === 'light' ? '#007AFF' : cardBg, borderColor }
                            ]}
                            onPress={() => handleThemeChange('light')}
                        >
                            <Ionicons
                                name="sunny"
                                size={20}
                                color={theme === 'light' ? '#fff' : textColor}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                { backgroundColor: theme === 'dark' ? '#007AFF' : cardBg, borderColor }
                            ]}
                            onPress={() => handleThemeChange('dark')}
                        >
                            <Ionicons
                                name="moon"
                                size={20}
                                color={theme === 'dark' ? '#fff' : textColor}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                { backgroundColor: theme === 'auto' ? '#007AFF' : cardBg, borderColor }
                            ]}
                            onPress={() => handleThemeChange('auto')}
                        >
                            <Ionicons
                                name="phone-portrait"
                                size={20}
                                color={theme === 'auto' ? '#fff' : textColor}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: textColor, opacity: 0.6 }]}>CONTA</Text>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: cardBg, borderColor }]}
                    onPress={handleLogout}
                >
                    <View style={[styles.cardIcon, { backgroundColor: '#FF3B3015' }]}>
                        <Ionicons name="log-out" size={24} color="#FF3B30" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, { color: '#FF3B30' }]}>Sair</Text>
                        <Text style={[styles.cardDescription, { color: textColor, opacity: 0.6 }]}>
                            Desconectar da conta
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={textColor} style={{ opacity: 0.4 }} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginTop: 24,
        marginBottom: 12,
        marginLeft: 16,
    },
    themeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    themeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});
