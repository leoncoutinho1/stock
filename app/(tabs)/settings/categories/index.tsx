import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Category, deleteCategory, listCategories } from '@/src/api/category';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';
    const textColor = useThemeColor({}, 'text');
    const bgColor = useThemeColor({}, 'background');
    const cardBg = scheme === 'dark' ? '#1f1f1f' : '#FFFFFF';
    const borderColor = scheme === 'dark' ? '#333' : '#E5E5EA';

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCategories = async () => {
        try {
            const result = await listCategories();
            setCategories(result.data);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            Alert.alert('Erro', 'Não foi possível carregar as categorias');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadCategories();
    };

    const handleDelete = (id: string, description: string) => {
        Alert.alert(
            'Confirmar exclusão',
            `Deseja realmente excluir a categoria "${description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategory(id);
                            loadCategories();
                        } catch (error) {
                            console.error('Erro ao excluir categoria:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a categoria');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Category }) => (
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <TouchableOpacity
                style={styles.cardContent}
                onPress={() => router.push(`/settings/categories/${item.id}` as any)}
            >
                <View style={styles.cardIcon}>
                    <Ionicons name="pricetag" size={20} color="#007AFF" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>
                        {item.description}
                    </Text>
                    <Text style={[styles.cardDate, { color: textColor, opacity: 0.5 }]}>
                        Criado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id, item.description)}
            >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Categorias</Text>
            </View>

            <FlatList
                data={categories}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="pricetags-outline" size={64} color={textColor} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
                            Nenhuma categoria cadastrada
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/settings/categories/new' as any)}
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
        backgroundColor: '#007AFF15',
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
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});
