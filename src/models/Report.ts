import { Schema, model, models, type InferSchemaType } from "mongoose";

export const REPORT_REASONS = [
  "wrong_info",
  "scam_suspicion",
  "not_responding",
  "spam",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_TARGET_TYPES = [
  "listing",
  "review",
  "guide",
  "opportunity",
] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_STATUSES = [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

const ReportSchema = new Schema(
  {
    targetType: { type: String, enum: REPORT_TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", index: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 1500 },
    reporter: { type: Schema.Types.ObjectId, ref: "User" },
    reporterContact: { type: String, trim: true, maxlength: 120 },
    status: { type: String, enum: REPORT_STATUSES, default: "open", index: true },
    resolutionNote: { type: String, trim: true, maxlength: 500 },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

ReportSchema.index({ status: 1, createdAt: -1 });

export type ReportDoc = InferSchemaType<typeof ReportSchema>;

export const Report = models.Report ?? model("Report", ReportSchema);
