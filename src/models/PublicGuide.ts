import { Schema, model, models, type InferSchemaType } from "mongoose";

export const GUIDE_CATEGORIES = [
  "nid",
  "birth_reg",
  "passport",
  "gov_service",
  "citizen_rights",
  "other",
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export const PUBLICATION_STATUSES = ["draft", "published"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

const GuideStepSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const SourceLinkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const PublicGuideSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, enum: GUIDE_CATEGORIES, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 800 },
    steps: { type: [GuideStepSchema], default: [] },
    requiredDocuments: { type: [String], default: [] },
    sourceLinks: { type: [SourceLinkSchema], default: [] },
    lastReviewedAt: { type: Date, required: true },
    status: { type: String, enum: PUBLICATION_STATUSES, default: "draft", index: true },
  },
  { timestamps: true },
);

PublicGuideSchema.index({ status: 1, category: 1 });

export type PublicGuideDoc = InferSchemaType<typeof PublicGuideSchema>;

export const PublicGuide =
  models.PublicGuide ?? model("PublicGuide", PublicGuideSchema);
