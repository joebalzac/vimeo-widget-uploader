import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 900, height: 900 },
  { name: "mobile", width: 390, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`feature card grid renders on ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");

    // Exactly one instance on the page.
    await expect(page.locator(".fcg")).toHaveCount(1);

    const grid = page.locator("#featureCardGrid .fcg");
    await expect(grid.locator(".fcg__card")).toHaveCount(3);
    await expect(grid.locator(".fcg__title").first()).toHaveText(
      "Smarter Workforce"
    );

    // The component must not paint a background anywhere in its tree.
    const backgrounds = await grid.evaluate((root) =>
      [root, ...Array.from(root.querySelectorAll("*"))].map((el) => {
        const s = getComputedStyle(el);
        return `${s.backgroundColor}|${s.backgroundImage}`;
      })
    );
    expect(
      backgrounds.every((b) => b === "rgba(0, 0, 0, 0)|none")
    ).toBeTruthy();

    // Each card image is loaded, not broken. Images are lazy, so bring the
    // grid into view first.
    await grid.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        grid
          .locator(".fcg__img")
          .evaluateAll((imgs) =>
            imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0)
          )
      )
      .toBe(true);

    const cardBoxes = await grid
      .locator(".fcg__card")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));

    if (vp.name === "desktop") {
      // Three equal columns on one row.
      expect(cardBoxes[0].top).toBeCloseTo(cardBoxes[2].top, 0);
      expect(cardBoxes[0].width).toBeCloseTo(cardBoxes[1].width, 0);
      const mediaHeight = await grid
        .locator(".fcg__media")
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.round(mediaHeight)).toBe(286);
    }

    if (vp.name === "mobile") {
      // Stacked single column.
      expect(cardBoxes[1].top).toBeGreaterThan(cardBoxes[0].bottom - 2);
      expect(cardBoxes[0].width).toBeCloseTo(cardBoxes[1].width, 0);
      const mediaHeight = await grid
        .locator(".fcg__media")
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.round(mediaHeight)).toBe(226);
    }

    await grid.screenshot({ path: `test-results/fcg-${vp.name}.png` });
  });
}
