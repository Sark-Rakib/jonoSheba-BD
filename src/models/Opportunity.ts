import { Schema, model, models, type InferSchemaType } from "mongoose";

export const OPPORTUNITY_CATEGORIES = [
  "job",
  "scholarship",
  "admission",
  "education",
  "exam_result",
] as const;
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

const OpportunitySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 220 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: OPPORTUNITY_CATEGORIES,
      required: true,
      index: true,
    },
    organization: { type: String, trim: true, maxlength: 200 },
    sourceLabel: { type: String, required: true, trim: true, maxlength: 120 },
    sourceUrl: { type: String, required: true, trim: true, maxlength: 500 },
    deadline: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    /** True for seeded demo entries so the UI can label them honestly. */
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

OpportunitySchema.index({ status: 1, category: 1, deadline: 1 });

export type OpportunityDoc = InferSchemaType<typeof OpportunitySchema>;

export const Opportunity =
  models.Opportunity ?? model("Opportunity", OpportunitySchema);
