import React from "react";
import { View, StyleSheet, SafeAreaView, Dimensions } from "react-native";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { PWAPrompt } from "./PWAPrompt";
import { theme } from "@/src/styles/theme";

export const Layout: React.FC = () => {
  const location = useLocation();
  const isMainTab =
    location.pathname === "/products" ||
    location.pathname === "/sales" ||
    location.pathname === "/settings";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        <Header showBack={!isMainTab} />
        
        <View style={styles.mainContent}>
          <Outlet />
        </View>

        <BottomNav />
        <PWAPrompt />
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get("window").width;
const isDesktop = windowWidth > 640;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bgApp,
    width: "100%",
    height: "100%",
  },
  appContainer: {
    flex: 1,
    width: "100%",
    maxWidth: isDesktop ? 500 : "100%",
    alignSelf: "center",
    backgroundColor: theme.colors.bgApp,
    position: "relative",
    borderLeftWidth: isDesktop ? 1 : 0,
    borderRightWidth: isDesktop ? 1 : 0,
    borderColor: theme.colors.borderSubtle,
  },
  mainContent: {
    flex: 1,
    marginBottom: 64, // Altura da BottomNav
    overflow: "hidden",
  },
});
