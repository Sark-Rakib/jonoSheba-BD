import { Schema, model, models, type InferSchemaType } from "mongoose";

const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Shapes" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof CategorySchema>;

export const Category =
  models.Category ?? model("Category", CategorySchema);
