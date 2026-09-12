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
    await expect(cards.first()).not.toHaveAttribute("data-scg-locked");

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

      const layout = await grid.evaluate((el) => {
        const cs = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        const padL = parseFloat(cs.paddingLeft);
        const padR = parseFloat(cs.paddingRight);
        return {
          contentLeft: box.left + padL,
          contentWidth: box.width - padL - padR,
          wrapRight: box.right,
          viewWidth: window.innerWidth,
        };
      });
      expect(Math.abs(cardBoxes[0].left - layout.contentLeft)).toBeLessThan(2);
      expect(Math.abs(cardBoxes[0].width - layout.contentWidth)).toBeLessThan(2);
      expect(cardBoxes[1].left).toBeLessThan(layout.wrapRight);
      expect(cardBoxes[1].right).toBeGreaterThan(layout.viewWidth - 8);

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

test("gated session card opens HubSpot modal once per session", async ({
  page,
}) => {
  await page.route("https://api.hsforms.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ inlineMessage: "Thanks" }),
    })
  );

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const locked = page.locator("#sessionCardGrid [data-scg-locked='true']");
  await locked.scrollIntoViewIfNeeded();
  await expect(locked).toHaveCount(1);
  await expect(locked).toHaveAttribute("aria-haspopup", "dialog");
  await expect(locked).not.toHaveAttribute("href");
  const cards = page.locator("#sessionCardGrid .scg");
  const cardCount = await cards.count();
  for (let i = 0; i < cardCount; i++) {
    const card = cards.nth(i);
    const isLocked = (await card.getAttribute("data-scg-locked")) === "true";
    await expect(card.locator(".scg__lock")).toHaveCount(isLocked ? 1 : 0);
  }
  await expect(locked.locator(".scg__lock")).toBeVisible();
  await expect(locked.locator(".scg__lock-label")).toHaveText("Exclusive");
  await expect(page.locator("#sessionCardGrid .scg:not([data-scg-locked]) .scg__lock")).toHaveCount(0);

  await locked.click();
  const modal = page.getByTestId("session-gated-modal");
  await expect(modal).toBeVisible();
  await expect(
    modal.getByRole("heading", { name: "Thank you for your interest." })
  ).toBeVisible();
  await expect(
    modal.getByText(/Enter your details below/)
  ).toBeVisible();
  await expect(
    modal.getByText(/If approved, you/)
  ).toBeVisible();

  await modal.getByRole("button", { name: "Submit" }).click();
  await expect(modal.getByText("First name is required.")).toBeVisible();
  await expect(modal.getByText("Email is required.")).toBeVisible();

  await modal.getByLabel("First name").fill("Jane");
  await modal.getByLabel("Last name").fill("Smith");
  await modal.getByLabel("Phone number").fill("555-0100");
  await modal.getByLabel("Email").fill("jane@meetelise.com");
  await modal.getByLabel("Job title").fill("PM");
  await modal.getByLabel("Company name").fill("EliseAI");
  await modal.getByRole("button", { name: "Submit" }).click();

  await expect(modal.getByText("Thank you for your submission.")).toBeVisible();
  await expect(modal.getByText(/all set/)).toBeVisible();
  await expect(modal.getByText(/Check your inbox/)).toBeVisible();
  await expect(
    modal.getByRole("link", { name: "marketing@eliseai.com" })
  ).toBeVisible();

  await modal.getByRole("button", { name: "Done" }).click();
  await expect(modal).toHaveCount(0);

  const stillLocked = page.locator("#sessionCardGrid [data-scg-locked='true']");
  await expect(stillLocked).toHaveCount(1);
  await stillLocked.click();
  const again = page.getByTestId("session-gated-modal");
  await expect(again).toBeVisible();
  await expect(again.getByText(/already received your request/)).toBeVisible();
  await expect(again.getByText(/Check your inbox for the recording link/)).toBeVisible();
});

test("gated session modal blocks competitor and personal emails", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const locked = page.locator("#sessionCardGrid [data-scg-locked='true']");
  await locked.scrollIntoViewIfNeeded();
  await locked.click();

  const modal = page.getByTestId("session-gated-modal");
  await expect(modal).toBeVisible();

  await modal.getByLabel("First name").fill("Jane");
  await modal.getByLabel("Last name").fill("Smith");
  await modal.getByLabel("Phone number").fill("555-0100");
  await modal.getByLabel("Job title").fill("PM");
  await modal.getByLabel("Company name").fill("EliseAI");

  await modal.getByLabel("Email").fill("rep@yardi.com");
  await modal.getByRole("button", { name: "Submit" }).click();
  await expect(
    modal.getByText("Please use your work email address.")
  ).toBeVisible();

  await modal.getByLabel("Email").fill("vp@verbaflo.ai");
  await modal.getByRole("button", { name: "Submit" }).click();
  await expect(
    modal.getByText("Please use your work email address.")
  ).toBeVisible();

  await modal.getByLabel("Email").fill("not-an-email");
  await modal.getByRole("button", { name: "Submit" }).click();
  await expect(modal.getByText("Please enter a valid email.")).toBeVisible();
});

test("gated session modal returns on click if the form was not submitted", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const locked = page.locator("#sessionCardGrid [data-scg-locked='true']");
  await locked.scrollIntoViewIfNeeded();
  await locked.click();

  const modal = page.getByTestId("session-gated-modal");
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Close" }).click();
  await expect(modal).toHaveCount(0);

  await locked.click();
  await expect(page.getByTestId("session-gated-modal")).toBeVisible();
});

test("light mode session card CTA darkens on hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const card = page.locator("#sessionCardGrid .scg").first();
  await card.scrollIntoViewIfNeeded();

  await expect(card.locator(".scg__cta")).toHaveCSS(
    "color",
    "rgb(122, 121, 119)"
  );

  const overlay = card.locator(".scg__overlay");
  await expect(overlay).toHaveCSS("opacity", "0");
  await expect(overlay.locator(".scg__watch-pill")).toHaveText("Watch Video");

  await card.hover();
  await expect(card.locator(".scg__cta")).toHaveCSS(
    "color",
    "rgb(14, 13, 12)"
  );
  await expect(overlay).toHaveCSS("opacity", "1");
});

test("dark mode session card uses light text colors", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const grid = page.locator("#sessionCardGridDark");
  await grid.scrollIntoViewIfNeeded();

  const card = grid.locator(".scg--dark").first();
  await expect(card).toHaveCount(1);

  await expect(card.locator(".scg__title")).toHaveCSS(
    "color",
    "rgb(250, 250, 251)"
  );
  await expect(card.locator(".scg__details")).toHaveCSS(
    "color",
    "rgb(221, 220, 218)"
  );
  await expect(card.locator(".scg__cta")).toHaveCSS(
    "color",
    "rgba(255, 255, 255, 0.8)"
  );

  await card.hover();
  await expect(card.locator(".scg__cta")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)"
  );

  await grid.screenshot({ path: "test-results/scg-dark.png" });
});

