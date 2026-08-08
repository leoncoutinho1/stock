import { theme } from "@/src/styles/theme";
import { Package, PlusCircle, Settings, ShoppingBag } from "lucide-react";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/sales") return location.pathname === "/sales";
    return location.pathname.startsWith(path);
  };

  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate("/products")}
        activeOpacity={0.7}
      >
        <Package
          color={
            isActive("/products")
              ? theme.colors.primary
              : theme.colors.textMuted
          }
          size={22}
        />
        <Text
          style={[
            styles.navLabel,
            isActive("/products") && styles.navLabelActive,
          ]}
        >
          Produtos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate("/sales/new")}
        activeOpacity={0.7}
      >
        <PlusCircle
          color={
            isActive("/sales/new")
              ? theme.colors.primary
              : theme.colors.textMuted
          }
          size={22}
        />
        <Text
          style={[
            styles.navLabel,
            isActive("/sales/new") && styles.navLabelActive,
          ]}
        >
          Nova venda
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate("/sales")}
        activeOpacity={0.7}
      >
        <ShoppingBag
          color={
            isActive("/sales") ? theme.colors.primary : theme.colors.textMuted
          }
          size={22}
        />
        <Text
          style={[styles.navLabel, isActive("/sales") && styles.navLabelActive]}
        >
          Vendas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigate("/settings")}
        activeOpacity={0.7}
      >
        <Settings
          color={
            isActive("/settings")
              ? theme.colors.primary
              : theme.colors.textMuted
          }
          size={22}
        />
        <Text
          style={[
            styles.navLabel,
            isActive("/settings") && styles.navLabelActive,
          ]}
        >
          Ajustes
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: theme.colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: theme.spacing.md,
    zIndex: 40,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: theme.spacing.xs,
  },
  navLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  centerNavItem: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    flex: 1,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  centerNavLabel: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: "700",
    marginTop: 2,
  },
});
