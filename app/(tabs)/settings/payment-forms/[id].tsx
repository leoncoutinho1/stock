import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState, useEffect } from 'react';
import { getPaymentForm, createPaymentForm, updatePaymentForm, PaymentFormInsertDTO, PaymentFormUpdateDTO } from '@/src/api/paymentForm';

export default function PaymentFormFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const scheme = useColorScheme() ?? 'light';
    const textColor = useThemeColor({}, 'text');
    const bgColor = useThemeColor({}, 'background');
    const cardBg = scheme === 'dark' ? '#1f1f1f' : '#FFFFFF';
    const borderColor = scheme === 'dark' ? '#333' : '#E5E5EA';

    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const isNew = id === 'new';

    useEffect(() => {
        if (!isNew) {
            loadPaymentForm();
        } else {
            setInitialLoading(false);
        }
    }, [id]);

    const loadPaymentForm = async () => {
        try {
            const paymentForm = await getPaymentForm(id) as any;
            setDescription(paymentForm.value.description);
        } catch (error) {
            console.error('Erro ao carregar forma de pagamento:', error);
            Alert.alert('Erro', 'Não foi possível carregar a forma de pagamento');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async () => {
        if (!description.trim()) {
            Alert.alert('Atenção', 'Por favor, informe a descrição da forma de pagamento');
            return;
        }

        setLoading(true);
        try {
            if (isNew) {
                const dto: PaymentFormInsertDTO = { description: description.trim() };
                await createPaymentForm(dto);
            } else {
                const dto: PaymentFormUpdateDTO = { id, description: description.trim() };
                await updatePaymentForm(dto);
            }
            Alert.alert('Sucesso', `Forma de pagamento ${isNew ? 'criada' : 'atualizada'} com sucesso!`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Erro ao salvar forma de pagamento:', error);
            Alert.alert('Erro', 'Não foi possível salvar a forma de pagamento');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color="#FF9500" />
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
                    {isNew ? 'Nova Forma de Pagamento' : 'Editar Forma de Pagamento'}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <Text style={[styles.label, { color: textColor }]}>Descrição</Text>
                    <TextInput
                        style={[styles.input, { color: textColor, borderColor }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Digite a descrição da forma de pagamento"
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
                                {isNew ? 'Criar Forma de Pagamento' : 'Salvar Alterações'}
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
        backgroundColor: '#FF9500',
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
