import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/src/contexts/ThemeContext";
import { usePWAInstall } from "@/src/contexts/PWAContext";
import {
  Wallet,
  Monitor,
  Tag,
  CreditCard,
  Moon,
  Sun,
  Laptop,
  ChevronRight,
  Download,
  Smartphone,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { authApi } from "@/src/api/auth";
import { theme as globalTheme } from "@/src/styles/theme";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isStandalone, promptInstall } = usePWAInstall();

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente encerrar a sessão?")) {
      await authApi.logout();
      navigate("/login");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* App Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoLeft}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>VB</Text>
          </View>
          <View>
            <Text style={styles.appTitle}>VenderBem Stock RN Web</Text>
            <Text style={styles.appSubtitle}>Versão Web PWA Mobile 1.0.0</Text>
          </View>
        </View>
        {isStandalone ? (
          <View style={styles.installedBadge}>
            <CheckCircle2 color={globalTheme.colors.success} size={12} />
            <Text style={styles.installedBadgeText}>Instalado</Text>
          </View>
        ) : null}
      </View>

      {/* PWA Install Button Card */}
      {!isStandalone ? (
        <View style={styles.installCard}>
          <View style={styles.installLeft}>
            <View style={styles.phoneIconBox}>
              <Smartphone color={globalTheme.colors.primary} size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.installTitle}>Aplicativo de Tela Inicial</Text>
              <Text style={styles.installSubtitle}>Instale para acesso rápido tipo app nativo.</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={promptInstall}
            style={styles.installButton}
            activeOpacity={0.8}
          >
            <Download color={globalTheme.colors.textWhite} size={16} />
            <Text style={styles.installButtonText}>Instalar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Navigation Links */}
      <View style={styles.navGroup}>
        <TouchableOpacity
          onPress={() => navigate("/settings/categories")}
          style={styles.navRow}
          activeOpacity={0.7}
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
              <Tag color="#c084fc" size={18} />
            </View>
            <View>
              <Text style={styles.navRowTitle}>Categorias de Produtos</Text>
              <Text style={styles.navRowSubtitle}>Organize seus itens por grupo</Text>
            </View>
          </View>
          <ChevronRight color={globalTheme.colors.textMuted} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate("/settings/payment-forms")}
          style={styles.navRow}
          activeOpacity={0.7}
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <CreditCard color={globalTheme.colors.success} size={18} />
            </View>
            <View>
              <Text style={styles.navRowTitle}>Formas de Pagamento</Text>
              <Text style={styles.navRowSubtitle}>Pix, Dinheiro, Cartão de Crédito/Débito</Text>
            </View>
          </View>
          <ChevronRight color={globalTheme.colors.textMuted} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate("/settings/cashiers")}
          style={styles.navRow}
          activeOpacity={0.7}
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.iconBox, { backgroundColor: globalTheme.colors.primaryLight }]}>
              <Wallet color={globalTheme.colors.primary} size={18} />
            </View>
            <View>
              <Text style={styles.navRowTitle}>Gerenciar Caixas</Text>
              <Text style={styles.navRowSubtitle}>Operadores e abertura/fechamento</Text>
            </View>
          </View>
          <ChevronRight color={globalTheme.colors.textMuted} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate("/settings/checkouts")}
          style={styles.navRow}
          activeOpacity={0.7}
        >
          <View style={styles.navRowLeft}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
              <Monitor color="#818cf8" size={18} />
            </View>
            <View>
              <Text style={styles.navRowTitle}>Checkouts / Guichês</Text>
              <Text style={styles.navRowSubtitle}>Terminais de venda cadastrados</Text>
            </View>
          </View>
          <ChevronRight color={globalTheme.colors.textMuted} size={18} />
        </TouchableOpacity>
      </View>

      {/* Theme Controls */}
      <View style={styles.themeSection}>
        <Text style={styles.sectionHeaderTitle}>Aparência do Aplicativo</Text>
        <View style={styles.themeGrid}>
          <TouchableOpacity
            onPress={() => setTheme("dark")}
            style={[
              styles.themeButton,
              theme === "dark" && styles.themeButtonActive,
            ]}
            activeOpacity={0.8}
          >
            <Moon
              color={theme === "dark" ? globalTheme.colors.primary : globalTheme.colors.textMuted}
              size={18}
            />
            <Text
              style={[
                styles.themeButtonText,
                theme === "dark" && styles.themeButtonTextActive,
              ]}
            >
              Escuro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTheme("light")}
            style={[
              styles.themeButton,
              theme === "light" && styles.themeButtonActive,
            ]}
            activeOpacity={0.8}
          >
            <Sun
              color={theme === "light" ? globalTheme.colors.primary : globalTheme.colors.textMuted}
              size={18}
            />
            <Text
              style={[
                styles.themeButtonText,
                theme === "light" && styles.themeButtonTextActive,
              ]}
            >
              Claro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTheme("auto")}
            style={[
              styles.themeButton,
              theme === "auto" && styles.themeButtonActive,
            ]}
            activeOpacity={0.8}
          >
            <Laptop
              color={theme === "auto" ? globalTheme.colors.primary : globalTheme.colors.textMuted}
              size={18}
            />
            <Text
              style={[
                styles.themeButtonText,
                theme === "auto" && styles.themeButtonTextActive,
              ]}
            >
              Sistema
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutButton}
        activeOpacity={0.8}
      >
        <LogOut color={globalTheme.colors.danger} size={18} />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalTheme.colors.bgApp,
  },
  scrollContent: {
    padding: globalTheme.spacing.lg,
    gap: globalTheme.spacing.md,
  },
  infoCard: {
    backgroundColor: globalTheme.colors.bgCard,
    borderRadius: globalTheme.borderRadius.xl,
    padding: globalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: globalTheme.colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: globalTheme.spacing.md,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: globalTheme.borderRadius.lg,
    backgroundColor: globalTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: globalTheme.colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  appTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: globalTheme.colors.textPrimary,
  },
  appSubtitle: {
    fontSize: 11,
    color: globalTheme.colors.textSecondary,
    marginTop: 2,
  },
  installedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: globalTheme.colors.successLight,
    paddingHorizontal: globalTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: globalTheme.borderRadius.sm,
  },
  installedBadgeText: {
    color: globalTheme.colors.success,
    fontSize: 10,
    fontWeight: "700",
  },
  installCard: {
    backgroundColor: globalTheme.colors.bgCard,
    borderRadius: globalTheme.borderRadius.xl,
    padding: globalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: globalTheme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: globalTheme.spacing.md,
  },
  installLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: globalTheme.spacing.md,
    flex: 1,
  },
  phoneIconBox: {
    width: 40,
    height: 40,
    borderRadius: globalTheme.borderRadius.md,
    backgroundColor: globalTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  installTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: globalTheme.colors.textPrimary,
  },
  installSubtitle: {
    fontSize: 11,
    color: globalTheme.colors.textSecondary,
    marginTop: 2,
  },
  installButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: globalTheme.spacing.xs,
    backgroundColor: globalTheme.colors.primary,
    borderRadius: globalTheme.borderRadius.md,
    paddingHorizontal: globalTheme.spacing.md,
    paddingVertical: globalTheme.spacing.sm,
  },
  installButtonText: {
    color: globalTheme.colors.textWhite,
    fontSize: 12,
    fontWeight: "700",
  },
  navGroup: {
    backgroundColor: globalTheme.colors.bgCard,
    borderRadius: globalTheme.borderRadius.xl,
    padding: globalTheme.spacing.xs,
    borderWidth: 1,
    borderColor: globalTheme.colors.borderSubtle,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: globalTheme.spacing.md,
    borderRadius: globalTheme.borderRadius.lg,
  },
  navRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: globalTheme.spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: globalTheme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  navRowTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: globalTheme.colors.textPrimary,
  },
  navRowSubtitle: {
    fontSize: 11,
    color: globalTheme.colors.textSecondary,
    marginTop: 1,
  },
  themeSection: {
    backgroundColor: globalTheme.colors.bgCard,
    borderRadius: globalTheme.borderRadius.xl,
    padding: globalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: globalTheme.colors.borderSubtle,
    gap: globalTheme.spacing.md,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: globalTheme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  themeGrid: {
    flexDirection: "row",
    gap: globalTheme.spacing.sm,
  },
  themeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: globalTheme.spacing.md,
    borderRadius: globalTheme.borderRadius.lg,
    backgroundColor: globalTheme.colors.bgElevated,
    borderWidth: 1,
    borderColor: globalTheme.colors.borderSubtle,
  },
  themeButtonActive: {
    backgroundColor: globalTheme.colors.primaryLight,
    borderColor: globalTheme.colors.primary,
  },
  themeButtonText: {
    fontSize: 12,
    color: globalTheme.colors.textMuted,
    fontWeight: "500",
  },
  themeButtonTextActive: {
    color: globalTheme.colors.primary,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: globalTheme.spacing.xs,
    backgroundColor: globalTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: globalTheme.colors.danger,
    borderRadius: globalTheme.borderRadius.lg,
    paddingVertical: globalTheme.spacing.md,
  },
  logoutButtonText: {
    color: globalTheme.colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
});
