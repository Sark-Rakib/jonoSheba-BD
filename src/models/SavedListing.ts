import { Schema, model, models, type InferSchemaType } from "mongoose";

const SavedListingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

SavedListingSchema.index({ user: 1, listing: 1 }, { unique: true });

export type SavedListingDoc = InferSchemaType<typeof SavedListingSchema>;

export const SavedListing =
  models.SavedListing ?? model("SavedListing", SavedListingSchema);
