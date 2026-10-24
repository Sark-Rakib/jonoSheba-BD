"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { toggleSaved } from "@/lib/services/saved";

export async function toggleSaveAction(listingId: string): Promise<boolean> {
  const user = await requireUser();
  if (!Types.ObjectId.isValid(listingId)) return false;
  const saved = await toggleSaved(user.id, listingId);
  revalidatePath("/dashboard/saved");
  return saved;
}
