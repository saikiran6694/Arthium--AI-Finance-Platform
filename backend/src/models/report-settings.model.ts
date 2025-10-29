import { Types, Schema, model } from "mongoose";

export enum ReportFrequencyEnum {
  MONTHLY = "MONTHLY",
}

export interface ReportSettingsDocument extends Document {
  userId: Types.ObjectId;
  frequency: keyof typeof ReportFrequencyEnum;
  isEnabled: boolean;
  nextReportDate?: Date;
  lastSentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSettingSchema = new Schema<ReportSettingsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    frequency: {
      type: String,
      required: true,
      enum: Object.values(ReportFrequencyEnum),
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    nextReportDate: {
      type: Date,
    },
    lastSentDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ReportSettingModel = model<ReportSettingsDocument>("ReportSetting", reportSettingSchema);

export default ReportSettingModel;
