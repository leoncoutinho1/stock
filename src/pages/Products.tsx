import { productApi } from "@/src/api/product";
import { ProductDto } from "@/src/api/types";
import { BarcodeScannerModal } from "@/src/components/BarcodeScannerModal";
import { theme } from "@/src/styles/theme";
import {
  AlertCircle,
  Barcode,
  Camera,
  Package,
  Plus,
  Search,
  Tag,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigate } from "react-router-dom";

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchQuery = "") => {
    setErrorMsg(null);
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const searchRes = await productApi.searchProducts(searchQuery);
        const list = Array.isArray(searchRes)
          ? searchRes
          : (searchRes as any)?.data || [];
        setProducts(list);
      } else {
        const listRes = await productApi.getProducts(0, 50);
        setProducts(listRes.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load products:", err);
      setErrorMsg("Falha ao carregar produtos. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = (code: string) => {
    setSearchText(code);
    fetchProducts(code);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Search and Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.searchContainer}>
          <Search
            color={theme.colors.textMuted}
            size={18}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (text === "") fetchProducts("");
            }}
            onSubmitEditing={() => fetchProducts(searchText)}
            placeholder="Buscar por nome ou código..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                fetchProducts("");
              }}
              style={styles.clearButton}
            >
              <X color={theme.colors.textSecondary} size={16} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => setScanOpen(true)}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Camera color={theme.colors.primary} size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate("/products/new")}
          style={styles.primaryActionButton}
          activeOpacity={0.7}
        >
          <Plus color={theme.colors.textWhite} size={20} />
        </TouchableOpacity>
      </View>

      {/* Error Alert */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <View style={styles.errorRow}>
            <AlertCircle color={theme.colors.danger} size={16} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
          <TouchableOpacity onPress={() => fetchProducts(searchText)}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Products List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>
            Carregando catálogo de produtos...
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package color={theme.colors.textMuted} size={48} />
          <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre um novo produto ou realize uma nova busca.
          </Text>
          <TouchableOpacity
            onPress={() => navigate("/products/new")}
            style={styles.emptyButton}
            activeOpacity={0.8}
          >
            <Plus color={theme.colors.textWhite} size={16} />
            <Text style={styles.emptyButtonText}>Cadastrar Produto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {products.map((prod) => (
            <TouchableOpacity
              key={prod.id}
              onPress={() => navigate(`/products/${prod.id}`)}
              style={styles.productCard}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={styles.imageBox}>
                  {prod.imageUrl ? (
                    <Image
                      source={{ uri: prod.imageUrl }}
                      style={styles.productImage}
                    />
                  ) : (
                    <Package color={theme.colors.textMuted} size={24} />
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {prod.description}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Barcode color={theme.colors.primary} size={12} />
                      <Text style={styles.badgeText}>
                        {prod.mainBarcode || prod.barcodes?.[0] || "S/ COD"}
                      </Text>
                    </View>
                    {prod.categoryDescription ? (
                      <View style={styles.badge}>
                        <Tag color="#818cf8" size={12} />
                        <Text style={styles.badgeText}>
                          {prod.categoryDescription}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.priceText}>
                  R${" "}
                  {(prod.price || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <Text style={styles.stockText}>
                  Estoque:{" "}
                  <Text style={styles.stockValue}>
                    {prod.unit === "KG"
                      ? prod.quantity.toFixed(3)
                      : prod.quantity.toFixed(0)}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={handleBarcodeScanned}
        title="Buscar Produto por Código"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgApp,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  clearButton: {
    padding: 4,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionButton: {
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    flex: 1,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "500",
  },
  retryText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  emptyContainer: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  emptyButtonText: {
    color: theme.colors.textWhite,
    fontSize: 13,
    fontWeight: "600",
  },
  listContainer: {
    gap: theme.spacing.md,
  },
  productCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },
  imageBox: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.success,
  },
  stockText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  stockValue: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
});
