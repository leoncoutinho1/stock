import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Category, listCategories } from '@/src/api/category';
import { productApi } from '@/src/api/product';
import { ProductDto } from '@/src/api/types';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';
  const borderColor = scheme === 'dark' ? '#333' : '#e0e0e0';

  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [cost, setCost] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('UN');
  const [barcodes, setBarcodes] = useState<string[]>(['']); // Array of barcodes, starts with one empty
  const [scanOpen, setScanOpen] = useState(false);
  const [scanningIndex, setScanningIndex] = useState(0); // Track which barcode is being scanned
  const [permission, requestPermission] = useCameraPermissions();

  const resetForm = () => {
    setDescription('');
    setCategoryId('');
    setCost('');
    setProfitMargin('');
    setPrice('');
    setQuantity('');
    setUnit('UN');
    setBarcodes(['']);
  };

  useEffect(() => {
    loadCategories();
    if (!isNew) {
      loadProduct();
    } else {
      resetForm();
      setInitialLoading(false);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const result = await listCategories({ limit: 1000 });
      setCategories(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProduct = async () => {
    try {
      console.log('Loading product with id:', id);
      const response = await productApi.getProduct(id);
      console.log('Product response:', response);

      // Handle ErrorOr response format from backend
      let product: ProductDto | null = null;

      if (response && typeof response === 'object') {
        // Check if it's an ErrorOr with errors
        if ('isError' in response && (response as any).isError) {
          const errors = (response as any).errors || [];
          const errorMessage = errors.length > 0 ? errors[0].description : 'Produto não encontrado';
          throw new Error(errorMessage);
        }

        // Check if it's wrapped in a value property (ErrorOr success)
        if ('value' in response) {
          product = (response as any).value;
        } else {
          // Direct product object
          product = response as ProductDto;
        }
      }

      if (!product || !product.id) {
        throw new Error('Produto não encontrado');
      }

      console.log('Product data:', product);

      setDescription(product.description || '');
      setCategoryId(product.categoryId || '');
      setCost(product.cost?.toString() || '');
      setPrice(product.price?.toString() || '');
      setQuantity(product.quantity?.toString() || '');
      setUnit(product.unit || 'UN');

      // Load all barcodes, or start with one empty field
      setBarcodes(product.barcodes && product.barcodes.length > 0 ? product.barcodes : ['']);

      // Calcular margem de lucro se custo e preço existirem
      if (product.cost && product.price && product.cost > 0) {
        const margin = ((product.price - product.cost) / product.cost) * 100;
        setProfitMargin(margin.toFixed(2));
      }
    } catch (error: any) {
      console.error('Erro ao carregar produto:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar o produto');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCostChange = (value: string) => {
    setCost(value);

    // Se houver margem de lucro definida, recalcular o preço
    if (value && profitMargin) {
      const costValue = parseFloat(value);
      const marginValue = parseFloat(profitMargin);

      if (!isNaN(costValue) && !isNaN(marginValue) && costValue > 0) {
        const calculatedPrice = costValue * (1 + marginValue / 100);
        setPrice(calculatedPrice.toFixed(2));
      }
    }
  };

  const handleProfitMarginChange = (value: string) => {
    setProfitMargin(value);

    // Calcular preço baseado no custo e margem
    if (cost && value) {
      const costValue = parseFloat(cost);
      const marginValue = parseFloat(value);

      if (!isNaN(costValue) && !isNaN(marginValue) && costValue > 0) {
        const calculatedPrice = costValue * (1 + marginValue / 100);
        setPrice(calculatedPrice.toFixed(2));
      }
    }
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);

    // Recalcular margem de lucro se custo estiver preenchido
    if (cost && value) {
      const costValue = parseFloat(cost);
      const priceValue = parseFloat(value);

      if (!isNaN(costValue) && !isNaN(priceValue) && costValue > 0) {
        const margin = ((priceValue - costValue) / costValue) * 100;
        setProfitMargin(margin.toFixed(2));
      }
    }
  };

  // Barcode management functions
  const handleBarcodeChange = (index: number, value: string) => {
    const newBarcodes = [...barcodes];
    newBarcodes[index] = value;
    setBarcodes(newBarcodes);
  };

  const addBarcode = () => {
    setBarcodes([...barcodes, '']);
  };

  const removeBarcode = (index: number) => {
    if (barcodes.length > 1) {
      const newBarcodes = barcodes.filter((_, i) => i !== index);
      setBarcodes(newBarcodes);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Atenção', 'Por favor, informe a descrição do produto');
      return;
    }

    if (!categoryId) {
      Alert.alert('Atenção', 'Por favor, selecione uma categoria');
      return;
    }

    if (!cost || parseFloat(cost) <= 0) {
      Alert.alert('Atenção', 'Por favor, informe um custo válido');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Atenção', 'Por favor, informe um preço válido');
      return;
    }

    // Validate first barcode is required
    if (!barcodes[0] || !barcodes[0].trim()) {
      Alert.alert('Atenção', 'Por favor, informe pelo menos um código de barras');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty barcodes and trim
      const validBarcodes = barcodes
        .map(b => b.trim())
        .filter(b => b.length > 0);

      const payload: any = {
        description: description.trim(),
        categoryId: categoryId,
        cost: parseFloat(cost) || 0,
        price: parseFloat(price) || 0,
        quantity: parseFloat(quantity) || 0,
        unit: unit,
        barcodes: validBarcodes,
        isActive: true,
      };

      if (isNew) {
        // Don't send id for new products - backend will generate it
        await productApi.createProduct(payload);
        Alert.alert('Sucesso', 'Produto criado com sucesso!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        // Include id for updates
        payload.id = id;
        await productApi.updateProduct(id, payload);
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirmar exclusão', 'Deseja realmente desativar este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desativar',
        style: 'destructive',
        onPress: async () => {
          try {
            await productApi.deactivateProduct(id);
            Alert.alert('Sucesso', 'Produto desativado com sucesso!', [
              { text: 'OK', onPress: () => router.replace('/(tabs)/products/index') }
            ]);
          } catch (error) {
            console.error('Erro ao desativar produto:', error);
            Alert.alert('Erro', 'Não foi possível desativar o produto');
          }
        },
      },
    ]);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à câmera para escanear códigos de barras');
        return;
      }
    }
    setScanOpen(true);
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
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
          {isNew ? 'Novo Produto' : 'Editar Produto'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Descrição */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Descrição *</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Digite a descrição do produto"
            placeholderTextColor={textColor + '80'}
            autoFocus={isNew}
          />
        </View>

        {/* Categoria */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Categoria *</Text>
          {categories.length === 0 ? (
            <Text style={[styles.helperText, { color: textColor, opacity: 0.5 }]}>
              Nenhuma categoria cadastrada. Cadastre uma categoria em Configurações.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: categoryId === category.id ? '#007AFF' : cardBg,
                      borderColor: categoryId === category.id ? '#007AFF' : borderColor,
                    }
                  ]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: categoryId === category.id ? '#fff' : textColor }
                    ]}
                  >
                    {category.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Custo e Margem de Lucro */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Custo *</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              value={cost}
              onChangeText={handleCostChange}
              placeholder="0.00"
              placeholderTextColor={textColor + '80'}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.card, styles.halfCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Margem (%)</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              value={profitMargin}
              onChangeText={handleProfitMarginChange}
              placeholder="0.00"
              placeholderTextColor={textColor + '80'}
              keyboardType="decimal-pad"
              editable={!!cost && parseFloat(cost) > 0}
            />
          </View>
        </View>

        {/* Preço de Venda */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Preço de Venda *</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            value={price}
            onChangeText={handlePriceChange}
            placeholder="0.00"
            placeholderTextColor={textColor + '80'}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Quantidade e Unidade */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Quantidade em Estoque</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              placeholderTextColor={textColor + '80'}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.card, styles.halfCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Unidade *</Text>
            <Picker
              selectedValue={unit}
              onValueChange={(itemValue) => setUnit(itemValue)}
              style={[styles.picker, { color: textColor }]}
            >
              <Picker.Item label="UN - Unidade" value="UN" />
              <Picker.Item label="KG - Quilograma" value="KG" />
              <Picker.Item label="LT - Litro" value="LT" />
              <Picker.Item label="PC - Peça" value="PC" />
            </Picker>
          </View>
        </View>

        {/* Códigos de Barras */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.barcodeHeader}>
            <Text style={[styles.label, { color: textColor }]}>Códigos de Barras *</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: '#007AFF' }]}
              onPress={addBarcode}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {barcodes.map((barcode, index) => (
            <View key={index} style={styles.barcodeItem}>
              <View style={styles.barcodeRow}>
                <TextInput
                  style={[styles.input, styles.barcodeInput, { color: textColor, borderColor }]}
                  value={barcode}
                  onChangeText={(value) => handleBarcodeChange(index, value)}
                  placeholder={index === 0 ? "Código principal (obrigatório)" : "Código adicional"}
                  placeholderTextColor={textColor + '80'}
                />
                <TouchableOpacity
                  style={[styles.scanButton, { backgroundColor: '#007AFF' }]}
                  onPress={() => {
                    setScanningIndex(index);
                    openScanner();
                  }}
                >
                  <Ionicons name="barcode-outline" size={24} color="#fff" />
                </TouchableOpacity>
                {barcodes.length > 1 && (
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: '#FF3B30' }]}
                    onPress={() => removeBarcode(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
              {index === 0 && (
                <Text style={[styles.helperText, { color: textColor, opacity: 0.5 }]}>
                  Este é o código principal e é obrigatório
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Botões de Ação */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>
                  {isNew ? 'Criar Produto' : 'Salvar Alterações'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!isNew && (
            <TouchableOpacity
              style={[styles.button, styles.buttonDestructive]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Desativar Produto</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Scanner Modal */}
      {scanOpen && (
        <View style={styles.modal}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
            }}
            onBarcodeScanned={({ data }) => {
              handleBarcodeChange(scanningIndex, String(data));
              setScanOpen(false);
            }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setScanOpen(false)}
            >
              <Ionicons name="close" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  barcodeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  barcodeInput: {
    flex: 1,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  barcodeItem: {
    marginBottom: 12,
  },
  removeButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#666',
  },
  buttonDestructive: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    marginBottom: 40,
  },
  picker: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
});
