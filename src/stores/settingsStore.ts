import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language } from "@/lib/i18n";
import { userService, type UserProfile } from "@/services/userService";

interface StoreSettings {
  storeName: string;
  address: string;
  mobile: string;
  email: string;
  ownerName: string;
  gstPercent: number;
  gstNumber: string;
  logoUrl: string;
  phone: string;
  officePhone: string;
  taxNumber: string;
  theme: "light" | "dark";
  themeColor: string;
  language: Language;
}

interface SettingsState extends StoreSettings {
  isLoaded: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<StoreSettings>) => Promise<void>;
  updateLocal: (settings: Partial<StoreSettings>) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      storeName: "FootWear Pro",
      address: "123 Main Street, Chennai, TN 600001",
      mobile: "+91 98765 43210",
      email: "info@footwearpro.com",
      ownerName: "John Doe",
      gstPercent: 18,
      gstNumber: "33XXXXX1234X1ZX",
      logoUrl: "",
      phone: "+91 98765 43210",
      officePhone: "",
      taxNumber: "",
      theme: "light",
      themeColor: "blue",
      language: "en",
      isLoaded: false,

      fetchSettings: async () => {
        try {
          // Check if we have auth token before calling API
          const authStore = localStorage.getItem("auth-store");
          if (!authStore) {
            console.warn("No auth store found, skipping settings fetch");
            set({ isLoaded: true });
            return;
          }

          const authData = JSON.parse(authStore);
          if (!authData?.state?.token) {
            console.warn("No auth token found, skipping settings fetch");
            set({ isLoaded: true });
            return;
          }

          console.log("Fetching user profile with settings...");
          const data = await userService.getProfile();
          console.log("User profile fetched successfully");

          set({
            storeName: data.storeName || "FootWear Pro",
            ownerName: data.name || "John Doe",
            address: data.storeAddress || "",
            phone: data.phone || "",
            officePhone: data.officePhone || "",
            taxNumber: (data as any).taxNumber || "",
            mobile: data.phone || "",
            email: data.email || "",
            gstPercent: data.gstPercent || 18,
            gstNumber: data.gstNumber || "",
            logoUrl: data.logoUrl || "",
            theme: data.theme || "light",
            themeColor: data.themeColor || "blue",
            language: data.language || "en",
            isLoaded: true,
          });

          // Apply theme
          if (data.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }

          // Apply theme color
          const { applyThemeColor } = await import("@/lib/themeColors");
          applyThemeColor(data.themeColor || "blue", data.theme || "light");
        } catch (error: any) {
          console.error("Failed to fetch settings:", error);
          console.error("Error details:", error?.message || error);
          set({ isLoaded: true });
        }
      },

      updateSettings: async (settings) => {
        try {
          console.log(
            "[settingsStore] updateSettings called with logoUrl length:",
            settings.logoUrl?.length || 0,
          );

          const data = await userService.updateProfile({
            name: settings.ownerName,
            storeName: settings.storeName,
            storeAddress: settings.address,
            phone: settings.mobile,
            officePhone: settings.officePhone,
            gstPercent: settings.gstPercent,
            gstNumber: settings.gstNumber,
            logoUrl: settings.logoUrl,
            theme: settings.theme,
            themeColor: settings.themeColor,
            language: settings.language,
          });

          console.log(
            "[settingsStore] updateProfile response, logoUrl length:",
            data.logoUrl?.length || 0,
          );

          set({
            storeName: data.storeName || "FootWear Pro",
            ownerName: data.name || "John Doe",
            address: data.storeAddress || "",
            phone: data.phone || "",
            officePhone: data.officePhone || "",
            taxNumber: (data as any).taxNumber || "",
            mobile: data.phone || "",
            email: data.email || "",
            gstPercent: data.gstPercent || 18,
            gstNumber: data.gstNumber || "",
            logoUrl: data.logoUrl || "",
            theme: data.theme || "light",
            themeColor: data.themeColor || "blue",
            language: data.language || "en",
          });

          console.log(
            "[settingsStore] State updated with logoUrl length:",
            get().logoUrl?.length || 0,
          );

          // Apply theme if changed
          if (settings.theme) {
            if (settings.theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }

          // Apply theme color if changed
          if (settings.themeColor) {
            const { applyThemeColor } = await import("@/lib/themeColors");
            const currentTheme = settings.theme || get().theme;
            applyThemeColor(settings.themeColor, currentTheme);
          }
        } catch (error) {
          console.error("Failed to update settings:", error);
          throw error;
        }
      },

      updateLocal: (settings) => set((state) => ({ ...state, ...settings })),

      setTheme: async (theme) => {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ theme });
        // Save to API
        try {
          await userService.updateProfile({ theme });
        } catch (error) {
          console.error("Failed to save theme:", error);
        }
      },

      setLanguage: async (language) => {
        set({ language });
        // Save to API
        try {
          await userService.updateProfile({ language });
        } catch (error) {
          console.error("Failed to save language:", error);
        }
      },
    }),
    { name: "settings-store" },
  ),
);
