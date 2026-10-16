import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:4173/Math-Game-/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.getByRole("button", { name: "Start the showdown" }).click();
  await page.screenshot({ path: "/tmp/math-game-phone.png" });
  for (const action of ["attack", "spell", "defend"]) {
    const rect = await page.locator(`[data-action="${action}"]`).boundingBox();
    assert.ok(
      rect &&
        rect.x >= 0 &&
        rect.x + rect.width <= 844 &&
        rect.y + rect.height <= 390,
      action + " fits landscape iPhone",
    );
    assert.ok(rect.height >= 44);
  }
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Start the showdown" }).click();
  await page.getByRole("button", { name: "✦ Attack", exact: true }).click();
  await page.waitForTimeout(750);
  assert.match(await page.locator(".enemy small").innerText(), /316/);
  assert.deepEqual(errors, []);
  console.log(
    "Passed: 844×390 touch layout, 44px controls, production service worker installation, offline reload and playable attack.",
  );
} finally {
  await browser.close();
}
