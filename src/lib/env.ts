import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
      (v) => v.startsWith("mongodb://") || v.startsWith("mongodb+srv://"),
      "MONGODB_URI must start with mongodb:// or mongodb+srv://",
    ),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  SITE_URL: z
    .string()
    .url("SITE_URL must be a valid URL")
    .transform((v) => v.replace(/\/+$/, "")),
  ADMIN_SEED_EMAIL: z.string().email().optional(),
  ADMIN_SEED_PASSWORD: z.string().min(8).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

/**
 * Validates process.env on the server. Throws a clear, aggregated error when
 * required variables are missing or malformed. Never import from client code.
 */
/** Treat unset and empty-string values alike — `VAR=` in .env means "not set". */
function emptyToUndefined(value: string | undefined): string | undefined {
  return value && value.trim() !== "" ? value : undefined;
}

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    MONGODB_URI: emptyToUndefined(process.env.MONGODB_URI),
    SESSION_SECRET: emptyToUndefined(process.env.SESSION_SECRET),
    SITE_URL: emptyToUndefined(process.env.SITE_URL) ?? "http://localhost:3000",
    ADMIN_SEED_EMAIL: emptyToUndefined(process.env.ADMIN_SEED_EMAIL),
    ADMIN_SEED_PASSWORD: emptyToUndefined(process.env.ADMIN_SEED_PASSWORD),
  });
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env.local and fill in the values.`,
    );
  }
  cached = parsed.data;
  return cached;
}

export function getSiteUrl(): string {
  return getEnv().SITE_URL;
}
