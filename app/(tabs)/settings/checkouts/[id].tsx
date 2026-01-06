import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState, useEffect } from 'react';
import { getCheckout, createCheckout, updateCheckout, CheckoutInsertDTO, CheckoutUpdateDTO } from '@/src/api/checkout';

export default function CheckoutFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const scheme = useColorScheme() ?? 'light';
    const textColor = useThemeColor({}, 'text');
    const bgColor = useThemeColor({}, 'background');
    const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';
    const borderColor = scheme === 'dark' ? '#333' : '#e0e0e0';

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const isNew = id === 'new';

    useEffect(() => {
        if (!isNew) {
            loadCheckout();
        } else {
            setInitialLoading(false);
        }
    }, [id]);

    const loadCheckout = async () => {
        try {
            const checkout = await getCheckout(id) as any;
            setName(checkout.value.name);
        } catch (error) {
            console.error('Erro ao carregar checkout:', error);
            Alert.alert('Erro', 'Não foi possível carregar o checkout');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'Por favor, informe o nome do checkout');
            return;
        }

        setLoading(true);
        try {
            if (isNew) {
                const dto: CheckoutInsertDTO = { name: name.trim() };
                await createCheckout(dto);
            } else {
                const dto: CheckoutUpdateDTO = { id, name: name.trim() };
                await updateCheckout(dto);
            }
            Alert.alert('Sucesso', `Checkout ${isNew ? 'criado' : 'atualizado'} com sucesso!`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Erro ao salvar checkout:', error);
            Alert.alert('Erro', 'Não foi possível salvar o checkout');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color="#5856D6" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: bgColor }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>
                    {isNew ? 'Novo Checkout' : 'Editar Checkout'}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <Text style={[styles.label, { color: textColor }]}>Nome</Text>
                    <TextInput
                        style={[styles.input, { color: textColor, borderColor }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Digite o nome do checkout"
                        placeholderTextColor={textColor + '80'}
                        autoFocus
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>
                                {isNew ? 'Criar Checkout' : 'Salvar Alterações'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#5856D6',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
