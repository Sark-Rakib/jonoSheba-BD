import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home page renders hero and main navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/জনসেবা/);
    await expect(
      page.getByRole("link", { name: /সেবা/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /নির্দেশিকা/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /চাকরি/ }).first(),
    ).toBeVisible();
  });

  test("home page links to login", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.getByRole("link", { name: /লগ ইন/ }).first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/ইমেইল/)).toBeVisible();
  });

  test("static informational pages render", async ({ page }) => {
    for (const path of ["/about", "/contact", "/privacy", "/terms"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("register page shows the form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/নাম/).first()).toBeVisible();
    await expect(page.getByLabel(/ইমেইল/)).toBeVisible();
  });

  test("robots.txt is served", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("Sitemap:");
    expect(body).toContain("Disallow: /admin");
  });
});
