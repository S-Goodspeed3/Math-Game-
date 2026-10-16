import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1180, height: 820 },
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(8000);
  await page.goto("http://localhost:4173/Math-Game-/");
  await page.getByRole("heading", { name: /LAST WEEK/ }).waitFor();
  await page.locator("canvas").waitFor();
  await page.screenshot({ path: "/tmp/math-game-menu.png" });
  await page
    .getByRole("button", { name: "Math settings", exact: true })
    .click();
  for (const box of await page.locator("input").all()) await box.uncheck();
  await page.getByRole("button", { name: "Save & return" }).click();
  assert.match(
    await page.locator("#setting-error").innerText(),
    /at least one/,
  );
  await page.locator('input[value="multiply"]').check();
  await page.getByRole("button", { name: "Save & return" }).click();
  await page.getByRole("button", { name: "Start the showdown" }).click();
  await page.screenshot({ path: "/tmp/math-game-battle.png" });
  await page.locator('[data-action="hero-2"]').click();
  await page.getByRole("button", { name: "✧ Spell", exact: true }).click();
  await page.locator('[data-action="level-3"]').click();
  let expression = await page.locator(".question h2").innerText();
  assert.match(expression, /×/);
  const answer = Function(`return ${expression.replaceAll("×", "*")}`)();
  for (const b of await page.locator(".answers button").all()) {
    if (Number(await b.innerText()) !== answer) {
      await b.click();
      break;
    }
  }
  await page.getByText("Let’s work through it together.").waitFor();
  await page.screenshot({ path: "/tmp/math-game-help.png" });
  await page.getByRole("button", { name: "Try this question again" }).click();
  await page.getByRole("button", { name: String(answer), exact: true }).click();
  await page.waitForTimeout(750);
  let actions = 0;
  while (!(await page.locator(".result").count()) && actions < 80) {
    await page.getByRole("button", { name: "✦ Attack", exact: true }).click();
    await page.waitForTimeout(720);
    actions++;
  }
  assert.match(await page.locator(".result h1").innerText(), /CLASS/);
  await page.screenshot({ path: "/tmp/math-game-victory.png" });
  await page.getByRole("button", { name: "Play again" }).click();
  for (let i = 0; i < 180 && !(await page.locator(".result").count()); i++) {
    await page.getByRole("button", { name: "◇ Defend", exact: true }).click();
    await page.waitForTimeout(680);
  }
  assert.match(await page.locator(".result h1").innerText(), /WE GO/);
  await page.getByRole("button", { name: "Play again" }).click();
  await page.getByRole("button", { name: "✧ Spell", exact: true }).click();
  await page.locator('[data-action="level-1"]').click();
  await page.locator(".answers button").first().click();
  if (await page.getByRole("button", { name: "Cast with help" }).count())
    await page.getByRole("button", { name: "Cast with help" }).click();
  await page.waitForTimeout(750);
  assert.deepEqual(errors, []);
  console.log(
    "Browser passed: startup, settings validation, selected curriculum, hero selection, wrong answer, worked explanation, retry, assisted spell, attacks, enemy turns, victory, defeat, restart.",
  );
} finally {
  await browser.close();
}
