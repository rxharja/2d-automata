import { createTorus, newTorus, Position, Rule, State } from "./automata";
import { pickColor } from "./util";

function update(rule: Rule) {
  if (rule === "Game of Life") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw(torus.grid);
  torus = newTorus(torus, rule);
}

function draw(grid: State[][]) {
  ctx.strokeStyle = "#111";
  ctx.fillStyle = pickColor();
  grid.map((r, x) =>
    r.map((s, y) => {
      s === 1
        ? ctx.fillRect(x * px, y * px, px, px)
        : ctx.strokeRect(x * px, y * px, px, px);
    })
  );
}

let interval: number;

const start = document.querySelector("#gol-start")!;
start.addEventListener("click", () => {
  clearInterval(interval);
  interval = setInterval(() => update(rule), 80);
});

const pause = document.querySelector("#gol-pause")!;
pause.addEventListener("click", () => {
  clearInterval(interval);
});

const random = document.querySelector("#gol-random")!;
random.addEventListener("click", () => {
  torus.grid.forEach((r, x) =>
    r.forEach((_, y) => (torus.grid[x][y] = Math.random() > 0.85 ? 1 : 0))
  );
  draw(torus.grid);
});

const clear = document.querySelector<HTMLButtonElement>("#gol-clear")!;
clear.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  torus.grid.forEach((r, x) => r.forEach((_, y) => (torus.grid[x][y] = 0)));
  draw(torus.grid);
});

const rules = document.querySelector<HTMLSelectElement>("#rules")!;
let rule: Rule = rules.value as Rule;

rules.addEventListener("change", () => {
  rule = rules.value as Rule;
});

const canvas = document.querySelector<HTMLCanvasElement>("#gol-canvas")!;

canvas.addEventListener("mousedown", (e) => {
  const [a, b] = [
    Math.floor(e.pageX / px),
    Math.floor(e.pageY / px),
  ] as Position;

  torus.grid[a][b] = 1;

  draw(torus.grid);
});

const px = 10;

const ctx = canvas!.getContext("2d")!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

const xs = Math.floor(window.innerWidth / px);
const ys = Math.floor(window.innerHeight / px);

let torus = createTorus(xs, ys);
draw(torus.grid);
