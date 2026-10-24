import { Schema, model, models, type InferSchemaType } from "mongoose";

const ReviewSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1200 },
  },
  { timestamps: true },
);

ReviewSchema.index({ listing: 1, user: 1 }, { unique: true });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema>;

export const Review = models.Review ?? model("Review", ReviewSchema);
