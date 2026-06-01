import { test, expect, type Page } from "@playwright/test";

async function mockAPIs(page: Page) {
  await page.route("https://api.hsforms.com/**", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ inlineMessage: "Thanks!" }) })
  );
  await page.route("https://contact-checker-backend.vercel.app/**", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
  );
  await page.route("https://import-cdn.default.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.DefaultSDK = { submit: () => Promise.resolve(), helloWorld: () => {} };",
    })
  );
}

async function fillEmail(page: Page, email = "test@acme.com") {
  await page.fill("#hsf-email", email);
  await page.click("button.emailCapture__btn");
}

test.describe("MultiStepForm (Housing)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIs(page);
    await page.goto("/?form=housing");
  });

  test("shows error for empty email", async ({ page }) => {
    await page.click("button.emailCapture__btn");
    await expect(page.locator(".fieldError")).toHaveText("Email is required.");
  });

  test("shows error for personal email domain", async ({ page }) => {
    await page.fill("#hsf-email", "user@gmail.com");
    await page.click("button.emailCapture__btn");
    await expect(page.locator(".fieldError")).toHaveText(
      "Please use your work email address."
    );
  });

  test("advances to form with valid work email", async ({ page }) => {
    await fillEmail(page);
    await expect(page.locator(".hsf__overlay")).toBeVisible();
    await expect(page.locator("#hsf-firstname")).toBeVisible();
  });

  test("step 2 validates required fields", async ({ page }) => {
    await fillEmail(page);
    await page.click(".hsf__nav button");
    await expect(page.locator(".fieldError")).toHaveCount(3);
  });

  test("step 2 back returns to email", async ({ page }) => {
    await fillEmail(page);
    await page.click(".hsf__nav-back");
    await expect(page.locator(".hsf__overlay")).not.toBeVisible();
    await expect(page.locator("#hsf-email")).toBeVisible();
  });

  test("advances to step 3 with valid step 2 data", async ({ page }) => {
    await fillEmail(page);
    await page.fill("#hsf-firstname", "Jane");
    await page.fill("#hsf-lastname", "Smith");
    await page.fill("#hsf-phone", "5555551234");
    await page.click(".hsf__nav button");
    await expect(page.locator("#hsf-company")).toBeVisible();
  });

  test("step 3 shows housing-specific fields", async ({ page }) => {
    await fillEmail(page);
    await page.fill("#hsf-firstname", "Jane");
    await page.fill("#hsf-lastname", "Smith");
    await page.fill("#hsf-phone", "5555551234");
    await page.click(".hsf__nav button");
    await expect(page.locator("#hsf-units")).toBeVisible();
    await expect(page.locator("#hsf-pms")).toBeVisible();
    await expect(page.locator("#hsf-ai")).toBeVisible();
  });

  test("step 3 validates company required", async ({ page }) => {
    await fillEmail(page);
    await page.fill("#hsf-firstname", "Jane");
    await page.fill("#hsf-lastname", "Smith");
    await page.fill("#hsf-phone", "5555551234");
    await page.click(".hsf__nav button");
    await page.click(".hsf__nav button");
    await expect(page.locator(".fieldError")).toContainText(
      "Company name is required."
    );
  });

  test("completes full housing submission and resets to email step", async ({
    page,
  }) => {
    await fillEmail(page);
    await page.fill("#hsf-firstname", "Jane");
    await page.fill("#hsf-lastname", "Smith");
    await page.fill("#hsf-phone", "5555551234");
    await page.click(".hsf__nav button");

    await page.fill("#hsf-company", "Acme Properties");
    await page.selectOption("#hsf-units", "1,000-4,999");
    await page.selectOption("#hsf-pms", "Yardi");
    await page.fill("#hsf-ai", "Leasing automation");
    await page.click(".hsf__nav button");

    // MultiStepForm resets to step 1 after submit (no inline success screen)
    await expect(page.locator("#hsf-email")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".hsf__overlay")).not.toBeVisible();
  });
});
