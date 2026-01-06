import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { saleApi } from '@/src/api/sale';
import { productApi } from '@/src/api/product';
import { SaleDTO, ProductDto } from '@/src/api/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type PeriodType = 'hoje' | 'semana' | 'mês';

interface SaleGroup {
  id: string;
  sale: SaleDTO;
  timestamp: number;
  total: number;
}

export default function SalesListScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';
  const borderColor = scheme === 'dark' ? '#333' : '#e0e0e0';

  const [sales, setSales] = useState<SaleDTO[]>([]);
  const [products, setProducts] = useState<Record<string, ProductDto>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('hoje');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        saleApi.getSales(),
        productApi.getProducts({ limit: 10000 }),
      ]);

      console.log('Sales data:', salesData);
      setSales(salesData || []);

      // Create product map
      const productMap: Record<string, ProductDto> = {};
      const productList = Array.isArray(productsData) ? productsData : productsData.data || [];
      for (const p of productList) {
        productMap[p.id] = p;
      }
      setProducts(productMap);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Convert sales to groups
  const groups = useMemo<SaleGroup[]>(() => {
    return sales.map(sale => {
      const timestamp = sale.createdAt ? new Date(sale.createdAt).getTime() : Date.now();
      return {
        id: sale.id || '',
        sale,
        timestamp,
        total: sale.totalValue,
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [sales]);

  // Filter by period
  const visibleGroups = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const inPeriod = (ts: number) => {
      if (period === 'hoje') return ts >= startOfDay;
      if (period === 'semana') return ts >= weekAgo;
      return ts >= startOfMonth;
    };

    return groups.filter(g => inPeriod(g.timestamp));
  }, [groups, period]);

  // Calculate period total
  const periodTotal = useMemo(() => {
    return visibleGroups.reduce((sum, group) => sum + group.total, 0);
  }, [visibleGroups]);

  const renderPeriodButton = (p: PeriodType, label: string) => (
    <TouchableOpacity
      key={p}
      style={[
        styles.periodButton,
        {
          backgroundColor: period === p ? '#34C759' : cardBg,
          borderColor: period === p ? '#34C759' : borderColor,
        }
      ]}
      onPress={() => setPeriod(p)}
    >
      <Text style={[styles.periodButtonText, { color: period === p ? '#fff' : textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSaleGroup = ({ item }: { item: SaleGroup }) => {
    const groupDate = new Date(item.timestamp);
    const dateStr = isNaN(groupDate.getTime())
      ? '-'
      : groupDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    const saleProducts = item.sale.saleProducts || [];

    return (
      <View style={[styles.groupCard, { backgroundColor: cardBg, borderColor }]}>
        {/* Group Header */}
        <View style={styles.groupHeader}>
          <View style={styles.groupHeaderLeft}>
            <Ionicons name="receipt-outline" size={20} color="#34C759" />
            <Text style={[styles.groupDate, { color: textColor }]}>{dateStr}</Text>
          </View>
          <Text style={[styles.groupTotal, { color: '#34C759' }]}>
            R$ {item.total.toFixed(2)}
          </Text>
        </View>

        {/* Sale Items */}
        {saleProducts.map((saleProduct, index) => {
          const product = products[saleProduct.productId];
          const price = Number(saleProduct.unitPrice || 0);
          const qty = Number(saleProduct.quantity || 0);
          const discount = Number(saleProduct.discount || 0);
          const subtotal = (price * qty) - discount;

          return (
            <View
              key={`${item.id}-${saleProduct.productId}-${index}`}
              style={[
                styles.saleItem,
                index < saleProducts.length - 1 && styles.saleItemBorder,
                { borderColor }
              ]}
            >
              <View style={styles.saleItemHeader}>
                <Text style={[styles.productName, { color: textColor }]} numberOfLines={1}>
                  {product?.description || 'Produto removido'}
                </Text>
                <Text style={[styles.subtotal, { color: textColor }]}>
                  R$ {subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.saleItemDetails}>
                <Text style={[styles.saleItemMeta, { color: textColor, opacity: 0.6 }]}>
                  Qtd: {qty} × R$ {price.toFixed(2)}
                  {discount > 0 && ` - Desc: R$ ${discount.toFixed(2)}`}
                </Text>
                {product?.barcodes?.[0] && (
                  <Text style={[styles.saleItemMeta, { color: textColor, opacity: 0.6 }]}>
                    Cód: {product.barcodes[0]}
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Items Count */}
        <View style={[styles.groupFooter, { borderColor }]}>
          <Text style={[styles.itemsCount, { color: textColor, opacity: 0.6 }]}>
            {saleProducts.length} {saleProducts.length === 1 ? 'item' : 'itens'}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={textColor} style={{ opacity: 0.3 }} />
        <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
          Nenhuma venda registrada {period !== 'mês' && `${period === 'hoje' ? 'hoje' : 'nesta semana'}`}
        </Text>
      </View>
    );
  };

  if (loading && sales.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Vendas</Text>
      </View>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        {renderPeriodButton('hoje', 'Hoje')}
        {renderPeriodButton('semana', 'Semana')}
        {renderPeriodButton('mês', 'Mês')}
      </View>

      {/* Period Total */}
      <View style={[styles.totalCard, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.totalLabel, { color: textColor }]}>Total do período</Text>
        <Text style={[styles.totalValue, { color: '#34C759' }]}>
          R$ {periodTotal.toFixed(2)}
        </Text>
      </View>

      {/* Sales Count */}
      {visibleGroups.length > 0 && (
        <Text style={[styles.resultCount, { color: textColor, opacity: 0.6 }]}>
          {visibleGroups.length} {visibleGroups.length === 1 ? 'venda' : 'vendas'}
        </Text>
      )}

      {/* Sales List */}
      <FlatList
        data={visibleGroups}
        renderItem={renderSaleGroup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/sales/new')}
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  groupCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  groupDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  groupTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saleItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saleItemBorder: {
    borderBottomWidth: 1,
  },
  saleItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  saleItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleItemMeta: {
    fontSize: 12,
  },
  groupFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  itemsCount: {
    fontSize: 12,
    textAlign: 'center',
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
