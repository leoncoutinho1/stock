import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PWAProvider } from "./contexts/PWAContext";
import { authApi } from "./api/auth";
import { setOnUnauthorized } from "./api/client";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Sales } from "./pages/Sales";
import { NewSale } from "./pages/NewSale";
import { SaleDetail } from "./pages/SaleDetail";
import { Settings } from "./pages/Settings";
import { Categories } from "./pages/Categories";
import { PaymentForms } from "./pages/PaymentForms";
import { Cashiers } from "./pages/Cashiers";
import { Checkouts } from "./pages/Checkouts";
import { theme } from "./styles/theme";

const getBasename = () => {
  if (typeof window === "undefined") return "/";
  const pathname = window.location.pathname;
  if (pathname.startsWith("/stockmobile")) return "/stockmobile";
  if (pathname.startsWith("/stock")) return "/stock";
  return "/";
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      setOnUnauthorized(() => {
        setIsAuthenticated(false);
      });
      await authApi.initialize();
      setIsAuthenticated(authApi.isAuthenticated());
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Iniciando VenderBem RN Web...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const basename = getBasename();

  return (
    <ThemeProvider>
      <PWAProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/products" replace />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/new" element={<NewSale />} />
              <Route path="sales/:id" element={<SaleDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/categories" element={<Categories />} />
              <Route path="settings/payment-forms" element={<PaymentForms />} />
              <Route path="settings/cashiers" element={<Cashiers />} />
              <Route path="settings/checkouts" element={<Checkouts />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PWAProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgApp,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
});

export default App;
