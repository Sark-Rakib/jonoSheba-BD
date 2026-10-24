import { z } from "zod";

const phoneRegex = /^01[3-9]\d{8}$/;

export function normalizePhone(value: string): string {
  const digits = value.replace(/[\s\-().০-৯]/g, (ch) => {
    const bn = "০১২৩৪৫৬৭৮৯".indexOf(ch);
    return bn >= 0 ? String(bn) : "";
  });
  return digits;
}

export const passwordSchema = z
  .string()
  .min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে")
  .max(128)
  .regex(/[a-zA-Z]/, "পাসওয়ার্ডে অন্তত একটি অক্ষর থাকতে হবে")
  .regex(/[0-9]/, "পাসওয়ার্ডে অন্তত একটি সংখ্যা থাকতে হবে");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("সঠিক ইমেইল ঠিকানা দিন"));

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে").max(80),
    businessName: z.string().trim().max(120).optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || phoneRegex.test(normalizePhone(v)), {
        message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)",
      }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড দুটি মিলছে না",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "পাসওয়ার্ড দিন").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || phoneRegex.test(normalizePhone(v)), {
      message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন",
    }),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
