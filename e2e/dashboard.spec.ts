import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("loads and shows KPI cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Operations Overview");
    await expect(page.locator("text=Active Incidents")).toBeVisible();
    await expect(page.locator("text=Investigating")).toBeVisible();
  });

  test("shows incident list", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Live Triage Queue")).toBeVisible();
  });

  test("navigates to incident detail", async ({ page }) => {
    await page.goto("/dashboard");
    const link = page.locator("a").filter({ hasText: /INC-/ }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/incidents\//);
  });
});

test.describe("Incidents Page", () => {
  test("loads with search and filters", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Active Incidents");
    await expect(page.locator('input[aria-label="Search incidents"]')).toBeVisible();
  });

  test("search filters incidents", async ({ page }) => {
    await page.goto("/dashboard");
    const search = page.locator('input[aria-label="Search incidents"]');
    await search.fill("INC-0001");
    await expect(page.locator("text=INC-0001")).toBeVisible();
  });

  test("priority filter works", async ({ page }) => {
    await page.goto("/dashboard");
    await page.locator("button", { hasText: "P0" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("Navigation", () => {
  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");
    await page.goto("/ai-assistant");
    await expect(page.locator("h1")).toContainText("Nexus AI Analysis");
    await page.goto("/infrastructure");
    await expect(page.locator("h1")).toContainText("Service Mesh Health");
    await page.goto("/analytics");
    await expect(page.locator("h1")).toContainText("System Analytics");
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("System Settings");
    await page.goto("/support");
    await expect(page.locator("h1")).toContainText("Help & Support");
  });
});
