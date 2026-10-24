import { Schema, model, models, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["user", "business", "admin", "moderator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    businessName: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 20 },
    role: { type: String, enum: USER_ROLES, default: "user" },
    status: { type: String, enum: USER_STATUSES, default: "active" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User = models.User ?? model("User", UserSchema);
