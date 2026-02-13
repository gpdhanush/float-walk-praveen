import type { Request, Response } from "express";
import { userUseCases, authService } from "../../container.js";

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    console.log("[UserController] getProfile called for userId:", userId);

    if (!userId) {
      console.error("[UserController] No userId in request");
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const user = await userUseCases.getById(userId);
    if (!user) {
      console.error("[UserController] User not found:", userId);
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    console.log("[UserController] Profile fetched successfully");
    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error("[UserController] Error fetching profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    console.log("[UserController] updateProfile called for userId:", userId);

    if (!userId) {
      console.error("[UserController] No userId in request");
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const {
      name,
      storeName,
      storeAddress,
      phone,
      officePhone,
      gstPercent,
      gstNumber,
      logoUrl,
      theme,
      themeColor,
      language,
    } = req.body;

    console.log("[UserController] Request body fields:", {
      hasName: name !== undefined,
      hasStoreName: storeName !== undefined,
      hasLogoUrl: logoUrl !== undefined,
      logoUrlLength: logoUrl ? logoUrl.length : 0,
      logoUrlPreview: logoUrl ? logoUrl.substring(0, 50) + "..." : "none",
    });

    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (storeName !== undefined) updates.storeName = storeName;
    if (storeAddress !== undefined) updates.storeAddress = storeAddress;
    if (phone !== undefined) updates.phone = phone;
    if (officePhone !== undefined) updates.officePhone = officePhone;
    if (gstPercent !== undefined) updates.gstPercent = gstPercent;
    if (gstNumber !== undefined) updates.gstNumber = gstNumber;
    if (logoUrl !== undefined) {
      updates.logoUrl = logoUrl;
      console.log("[UserController] Setting logoUrl, length:", logoUrl.length);
    }
    if (theme !== undefined) updates.theme = theme;
    if (themeColor !== undefined) updates.themeColor = themeColor;
    if (language !== undefined) updates.language = language;

    console.log("[UserController] Updates to apply:", Object.keys(updates));

    const user = await userUseCases.update(userId, updates);
    if (!user) {
      console.error("[UserController] User not found after update");
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    console.log(
      "[UserController] Profile updated successfully, logoUrl length:",
      user.logoUrl?.length || 0,
    );
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    console.log("[UserController] changePassword called for userId:", userId);

    if (!userId) {
      console.error("[UserController] No userId in request");
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({
          success: false,
          error: "Current and new password are required",
        });
      return;
    }

    if (newPassword.length < 6) {
      res
        .status(400)
        .json({
          success: false,
          error: "Password must be at least 6 characters",
        });
      return;
    }

    // Verify current password using auth service
    const isValid = await authService.verifyPassword(userId, currentPassword);
    if (!isValid) {
      res
        .status(401)
        .json({ success: false, error: "Current password is incorrect" });
      return;
    }

    // Update with new password
    await userUseCases.update(userId, { password: newPassword });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
