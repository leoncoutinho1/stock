import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { productApi } from '@/src/api/product';
import { ProductDto, ResultList } from '@/src/api/types';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ITEMS_PER_PAGE = 20;

export default function ProductsListScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';
  const borderColor = scheme === 'dark' ? '#333' : '#e0e0e0';

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const loadProducts = async (page: number = 0, search: string = '', append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let result: ResultList<ProductDto> = { data: [], totalCount: 0 };

      if (search) {
        // Use searchProducts endpoint for search
        const searchResponse = await productApi.searchProducts(search);

        // Handle both array response and ResultList response
        if (Array.isArray(searchResponse)) {
          result = { data: searchResponse, totalCount: searchResponse.length };
        } else if (searchResponse && typeof searchResponse === 'object' && 'data' in searchResponse) {
          result = searchResponse as ResultList<ProductDto>;
        } else {
          // Fallback: treat as single product or empty
          result = { data: searchResponse ? [searchResponse as ProductDto] : [], totalCount: searchResponse ? 1 : 0 };
        }
      } else {
        // Use paginated list for normal browsing
        result = await productApi.getProducts({
          limit: ITEMS_PER_PAGE,
          offset: page * ITEMS_PER_PAGE,
        });
      }

      const activeProducts = (result.data || []).filter((p) => p.isActive !== false);

      if (append) {
        setProducts((prev) => [...prev, ...activeProducts]);
      } else {
        setProducts(activeProducts);
      }

      setTotalCount(result.totalCount || activeProducts.length);
      setHasMore(activeProducts.length === ITEMS_PER_PAGE && !search);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadProducts(0, searchText);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
      loadProducts(0, searchText, false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(0);
    loadProducts(0, searchText, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && products.length > 0) {
      loadProducts(currentPage + 1, searchText, true);
    }
  };

  const confirmDelete = (product: ProductDto) => {
    Alert.alert('Desativar produto', 'Deseja desativar este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desativar',
        style: 'destructive',
        onPress: async () => {
          try {
            await productApi.deactivateProduct(product.id);
            handleRefresh();
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

  const renderItem = ({ item }: { item: ProductDto }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
      onPress={() => router.push({ pathname: '/(tabs)/products/[id]', params: { id: item.id } })}
      onLongPress={() => confirmDelete(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImagePlaceholder, { backgroundColor: borderColor }]}>
          <Ionicons name="image-outline" size={32} color={textColor} style={{ opacity: 0.3 }} />
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.cardText, { color: textColor, opacity: 0.6 }]}>
          Código: {item.barcodes?.[0] || 'N/A'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.cardPrice, { color: '#34C759' }]}>
            R$ {Number(item.price).toFixed(2)}
          </Text>
          <Text style={[styles.cardText, { color: textColor, opacity: 0.6 }]}>
            Qtd: {item.quantity}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={64} color={textColor} style={{ opacity: 0.3 }} />
        <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
          {searchText ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
        </Text>
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Produtos</Text>

      </View>

      <View style={[styles.searchContainer, { backgroundColor: cardBg, borderColor }]}>
        <Ionicons name="search" size={20} color={textColor} style={{ opacity: 0.5 }} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar por descrição ou código de barras..."
          placeholderTextColor={textColor + '80'}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={textColor} style={{ opacity: 0.5 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={openScanner}>
            <Ionicons name="barcode-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {totalCount > 0 && (
        <Text style={[styles.resultCount, { color: textColor, opacity: 0.6 }]}>
          {totalCount} produto{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
        </Text>
      )}

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* Scanner Modal */}
      {scanOpen && (
        <View style={styles.modal}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
            }}
            onBarcodeScanned={({ data }) => {
              handleSearch(String(data));
              setScanOpen(false);
            }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: '#666' }]}
              onPress={() => setScanOpen(false)}
            >
              <Ionicons name="close" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.scanButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/(tabs)/products/[id]', params: { id: 'new' } })}
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
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 4,
  },
  resultCount: {
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
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
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
