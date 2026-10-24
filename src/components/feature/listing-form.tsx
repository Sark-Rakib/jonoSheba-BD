"use client";

import { useEffect, useMemo } from "react";
import {
  useFieldArray,
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listingFormSchema, type ListingFormInput } from "@/lib/validations/listing";
import { DIVISIONS, getDistricts, getUpazilas } from "@/lib/constants/locations";
import type { ListingActionState } from "@/actions/listings";
import type { CategoryDTO } from "@/types";

/** Day indices follow JS Date.getDay(): 0 = Sunday … 6 = Saturday. */
const WEEK_DAYS = [
  { day: 0, label: "রবিবার" },
  { day: 1, label: "সোমবার" },
  { day: 2, label: "মঙ্গলবার" },
  { day: 3, label: "বুধবার" },
  { day: 4, label: "বৃহস্পতিবার" },
  { day: 5, label: "শুক্রবার" },
  { day: 6, label: "শনিবার" },
];

interface FlatValues {
  name: string;
  description: string;
  category: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  division: string;
  district: string;
  upazila: string;
  addressLine: string;
  images: { url: string; alt: string }[];
  openingHours: { day: number; opensAt: string; closesAt: string; enabled: boolean }[];
  services: { name: string; price: string; description: string }[];
  status: "draft" | "pending";
}

function toNested(flat: FlatValues): ListingFormInput {
  return {
    name: flat.name,
    description: flat.description,
    category: flat.category,
    contact: {
      phone: flat.phone,
      whatsapp: flat.whatsapp,
      email: flat.email,
      website: flat.website,
    },
    location: {
      division: flat.division,
      district: flat.district,
      upazila: flat.upazila,
      addressLine: flat.addressLine,
    },
    images: flat.images
      .filter((img) => img.url.trim() !== "")
      .map((img) => ({ url: img.url, alt: img.alt || undefined })),
    openingHours: flat.openingHours
      .filter((h) => h.enabled)
      .map(({ day, opensAt, closesAt }) => ({ day, opensAt, closesAt })),
    services: flat.services
      .filter((s) => s.name.trim() !== "")
      .map((s) => ({
        name: s.name,
        price: s.price.trim() === "" ? null : Number(s.price),
        description: s.description || undefined,
      })),
    status: flat.status,
  };
}

/** Zod → react-hook-form resolver over the flat wire format the action expects. */
const resolver = (async (values: FlatValues) => {
  const parsed = listingFormSchema.safeParse(toNested(values));
  if (parsed.success) {
    return { values, errors: {} };
  }
  const errors: FieldErrors<FlatValues> = {};
  for (const issue of parsed.error.issues) {
    const [first, second] = issue.path;
    const key =
      first === "contact" || first === "location"
        ? String(second ?? first)
        : String(first ?? "form");
    const bucket = (errors as Record<string, unknown>)[key] as
      | { type?: string; message?: string }
      | undefined;
    if (!bucket || !bucket.message) {
      (errors as Record<string, unknown>)[key] = {
        type: issue.code,
        message: issue.message,
      };
    }
  }
  return { values: {} as FlatValues, errors };
}) as unknown as Resolver<FlatValues>;

export interface ListingFormProps {
  categories: CategoryDTO[];
  action: (formData: FormData) => void;
  state: ListingActionState;
  isPending: boolean;
  submitLabel: string;
  initial?: {
    name: string;
    description: string;
    categorySlug: string;
    contact: { phone?: string; whatsapp?: string; email?: string; website?: string };
    location: { division: string; district: string; upazila?: string; addressLine?: string };
    images: { url: string; alt?: string }[];
    openingHours: { day: number; opensAt: string; closesAt: string }[];
    services: { name: string; price?: number | null; description?: string }[];
    status: "draft" | "pending";
  };
}

