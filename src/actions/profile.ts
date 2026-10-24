"use server";

import { revalidatePath } from "next/cache";
import { profileUpdateSchema, normalizePhone } from "@/lib/validations/auth";
import { requireUser } from "@/lib/auth/dal";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";

export interface ProfileFormState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    businessName: formData.get("businessName") ?? "",
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      (errors[key] ??= []).push(issue.message);
    }
    return { errors };
  }

  try {
    await connectDB();
    await User.updateOne(
      { _id: user.id },
      {
        $set: {
          name: parsed.data.name,
          businessName: parsed.data.businessName || null,
          phone: parsed.data.phone ? normalizePhone(parsed.data.phone) : null,
        },
      },
    );
  } catch (err) {
    console.error("[profile]", err);
    return { message: "সংরক্ষণ করা যায়নি। পরে আবার চেষ্টা করুন।" };
  }

  revalidatePath("/dashboard/profile");
  return { ok: true, message: "প্রোফাইল হালনাগাদ হয়েছে" };
}
