import { describe, expect, it } from "vitest";
import { containsRegex, escapeRegExp, normalizeSearchText } from "./search";

describe("escapeRegExp", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegExp("a.b*c?")).toBe("a\\.b\\*c\\?");
    expect(escapeRegExp("(x+y)")).toBe("\\(x\\+y\\)");
  });
});

describe("containsRegex", () => {
  it("returns null for blank input", () => {
    expect(containsRegex("   ")).toBeNull();
    expect(containsRegex("")).toBeNull();
  });

  it("matches substrings case-insensitively", () => {
    const re = containsRegex("ঢাকা");
    expect(re).not.toBeNull();
    expect(re?.test("সাভার, ঢাকা")).toBe(true);
    expect(re?.test("চট্টগ্রাম")).toBe(false);
  });

  it("treats user input literally, not as a pattern", () => {
    const re = containsRegex("a.c");
    expect(re?.test("abc")).toBe(false);
    expect(re?.test("a.c")).toBe(true);
  });
});

describe("normalizeSearchText", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeSearchText("  Hello   World  ")).toBe("hello world");
  });

  it("normalizes Bangla digits to ASCII", () => {
    expect(normalizeSearchText("ফি ৫০০ টাকা")).toBe("ফি 500 টাকা");
  });

  it("normalizes full-width characters via NFKC", () => {
    expect(normalizeSearchText("１２３")).toBe("123");
  });
});
