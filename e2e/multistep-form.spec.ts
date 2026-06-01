import { test, expect, type Page } from "@playwright/test";

// Intercept external APIs so tests don't hit real endpoints
async function mockAPIs(page: Page) {
  // HubSpot form submission
  await page.route("https://api.hsforms.com/**", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ inlineMessage: "Thanks!" }) })
  );
  // Backend contact API
  await page.route("https://contact-checker-backend.vercel.app/**", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
  );
  // Default SDK script
  await page.route("https://import-cdn.default.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.DefaultSDK = { submit: () => Promise.resolve(), helloWorld: () => {} };",
    })
  );
}

async function fillEmail(page: Page, email = "test@acme.com") {
  await page.fill("#msfu-email", email);
  await page.click("button.emailCapture__btn");
}

test.describe("Email step", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIs(page);
    await page.goto("/");
  });

  test("shows error for empty email", async ({ page }) => {
    await page.click("button.emailCapture__btn");
    await expect(page.locator(".fieldError")).toHaveText("Email is required.");
  });

  test("shows error for personal/blocked email domain", async ({ page }) => {
    await page.fill("#msfu-email", "user@gmail.com");
    await page.click("button.emailCapture__btn");
    await expect(page.locator(".fieldError")).toHaveText(
      "Please use your work email address."
    );
  });

  test("shows error for malformed email", async ({ page }) => {
    await page.fill("#msfu-email", "notanemail");
    await page.click("button.emailCapture__btn");
    await expect(page.locator(".fieldError")).toHaveText(
      "Please use your work email address."
    );
  });

  test("advances to picker with valid work email", async ({ page }) => {
    await fillEmail(page);
    await expect(page.locator(".hsf__overlay")).toBeVisible();
    await expect(page.locator(".msf__picker-cards")).toBeVisible();
  });

  test("can submit email with Enter key", async ({ page }) => {
    await page.fill("#msfu-email", "test@acme.com");
    await page.keyboard.press("Enter");
    await expect(page.locator(".msf__picker-cards")).toBeVisible();
  });
});

test.describe("Picker step", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIs(page);
    await page.goto("/");
    await fillEmail(page);
  });

  test("shows housing and healthcare cards", async ({ page }) => {
    const cards = page.locator(".msf__picker-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("Housing");
    await expect(cards.nth(1)).toContainText("Healthcare");
  });

  test("Continue button is disabled until a vertical is selected", async ({
    page,
  }) => {
    const continueBtn = page.locator(".hsf__nav button");
    await expect(continueBtn).toBeDisabled();
    await page.click(".msf__picker-card:first-child");
    await expect(continueBtn).toBeEnabled();
  });

  test("back button returns to email step", async ({ page }) => {
    await page.click(".hsf__nav-back");
    await expect(page.locator(".hsf__overlay")).not.toBeVisible();
    await expect(page.locator("#msfu-email")).toBeVisible();
  });

  test("selecting Housing highlights the card", async ({ page }) => {
    await page.click(".msf__picker-card:first-child");
    await expect(page.locator(".msf__picker-card:first-child")).toHaveClass(
      /msf__picker-card--selected/
    );
  });

  test("selecting Healthcare highlights the card", async ({ page }) => {
    await page.click(".msf__picker-card:last-child");
    await expect(page.locator(".msf__picker-card:last-child")).toHaveClass(
      /msf__picker-card--selected/
    );
  });
});

