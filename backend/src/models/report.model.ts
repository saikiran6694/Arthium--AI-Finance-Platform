import { Types, Schema, model } from "mongoose";

export enum ReportStatusEnum {
  SENT = "SENT",
  PENDING = "PENDING",
  FAILED = "FAILED",
  NO_ACTIVITY = "NO_ACTIVITY",
}

export interface ReportDocument extends Document {
  userId: Types.ObjectId;
  period: String;
  sentDate: Date;
  status: keyof typeof ReportStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<ReportDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    period: {
      type: String,
      required: true,
    },
    sentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ReportStatusEnum),
    },
  },
  { timestamps: true }
);

const ReportModel = model<ReportDocument>("Report", reportSchema);

export default ReportModel;
