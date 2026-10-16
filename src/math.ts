/** Proposed mappings; never present these as verified curriculum alignment. */
export const standardsSource = {
  url: "https://www.isbe.net/Documents/math-standards.pdf",
  verified: false,
  note: "Official PDF returned HTTP 403 during development; manual verification is required.",
} as const;
export type Level = 1 | 2 | 3;
export type SkillId =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "integers"
  | "ratio";
export const skills: {
  id: SkillId;
  name: string;
  grade: number;
  prerequisites: SkillId[];
  standard: string;
  variations: string[];
}[] = [
  {
    id: "add",
    name: "Addition",
    grade: 2,
    prerequisites: [],
    standard: "2.NBT.5",
    variations: ["Within 20", "Two-digit sums", "Three addends"],
  },
  {
    id: "subtract",
    name: "Subtraction",
    grade: 2,
    prerequisites: ["add"],
    standard: "2.NBT.5",
    variations: ["Within 20", "Two-digit differences", "Two subtractions"],
  },
  {
    id: "multiply",
    name: "Multiplication",
    grade: 4,
    prerequisites: ["add"],
    standard: "4.NBT.5",
    variations: [
      "Single-digit factors",
      "Two-digit × one-digit",
      "Three factors",
    ],
  },
  {
    id: "divide",
    name: "Division",
    grade: 4,
    prerequisites: ["multiply"],
    standard: "4.NBT.6",
    variations: ["Basic facts", "Larger dividends", "Two divisions"],
  },
  {
    id: "integers",
    name: "Signed number comparisons",
    grade: 6,
    prerequisites: [],
    standard: "6.NS.7a",
    variations: [
      "Compare near zero",
      "Compare larger values",
      "Compare three values",
    ],
  },
  {
    id: "ratio",
    name: "Ratios & unit rates",
    grade: 6,
    prerequisites: ["divide"],
    standard: "6.RP.2",
    variations: ["Small unit rates", "Larger unit rates", "Scale a unit rate"],
  },
];
export interface Question {
  skill: SkillId;
  level: Level;
  prompt: string;
  answer: number;
  choices: number[];
  steps: string[];
  visual: string;
}
export function generate(
  skill: SkillId,
  level: Level,
  random = Math.random,
): Question {
  const n = (lo: number, hi: number) =>
    lo + Math.floor(random() * (hi - lo + 1));
  let a = n(2, 9),
    b = n(2, 9),
    c = n(2, 5),
    answer = 0,
    prompt = "",
    steps: string[] = [],
    visual = "";
  if (skill === "add") {
    if (level > 1) a = n(20, 80);
    answer = a + b + (level === 3 ? c : 0);
    prompt = `${a} + ${b}${level === 3 ? ` + ${c}` : ""}`;
    steps = [
      `${a} + ${b} = ${a + b}`,
      ...(level === 3 ? [`${a + b} + ${c} = ${answer}`] : []),
    ];
  }
  if (skill === "subtract") {
    a = level === 1 ? n(10, 19) : n(40, 90);
    answer = a - b - (level === 3 ? c : 0);
    prompt = `${a} − ${b}${level === 3 ? ` − ${c}` : ""}`;
    steps = [
      `${a} − ${b} = ${a - b}`,
      ...(level === 3 ? [`${a - b} − ${c} = ${answer}`] : []),
    ];
  }
  if (skill === "multiply") {
    if (level === 2) a = n(12, 29);
    answer = a * b * (level === 3 ? c : 1);
    prompt = `${a} × ${b}${level === 3 ? ` × ${c}` : ""}`;
    steps = [
      `${a} groups of ${b} = ${a * b}`,
      ...(level === 3 ? [`${a * b} × ${c} = ${answer}`] : []),
    ];
    if (level === 1)
      visual = Array.from({ length: a }, () => "● ".repeat(b)).join("\n");
  }
  if (skill === "divide") {
    const q = level === 1 ? n(2, 9) : n(10, 20);
    a = q * b * (level === 3 ? c : 1);
    answer = q;
    prompt = `${a} ÷ ${b}${level === 3 ? ` ÷ ${c}` : ""}`;
    steps = [
      `${a} ÷ ${b} = ${a / b}`,
      ...(level === 3 ? [`${a / b} ÷ ${c} = ${q}`] : []),
    ];
  }
  if (skill === "integers") {
    a = -n(1, level === 1 ? 9 : 50);
    b = n(-9, 9);
    c = -n(10, 60);
    const values = level === 3 ? [a, b, c] : [a, b];
    answer = Math.max(...values);
    prompt = `Which is greatest: ${values.join(", ")}?`;
    steps = [
      `On a number line, values increase to the right.`,
      `${values
        .slice()
        .sort((x, y) => x - y)
        .join(" < ")}; ${answer} is greatest.`,
    ];
    visual = "← negative     0     positive →";
  }
  if (skill === "ratio") {
    b = n(2, level === 1 ? 5 : 12);
    a = b * n(2, level === 1 ? 6 : 15);
    answer = (a / b) * (level === 3 ? c : 1);
    prompt = `${b} notebooks cost $${a}. What ${level === 3 ? `do ${c} notebooks` : "does 1 notebook"} cost?`;
    steps = [
      `One notebook costs ${a} ÷ ${b} = $${a / b}.`,
      ...(level === 3 ? [`${c} × $${a / b} = $${answer}.`] : []),
    ];
  }
  // Distractors model operation confusion, reversed comparisons, and off-by-one facts.
  const misconception =
    skill === "multiply"
      ? a + b
      : skill === "divide"
        ? a - b
        : skill === "add"
          ? a - b
          : skill === "subtract"
            ? a + b
            : skill === "integers"
              ? Math.min(a, b, ...(level === 3 ? [c] : []))
              : a * b;
  const wrong = new Set<number>();
  for (const value of [misconception, answer + 1, answer - 1, answer + 2]) {
    if (value !== answer) wrong.add(value);
    if (wrong.size === 3) break;
  }
  const choices = [answer, ...wrong];
  // Fisher–Yates avoids engine-dependent randomized comparator behavior.
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { skill, level, prompt, answer, choices, steps, visual };
}
export const verify = (q: Question, answer: number) =>
  Number.isFinite(answer) && answer === q.answer;
export interface Attempt {
  skill: SkillId;
  level: Level;
  correct: boolean;
  assisted: boolean;
  at: number;
}
export const cost = (level: Level) => level * 3;
