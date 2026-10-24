import "server-only";
import { cacheTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models";
import type { CategoryDTO } from "@/types";

/** Public read path (home, forms) — cached; invalidated by admin category actions. */
export async function getActiveCategories(): Promise<CategoryDTO[]> {
  "use cache";
  cacheTag("categories-active");
  await connectDB();
  const docs = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .select("slug name nameEn description icon isActive sortOrder")
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    nameEn: d.nameEn,
    description: d.description ?? "",
    icon: d.icon ?? "Shapes",
    isActive: d.isActive ?? true,
    sortOrder: d.sortOrder ?? 0,
  }));
}

export async function getAllCategories(): Promise<CategoryDTO[]> {
  await connectDB();
  const docs = await Category.find({})
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    nameEn: d.nameEn,
    description: d.description ?? "",
    icon: d.icon ?? "Shapes",
    isActive: d.isActive ?? true,
    sortOrder: d.sortOrder ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
  await connectDB();
  const d = await Category.findOne({ slug }).lean();
  if (!d) return null;
  return {
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    nameEn: d.nameEn,
    description: d.description ?? "",
    icon: d.icon ?? "Shapes",
    isActive: d.isActive ?? true,
    sortOrder: d.sortOrder ?? 0,
  };
}

export async function categoryExistsBySlug(slug: string): Promise<boolean> {
  await connectDB();
  const count = await Category.countDocuments({ slug });
  return count > 0;
}
