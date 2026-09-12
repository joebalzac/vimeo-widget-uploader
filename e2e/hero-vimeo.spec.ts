import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 900, height: 900 },
  { name: "mobile", width: 390, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`hero vimeo renders on ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");

    const hero = page.locator("#heroSection.hv");
    await expect(hero).toHaveCount(1);
    await expect(hero.getByRole("heading", { name: "Elise Beyond 2026" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Get Access to Beyond 2027" })).toBeVisible();
    await expect(hero.getByRole("button", { name: "Play video" })).toBeVisible();

    const play = hero.getByRole("button", { name: "Play video" });
    const playBox = await play.boundingBox();
    expect(playBox?.width).toBe(64);
    expect(playBox?.height).toBe(64);

    await hero.screenshot({ path: `test-results/hv-${vp.name}.png` });
  });
}

test("play button opens and closes the lightbox", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const hero = page.locator("#heroSection.hv");
  await hero.getByRole("button", { name: "Play video" }).click();

  const dialog = page.getByRole("dialog", { name: "Video" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("iframe")).toBeVisible();

  await dialog.getByRole("button", { name: "Close video" }).click();
  await expect(dialog).toHaveCount(0);
});
