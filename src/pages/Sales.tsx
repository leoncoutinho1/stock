import { saleApi } from "@/src/api/sale";
import { theme } from "@/src/styles/theme";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Plus,
  ShoppingBag,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigate } from "react-router-dom";

export const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await saleApi.getSales({
        limit: 10,
        sort: "-SaleDate",
      });
      setSales(res.data || []);
    } catch (err: any) {
      console.error("Error loading sales:", err);
      setErrorMsg("Não foi possível carregar o histórico de vendas.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Hoje";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header action */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Últimas Vendas Realizadas</Text>
        <TouchableOpacity
          onPress={() => navigate("/sales/new")}
          style={styles.newSaleButton}
          activeOpacity={0.8}
        >
          <Plus color={theme.colors.textWhite} size={16} />
          <Text style={styles.newSaleButtonText}>Nova Venda (PDV)</Text>
        </TouchableOpacity>
      </View>

      {/* Error Alert */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <View style={styles.errorRow}>
            <AlertCircle color={theme.colors.danger} size={16} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
          <TouchableOpacity onPress={fetchSales}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Loading / Empty / List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>
            Carregando histórico de vendas...
          </Text>
        </View>
      ) : sales.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag color={theme.colors.textMuted} size={48} />
          <Text style={styles.emptyTitle}>Nenhuma venda registrada</Text>
          <Text style={styles.emptySubtitle}>
            Abra uma nova venda no PDV Mobile para registrar seus pedidos.
          </Text>
          <TouchableOpacity
            onPress={() => navigate("/sales/new")}
            style={styles.emptyButton}
            activeOpacity={0.8}
          >
            <Plus color={theme.colors.textWhite} size={16} />
            <Text style={styles.emptyButtonText}>Iniciar Venda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {sales.map((sale, idx) => {
            const rawDate = sale.saleDate || sale.createdAt;
            const totalValue =
              sale.totalValue ?? sale.total ?? sale.totalAmount ?? 0;

            return (
              <TouchableOpacity
                key={sale.id || idx}
                onPress={() =>
                  sale.id && navigate(`/sales/${sale.id}`, { state: { sale } })
                }
                style={styles.saleCard}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.dateRow}>
                    <Calendar color={theme.colors.primary} size={16} />
                    <Text style={styles.dateText}>{formatDate(rawDate)}</Text>
                  </View>

                  {sale.clientName || sale.paymentFormName ? (
                    <View style={styles.infoRow}>
                      {sale.clientName ? (
                        <View style={styles.tagItem}>
                          <User color={theme.colors.primary} size={12} />
                          <Text style={styles.tagText}>{sale.clientName}</Text>
                        </View>
                      ) : null}
                      {sale.paymentFormName ? (
                        <View style={styles.tagItem}>
                          <CreditCard color={theme.colors.success} size={12} />
                          <Text style={styles.tagText}>
                            {sale.paymentFormName}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.totalText}>
                    R${" "}
                    {Number(totalValue).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  newSaleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  newSaleButtonText: {
    color: theme.colors.textWhite,
    fontSize: 12,
    fontWeight: "600",
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
  saleCard: {
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
    gap: 4,
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: 2,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.success,
  },
});
