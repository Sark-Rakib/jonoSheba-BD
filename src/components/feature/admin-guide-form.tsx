"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type GuideLike = {
  title?: string;
  category?: "nid" | "birth_reg" | "passport" | "gov_service" | "citizen_rights" | "other";
  description?: string;
  steps?: { title: string; body: string }[];
  requiredDocuments?: string[];
  sourceLinks?: { label: string; url: string }[];
  lastReviewedAt?: string;
  status?: "draft" | "published";
};

function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function AdminGuideForm({
  guide,
  formAction,
  pending,
  submitLabel,
}: {
  guide?: GuideLike;
  formAction: (formData: FormData) => void;
  pending: boolean;
  submitLabel: string;
}): React.ReactNode {
  const [steps, setSteps] = useState(() =>
    stringify(guide?.steps ?? [{ title: "", body: "" }]),
  );
  const [docs, setDocs] = useState(() =>
    stringify(guide?.requiredDocuments ?? []),
  );
  const [sources, setSources] = useState(() =>
    stringify(guide?.sourceLinks ?? [{ label: "", url: "" }]),
  );
  const [lastReviewed, setLastReviewed] = useState(
    guide?.lastReviewedAt
      ? new Date(guide.lastReviewedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );

  return (
    <form
      action={(fd) => {
        fd.set("steps", steps);
        fd.set("requiredDocuments", docs);
        fd.set("sourceLinks", sources);
        fd.set("lastReviewedAt", lastReviewed);
        formAction(fd);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="g-title">
            শিরোনাম *
          </label>
          <input
            id="g-title"
            name="title"
            defaultValue={guide?.title ?? ""}
            required
            minLength={4}
            maxLength={200}
            className="field-input py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="g-category">
            ক্যাটাগরি *
          </label>
          <select
            id="g-category"
            name="category"
            defaultValue={guide?.category ?? "nid"}
            className="field-input py-2"
          >
            <option value="nid">জাতীয় পরিচয়পত্র (NID)</option>
            <option value="birth_reg">জন্মনিবন্ধন</option>
            <option value="passport">পাসপোর্ট</option>
            <option value="gov_service">সরকারি সেবা</option>
            <option value="citizen_rights">নাগরিক অধিকার</option>
            <option value="other">অন্যান্য</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted" htmlFor="g-desc">
          বিবরণ *
        </label>
        <textarea
          id="g-desc"
          name="description"
          defaultValue={guide?.description ?? ""}
          required
          minLength={10}
          maxLength={800}
          rows={3}
          className="field-input py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted" htmlFor="g-steps">
          ধাপসমূহ (JSON)
        </label>
        <textarea
          id="g-steps"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={6}
          spellCheck={false}
          className="field-input py-2 font-mono text-xs"
          placeholder='[{ "title": "ধাপ ১", "body": "বিবরণ" }]'
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted" htmlFor="g-docs">
          প্রয়োজনীয় কাগজপত্র (JSON অ্যারে)
        </label>
        <textarea
          id="g-docs"
          value={docs}
          onChange={(e) => setDocs(e.target.value)}
          rows={3}
          spellCheck={false}
          className="field-input py-2 font-mono text-xs"
          placeholder='["জাতীয় পরিচয়পত্র", "জন্মনিবন্ধন সনদ"]'
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted" htmlFor="g-sources">
          উৎস লিংক (JSON অ্যারে)
        </label>
        <textarea
          id="g-sources"
          value={sources}
          onChange={(e) => setSources(e.target.value)}
          rows={4}
          spellCheck={false}
          className="field-input py-2 font-mono text-xs"
          placeholder='[{ "label": "BDRIS", "url": "https://bdris.gov.bd" }]'
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="g-reviewed">
            সর্বশেষ পর্যালোচনা *
          </label>
          <input
            id="g-reviewed"
            type="date"
            value={lastReviewed}
            onChange={(e) => setLastReviewed(e.target.value)}
            required
            className="field-input py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="g-status">
            প্রকাশনা অবস্থা
          </label>
          <select
            id="g-status"
            name="status"
            defaultValue={guide?.status ?? "draft"}
            className="field-input py-2"
          >
            <option value="draft">খসড়া</option>
            <option value="published">প্রকাশিত</option>
          </select>
        </div>
      </div>

      <div>
        <button type="submit" disabled={pending} className="btn-primary px-4 py-2 text-sm">
          {pending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
