import { match } from "ts-pattern";
import { compose, range } from "./util";

export type Rule = "Game of Life" | "Rule 30" | "Hat";

export type Position = [x: number, y: number];

export type State = 0 | 1;

export type Torus = {
  grid: State[][];
  readonly x: number;
  readonly y: number;
};

const ne = (maxX: number, maxY: number) => (pos: Position) =>
  compose(n(maxY), e(maxX), pos);
const nw = (maxX: number, maxY: number) => (pos: Position) =>
  compose(n(maxY), w(maxX), pos);
const se = (maxX: number, maxY: number) => (pos: Position) =>
  compose(s(maxY), e(maxX), pos);
const sw = (maxX: number, maxY: number) => (pos: Position) =>
  compose(s(maxY), w(maxX), pos);
const n =
  (maxY: number) =>
  ([x, y]: Position): Position =>
    [x, y - 1 < 0 ? maxY : y - 1];
const e =
  (maxX: number) =>
  ([x, y]: Position): Position =>
    [x + 1 > maxX ? 0 : x + 1, y];
const s =
  (maxY: number) =>
  ([x, y]: Position): Position =>
    [x, y + 1 > maxY ? 0 : y + 1];
const w =
  (maxX: number) =>
  ([x, y]: Position): Position =>
    [x - 1 < 0 ? maxX : x - 1, y];

const countLive =
  (axes: ((pos: Position) => Position)[]) =>
  (pos: Position, { x, y, grid }: Torus) =>
    axes
      .map((f) => f(pos))
      .map<number>(([x, y]) => grid[x][y])
      .reduceRight((t, s) => t + s, 0);

const golDirs = (x: number, y: number) =>
  countLive([nw(x, y), n(y), ne(x, y), e(x), se(x, y), s(y), sw(x, y), w(x)]);

const gameOfLife = ([x, y]: Position, torus: Torus) =>
  match([torus.grid[x][y], golDirs(torus.x, torus.y)([x, y], torus)])
    .with([0, 3], () => 1)
    .with([1, 2], () => 1)
    .with([1, 3], () => 1)
    .otherwise(() => 0) as State;

const rule30 = ([x, y]: Position, { x: maxX, y: maxY, grid }: Torus) => {
  const [[lx, ly], [nx, ny], [rx, ry]] = [
    nw(maxX, maxY)([x, y]),
    n(maxY)([x, y]),
    ne(maxX, maxY)([x, y]),
  ];
  const [left, center, right] = [grid[lx][ly], grid[nx][ny], grid[rx][ry]];
  return (left ^ (center | right)) as State;
};

const hat = ([x, y]: Position, { x: maxX, y: maxY, grid }: Torus) => {
  const [[lx, ly], [rx, ry]] = [nw(maxX, maxY)([x, y]), ne(maxX, maxY)([x, y])];
  const [left, right] = [grid[lx][ly], grid[rx][ry]];
  return (left ^ right) as State;
};

const rules: Map<Rule, (p: Position, t: Torus) => State> = new Map([
  ["Game of Life", gameOfLife],
  ["Rule 30", rule30],
  ["Hat", hat],
]);

export const newTorus = (torus: Torus, rule: Rule): Torus => ({
  ...torus,
  grid: torus.grid.map((r, x) =>
    r.map((_, y) => rules.get(rule)!([x, y], torus))
  ),
});

export function createTorus(endX: number = 3, endY: number = 3) {
  const [x, y] = [endX < 3 ? 3 : endX, endY < 3 ? 3 : endY];
  const cells = range(0, x).map((_x) => range(0, y).map<State>((_y) => 0));
  return { grid: cells, x: x - 1, y: y - 1 };
}
