/* Domain */
type Position = [x: number, y: number];

type State = 'Alive' | 'Dead'

type Cell = [Position, State]

type Torus = { grid: Map<Position, State>, x: number, y: number, frozen: boolean };

/* Util */
const compose = <A, B, C,>(bc: (b: B) => C, ab: (a: A) => B, a: A) => bc(ab(a));

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const range = (s: number, e: number) => Array.from({ length: (e - s) }, (_, i) => s + i);

const cartesian = <T,>(set1: T[], set2: T[]) => set1.flatMap(a => set2.map(b => [a, b]));

/* Directions */
const ne = (maxX: number, maxY: number) => (pos: Position) => compose(n(maxY), e(maxX), pos);
const n = (maxY: number) => ([x, y]: Position): Position => [x, (y - 1 < 0 ? maxY : y - 1)];
const nw = (maxX: number, maxY: number) => (pos: Position) => compose(n(maxY), w(maxX), pos);
const e = (maxX: number) => ([x, y]: Position): Position => [(x + 1 > maxX ? 0 : x + 1), y];
const se = (maxX: number, maxY: number) => (pos: Position) => compose(s(maxY), e(maxX), pos);
const s = (maxY: number) => ([x, y]: Position): Position => [x, (y + 1 > maxY ? 0 : y + 1)];
const sw = (maxX: number, maxY: number) => (pos: Position) => compose(s(maxY), w(maxX), pos);
const w = (maxX: number) => ([x, y]: Position): Position => [(x - 1 < 0 ? maxX : x - 1), y];

/* State */
const countLive = (pos: Position, { x, y, grid }: Torus) =>
  [nw(x, y), n(y), ne(x, y), e(x), se(x, y), s(y), sw(x, y), w(x)]
    .map(f => f(pos))
    .map(p => grid.get(p))
    .reduceRight((t, s) => t + (s == 'Alive' ? 1 : 0), 0);

const cell = (torus: Torus) => ([pos, state]: Cell): Cell => {
  const liveCells = countLive(pos, torus)
  switch (state) {
    case 'Dead':
      return [pos, liveCells === 3 ? 'Alive' : 'Dead'];

    case 'Alive':
      return [pos, liveCells === 2 || liveCells === 3 ? 'Alive' : 'Dead'];

    case undefined:
      return [pos, 'Dead'];
  }
}

const newTorus = (torus: Torus) => ({ ...torus, grid: new Map(Array.from(torus.grid).map(cell(torus))) });

function initTorus(endX: number = 3, endY: number = 3) {
  const [x, y] = [(endX < 3 ? 3 : endX), (endY < 3 ? 3 : endY)];
  const cells = cartesian(range(0, x), range(0, y)).map<Cell>(p => [p as Position, 'Dead']);
  return { grid: new Map(cells), x: x - 1, y: y - 1, frozen: false };
}

async function run(torus: Torus): Promise<Torus> {
  // draw(torus.grid);
  console.log(torus);
  await sleep(20);
  const next = newTorus(torus);
  return torus.frozen ? next : run(next);
}

function draw(grid: Map<Position, State>) {
  var c = document.getElementById("myCanvas") as HTMLCanvasElement;
  var ctx = c.getContext("2d") as CanvasRenderingContext2D;

  grid.forEach((state, [x, y]) => {
    switch (state) {
      case "Dead":
        ctx.strokeRect(x * 10, y * 10, 10, 10);
        break;
      case "Alive":
        return ctx.fillRect(x * 10, y * 10, 10, 10);
    }
  })
}

run(initTorus());
