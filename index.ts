import { match } from "ts-pattern";

/* Domain */
type Position = [x: number, y: number];

type State = "Alive" | "Dead";

type Cell = [Position, State];

type Torus = {
  grid: Map<Position, State>;
  x: number;
  y: number;
};

/* Util */
const compose = <A, B, C>(bc: (b: B) => C, ab: (a: A) => B, a: A) => bc(ab(a));

const range = (s: number, e: number) =>
  Array.from({ length: e - s }, (_, i) => s + i);

const cartesian = <T>(set1: T[], set2: T[]) =>
  set1.flatMap((a) => set2.map((b) => [a, b]));

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
    .map((p) => grid.get(p))
    .reduceRight((t, s) => t + (s == "Alive" ? 1 : 0), 0);

const cell =
  (torus: Torus) =>
  ([pos, state]: Cell): Cell =>
    match([state, countLive(pos, torus)])
      .with(["Dead", 3], () => [pos, "Alive"])
      .with(["Alive", 2], () => [pos, "Alive"])
      .with(["Alive", 3], () => [pos, "Alive"])
      .otherwise(() => [pos, "Dead"]) as Cell;

const newTorus = (torus: Torus) => {
  const a = {
    ...torus,
    grid: new Map(Array.from(torus.grid).map(cell(torus))),
  };
  console.log(a.grid);
  return a;
};

function initTorus(endX: number = 3, endY: number = 3) {
  const [x, y] = [endX < 3 ? 3 : endX, endY < 3 ? 3 : endY];
  const cells = cartesian(range(0, x), range(0, y)).map<Cell>(([x, y]) => [
    [x, y] as Position,
    "Dead",
  ]);
  return { grid: new Map(cells), x: x - 1, y: y - 1 };
}

/* IO */
function update() {
  draw(torus.grid);
  torus = newTorus(torus);
}

function draw(grid: Map<Position, State>) {
  const c = document.getElementById("gol-canvas") as HTMLCanvasElement;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, c.width, c.height);

  grid.forEach((state, [x, y]) => {
    return match(state)
      .with("Dead", () => ctx.strokeRect(x * 20, y * 20, 20, 20))
      .with("Alive", () => ctx.fillRect(x * 20, y * 20, 20, 20))
      .exhaustive();
  });
}

let torus = initTorus(100, 50);
const c = document.getElementById("gol-canvas") as HTMLCanvasElement;

c.addEventListener("mousedown", (e) => {
  const [a, b] = [
    Math.floor(e.pageX / 20),
    Math.floor(e.pageY / 20),
  ] as Position;

  const entries = Array.from(torus.grid).map<Cell>(([[x, y], s]) => {
    return x === a && y === b ? [[x, y], "Alive"] : [[x, y], s];
  });

  torus = { ...torus, grid: new Map(entries) };

  draw(torus.grid);
});

let interval: number;
const b = document.querySelector<HTMLButtonElement>("button");
b.addEventListener("click", (e) => {
  clearInterval(interval);
  interval = setInterval(update, 500);
});

update();
