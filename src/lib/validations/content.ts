import { z } from "zod";
import { GUIDE_CATEGORIES } from "@/models/PublicGuide";
import { OPPORTUNITY_CATEGORIES } from "@/models/Opportunity";

const httpUrl = z
  .string()
  .trim()
  .max(500)
  .url("সঠিক URL দিন")
  .refine((v) => v.startsWith("http://") || v.startsWith("https://"), {
    message: "শুধু http/https URL গ্রহণযোগ্য",
  });

export const guideInputSchema = z.object({
  title: z.string().trim().min(4).max(200),
  category: z.enum(GUIDE_CATEGORIES),
  description: z.string().trim().min(10).max(800),
  steps: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(200),
        body: z.string().trim().min(2).max(2000),
      }),
    )
    .max(20)
    .default([]),
  requiredDocuments: z
    .array(z.string().trim().min(1).max(200))
    .max(20)
    .default([]),
  sourceLinks: z
    .array(z.object({ label: z.string().trim().min(1).max(120), url: httpUrl }))
    .max(10)
    .default([]),
  lastReviewedAt: z.coerce.date(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type GuideInput = z.infer<typeof guideInputSchema>;

export const opportunityInputSchema = z.object({
  title: z.string().trim().min(4).max(220),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(OPPORTUNITY_CATEGORIES),
  organization: z.string().trim().max(200).optional().or(z.literal("")),
  sourceLabel: z.string().trim().min(2).max(120),
  sourceUrl: httpUrl,
  deadline: z.coerce.date().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type OpportunityInput = z.infer<typeof opportunityInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().min(2).max(80),
  description: z.string().trim().max(200).default(""),
  icon: z.string().trim().max(40).default("Shapes"),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const reportModerationSchema = z.object({
  status: z.enum(["reviewing", "resolved", "dismissed"]),
  resolutionNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export const userRoleSchema = z.object({
  role: z.enum(["user", "business", "admin", "moderator"]),
  status: z.enum(["active", "suspended"]),
});
