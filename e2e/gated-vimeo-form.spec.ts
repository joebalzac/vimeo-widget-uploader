import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 900, height: 900 },
  { name: "mobile", width: 390, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`gated vimeo form renders on ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");

    const root = page.locator("#gatedVimeoForm .gvf");
    await expect(root).toHaveCount(1);
    await root.scrollIntoViewIfNeeded();

    await expect(root.locator(".gvf__preview-btn")).toHaveText("Watch preview");
    await expect(root.locator(".gvf__overlay-copy")).toHaveText(
      "Complete form to watch full video."
    );

    await expect(root.getByLabel("Work email")).toBeVisible();
    await expect(root.getByLabel("First name")).toHaveCount(0);

    await root.screenshot({ path: `test-results/gvf-${vp.name}-step1.png` });
  });
}

test("two-step form expands, validates, then ungates", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const root = page.locator("#gatedVimeoForm .gvf");
  await root.scrollIntoViewIfNeeded();

  await root.locator(".gvf__continue").click();
  await expect(root.getByLabel("Work email")).toBeVisible();
  await expect(root.locator(".gvf__row--error")).toHaveCount(1);

  await root.getByLabel("Work email").fill("jane@gmail.com");
  await root.locator(".gvf__continue").click();
  await expect(root.locator(".gvf__row--error")).toHaveCount(1);

  await root.getByLabel("Work email").fill("jane@meetelise.com");
  await root.locator(".gvf__continue").click();

  await expect(root.getByLabel("First name")).toBeVisible();
  await expect(root.getByLabel("Last name")).toBeVisible();
  await expect(root.getByLabel("Company")).toBeVisible();
  await expect(root.getByLabel("Country/Region")).toBeVisible();

  await root.screenshot({ path: "test-results/gvf-desktop-step2.png" });

  await root.locator(".gvf__continue").click();
  await expect(root.locator(".gvf__row--error")).toHaveCount(3);

  await root.getByLabel("First name").fill("Jane");
  await root.getByLabel("Last name").fill("Diaz");
  await root.getByLabel("Company").fill("Awesome Company");
  await root.locator(".gvf__continue").click();

  await expect(root.locator(".gvf__form")).toHaveCount(0);
  await expect(root.locator(".gvf__overlay")).toHaveCount(0);
  await expect(root).toHaveClass(/gvf--unlocked/);
});