test.describe("Housing flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIs(page);
    await page.goto("/");
    await fillEmail(page);
    await page.click(".msf__picker-card:first-child"); // Housing
    await page.click(".hsf__nav button"); // Continue
  });

  test("shows step 2 with name and phone fields", async ({ page }) => {
    await expect(page.locator("#msfu-firstname")).toBeVisible();
    await expect(page.locator("#msfu-lastname")).toBeVisible();
    await expect(page.locator("#msfu-phone")).toBeVisible();
    await expect(page.locator(".hsf__step-count")).toHaveText("1 / 2");
  });

  test("step 2 validates required fields", async ({ page }) => {
    await page.click(".hsf__nav button"); // Continue without filling
    const errors = page.locator(".fieldError");
    await expect(errors).toHaveCount(3);
  });

  test("step 2 back returns to picker", async ({ page }) => {
    await page.click(".hsf__nav-back");
    await expect(page.locator(".msf__picker-cards")).toBeVisible();
  });

  test("advances to step 3 with valid step 2 data", async ({ page }) => {
    await page.fill("#msfu-firstname", "Jane");
    await page.fill("#msfu-lastname", "Smith");
    await page.fill("#msfu-phone", "5555551234");
    await page.click(".hsf__nav button");
    await expect(page.locator("#msfu-company")).toBeVisible();
    await expect(page.locator(".hsf__step-count")).toHaveText("2 / 2");
  });

  test("step 3 shows housing-specific fields", async ({ page }) => {
    await page.fill("#msfu-firstname", "Jane");
    await page.fill("#msfu-lastname", "Smith");
    await page.fill("#msfu-phone", "5555551234");
    await page.click(".hsf__nav button");
    await expect(page.locator("#msfu-units")).toBeVisible();
    await expect(page.locator("#msfu-pms")).toBeVisible();
    await expect(page.locator("#msfu-ai")).toBeVisible();
  });

  test("step 3 validates company required", async ({ page }) => {
    await page.fill("#msfu-firstname", "Jane");
    await page.fill("#msfu-lastname", "Smith");
    await page.fill("#msfu-phone", "5555551234");
    await page.click(".hsf__nav button");
    await page.click(".hsf__nav button"); // Submit without company
    await expect(page.locator(".fieldError")).toContainText(
      "Company name is required."
    );
  });

  test("completes housing submission and shows success", async ({ page }) => {
    await page.fill("#msfu-firstname", "Jane");
    await page.fill("#msfu-lastname", "Smith");
    await page.fill("#msfu-phone", "5555551234");
    await page.click(".hsf__nav button");

    await page.fill("#msfu-company", "Acme Properties");
    await page.selectOption("#msfu-units", "1,000-4,999");
    await page.selectOption("#msfu-pms", "Yardi");
    await page.fill("#msfu-ai", "Leasing automation and resident communications");
    await page.click(".hsf__nav button"); // Submit

    await expect(page.locator(".hsf__success")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".hsf__success-headline")).toHaveText(
      "Your submission has been received!"
    );
  });
});

test.describe("Healthcare flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIs(page);
    await page.goto("/");
    await fillEmail(page);
    await page.click(".msf__picker-card:last-child"); // Healthcare
    await page.click(".hsf__nav button"); // Continue
  });

  test("shows step 2 with name and phone fields", async ({ page }) => {
    await expect(page.locator("#msfu-firstname")).toBeVisible();
    await expect(page.locator("#msfu-lastname")).toBeVisible();
    await expect(page.locator("#msfu-phone")).toBeVisible();
  });

  test("step 3 shows healthcare-specific fields", async ({ page }) => {
    await page.fill("#msfu-firstname", "Dr. John");
    await page.fill("#msfu-lastname", "Doe");
    await page.fill("#msfu-phone", "5555559876");
    await page.click(".hsf__nav button");

    await expect(page.locator("#msfu-callvol")).toBeVisible();
    await expect(page.locator("#msfu-ehr")).toBeVisible();
    await expect(page.locator("#msfu-specialty")).toBeVisible();
    await expect(page.locator("#msfu-providers")).toBeVisible();
    await expect(page.locator("#msfu-hear")).toBeVisible();
  });

  test("step 3 validates all required healthcare fields", async ({ page }) => {
    await page.fill("#msfu-firstname", "Dr. John");
    await page.fill("#msfu-lastname", "Doe");
    await page.fill("#msfu-phone", "5555559876");
    await page.click(".hsf__nav button");

    await page.fill("#msfu-company", "City Clinic");
    await page.click(".hsf__nav button"); // Submit without healthcare-specific fields

    const errors = page.locator(".fieldError");
    await expect(errors).toHaveCount(4); // call volume, ehr, specialty, providers
  });

  test("completes healthcare submission and shows success", async ({ page }) => {
    await page.fill("#msfu-firstname", "Dr. John");
    await page.fill("#msfu-lastname", "Doe");
    await page.fill("#msfu-phone", "5555559876");
    await page.click(".hsf__nav button");

    await page.fill("#msfu-company", "City Clinic");
    await page.fill("#msfu-callvol", "3000");
    await page.selectOption("#msfu-ehr", "Epic");
    await page.selectOption("#msfu-specialty", "Dermatology");
    await page.fill("#msfu-providers", "12");
    await page.fill("#msfu-hear", "Google search");
    await page.click(".hsf__nav button"); // Submit

    await expect(page.locator(".hsf__success")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".hsf__success-headline")).toHaveText(
      "Your submission has been received!"
    );
  });
});