export function ListingForm({
  categories,
  action,
  state,
  isPending,
  submitLabel,
  initial,
}: ListingFormProps): React.ReactNode {
  const defaultValues: FlatValues = useMemo(
    () => ({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      category: initial?.categorySlug ?? "",
      phone: initial?.contact.phone ?? "",
      whatsapp: initial?.contact.whatsapp ?? "",
      email: initial?.contact.email ?? "",
      website: initial?.contact.website ?? "",
      division: initial?.location.division ?? "",
      district: initial?.location.district ?? "",
      upazila: initial?.location.upazila ?? "",
      addressLine: initial?.location.addressLine ?? "",
      images:
        initial?.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })) ?? [],
      openingHours: WEEK_DAYS.map(({ day }) => {
        const existing = initial?.openingHours.find((h) => h.day === day);
        return {
          day,
          opensAt: existing?.opensAt ?? "10:00",
          closesAt: existing?.closesAt ?? "18:00",
          enabled: Boolean(existing),
        };
      }),
      services:
        initial?.services.map((s) => ({
          name: s.name,
          price: s.price == null ? "" : String(s.price),
          description: s.description ?? "",
        })) ?? [],
      status: initial?.status ?? "pending",
    }),
    [initial],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlatValues>({ resolver, defaultValues, mode: "onBlur" });

  const imagesArray = useFieldArray({ control, name: "images" });
  const servicesArray = useFieldArray({ control, name: "services" });
  const hoursArray = useFieldArray({ control, name: "openingHours" });

  const division = watch("division");
  const districts = useMemo(() => getDistricts(division), [division]);
  const district = watch("district");
  const upazilas = useMemo(() => getUpazilas(division, district), [division, district]);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
  }, [state]);

  function err(key: keyof FlatValues | string): string | undefined {
    const e = (errors as Record<string, { message?: string } | undefined>)[
      String(key)
    ];
    return e?.message;
  }
  function serverErr(key: string): string | undefined {
    const list = state.errors?.[key];
    return list?.[0];
  }

  function onSubmit(values: FlatValues): void {
    const nested = toNested(values);
    const fd = new FormData();
    fd.set("name", nested.name);
    fd.set("description", nested.description);
    fd.set("category", nested.category);
    fd.set("phone", nested.contact.phone ?? "");
    fd.set("whatsapp", nested.contact.whatsapp ?? "");
    fd.set("email", nested.contact.email ?? "");
    fd.set("website", nested.contact.website ?? "");
    fd.set("division", nested.location.division);
    fd.set("district", nested.location.district);
    fd.set("upazila", nested.location.upazila ?? "");
    fd.set("addressLine", nested.location.addressLine ?? "");
    fd.set("images", JSON.stringify(nested.images));
    fd.set("openingHours", JSON.stringify(nested.openingHours));
    fd.set("services", JSON.stringify(nested.services));
    fd.set("status", nested.status);
    action(fd);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit)(e);
      }}
      className="flex flex-col gap-8"
      noValidate
    >
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-semibold text-ink">মূল তথ্য</h2>
        <div>
          <label htmlFor="lf-name" className="field-label">
            সেবার / প্রতিষ্ঠানের নাম <span className="text-danger-500">*</span>
          </label>
          <input id="lf-name" className="field-input" maxLength={140} {...register("name")} />
          {(err("name") || serverErr("name")) && (
            <p className="field-error">{err("name") ?? serverErr("name")}</p>
          )}
        </div>
        <div>
          <label htmlFor="lf-description" className="field-label">
            বিবরণ <span className="text-danger-500">*</span>
          </label>
          <textarea
            id="lf-description"
            rows={5}
            maxLength={4000}
            className="field-input"
            placeholder="আপনার সেবা সম্পর্কে বিস্তারিত লিখুন…"
            {...register("description")}
          />
          {(err("description") || serverErr("description")) && (
            <p className="field-error">{err("description") ?? serverErr("description")}</p>
          )}
        </div>
        <div>
          <label htmlFor="lf-category" className="field-label">
            ক্যাটাগরি <span className="text-danger-500">*</span>
          </label>
          <select id="lf-category" className="field-input" {...register("category")}>
            <option value="">— নির্বাচন করুন —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          {(err("category") || serverErr("category")) && (
            <p className="field-error">{err("category") ?? serverErr("category")}</p>
          )}
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-semibold text-ink">যোগাযোগ</h2>
        <p className="-mt-2 text-sm text-ink-muted">
          অন্তত একটি যোগাযোগের মাধ্যম দিন। কমপক্ষে একটি ফোন নম্বর দিলে ব্যবহারকারী
          সহজে আপনাকে খুঁজে পাবেন।
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lf-phone" className="field-label">
              মোবাইল নম্বর
            </label>
            <input
              id="lf-phone"
              className="field-input"
              placeholder="01XXXXXXXXX"
              {...register("phone")}
            />
            {(err("phone") || serverErr("phone")) && (
              <p className="field-error">{err("phone") ?? serverErr("phone")}</p>
            )}
          </div>
          <div>
            <label htmlFor="lf-whatsapp" className="field-label">
              হোয়াটসঅ্যাপ নম্বর
            </label>
            <input
              id="lf-whatsapp"
              className="field-input"
              placeholder="01XXXXXXXXX"
              {...register("whatsapp")}
            />
            {err("whatsapp") && <p className="field-error">{err("whatsapp")}</p>}
          </div>
          <div>
            <label htmlFor="lf-email" className="field-label">
              ইমেইল
            </label>
            <input id="lf-email" type="email" className="field-input" {...register("email")} />
            {(err("email") || serverErr("email")) && (
              <p className="field-error">{err("email") ?? serverErr("email")}</p>
            )}
          </div>
          <div>
            <label htmlFor="lf-website" className="field-label">
              ওয়েবসাইট
            </label>
            <input
              id="lf-website"
              className="field-input"
              placeholder="https://…"
              {...register("website")}
            />
            {(err("website") || serverErr("website")) && (
              <p className="field-error">{err("website") ?? serverErr("website")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-semibold text-ink">অবস্থান</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lf-division" className="field-label">
              বিভাগ <span className="text-danger-500">*</span>
            </label>
            <select
              id="lf-division"
              className="field-input"
              {...register("division", {
                onChange: () => {
                  setValue("district", "");
                  setValue("upazila", "");
                },
              })}
            >
              <option value="">— নির্বাচন করুন —</option>
              {DIVISIONS.map((d) => (
                <option key={d.nameEn} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            {(err("division") || serverErr("division")) && (
              <p className="field-error">{err("division") ?? serverErr("division")}</p>
            )}
          </div>
          <div>
            <label htmlFor="lf-district" className="field-label">
              জেলা <span className="text-danger-500">*</span>
            </label>
            <select
              id="lf-district"
              className="field-input"
              disabled={districts.length === 0}
              {...register("district", {
                onChange: () => setValue("upazila", ""),
              })}
            >
              <option value="">— নির্বাচন করুন —</option>
              {districts.map((d) => (
                <option key={d.nameEn} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            {(err("district") || serverErr("district")) && (
              <p className="field-error">{err("district") ?? serverErr("district")}</p>
            )}
          </div>
          <div>
            <label htmlFor="lf-upazila" className="field-label">
              উপজেলা <span className="text-ink-subtle">(ঐচ্ছিক)</span>
            </label>
            {upazilas.length > 0 ? (
              <select id="lf-upazila" className="field-input" {...register("upazila")}>
                <option value="">— নির্বাচন করুন —</option>
                {upazilas.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="lf-upazila"
                className="field-input"
                placeholder="উপজেলার নাম"
                {...register("upazila")}
              />
            )}
            {err("upazila") && <p className="field-error">{err("upazila")}</p>}
          </div>
          <div>
            <label htmlFor="lf-address" className="field-label">
              বিস্তারিত ঠিকানা <span className="text-ink-subtle">(ঐচ্ছিক)</span>
            </label>
            <input
              id="lf-address"
              className="field-input"
              maxLength={300}
              placeholder="রোড, এলাকা…"
              {...register("addressLine")}
            />
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">ছবি</h2>
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() =>
              imagesArray.fields.length < 6 &&
              imagesArray.append({ url: "", alt: "" })
            }
            disabled={imagesArray.fields.length >= 6}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            ছবি যোগ করুন
          </button>
        </div>
        {imagesArray.fields.length === 0 ? (
          <p className="text-sm text-ink-muted">
            ছবি যোগ করলে তালিকা আরও আকর্ষণীয় হয় (সর্বোচ্চ ৬টি)।
          </p>
        ) : null}
        {imagesArray.fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="field-label text-xs">ছবির লিংক (URL)</label>
              <input
                className="field-input"
                placeholder="https://…"
                {...register(`images.${index}.url` as const)}
              />
              {err(`images.${index}.url`) && (
                <p className="field-error">{err(`images.${index}.url`)}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="field-label text-xs">বিকল্প লেখা (alt)</label>
              <input
                className="field-input"
                maxLength={160}
                {...register(`images.${index}.alt` as const)}
              />
            </div>
            <button
              type="button"
              className="btn-ghost text-danger-600"
              onClick={() => imagesArray.remove(index)}
              aria-label="ছবি সরান"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="text-base font-semibold text-ink">খোলার সময়</h2>
        <p className="-mt-2 text-sm text-ink-muted">
          সক্রিয় দিনগুলোর সময়সীমা দিন। বন্ধ থাকার দিন আনচেক করে রাখুন।
        </p>
        {hoursArray.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-line p-3 sm:grid-cols-[8rem_1fr_1fr_auto]"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line-strong text-primary-600 focus:ring-primary-500"
                {...register(`openingHours.${index}.enabled` as const)}
              />
              {WEEK_DAYS[index].label}
            </label>
            <input
              type="time"
              className="field-input py-1.5"
              aria-label={`${WEEK_DAYS[index].label} খোলার সময়`}
              {...register(`openingHours.${index}.opensAt` as const)}
            />
            <input
              type="time"
              className="field-input py-1.5"
              aria-label={`${WEEK_DAYS[index].label} বন্ধ হওয়ার সময়`}
              {...register(`openingHours.${index}.closesAt` as const)}
            />
          </div>
        ))}
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">প্রদত্ত সেবা ও মূল্য</h2>
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() => servicesArray.append({ name: "", price: "", description: "" })}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            সেবা যোগ করুন
          </button>
        </div>
        {servicesArray.fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="field-label text-xs">সেবার নাম</label>
              <input
                className="field-input"
                maxLength={120}
                {...register(`services.${index}.name` as const)}
              />
            </div>
            <div className="w-full sm:w-36">
              <label className="field-label text-xs">মূল্য (টাকা)</label>
              <input
                type="number"
                min={0}
                className="field-input"
                placeholder="ঐচ্ছিক"
                {...register(`services.${index}.price` as const)}
              />
            </div>
            <div className="flex-1">
              <label className="field-label text-xs">বিবরণ</label>
              <input
                className="field-input"
                maxLength={300}
                {...register(`services.${index}.description` as const)}
              />
            </div>
            <button
              type="button"
              className="btn-ghost text-danger-600"
              onClick={() => servicesArray.remove(index)}
              aria-label="সেবা সরান"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {err("services") && <p className="field-error">{err("services")}</p>}
      </section>

      {state.errors?.form && (
        <p className="text-sm font-medium text-danger-600">{state.errors.form[0]}</p>
      )}
      {state.message && !state.ok && (
        <p className="text-sm font-medium text-danger-600">{state.message}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {submitLabel}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={isPending}
          onClick={() => void handleSubmit((vals) => onSubmit({ ...vals, status: "draft" }))()}
        >
          খসড়া হিসেবে সংরক্ষণ
        </button>
      </div>
    </form>
  );
}
