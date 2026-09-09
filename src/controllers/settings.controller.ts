import { Request, Response } from "express";
import { prisma } from "../config/database";
import { getPublicCarouselSlides } from "../services/carousel.service";
import { getAdminSystemSettings, upsertSystemSetting } from "../services/admin.service";

/**
 * Public: Fetch public system settings by key or all settings
 * Route: GET /api/v1/settings/public?key=homepage_carousel
 */
export const getPublicSettingsController = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (key && typeof key === "string") {
      const setting = await prisma.systemSetting.findUnique({
        where: { settingKey: key },
      });

      if (setting) {
        let parsedValue: any = setting.settingValue;
        try {
          parsedValue = JSON.parse(setting.settingValue);
        } catch {
          parsedValue = setting.settingValue;
        }

        if (Array.isArray(parsedValue)) {
          const normalized = parsedValue.map((slide: any, index: number) => {
            const img = slide.imageUrl || slide.url || slide.image || slide.bannerUrl || slide.src || "";
            const title = slide.title || slide.heading || slide.name || "";
            const tagline = slide.tagline || slide.subtitle || slide.subTitle || "";
            const description = slide.description || slide.desc || "";
            const route = slide.route || slide.link || "/courses";
            const active = slide.active !== undefined ? Boolean(slide.active) : true;
            return {
              ...slide,
              id: String(slide.id || index + 1),
              title,
              heading: title,
              tagline,
              subtitle: tagline,
              subTitle: tagline,
              description,
              imageUrl: img,
              url: img,
              image: img,
              bannerUrl: img,
              src: img,
              route,
              link: route,
              active,
              isActive: active,
            };
          });

          return res.status(200).json({
            success: true,
            settingKey: setting.settingKey,
            description: setting.description,
            data: normalized,
            slides: normalized,
          });
        }

        return res.status(200).json({
          success: true,
          settingKey: setting.settingKey,
          description: setting.description,
          data: parsedValue,
        });
      }

      // Fallback for homepage_carousel if not stored in system_settings table yet
      if (key === "homepage_carousel") {
        const slides = await getPublicCarouselSlides();
        return res.status(200).json({
          success: true,
          settingKey: "homepage_carousel",
          description: "Homepage Hero Carousel Slides",
          data: slides,
          slides: slides,
        });
      }

      return res.status(404).json({
        success: false,
        message: `Setting with key '${key}' not found`,
      });
    }

    const settings = await prisma.systemSetting.findMany({
      orderBy: { settingKey: "asc" },
    });

    const parsedSettings = settings.map((s) => {
      let parsedValue: any = s.settingValue;
      try {
        parsedValue = JSON.parse(s.settingValue);
      } catch {
        parsedValue = s.settingValue;
      }
      return {
        id: s.id,
        settingKey: s.settingKey,
        settingValue: parsedValue,
        description: s.description,
        updatedAt: s.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: parsedSettings,
    });
  } catch (error: any) {
    console.error("Get public settings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch settings",
    });
  }
};

/**
 * Admin: Get all settings
 * Route: GET /api/v1/settings
 */
export const getSettingsController = async (_req: Request, res: Response) => {
  try {
    const settings = await getAdminSystemSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch system settings",
    });
  }
};

/**
 * Admin: Upsert setting
 * Route: PUT /api/v1/settings
 */
export const updateSettingsController = async (req: Request, res: Response) => {
  try {
    const { settingKey, settingValue, description } = req.body;

    if (!settingKey || settingValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "settingKey and settingValue are required",
      });
    }

    const valueString =
      typeof settingValue === "object"
        ? JSON.stringify(settingValue)
        : String(settingValue);

    const setting = await upsertSystemSetting({
      settingKey,
      settingValue: valueString,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "System setting saved successfully",
      data: setting,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to save system setting",
    });
  }
};
