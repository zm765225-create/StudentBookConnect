import { Platform, I18nManager } from "react-native";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const tintColorLight = "#1A5F7A";
const tintColorDark = "#57C5B6";

export const Colors = {
  light: {
    text: "#2C3E50",
    textSecondary: "#7F8C8D",
    buttonText: "#FFFFFF",
    tabIconDefault: "#7F8C8D",
    tabIconSelected: tintColorLight,
    link: "#1A5F7A",
    backgroundRoot: "#F8F9FA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F0F4F8",
    backgroundTertiary: "#E1E8ED",
    primary: "#1A5F7A",
    secondary: "#159895",
    accent: "#57C5B6",
    success: "#27AE60",
    warning: "#F39C12",
    error: "#E74C3C",
    border: "#E1E8ED",
    surface: "#FFFFFF",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: "#57C5B6",
    backgroundRoot: "#1A1D1E",
    backgroundDefault: "#2A2D2E",
    backgroundSecondary: "#353839",
    backgroundTertiary: "#404344",
    primary: "#1A5F7A",
    secondary: "#159895",
    accent: "#57C5B6",
    success: "#2ECC71",
    warning: "#F1C40F",
    error: "#E74C3C",
    border: "#404344",
    surface: "#2A2D2E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 52,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  "2xl": 32,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Gradients = {
  primary: ["#1A5F7A", "#159895"],
  hero: ["#1A5F7A", "#159895", "#57C5B6"],
  card: ["#FFFFFF", "#F8F9FA"],
};
