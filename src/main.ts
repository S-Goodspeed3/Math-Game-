import Phaser from "phaser";
import { Hallway } from "./scene";
import { createParty, damage, spellPower } from "./combat";
import {
  skills,
  generate,
  verify,
  cost,
  type SkillId,
  type Level,
  type Question,
  type Attempt,
} from "./math";
import "./style.css";
const scene = new Hallway();
new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#accbd2",
  scene: [scene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true },
});
const ui = document.querySelector<HTMLElement>("#ui")!;
function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
let enabled: SkillId[] = load("curriculum", [
  "add",
  "subtract",
  "multiply",
  "divide",
]);
enabled = enabled.filter((id) => skills.some((s) => s.id === id));
if (!enabled.length) enabled = ["multiply"];
let attempts: Attempt[] = load("practice", []),
  party = createParty(),
  enemy = 340,
  turn = 0,
  round = 1,
  busy = false,
  shield = false,
  weaken = 0,
  muted = false;
let acted = new Set<number>(),
  pending: ReturnType<typeof setTimeout> | undefined;
function later(fn: () => void, ms: number) {
  pending = setTimeout(fn, ms);
}
let audio: AudioContext | undefined;
function sound() {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.connect(g);
    g.connect(audio.destination);
    o.frequency.setValueAtTime(520, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(180, audio.currentTime + 0.15);
    g.gain.setValueAtTime(0.06, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
    o.start();
    o.stop(audio.currentTime + 0.2);
  } catch {}
}
const button = (label: string, action: string, extra = "") =>
  `<button data-action="${action}" ${extra}>${label}</button>`;
function shell(body: string) {
  ui.innerHTML = `<header><a href="#" data-action="home">LW<span> / </span>OS</a><span class="chapter">MONDAY · THE HALLWAY HUSTLE</span>${button(muted ? "♫ Sound off" : "♫ Sound on", "mute")}</header>${body}<div class="rotate">Best played sideways ↻</div>`;
}
function home() {
  clearTimeout(pending);
  busy = false;
  shell(
    `<section class="menu"><div class="eyebrow">A MATH-POWERED MISADVENTURE</div><h1>LAST WEEK<br><span>OF SCHOOL</span><i>!</i></h1><p>Four friends. One hallway.<br>A little math. A whole lot of swagger.</p><div class="row">${button("Start the showdown →", "start", 'class="primary"')}${button("Math settings", "settings")}</div><small>No timer. No pressure. Just one more turn.</small></section><div class="sticker">SUMMER<br>IS SO CLOSE ☀</div>`,
  );
}
function settings() {
  shell(
    `<section class="panel settings"><div class="eyebrow">LEARN YOUR WAY</div><h2>Pick your math mix</h2><p>Every spell level stays inside your selected skills. Mix any concepts you like.</p>${[
      2, 6,
    ]
      .map(
        (grade) =>
          `<h3>${grade === 2 ? "Elementary foundations" : "Sixth-grade mathematics"}</h3><div class="skill-grid">${skills
            .filter((s) => (grade === 2 ? s.grade < 6 : s.grade === 6))
            .map(
              (s) =>
                `<label><input type="checkbox" value="${s.id}" ${enabled.includes(s.id) ? "checked" : ""}> ${s.name}<small>${s.variations.join(" → ")}</small></label>`,
            )
            .join("")}</div>`,
      )
      .join(
        "",
      )}<p class="future">Coming later: fractions, decimals, percentages, geometry, algebra & statistics. Seventh and eighth grade groups are not yet available.</p><small>Standards mapping: ${skills.map((s) => s.standard).join(", ")}. Curriculum is independent of story progress.</small><div class="row">${button("Save & return", "save-settings", 'class="primary"')}</div><p id="setting-error" role="status"></p></section>`,
  );
}
function start() {
  scene.reset();
  clearTimeout(pending);
  acted.clear();
  party = createParty();
  enemy = 340;
  turn = 0;
  round = 1;
  shield = false;
  weaken = 0;
  busy = false;
  battle("The Bell-Ringer blocks the exit. Your move!");
}
function battle(message = "Choose your move.") {
  const u = party[turn];
  shell(
    `<section class="battle"><div class="encounter"><span class="eyebrow">ENCOUNTER 01 / THE LAST BELL</span><h2>Hallway showdown</h2></div><div class="enemy"><strong>THE BELL-RINGER</strong><div class="meter"><i style="width:${(enemy / 340) * 100}%"></i></div><small>Swagger ${enemy} / 340 ${shield ? "· Shielded" : ""} ${weaken ? "· Weakened" : ""}</small><p>Next: ${round % 3 === 0 ? "Desk-rattle · everyone" : round % 3 === 2 ? "Brace · shield up" : "Paper-ball · one student"}</p></div><div class="combat-bottom"><div class="party">${party.map((p, i) => `<button class="card ${i === turn ? "active" : ""} ${p.hp <= 0 ? "out" : ""}" data-action="hero-${i}" ${busy || p.hp === 0 || acted.has(i) ? "disabled" : ""}><b>${p.symbol} ${p.name}</b><small>${p.role}</small><div class="meter"><i style="width:${p.hp}%"></i></div><span>Confidence ${p.hp}/${p.max} · MP ${p.mp}</span>${p.guard ? "<small>Guarding</small>" : ""}</button>`).join("")}</div><div class="command"><div><span class="eyebrow">ROUND ${round} · ${u.name.toUpperCase()}'S TURN</span><p role="status" aria-live="polite">${message}</p></div><div class="row">${button("✦ Attack", "attack", busy ? "disabled" : "")}${button("✧ Spell", "spell", busy ? "disabled" : "")}${button("◇ Defend", "defend", busy ? "disabled" : "")}</div></div></div></section>`,
  );
}
function levels() {
  battle();
  ui.insertAdjacentHTML(
    "beforeend",
    `<div class="overlay"><section class="panel"><div class="eyebrow">${party[turn].role}</div><h2>Make a little magic</h2><p>${["Restore the whole party’s Confidence.", "Lower attack strength and deal damage.", "Unleash a powerful multi-hit combo.", "Break shields, deal damage, restore party MP."][turn]}</p><p>Questions use your selected math mix, regardless of hero.</p><div class="levels">${([1, 2, 3] as Level[]).map((l) => button(`<b>Level ${l}</b><small>${["Easy", "Medium", "Hard"][l - 1]} · ${cost(l)} MP</small>`, "level-" + l, party[turn].mp < cost(l) ? "disabled" : "")).join("")}</div>${button("Back", "back")}</section></div>`,
  );
}
let question: Question,
  level: Level,
  assisted = false;
function ask(l: Level) {
  level = l;
  assisted = false;
  question = generate(enabled[Math.floor(Math.random() * enabled.length)], l);
  showQuestion();
}
function showQuestion(feedback = false) {
  battle();
  ui.insertAdjacentHTML(
    "beforeend",
    `<div class="overlay"><section class="panel question"><div class="eyebrow">LEVEL ${level} · ${skills.find((s) => s.id === question.skill)!.name} · NO TIMER</div><h2>${question.prompt}</h2>${feedback ? `<div class="feedback" role="status"><b>Let’s work through it together.</b>${question.steps.map((s) => `<p>${s}</p>`).join("")}${question.visual ? `<pre>${question.visual}</pre>` : ""}<p>The answer is <strong>${question.answer}</strong>. Your spell still works with a little help.</p></div><div class="row">${button("Try this question again", "retry-question")}${button("Cast with help →", "assist", 'class="primary"')}</div>` : `<div class="answers">${question.choices.map((v) => button(String(v), "answer-" + v)).join("")}</div><p>Take your time. Your team has your back.</p>${button("Back to spell levels", "spell")}`}</section></div>`,
  );
}
function cast() {
  party[turn].mp -= cost(level);
  const power = spellPower(level, assisted);
  sound();
  if (turn === 0) {
    party.forEach((p, i) => {
      if (p.hp > 0) {
        p.hp = Math.min(p.max, p.hp + power);
        scene.effect(i, "+" + power, true);
      }
    });
  } else {
    if (turn === 3) shield = false;
    const hit = damage(turn === 2 ? power * 1.5 : power, false, shield);
    enemy = Math.max(0, enemy - hit);
    scene.effect(4, "−" + hit);
    scene.effect(turn, ["", "UNFAZED!", "COMBO!", "SPLIT!"][turn], true);
    if (turn === 1) weaken = 3;
    if (turn === 3) party.forEach((p) => (p.mp = Math.min(24, p.mp + 2)));
  }
  advance(
    assisted
      ? "A little help, a lot of magic."
      : "Beautiful work. Spell activated!",
  );
}
function advance(message: string) {
  acted.add(turn);
  busy = true;
  battle(message);
  if (enemy === 0) {
    later(() => result(true), 750);
    return;
  }
  later(() => {
    turn = party.findIndex((p, i) => p.hp > 0 && !acted.has(i));
    if (turn >= 0) {
      party[turn].guard = false;
      busy = false;
      battle();
    } else enemyTurn();
  }, 650);
}
function enemyTurn() {
  let msg = "";
  if (round % 3 === 2) {
    shield = true;
    msg = "The Bell-Ringer hides behind a backpack. Shield up!";
    scene.effect(4, "BRACE", true);
  } else {
    shield = false;
    const live = party.map((p, i) => (p.hp > 0 ? i : -1)).filter((i) => i >= 0);
    const targets = round % 3 === 0 ? live : [live[(round - 1) % live.length]];
    targets.forEach((i) => {
      const hit = damage(
        (round % 3 === 0 ? 24 : 35) * (weaken > 0 ? 0.6 : 1),
        party[i].guard,
      );
      party[i].hp = Math.max(0, party[i].hp - hit);
      scene.effect(i, "−" + hit);
    });
    sound();
    msg =
      round % 3 === 0
        ? "Desk-rattle! The whole team takes a confidence check."
        : "A paper ball flies across the hallway!";
  }
  weaken = Math.max(0, weaken - 1);
  if (party.every((p) => p.hp === 0)) {
    result(false);
    return;
  }
  round++;
  acted.clear();
  turn = party.findIndex((p) => p.hp > 0);
  party[turn].guard = false;
  busy = false;
  battle(msg);
}
function result(won: boolean) {
  scene.victory(won);
  busy = false;
  shell(
    `<div class="overlay"><section class="panel result"><div class="eyebrow">${won ? "HALLWAY CLEARED" : "TAKE A BREATHER"}</div><h1>${won ? "CLASS<br>DISMISSED!" : "WE GO<br>AGAIN."}</h1><p>${won ? "The Bell-Ringer remembers an urgent appointment… somewhere else." : "Even great teams need another try. Your math practice still counts."}</p><p>${attempts.length} recorded answers · ${attempts.filter((a) => a.assisted).length} assisted answers</p><div class="row">${button("Play again", "start", 'class="primary"')}${button("Main menu", "home")}</div></section></div>`,
  );
}
ui.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!b || b.hasAttribute("disabled")) return;
  e.preventDefault();
  const a = b.dataset.action!;
  if (a === "mute") {
    muted = !muted;
    b.textContent = muted ? "♫ Sound off" : "♫ Sound on";
    return;
  }
  if (a === "home") {
    home();
    return;
  }
  if (a === "settings") {
    settings();
    return;
  }
  if (a === "save-settings") {
    const selected = Array.from(
      ui.querySelectorAll<HTMLInputElement>("input:checked"),
    ).map((i) => i.value as SkillId);
    if (!selected.length) {
      document.querySelector("#setting-error")!.textContent =
        "Choose at least one skill to power your spells.";
      return;
    }
    enabled = selected;
    save("curriculum", enabled);
    home();
    return;
  }
  if (a === "start") {
    start();
    return;
  }
  if (busy) return;
  if (a.startsWith("hero-")) {
    turn = Number(a.slice(5));
    party[turn].guard = false;
    battle();
    return;
  }
  if (a === "attack") {
    sound();
    const hit = damage(24, false, shield);
    enemy = Math.max(0, enemy - hit);
    scene.effect(turn, "POW!", true);
    scene.effect(4, "−" + hit);
    advance("A reliable hit. No math required.");
  }
  if (a === "defend") {
    party[turn].guard = true;
    party[turn].mp = Math.min(24, party[turn].mp + 4);
    scene.effect(turn, "+4 MP", true);
    advance("Guard up! Incoming damage reduced until the next turn.");
  }
  if (a === "spell") levels();
  if (a === "back") battle();
  if (a.startsWith("level-")) ask(Number(a.slice(6)) as Level);
  if (a === "retry-question") showQuestion();
  if (a === "assist") cast();
  if (a.startsWith("answer-")) {
    const correct = verify(question, Number(a.slice(7)));
    attempts.push({
      skill: question.skill,
      level,
      correct,
      assisted: assisted || !correct,
      at: Date.now(),
    });
    attempts = attempts.slice(-1000);
    save("practice", attempts);
    if (correct) cast();
    else {
      assisted = true;
      showQuestion(true);
    }
  }
});
home();
if ("serviceWorker" in navigator && import.meta.env.PROD)
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(console.warn);
  });
