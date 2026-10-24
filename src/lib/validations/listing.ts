import { z } from "zod";
import {
  DIVISION_NAMES,
  getDistricts,
  getUpazilas,
} from "@/lib/constants/locations";

const httpUrl = z
  .string()
  .trim()
  .max(300)
  .url("সঠিক URL দিন")
  .refine((v) => v.startsWith("http://") || v.startsWith("https://"), {
    message: "শুধু http/https URL গ্রহণযোগ্য",
  });

const phoneLike = z
  .string()
  .trim()
  .max(20)
  .regex(/^01[3-9][\d\s\-]{6,12}$/, "সঠিক মোবাইল নম্বর দিন");

export const listingContactSchema = z
  .object({
    phone: phoneLike.optional().or(z.literal("")),
    whatsapp: phoneLike.optional().or(z.literal("")),
    email: z.string().trim().max(120).pipe(z.email("সঠিক ইমেইল দিন")).optional().or(z.literal("")),
    website: httpUrl.optional().or(z.literal("")),
  })
  .refine(
    (c) => Boolean(c.phone || c.whatsapp || c.email || c.website),
    { message: "অন্তত একটি যোগাযোগের মাধ্যম দিন", path: ["phone"] },
  );

export const listingLocationSchema = z
  .object({
    division: z
      .string()
      .trim()
      .refine((v) => DIVISION_NAMES.includes(v), "সঠিক বিভাগ নির্বাচন করুন"),
    district: z.string().trim().min(1, "জেলা নির্বাচন করুন"),
    upazila: z.string().trim().max(80).optional().or(z.literal("")),
    addressLine: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .superRefine((loc, ctx) => {
    const districts = getDistricts(loc.division);
    if (!districts.some((d) => d.name === loc.district)) {
      ctx.addIssue({
        code: "custom",
        message: "এই বিভাগে সঠিক জেলা নেই",
        path: ["district"],
      });
    }
    if (loc.upazila) {
      const upazilas = getUpazilas(loc.division, loc.district);
      if (upazilas.length > 0 && !upazilas.includes(loc.upazila)) {
        ctx.addIssue({
          code: "custom",
          message: "সঠিক উপজেলা নির্বাচন করুন",
          path: ["upazila"],
        });
      }
    }
  });

const hourSchema = z.object({
  day: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
});

const serviceItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z
    .number()
    .min(0, "মূল্যঋণাত্মক হতে পারে না")
    .max(10_000_000)
    .nullable()
    .optional(),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});

export const listingFormSchema = z.object({
  name: z.string().trim().min(3, "নাম কমপক্ষে ৩ অক্ষরের হতে হবে").max(140),
  description: z
    .string()
    .trim()
    .min(20, "বিবরণ কমপক্ষে ২০ অক্ষরের হতে হবে")
    .max(4000),
  category: z.string().trim().min(1, "ক্যাটাগরি নির্বাচন করুন"),
  contact: listingContactSchema,
  location: listingLocationSchema,
  images: z
    .array(z.object({ url: httpUrl, alt: z.string().trim().max(160).optional().or(z.literal("")) }))
    .max(6, "সর্বোচ্চ ৬টি ছবি")
    .default([]),
  openingHours: z.array(hourSchema).max(7).default([]),
  services: z.array(serviceItemSchema).max(40).default([]),
  status: z.enum(["draft", "pending"]).default("pending"),
});

export type ListingFormInput = z.infer<typeof listingFormSchema>;

export const listingStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "suspended", "pending"]),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const listingModerationSchema = z.object({
  status: z.enum(["approved", "rejected", "suspended"]),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const reportInputSchema = z.object({
  targetType: z.enum(["listing", "review", "guide", "opportunity"]),
  targetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "সঠিক আইডি দিন"),
  reason: z.enum(["wrong_info", "scam_suspicion", "not_responding", "spam", "other"]),
  details: z.string().trim().max(1500).optional().or(z.literal("")),
  reporterContact: z.string().trim().max(120).optional().or(z.literal("")),
});

export type ReportInput = z.infer<typeof reportInputSchema>;

export const reviewInputSchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1200).optional().or(z.literal("")),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

/** Query schema for public listing search (also used by /api/services). */
export const serviceSearchSchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  division: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  sort: z.enum(["newest", "most_viewed", "name"]).default("newest"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  perPage: z.coerce.number().int().min(1).max(24).default(12),
});

export type ServiceSearchParams = z.infer<typeof serviceSearchSchema>;
