import { Schema, model, models, type InferSchemaType } from "mongoose";

export const LISTING_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

const ContactSchema = new Schema(
  {
    phone: { type: String, trim: true, maxlength: 20 },
    whatsapp: { type: String, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    website: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const LocationSchema = new Schema(
  {
    division: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    upazila: { type: String, trim: true },
    addressLine: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const ImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, maxlength: 160 },
  },
  { _id: false },
);

const HourSchema = new Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true },
    opensAt: { type: String, required: true },
    closesAt: { type: String, required: true },
  },
  { _id: false },
);

const ServiceItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, min: 0 },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const ListingSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 4000 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    contact: { type: ContactSchema, default: () => ({}) },
    location: { type: LocationSchema, required: true },
    images: { type: [ImageSchema], default: [], validate: [(v: unknown[]) => v.length <= 6, "Maximum 6 images"] },
    openingHours: { type: [HourSchema], default: [] },
    services: { type: [ServiceItemSchema], default: [] },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: "pending",
      index: true,
    },
    statusReason: { type: String, maxlength: 500 },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    featured: { type: Boolean, default: false, index: true },
    featuredUntil: { type: Date },
    stats: {
      views: { type: Number, default: 0 },
      contactClicks: { type: Number, default: 0 },
    },
    /** Denormalized lowercase text for contains-search (Bangla-friendly). */
    searchText: { type: String, default: "" },
  },
  { timestamps: true },
);

ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ status: 1, featured: -1, createdAt: -1 });
ListingSchema.index({ status: 1, "location.division": 1, "location.district": 1 });
ListingSchema.index({ searchText: 1 });

export type ListingDoc = InferSchemaType<typeof ListingSchema>;

export const Listing = models.Listing ?? model("Listing", ListingSchema);
