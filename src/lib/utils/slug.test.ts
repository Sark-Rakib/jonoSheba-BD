import { describe, expect, it } from "vitest";
import { ensureUniqueSlug, slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("keeps Bangla letters and numbers", () => {
    expect(slugify("রহমান লিগ্যাল সার্ভিসেস")).toBe(
      "রহমান-লিগ্যাল-সার্ভিসেস",
    );
  });

  it("strips punctuation and trims dashes", () => {
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
    expect(slugify("--abc--")).toBe("abc");
  });

  it("handles empty-ish input", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("returns slugify(base) when long enough", () => {
    expect(uniqueSlug("নারায়ণগঞ্জ সেবা")).toBe("নারায়ণগঞ্জ-সেবা");
  });

  it("falls back to a random suffix for short input", () => {
    expect(uniqueSlug("ab")).toMatch(/^ab-[a-z0-9]+$/);
    expect(uniqueSlug("!!")).toMatch(/^item-[a-z0-9]+$/);
  });
});

describe("ensureUniqueSlug", () => {
  it("returns the base slug when unused", async () => {
    const slug = await ensureUniqueSlug("Dhaka Services", async () => false);
    expect(slug).toBe("dhaka-services");
  });

  it("appends -2, -3… on collisions", async () => {
    const taken = new Set(["dhaka-services", "dhaka-services-2"]);
    const slug = await ensureUniqueSlug("Dhaka Services", async (c) =>
      taken.has(c),
    );
    expect(slug).toBe("dhaka-services-3");
  });
});
