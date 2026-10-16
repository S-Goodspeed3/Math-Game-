import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1180, height: 820 },
  });
  page.setDefaultTimeout(8000);
  await page.goto("http://localhost:4173/Math-Game-/");
  await page
    .getByRole("button", { name: "Math settings", exact: true })
    .click();
  for (const box of await page.locator("input").all()) await box.uncheck();
  await page.locator('input[value="multiply"]').check();
  await page.getByRole("button", { name: "Save & return" }).click();
  await page.getByRole("button", { name: "Start the showdown" }).click();
  const pause = () => page.waitForTimeout(720);
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-action="defend"]').click();
    await pause();
  }
  assert.match(
    await page.locator('[data-action="hero-0"]').innerText(),
    /Confidence 84/,
  );
  async function cast(hero, level, help = false) {
    await page.locator(`[data-action="hero-${hero}"]`).click();
    await page.locator('[data-action="spell"]').click();
    await page.locator(`[data-action="level-${level}"]`).click();
    const expression = await page.locator(".question h2").innerText();
    const answer = Function(`return ${expression.replaceAll("×", "*")}`)();
    if (help) {
      const wrong = page
        .locator(".answers button")
        .filter({ hasText: new RegExp(`^(?!${answer}$).+$`) })
        .first();
      await wrong.click();
      await page.getByRole("button", { name: "Cast with help" }).click();
    } else
      await page
        .getByRole("button", { name: String(answer), exact: true })
        .click();
    await pause();
  }
  await cast(0, 1);
  assert.match(
    await page.locator('[data-action="hero-0"]').innerText(),
    /Confidence 100/,
  );
  await cast(1, 2, true);
  assert.match(await page.locator(".enemy small").innerText(), /Weakened/);
  await cast(2, 3);
  await cast(3, 1);
  assert.match(await page.locator(".enemy small").innerText(), /Shielded/);
  assert.match(
    await page.locator('[data-action="hero-0"]').innerText(),
    /MP 21/,
  );
  await cast(3, 1);
  assert.doesNotMatch(
    await page.locator(".enemy small").innerText(),
    /Shielded/,
  );
  console.log(
    "Passed all four role spells, levels 1/2/3, healing after damage, assisted debuff, MP spending/restoration, and shield breaking.",
  );
} finally {
  await browser.close();
}
