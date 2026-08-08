import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Package, LogOut } from "lucide-react";
import { authApi } from "@/src/api/auth";
import { theme } from "@/src/styles/theme";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.startsWith("/products/new")) return "Novo Produto";
    if (path.startsWith("/products/")) return "Editar Produto";
    if (path.startsWith("/products")) return "Produtos";
    if (path.startsWith("/sales/new")) return "Nova Venda (PDV)";
    if (path.startsWith("/sales")) return "Histórico de Vendas";
    if (path.startsWith("/settings/cashiers")) return "Gerenciar Caixas";
    if (path.startsWith("/settings/checkouts")) return "Gerenciar Checkouts";
    if (path.startsWith("/settings/categories")) return "Categorias";
    if (path.startsWith("/settings/payment-forms")) return "Formas de Pagamento";
    if (path.startsWith("/settings")) return "Configurações";
    return "VenderBem Stock";
  };

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair da sua conta?")) {
      await authApi.logout();
      navigate("/login");
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigate(-1)}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color={theme.colors.textPrimary} size={20} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Package color={theme.colors.textWhite} size={20} />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{getPageTitle()}</Text>
          <Text style={styles.subtitleText}>VenderBem RN Web</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <LogOut color={theme.colors.danger} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: theme.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 30,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    justifyContent: "center",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
