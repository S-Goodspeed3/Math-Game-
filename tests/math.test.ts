import { test } from "node:test";
import assert from "node:assert/strict";
import { skills, generate, verify, cost, type Level } from "../src/math";
import { damage, spellPower, createParty } from "../src/combat";
test("all skills and levels generate unique, finite, verifiable options across 1800 samples", () => {
  for (const skill of skills)
    for (const level of [1, 2, 3] as Level[])
      for (let i = 0; i < 100; i++) {
        const q = generate(skill.id, level);
        assert.equal(q.skill, skill.id);
        assert.equal(q.level, level);
        assert.equal(new Set(q.choices).size, 4);
        assert.ok(q.choices.includes(q.answer));
        assert.ok(q.choices.every(Number.isFinite));
        assert.ok(q.steps.length);
        assert.ok(verify(q, q.answer));
        assert.ok(!verify(q, q.answer + 1));
        assert.ok(!verify(q, NaN));
        if (["add", "subtract", "multiply", "divide"].includes(skill.id)) {
          const expression = q.prompt
            .replaceAll("×", "*")
            .replaceAll("÷", "/")
            .replaceAll("−", "-");
          assert.equal(Function(`return (${expression})`)(), q.answer);
        }
        if (skill.id === "integers") {
          const values = q.prompt.match(/-?\d+/g)!.map(Number);
          assert.equal(Math.max(...values), q.answer);
        }
        if (skill.id === "ratio") {
          const values = q.prompt.match(/\d+/g)!.map(Number);
          assert.equal((values[1] / values[0]) * values[2], q.answer);
        }
      }
});
test("difficulty stays within selected skill and increases cost and reward", () => {
  for (const s of skills) {
    for (const l of [1, 2, 3] as Level[])
      assert.equal(generate(s.id, l).skill, s.id);
  }
  assert.ok(cost(1) < cost(2) && cost(2) < cost(3));
  assert.ok(spellPower(1, false) < spellPower(2, false));
  assert.ok(spellPower(2, false) < spellPower(3, false));
  assert.ok(
    spellPower(3, true) > 0 && spellPower(3, true) < spellPower(3, false),
  );
});
test("defense and shields reduce damage, fresh parties do not share state", () => {
  assert.ok(damage(30, true) < damage(30));
  assert.ok(damage(30, false, true) < damage(30));
  const p = createParty();
  p[0].hp = 0;
  assert.equal(createParty()[0].hp, 100);
});
