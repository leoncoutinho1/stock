import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Cashier, deleteCashier, listCashiers } from '@/src/api/cashier';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CashiersScreen() {
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';
    const textColor = useThemeColor({}, 'text');
    const bgColor = useThemeColor({}, 'background');
    const cardBg = scheme === 'dark' ? '#1f1f1f' : '#FFFFFF';
    const borderColor = scheme === 'dark' ? '#333' : '#E5E5EA';

    const [cashiers, setCashiers] = useState<Cashier[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCashiers = async () => {
        try {
            const result = await listCashiers();
            setCashiers(result.data);
        } catch (error) {
            console.error('Erro ao carregar operadores:', error);
            Alert.alert('Erro', 'Não foi possível carregar as operadores');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCashiers();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadCashiers();
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Confirmar exclusão',
            `Deseja realmente excluir o operador "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCashier(id);
                            loadCashiers();
                        } catch (error) {
                            console.error('Erro ao excluir operador:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o operador');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Cashier }) => (
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <TouchableOpacity
                style={styles.cardContent}
                onPress={() => router.push(`/settings/cashiers/${item.id}` as any)}
            >
                <View style={styles.cardIcon}>
                    <Ionicons name="person" size={20} color="#34C759" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.cardDate, { color: textColor, opacity: 0.5 }]}>
                        Criado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id, item.name)}
            >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color="#34C759" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Operadores</Text>
            </View>

            <FlatList
                data={cashiers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={textColor} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
                            Nenhum operador cadastrado
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/settings/cashiers/new' as any)}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    list: {
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
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#34C75915',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});
