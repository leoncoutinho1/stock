import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Category, listCategories } from '@/src/api/category';
import { productApi } from '@/src/api/product';
import { ProductDto } from '@/src/api/types';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
  const [unitModalOpen, setUnitModalOpen] = useState(false);

  const units = [
    { label: 'UN - Unidade', value: 'UN' },
    { label: 'KG - Quilograma', value: 'KG' },
    { label: 'LT - Litro', value: 'LT' },
    { label: 'PC - Peça', value: 'PC' },
  ];

  // Composition States
  const [composite, setComposite] = useState(false);
  const [componentProducts, setComponentProducts] = useState<any[]>([]);
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [compSearchText, setCompSearchText] = useState('');
  const [compSearchResults, setCompSearchResults] = useState<ProductDto[]>([]);
  const [compSearchLoading, setCompSearchLoading] = useState(false);

  const resetForm = () => {
    setDescription('');
    setCategoryId('');
    setCost('');
    setProfitMargin('');
    setPrice('');
    setQuantity('');
    setUnit('UN');
    setBarcodes(['']);
    setComposite(false);
    setComponentProducts([]);
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

      // Composição
      setComposite(!!product.composite);
      setComponentProducts(product.componentProducts?.map(cp => ({ ...cp, quantity: cp.quantity.toString() })) || []);

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

  const searchComponents = async () => {
    if (!compSearchText.trim()) return;
    setCompSearchLoading(true);
    try {
      const results = await productApi.searchProducts(compSearchText);
      // Backend returns either ProductDto, ProductDto[] or wrapped result
      if (Array.isArray(results)) {
        setCompSearchResults(results.filter(p => p.id !== id)); // Don't allow self-composition
      } else if (results && (results as any).id) {
        setCompSearchResults([(results as ProductDto)].filter(p => p.id !== id));
      } else {
        setCompSearchResults([]);
      }
    } catch (error) {
      console.error('Erro ao buscar componentes:', error);
    } finally {
      setCompSearchLoading(false);
    }
  };

  const addComponent = (product: ProductDto) => {
    if (componentProducts.some(p => p.componentProductId === product.id)) {
      Alert.alert('Aviso', 'Este produto já foi adicionado à composição');
      return;
    }

    const newComponent: any = {
      componentProductId: product.id,
      componentProductDescription: product.description,
      quantity: '1',
      componentProductPrice: product.price,
      componentProductCost: product.cost
    };

    setComponentProducts([...componentProducts, newComponent]);
    setCompModalOpen(false);
    setCompSearchText('');
    setCompSearchResults([]);

    // Recalcular custo total se for composto
    updateCompositeCost([...componentProducts, newComponent]);
  };

  const removeComponent = (productId: string) => {
    const updated = componentProducts.filter(p => p.componentProductId !== productId);
    setComponentProducts(updated);
    updateCompositeCost(updated);
  };

  const updateComponentQuantity = (productId: string, qty: string) => {
    // Allow comma or dot for decimals
    const sanitizedQty = qty.replace(',', '.');

    // Only allow numeric characters and one decimal point
    if (sanitizedQty !== '' && !/^\d*\.?\d*$/.test(sanitizedQty)) {
      return;
    }

    const updated = componentProducts.map(p =>
      p.componentProductId === productId ? { ...p, quantity: sanitizedQty } : p
    );
    setComponentProducts(updated);
    updateCompositeCost(updated);
  };

  const updateCompositeCost = (components: any[]) => {
    if (composite) {
      const totalCost = components.reduce((sum, p) => {
        const qty = typeof p.quantity === 'string' ? parseFloat(p.quantity) || 0 : p.quantity;
        return sum + (p.componentProductCost || 0) * qty;
      }, 0);
      setCost(totalCost.toFixed(2));

      // Se houver margem, recalcular preço
      if (profitMargin) {
        const marginValue = parseFloat(profitMargin);
        if (!isNaN(marginValue)) {
          const calculatedPrice = totalCost * (1 + marginValue / 100);
          setPrice(calculatedPrice.toFixed(2));
        }
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
        composite: composite,
        componentProducts: composite ? componentProducts.map(cp => ({
          componentProductId: cp.componentProductId,
          quantity: typeof cp.quantity === 'string' ? parseFloat(cp.quantity) || 0 : cp.quantity
        })) : []
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setUnitModalOpen(true)}
              style={[styles.pickerContainer, { borderColor, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 48 }]}
            >
              <Text style={{ color: textColor }}>
                {units.find(u => u.value === unit)?.label || 'Selecione'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={textColor} />
            </TouchableOpacity>
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

        {/* Produto Composto */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.label, { color: textColor, marginBottom: 0 }]}>Produto Composto</Text>
              <Text style={[styles.helperText, { color: textColor, opacity: 0.5 }]}>
                Este produto é formado por outros produtos?
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const newValue = !composite;
                setComposite(newValue);
                if (newValue) updateCompositeCost(componentProducts);
              }}
              style={styles.customSwitchContainer}
            >
              <View style={[
                styles.customSwitchTrack,
                { backgroundColor: composite ? '#34C759' : '#767577' }
              ]}>
                <View style={[
                  styles.customSwitchThumb,
                  { transform: [{ translateX: composite ? 20 : 0 }] }
                ]} />
              </View>
            </TouchableOpacity>
          </View>

          {composite && (
            <View style={styles.compositionContainer}>
              <View style={[styles.separator, { backgroundColor: borderColor }]} />
              <View style={styles.barcodeHeader}>
                <Text style={[styles.label, { color: textColor }]}>Componentes</Text>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: '#007AFF' }]}
                  onPress={() => setCompModalOpen(true)}
                >
                  <Ionicons name="search" size={18} color="#fff" />
                  <Text style={styles.addButtonText}>Buscar</Text>
                </TouchableOpacity>
              </View>

              {componentProducts.length === 0 ? (
                <Text style={[styles.helperText, { color: textColor, opacity: 0.5, textAlign: 'center', marginVertical: 10 }]}>
                  Nenhum componente adicionado
                </Text>
              ) : (
                componentProducts.map((item) => (
                  <View key={item.componentProductId} style={styles.componentItem}>
                    <View style={styles.componentInfo}>
                      <Text style={[styles.componentTitle, { color: textColor }]} numberOfLines={1}>
                        {item.componentProductDescription}
                      </Text>
                      <Text style={[styles.componentSub, { color: textColor, opacity: 0.6 }]}>
                        Custo: R$ {(item.componentProductCost || 0).toFixed(2)} | Subtotal: R$ {((item.componentProductCost || 0) * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.componentActions}>
                      <TextInput
                        style={[styles.input, styles.qtyInput, { color: textColor, borderColor }]}
                        value={item.quantity.toString()}
                        onChangeText={(val) => updateComponentQuantity(item.componentProductId, val)}
                        keyboardType="decimal-pad"
                      />
                      <TouchableOpacity
                        style={[styles.removeButtonSmall, { backgroundColor: '#FF3B30' }]}
                        onPress={() => removeComponent(item.componentProductId)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <View style={styles.compositeSummary}>
                <Text style={[styles.summaryText, { color: textColor }]}>
                  Custo Total da Composição: <Text style={{ fontWeight: 'bold' }}>R$ {parseFloat(cost || '0').toFixed(2)}</Text>
                </Text>
              </View>
            </View>
          )}
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
      {/* Modal de Busca de Componentes */}
      <Modal
        visible={compModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Adicionar Componente</Text>
              <TouchableOpacity onPress={() => setCompModalOpen(false)}>
                <Ionicons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { borderColor }]}>
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Nome ou código do componente..."
                placeholderTextColor={textColor + '80'}
                value={compSearchText}
                onChangeText={setCompSearchText}
                onSubmitEditing={searchComponents}
                autoFocus
              />
              <TouchableOpacity onPress={searchComponents} style={styles.searchIcon}>
                <Ionicons name="search" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={compSearchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.searchResultItem, { borderBottomColor: borderColor }]}
                  onPress={() => addComponent(item)}
                >
                  <View>
                    <Text style={[styles.searchResultTitle, { color: textColor }]}>{item.description}</Text>
                    <Text style={[styles.searchResultSub, { color: textColor, opacity: 0.6 }]}>
                      Custo: R$ {item.cost.toFixed(2)} | Preço: R$ {item.price.toFixed(2)}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color="#34C759" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                !compSearchLoading && compSearchText ? (
                  <Text style={[styles.emptySearchText, { color: textColor, opacity: 0.5 }]}>
                    Nenhum produto encontrado
                  </Text>
                ) : null
              )}
              ListHeaderComponent={() => (
                compSearchLoading ? <ActivityIndicator style={{ margin: 20 }} color="#007AFF" /> : null
              )}
              style={styles.resultsList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Unidade */}
      <Modal
        visible={unitModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setUnitModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setUnitModalOpen(false)}
        >
          <View style={[styles.unitModalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor, marginBottom: 16 }]}>Selecione a Unidade</Text>
            {units.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[
                  styles.unitOption,
                  { borderBottomColor: borderColor },
                  unit === u.value && { backgroundColor: '#007AFF20' }
                ]}
                onPress={() => {
                  setUnit(u.value);
                  setUnitModalOpen(false);
                }}
              >
                <Text style={{ color: unit === u.value ? '#007AFF' : textColor, fontSize: 16, fontWeight: unit === u.value ? 'bold' : 'normal' }}>
                  {u.label}
                </Text>
                {unit === u.value && <Ionicons name="checkmark" size={20} color="#007AFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compositionContainer: {
    marginTop: 16,
  },
  separator: {
    height: 1,
    marginBottom: 16,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  componentInfo: {
    flex: 1,
    marginRight: 10,
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  componentSub: {
    fontSize: 12,
  },
  componentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyInput: {
    width: 100,
    padding: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  removeButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compositeSummary: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  unitModalContent: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  unitOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customSwitchContainer: {
    padding: 4,
  },
  customSwitchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  customSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchIcon: {
    padding: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultSub: {
    fontSize: 13,
  },
  emptySearchText: {
    textAlign: 'center',
    marginTop: 40,
  },
  resultsList: {
    flex: 1,
  },
});
