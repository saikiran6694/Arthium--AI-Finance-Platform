import { z } from "zod";

export const reportSettingSchema = z.object({
  isEnabled: z.boolean().default(true),
});

export const updateReportSettingsSchema = reportSettingSchema.partial();

export type UpdateReportSettingType = z.infer<typeof updateReportSettingsSchema>;
