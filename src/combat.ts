export interface Unit {
  name: string;
  role: string;
  symbol: string;
  hp: number;
  max: number;
  mp: number;
  guard: boolean;
  color: number;
}
export const createParty = (): Unit[] => [
  {
    name: "Sunny",
    role: "Addition · Support",
    symbol: "+",
    hp: 100,
    max: 100,
    mp: 18,
    guard: false,
    color: 0xffc857,
  },
  {
    name: "Mina",
    role: "Subtraction · Debuffer",
    symbol: "−",
    hp: 100,
    max: 100,
    mp: 18,
    guard: false,
    color: 0xb69aff,
  },
  {
    name: "Dex",
    role: "Multiplication · Striker",
    symbol: "×",
    hp: 100,
    max: 100,
    mp: 18,
    guard: false,
    color: 0xff7c76,
  },
  {
    name: "Quinn",
    role: "Division · Tactician",
    symbol: "÷",
    hp: 100,
    max: 100,
    mp: 18,
    guard: false,
    color: 0x53d8cf,
  },
];
export function damage(raw: number, guard = false, shield = false) {
  return Math.max(
    1,
    Math.round(raw * (guard ? 0.45 : 1) * (shield ? 0.65 : 1)),
  );
}
export const spellPower = (level: number, assisted: boolean) =>
  Math.round((18 + level * 16) * (assisted ? 0.65 : 1));
