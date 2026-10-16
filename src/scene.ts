import Phaser from "phaser";
import { createParty } from "./combat";
export class Hallway extends Phaser.Scene {
  figures: Phaser.GameObjects.Container[] = [];
  constructor() {
    super("hall");
  }
  create() {
    const g = this.add.graphics();
    g.fillStyle(0xaccbd2);
    g.fillRect(0, 0, 1280, 720);
    g.fillStyle(0xe6e5cd);
    g.fillRect(0, 50, 1280, 310);
    g.fillStyle(0x29374f);
    g.fillRect(0, 355, 1280, 12);
    for (let i = 0; i < 17; i++) {
      const x = i * 78;
      g.fillStyle(i % 2 ? 0x5e9c9d : 0x72afad);
      g.fillRoundedRect(x + 3, 135, 72, 218, 5);
      g.lineStyle(2, 0x346675);
      g.strokeRoundedRect(x + 3, 135, 72, 218, 5);
      g.fillStyle(0x24495c);
      g.fillRect(x + 57, 235, 4, 23);
      for (let j = 0; j < 3; j++) g.fillRect(x + 20, 152 + j * 7, 32, 2);
    }
    g.fillStyle(0xd6c6a7);
    g.fillRect(0, 368, 1280, 352);
    g.lineStyle(2, 0xb4ab94, 0.6);
    for (let y = 400; y < 720; y += 65) g.lineBetween(0, y, 1280, y);
    for (let x = -500; x < 1800; x += 180)
      g.lineBetween(640 + (x - 640) * 0.35, 368, x, 720);
    const text = (
      x: number,
      y: number,
      s: string,
      size: number,
      color: string,
    ) =>
      this.add.text(x, y, s, {
        fontFamily: "Trebuchet MS",
        fontSize: size,
        color,
        fontStyle: "bold",
      });
    text(470, 72, "MONDAY • 3:14 PM", 22, "#3b5563");
    text(440, 108, "ONE WEEK. ZERO CHILL.", 15, "#63767b");
    g.fillStyle(0xffdf83);
    g.fillRoundedRect(925, 66, 190, 65, 4);
    text(941, 78, "BE KIND.", 24, "#413e54");
    text(941, 108, "Even before summer.", 13, "#413e54");
    createParty().forEach((u, i) =>
      this.character(
        140 + i * 110,
        325 + (i % 2) * 58,
        u.color,
        u.symbol,
        false,
      ),
    );
    this.character(994, 336, 0xe29165, "!", true);
    this.add.ellipse(630, 535, 1150, 90, 0xffedbf, 0.12);
  }
  character(
    x: number,
    y: number,
    color: number,
    symbol: string,
    enemy: boolean,
  ) {
    const scale = enemy ? 1.5 : 1;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0x253044, 0.18);
    g.fillEllipse(0, 95, 75, 20);
    g.fillStyle(0x25324a);
    g.fillRoundedRect(-24, 45, 20, 47, 6);
    g.fillRoundedRect(7, 45, 20, 47, 6);
    g.fillStyle(0xfff6dd);
    g.fillRoundedRect(-29, 83, 29, 12, 4);
    g.fillRoundedRect(6, 83, 29, 12, 4);
    g.fillStyle(color);
    g.lineStyle(3, 0x273247);
    g.fillRoundedRect(-34, -7, 68, 65, 14);
    g.strokeRoundedRect(-34, -7, 68, 65, 14);
    g.fillStyle(0xf0b58b);
    g.fillRoundedRect(-47, 5, 14, 42, 7);
    g.fillRoundedRect(33, 5, 14, 42, 7);
    g.fillRoundedRect(-30, -65, 60, 63, 20);
    g.strokeRoundedRect(-30, -65, 60, 63, 20);
    g.fillStyle(0x32334b);
    g.fillRoundedRect(-34, -72, 68, 23, 8);
    g.fillTriangle(-34, -50, -30, -78, 2, -62);
    g.fillStyle(0x263149);
    g.fillCircle(-12, -35, 3);
    g.fillCircle(13, -35, 3);
    g.lineStyle(3, 0x263149);
    g.lineBetween(-9, -17, 10, enemy ? -22 : -17);
    if (enemy) {
      g.lineBetween(-20, -45, -5, -41);
      g.lineBetween(5, -41, 21, -45);
    }
    const index = this.figures.length;
    if (!enemy) {
      // Original silhouette details distinguish the four students at small sizes.
      if (index === 0) {
        g.fillStyle(0xffd766);
        g.fillRoundedRect(-35, -78, 70, 17, 6);
        g.fillTriangle(-40, -61, 36, -61, 41, -52);
        g.fillStyle(0xffffff);
        g.fillCircle(-15, -70, 4);
      }
      if (index === 1) {
        g.fillStyle(0x4c3355);
        g.fillEllipse(-32, -49, 20, 47);
        g.fillEllipse(31, -49, 20, 47);
        g.lineStyle(3, 0x493553);
        g.strokeCircle(-13, -35, 10);
        g.strokeCircle(13, -35, 10);
        g.lineBetween(-3, -35, 3, -35);
      }
      if (index === 2) {
        g.fillStyle(0x8a4434);
        g.fillTriangle(-28, -68, -16, -91, -3, -67);
        g.fillTriangle(-9, -68, 8, -94, 19, -67);
        g.fillTriangle(12, -68, 31, -87, 31, -59);
        g.fillStyle(0xffffff);
        g.fillRect(-30, 4, 60, 6);
      }
      if (index === 3) {
        g.fillStyle(0x53d8cf);
        g.fillRoundedRect(-35, -58, 70, 9, 3);
        g.fillStyle(0x263149);
        g.fillRoundedRect(-40, -45, 10, 28, 4);
        g.fillRoundedRect(30, -45, 10, 28, 4);
        g.lineStyle(4, 0xffcf79);
        g.strokeEllipse(0, -50, 75, 54);
      }
    }
    const badge = this.add
      .text(0, 22, symbol, {
        fontFamily: "Arial",
        fontSize: "35px",
        fontStyle: "bold",
        color: "#273247",
      })
      .setOrigin(0.5);
    c.add([g, badge]);
    c.setScale(scale);
    this.figures.push(c);
    this.tweens.add({
      targets: c,
      y: y - 5,
      duration: 1000 + this.figures.length * 90,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }
  victory(won: boolean) {
    this.figures.forEach((c, i) => {
      if (i < 4 === won)
        this.tweens.add({
          targets: c,
          angle: { from: -5, to: 5 },
          duration: 250,
          yoyo: true,
          repeat: 5,
        });
      else this.tweens.add({ targets: c, alpha: 0.35, duration: 400 });
    });
  }
  reset() {
    this.figures.forEach((c) => {
      c.setAlpha(1);
      c.setAngle(0);
    });
  }
  effect(index: number, label: string, heal = false) {
    const c = this.figures[index];
    if (!c) return;
    this.tweens.add({
      targets: c,
      x: c.x + (index === 4 ? -28 : 30),
      duration: 110,
      yoyo: true,
    });
    const t = this.add
      .text(c.x, c.y - 75, label, {
        fontFamily: "Arial",
        fontSize: "32px",
        fontStyle: "bold",
        color: heal ? "#147a67" : "#ab304c",
        stroke: "#fff5df",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: t.y - 65,
      alpha: 0,
      duration: 1200,
      onComplete: () => t.destroy(),
    });
    for (let i = 0; i < 10; i++) {
      const p = this.add.star(c.x, c.y, 5, 3, 9, heal ? 0x66ffcc : 0xffdc70);
      this.tweens.add({
        targets: p,
        x: c.x + Phaser.Math.Between(-90, 90),
        y: c.y + Phaser.Math.Between(-90, 30),
        alpha: 0,
        angle: 180,
        duration: 650,
        onComplete: () => p.destroy(),
      });
    }
    if (!heal) this.cameras.main.shake(100, 0.003);
  }
}
