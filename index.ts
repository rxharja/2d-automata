import { match } from "ts-pattern";
import { compose, range, pickColor } from "./util";

/* Domain */
type Position = [x: number, y: number];

type State = 0 | 1;

type Torus = {
  grid: State[][];
  readonly x: number;
  readonly y: number;
};

/* Directions */
const ne = (maxX: number, maxY: number) => (pos: Position) => compose(n(maxY), e(maxX), pos);
const nw = (maxX: number, maxY: number) => (pos: Position) => compose(n(maxY), w(maxX), pos);
const se = (maxX: number, maxY: number) => (pos: Position) => compose(s(maxY), e(maxX), pos);
const sw = (maxX: number, maxY: number) => (pos: Position) => compose(s(maxY), w(maxX), pos);

const n = (maxY: number) => ([x, y]: Position): Position => [x, y - 1 < 0 ? maxY : y - 1];
const e = (maxX: number) => ([x, y]: Position): Position => [x + 1 > maxX ? 0 : x + 1, y];
const s = (maxY: number) => ([x, y]: Position): Position => [x, y + 1 > maxY ? 0 : y + 1];
const w = (maxX: number) => ([x, y]: Position): Position => [x - 1 < 0 ? maxX : x - 1, y];

/* Pure */
const countLive = (pos: Position, { x, y, grid }: Torus) =>
  [nw(x, y), n(y), ne(x, y), e(x), se(x, y), s(y), sw(x, y), w(x)]
    .map((f) => f(pos))
    .map(([x, y]) => grid[x][y])
    .reduceRight((t, s) => t + s, 0);

const state = (torus: Torus, [x, y]: Position) =>
  match([torus.grid[x][y], countLive([x, y], torus)])
    .with([0, 3], () => 1)
    .with([1, 2], () => 1)
    .with([1, 3], () => 1)
    .otherwise(() => 0) as State;

const newTorus = (torus: Torus): Torus => ({
  ...torus,
  grid: torus.grid.map((r, x) => r.map((_, y) => state(torus, [x, y]))),
});

function initTorus(endX: number = 3, endY: number = 3) {
  const [x, y] = [endX < 3 ? 3 : endX, endY < 3 ? 3 : endY];
  const cells = range(0, x).map((_x) => range(0, y).map<State>((_y) => 0));
  return { grid: cells, x: x - 1, y: y - 1 };
}

/* IO */
function update() {
  draw(torus.grid);
  torus = newTorus(torus);
}

function draw(grid: State[][]) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#111";
  ctx.fillStyle = pickColor();
  grid.forEach((r, x) =>
    r.map((s, y) => {
      s === 1
        ? ctx.fillRect(x * px, y * px, px, px)
        : ctx.strokeRect(x * px, y * px, px, px);
    })
  );
}

let interval: number;

const start = document.querySelector("#gol-start");
start.addEventListener("click", () => {
  clearInterval(interval);
  interval = setInterval(update, 80);
});

const pause = document.querySelector("#gol-pause");
pause.addEventListener("click", () => {
  clearInterval(interval);
});

const random = document.querySelector("#gol-random");
random.addEventListener("click", () => {
  torus.grid.forEach((r, x) =>
    r.forEach((_, y) => (torus.grid[x][y] = Math.random() > 0.85 ? 1 : 0))
  );
  draw(torus.grid);
});

const clear = document.querySelector<HTMLButtonElement>("#gol-clear");
clear.addEventListener("click", () => {
  torus.grid.forEach((r, x) => r.forEach((_, y) => (torus.grid[x][y] = 0)));
  draw(torus.grid);
});

const canvas = document.querySelector<HTMLCanvasElement>("#gol-canvas");

canvas.addEventListener("mousedown", (e) => {
  const [a, b] = [
    Math.floor(e.pageX / px),
    Math.floor(e.pageY / px),
  ] as Position;

  torus.grid[a][b] = 1;

  draw(torus.grid);
});

const px = 10;

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

const xs = Math.floor(window.innerWidth / px);
const ys = Math.floor(window.innerHeight / px);

let torus = initTorus(xs, ys);
draw(torus.grid);
