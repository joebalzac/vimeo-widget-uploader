import { test, expect, type Page } from "@playwright/test";

async function mockAPIs(page: Page) {
  await page.route("https://api.hsforms.com/**", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ inlineMessage: "Thanks!" }) })
  );
  await page.route("https://contact-checker-backend.vercel.app/**", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
  );
}

async function fillEmail(page: Page, email = "test@clinic.com") {
  await page.fill("#hsf-email", email);
  await page.click("button.emailCapture__btn");
}

test.describe("MultiStepFormHealth (Healthcare)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIs(page);
    await page.goto("/?form=health");
  });

  test("shows error for empty email", async ({ page }) => {
    await page.click("button.emailCapture__btn");
    await expect(page.locator(".fieldError")).toHaveText("Email is required.");
  });

  test("shows error for personal email domain", async ({ page }) => {
    await page.fill("#hsf-email", "user@yahoo.com");
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
    await page.fill("#hsf-firstname", "Dr. John");
    await page.fill("#hsf-lastname", "Doe");
    await page.fill("#hsf-phone", "5555559876");
    await page.click(".hsf__nav button");
    await expect(page.locator("#hsf-company")).toBeVisible();
  });

  test("step 3 shows healthcare-specific fields", async ({ page }) => {
    await fillEmail(page);
    await page.fill("#hsf-firstname", "Dr. John");
    await page.fill("#hsf-lastname", "Doe");
    await page.fill("#hsf-phone", "5555559876");
    await page.click(".hsf__nav button");
    await expect(page.locator("#hsf-ehr")).toBeVisible();
    await expect(page.locator("#hsf-specialty")).toBeVisible();
    await expect(page.locator("#hsf-how_did_you_hear_about_us")).toBeVisible();
  });

  test("step 3 validates company required", async ({ page }) => {
    await fillEmail(page);
    await page.fill("#hsf-firstname", "Dr. John");
    await page.fill("#hsf-lastname", "Doe");
    await page.fill("#hsf-phone", "5555559876");
    await page.click(".hsf__nav button");
    await page.click(".hsf__nav button");
    await expect(page.locator(".fieldError")).toContainText(
      "Company name is required."
    );
  });

  test("completes full healthcare submission and shows success", async ({
    page,
  }) => {
    await fillEmail(page);
    await page.fill("#hsf-firstname", "Dr. John");
    await page.fill("#hsf-lastname", "Doe");
    await page.fill("#hsf-phone", "5555559876");
    await page.click(".hsf__nav button");

    await page.fill("#hsf-company", "City Clinic");
    await page.selectOption("#hsf-ehr", "Epic");
    await page.selectOption("#hsf-specialty", "Dermatology");
    await page.fill("#hsf-how_did_you_hear_about_us", "Google search");
    await page.click(".hsf__nav button");

    await expect(page.locator(".hsf__success")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".hsf__success-headline")).toHaveText(
      "Your submission has been received!"
    );
  });
});
