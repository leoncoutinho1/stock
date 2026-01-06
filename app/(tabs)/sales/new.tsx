import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { productApi } from '@/src/api/product';
import { saleApi } from '@/src/api/sale';
import { listCashiers, Cashier } from '@/src/api/cashier';
import { listPaymentForms, PaymentForm } from '@/src/api/paymentForm';
import { listCheckouts, Checkout } from '@/src/api/checkout';
import { ProductDto, SaleDTO, SaleProductDTO } from '@/src/api/types';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo } from 'react';
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

const STORAGE_KEYS = {
  CASHIER: '@sale_cashier',
  CHECKOUT: '@sale_checkout',
  PAYMENT_FORM: '@sale_payment_form',
};

interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export default function SaleNewScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';
  const borderColor = scheme === 'dark' ? '#333' : '#e0e0e0';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Products
  const [products, setProducts] = useState<Record<string, ProductDto>>({});
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Scanner
  const [scanOpen, setScanOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Sale details
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [paymentForms, setPaymentForms] = useState<PaymentForm[]>([]);

  const [selectedCashier, setSelectedCashier] = useState('');
  const [selectedCheckout, setSelectedCheckout] = useState('');
  const [selectedPaymentForm, setSelectedPaymentForm] = useState('');

  const [paidValue, setPaidValue] = useState('');
  const [overallDiscount, setOverallDiscount] = useState('0');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products
      const productsData = await productApi.getProducts({ limit: 10000 });
      const productMap: Record<string, ProductDto> = {};
      const productList = Array.isArray(productsData) ? productsData : productsData.data || [];
      for (const p of productList) {
        productMap[p.id] = p;
      }
      setProducts(productMap);

      // Load cashiers, checkouts, payment forms
      const [cashiersData, checkoutsData, paymentFormsData] = await Promise.all([
        listCashiers({ limit: 1000 }),
        listCheckouts({ limit: 1000 }),
        listPaymentForms({ limit: 1000 }),
      ]);

      setCashiers(cashiersData.data || []);
      setCheckouts(checkoutsData.data || []);
      setPaymentForms(paymentFormsData.data || []);

      // Load saved selections
      const [savedCashier, savedCheckout, savedPaymentForm] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CASHIER),
        AsyncStorage.getItem(STORAGE_KEYS.CHECKOUT),
        AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_FORM),
      ]);

      if (savedCashier) setSelectedCashier(savedCashier);
      if (savedCheckout) setSelectedCheckout(savedCheckout);
      if (savedPaymentForm) setSelectedPaymentForm(savedPaymentForm);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  // Save selections to AsyncStorage
  useEffect(() => {
    if (selectedCashier) AsyncStorage.setItem(STORAGE_KEYS.CASHIER, selectedCashier);
  }, [selectedCashier]);

  useEffect(() => {
    if (selectedCheckout) AsyncStorage.setItem(STORAGE_KEYS.CHECKOUT, selectedCheckout);
  }, [selectedCheckout]);

  useEffect(() => {
    if (selectedPaymentForm) AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_FORM, selectedPaymentForm);
  }, [selectedPaymentForm]);

  // Filtered products for search
  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];

    return Object.values(products)
      .filter(p => p.ind_active !== false)
      .filter(p =>
        p.description.toLowerCase().includes(q) ||
        p.barcodes?.some(b => b.toLowerCase().includes(q))
      )
      .slice(0, 10); // Limit to 10 results
  }, [products, searchText]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);
  }, [cart]);

  const discountValue = useMemo(() => {
    return parseFloat(overallDiscount) || 0;
  }, [overallDiscount]);

  const total = useMemo(() => {
    return Math.max(subtotal - discountValue, 0);
  }, [subtotal, discountValue]);

  const changeValue = useMemo(() => {
    const paid = parseFloat(paidValue) || 0;
    return Math.max(paid - total, 0);
  }, [paidValue, total]);

  // Cart operations
  const addToCart = (product: ProductDto, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        quantity,
        unitPrice: product.price,
        discount: 0,
      }];
    });
    setSearchText('');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSearchText('');
    setPaidValue('');
    setOverallDiscount('0');
  };

  // Scanner
  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à câmera');
        return;
      }
    }
    setScanOpen(true);
  };

  const handleBarcodeScan = (code: string) => {
    const product = Object.values(products).find(p =>
      p.ind_active !== false && p.barcodes?.includes(code)
    );
    if (product) {
      addToCart(product, 1);
      setScanOpen(false);
    } else {
      Alert.alert('Produto não encontrado', 'Nenhum produto com este código de barras');
    }
  };

  // Save sale
  const handleSave = async () => {
    // Validations
    if (cart.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto à venda');
      return;
    }

    if (!selectedCashier) {
      Alert.alert('Atenção', 'Selecione um operador');
      return;
    }

    if (!selectedCheckout) {
      Alert.alert('Atenção', 'Selecione um checkout');
      return;
    }

    if (!selectedPaymentForm) {
      Alert.alert('Atenção', 'Selecione uma forma de pagamento');
      return;
    }

    const paid = parseFloat(paidValue) || 0;
    if (paid < total) {
      Alert.alert('Atenção', 'O valor pago deve ser maior ou igual ao total');
      return;
    }

    setSaving(true);
    try {
      const saleProducts: SaleProductDTO[] = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      }));

      const saleDTO: SaleDTO = {
        cashierId: selectedCashier,
        checkoutId: selectedCheckout,
        paymentFormId: selectedPaymentForm,
        totalValue: total,
        paidValue: paid,
        changeValue: changeValue,
        overallDiscount: discountValue,
        saleProducts,
      };

      await saleApi.createSale(saleDTO);

      Alert.alert('Sucesso', 'Venda registrada com sucesso!', [
        {
          text: 'OK', onPress: () => {
            clearCart();
            router.back();
          }
        }
      ]);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      Alert.alert('Erro', 'Não foi possível salvar a venda');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Nova Venda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sale Configuration */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Configuração da Venda</Text>

          {/* Cashier */}
          <View style={styles.configItem}>
            <Text style={[styles.label, { color: textColor }]}>Operador *</Text>
            {cashiers.length === 0 ? (
              <Text style={[styles.helperText, { color: textColor, opacity: 0.5 }]}>
                Nenhum operador cadastrado
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {cashiers.map((cashier) => (
                  <TouchableOpacity
                    key={cashier.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedCashier === cashier.id ? '#007AFF' : cardBg,
                        borderColor: selectedCashier === cashier.id ? '#007AFF' : borderColor,
                      }
                    ]}
                    onPress={() => setSelectedCashier(cashier.id)}
                  >
                    <Text style={[styles.optionButtonText, { color: selectedCashier === cashier.id ? '#fff' : textColor }]}>
                      {cashier.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Checkout */}
          <View style={styles.configItem}>
            <Text style={[styles.label, { color: textColor }]}>Checkout *</Text>
            {checkouts.length === 0 ? (
              <Text style={[styles.helperText, { color: textColor, opacity: 0.5 }]}>
                Nenhum checkout cadastrado
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {checkouts.map((checkout) => (
                  <TouchableOpacity
                    key={checkout.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedCheckout === checkout.id ? '#007AFF' : cardBg,
                        borderColor: selectedCheckout === checkout.id ? '#007AFF' : borderColor,
                      }
                    ]}
                    onPress={() => setSelectedCheckout(checkout.id)}
                  >
                    <Text style={[styles.optionButtonText, { color: selectedCheckout === checkout.id ? '#fff' : textColor }]}>
                      {checkout.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Payment Form */}
          <View style={styles.configItem}>
            <Text style={[styles.label, { color: textColor }]}>Forma de Pagamento *</Text>
            {paymentForms.length === 0 ? (
              <Text style={[styles.helperText, { color: textColor, opacity: 0.5 }]}>
                Nenhuma forma de pagamento cadastrada
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {paymentForms.map((paymentForm) => (
                  <TouchableOpacity
                    key={paymentForm.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedPaymentForm === paymentForm.id ? '#007AFF' : cardBg,
                        borderColor: selectedPaymentForm === paymentForm.id ? '#007AFF' : borderColor,
                      }
                    ]}
                    onPress={() => setSelectedPaymentForm(paymentForm.id)}
                  >
                    <Text style={[styles.optionButtonText, { color: selectedPaymentForm === paymentForm.id ? '#fff' : textColor }]}>
                      {paymentForm.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Product Search */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Adicionar Produtos</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { color: textColor, borderColor, flex: 1 }]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar produto..."
              placeholderTextColor={textColor + '80'}
            />
            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: '#007AFF' }]}
              onPress={openScanner}
            >
              <Ionicons name="barcode-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {filteredProducts.length > 0 && (
            <View style={styles.searchResults}>
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productItem, { borderColor }]}
                  onPress={() => addToCart(product)}
                >
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: textColor }]} numberOfLines={1}>
                      {product.description}
                    </Text>
                    <Text style={[styles.productMeta, { color: textColor, opacity: 0.6 }]}>
                      R$ {product.price.toFixed(2)} • Estoque: {product.quantity}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#34C759" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Cart */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Itens da Venda ({cart.length})
          </Text>

          {cart.length === 0 ? (
            <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
              Nenhum produto adicionado
            </Text>
          ) : (
            cart.map((item) => {
              const product = products[item.productId];
              if (!product) return null;

              const itemTotal = item.unitPrice * item.quantity - item.discount;

              return (
                <View key={item.productId} style={[styles.cartItem, { borderColor }]}>
                  <View style={styles.cartItemHeader}>
                    <Text style={[styles.cartProductName, { color: textColor }]} numberOfLines={1}>
                      {product.description}
                    </Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.productId)}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cartItemDetails}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={[styles.qtyButton, { borderColor }]}
                        onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color={textColor} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyText, { color: textColor }]}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[styles.qtyButton, { borderColor }]}
                        onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color={textColor} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.cartItemPrice, { color: textColor }]}>
                      R$ {itemTotal.toFixed(2)}
                    </Text>
                  </View>

                  <Text style={[styles.cartItemMeta, { color: textColor, opacity: 0.6 }]}>
                    {item.quantity} × R$ {item.unitPrice.toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Payment Details */}
        {cart.length > 0 && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Pagamento</Text>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: textColor }]}>Subtotal:</Text>
              <Text style={[styles.paymentValue, { color: textColor }]}>
                R$ {subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: textColor }]}>Desconto:</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={overallDiscount}
                onChangeText={setOverallDiscount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={textColor + '80'}
              />
            </View>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: textColor, fontWeight: 'bold' }]}>Total:</Text>
              <Text style={[styles.totalValue, { color: '#34C759' }]}>
                R$ {total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: textColor }]}>Valor Pago:</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={paidValue}
                onChangeText={setPaidValue}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={textColor + '80'}
              />
            </View>

            {parseFloat(paidValue) > 0 && (
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: textColor }]}>Troco:</Text>
                <Text style={[styles.paymentValue, { color: textColor }]}>
                  R$ {changeValue.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      {cart.length > 0 && (
        <View style={[styles.footer, { backgroundColor: bgColor, borderColor }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#34C759' }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Finalizar Venda</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Scanner Modal */}
      {scanOpen && (
        <View style={styles.modal}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
            }}
            onBarcodeScanned={({ data }) => handleBarcodeScan(String(data))}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: '#666' }]}
              onPress={() => setScanOpen(false)}
            >
              <Ionicons name="close" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.closeButtonText}>Fechar</Text>
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
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  configItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  optionsScroll: {
    marginTop: 4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    marginTop: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  cartItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartProductName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItemMeta: {
    fontSize: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 16,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputRow: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
