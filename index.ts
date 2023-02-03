import { match } from "ts-pattern";

/* Domain */
type Position = [x: number, y: number];

type State = 0 | 1;

type Torus = {
  grid: State[][];
  x: number;
  y: number;
};

/* Util */
const compose = <A, B, C>(bc: (b: B) => C, ab: (a: A) => B, a: A) => bc(ab(a));

const range = (s: number, e: number) =>
  Array.from({ length: e - s }, (_, i) => s + i);

/* Directions */
const ne = (maxX: number, maxY: number) => (pos: Position) =>
  compose(n(maxY), e(maxX), pos);
const n =
  (maxY: number) =>
  ([x, y]: Position): Position =>
    [x, y - 1 < 0 ? maxY : y - 1];
const nw = (maxX: number, maxY: number) => (pos: Position) =>
  compose(n(maxY), w(maxX), pos);
const e =
  (maxX: number) =>
  ([x, y]: Position): Position =>
    [x + 1 > maxX ? 0 : x + 1, y];
const se = (maxX: number, maxY: number) => (pos: Position) =>
  compose(s(maxY), e(maxX), pos);
const s =
  (maxY: number) =>
  ([x, y]: Position): Position =>
    [x, y + 1 > maxY ? 0 : y + 1];
const sw = (maxX: number, maxY: number) => (pos: Position) =>
  compose(s(maxY), w(maxX), pos);
const w =
  (maxX: number) =>
  ([x, y]: Position): Position =>
    [x - 1 < 0 ? maxX : x - 1, y];

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
  const cells = range(0, x).map((x) => range(0, y).map<State>((y) => 0));
  return { grid: cells, x: x - 1, y: y - 1 };
}

/* IO */
function update() {
  draw(torus.grid);
  torus = newTorus(torus);
}

function draw(grid: State[][]) {
  const c = document.getElementById("gol-canvas") as HTMLCanvasElement;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#FFFFFF";

  ctx.clearRect(0, 0, c.width, c.height);

  grid.forEach((r, x) =>
    r.map((s, y) => {
      if (s === 1) {
        ctx.fillRect(Number(x) * 20, Number(y) * 20, 20, 20);
      }
    })
  );
}

let torus = initTorus(100, 50);
const c = document.getElementById("gol-canvas") as HTMLCanvasElement;

c.addEventListener("mousedown", (e) => {
  const [a, b] = [
    Math.floor(e.pageX / 20),
    Math.floor(e.pageY / 20),
  ] as Position;

  torus.grid[a][b] = 1;

  draw(torus.grid);
});

let interval: number;
const b = document.querySelector<HTMLButtonElement>("button");
b.addEventListener("click", (e) => {
  clearInterval(interval);
  interval = setInterval(update, 25);
});

update();
