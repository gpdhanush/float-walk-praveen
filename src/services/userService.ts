import { api } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;

  // Store Information
  storeName?: string;
  storeAddress?: string;
  phone?: string;
  officePhone?: string;
  gstPercent: number;
  gstNumber?: string;
  logoUrl?: string;

  // UI Preferences
  theme: "light" | "dark";
  themeColor: string;
  language: "en" | "ta";
}

export interface UpdateProfileDTO {
  name?: string;
  storeName?: string;
  storeAddress?: string;
  phone?: string;
  officePhone?: string;
  gstPercent?: number;
  gstNumber?: string;
  logoUrl?: string;
  theme?: "light" | "dark";
  themeColor?: string;
  language?: "en" | "ta";
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      console.log("Calling GET /users/profile...");
      const response = await api.get("/users/profile");
      console.log("Profile response:", response);

      // Handle both { data: {...} } and direct {...} response formats
      const profileData = response?.data || response;
      return profileData as UserProfile;
    } catch (error) {
      console.error("getProfile error:", error);
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileDTO): Promise<UserProfile> => {
    try {
      console.log("Calling PATCH /users/profile with data:", data);
      const response = await api.patch("/users/profile", data);
      console.log("Update profile response:", response);

      const profileData = response?.data || response;
      return profileData as UserProfile;
    } catch (error) {
      console.error("updateProfile error:", error);
      throw error;
    }
  },

  changePassword: async (data: ChangePasswordDTO): Promise<void> => {
    await api.post("/users/change-password", data);
  },
};
