import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 900, height: 900 },
  { name: "mobile", width: 390, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`session card renders on ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");

    const grid = page.locator("#sessionCardGrid");
    await expect(grid).toHaveCount(1);
    await grid.scrollIntoViewIfNeeded();

    const cards = grid.locator(".scg");
    await expect(cards).toHaveCount(8);
    await expect(cards.first().locator(".scg__title")).toHaveText(
      "Session Title"
    );
    await expect(cards.first().locator(".scg__cta")).toHaveText("View Talk");
    await expect(cards.first()).toHaveAttribute("href", "/talks/session-1");

    const cardBoxes = await cards.evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect().toJSON())
    );

    if (vp.name === "desktop") {
      expect(cardBoxes[0].top).toBeCloseTo(cardBoxes[2].top, 0);
      expect(cardBoxes[0].width).toBeCloseTo(cardBoxes[1].width, 1);
      await expect(grid.locator(".scg-nav")).toBeHidden();
    }

    if (vp.name === "mobile") {
      expect(cardBoxes[0].top).toBeCloseTo(cardBoxes[1].top, 1);
      expect(cardBoxes[1].left).toBeGreaterThan(cardBoxes[0].right - 4);
      const nav = grid.locator(".scg-nav");
      await expect(nav).toBeVisible();
      await expect(nav.locator(".scg-nav__btn").first()).toBeDisabled();
      await expect(nav.locator(".scg-nav__btn").nth(1)).toBeEnabled();

      await nav.locator(".scg-nav__btn").nth(1).click();
      await expect
        .poll(() =>
          grid.locator(".scg-carousel").evaluate((el) => el.scrollLeft)
        )
        .toBeGreaterThan(50);
      await expect(nav.locator(".scg-nav__btn").first()).toBeEnabled();
    }

    await grid.screenshot({ path: `test-results/scg-${vp.name}.png` });
  });
}
