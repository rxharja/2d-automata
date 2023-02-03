export const compose = <A, B, C>(bc: (b: B) => C, ab: (a: A) => B, a: A) =>
  bc(ab(a));

export const range = (s: number, e: number) =>
  Array.from({ length: e - s }, (_, i) => s + i);

function byte2Hex(n: number) {
  const nybHexString = "0123456789ABCDEF";
  return (
    String(nybHexString.substr((n >> 4) & 0x0f, 1)) +
    nybHexString.substr(n & 0x0f, 1)
  );
}

const RGB2Color = (r: number, g: number, b: number) =>
  "#" + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);

export function makeColorGradient(
  frequency1: number,
  frequency2: number,
  frequency3: number,
  phase1: number,
  phase2: number,
  phase3: number,
  center?: number,
  width?: number,
  len?: number
) {
  if (center == undefined) center = 128;
  if (width == undefined) width = 127;
  if (len == undefined) len = 50;
  return range(0, len).map((i) => {
    const red = Math.sin(frequency1 * i + phase1) * width + center;
    const grn = Math.sin(frequency2 * i + phase2) * width + center;
    const blu = Math.sin(frequency3 * i + phase3) * width + center;
    return RGB2Color(red, grn, blu);
  });
}

const gradient = makeColorGradient(0.1, 0.1, 0.1, 0, 2, 4, 230, 25);
let gradientIndex = 0;

export function pickColor() {
  if (gradientIndex >= gradient.length) {
    gradientIndex = 0;
  }
  const g = gradient[gradientIndex];
  console.log(g);
  gradientIndex++;
  return g;
}
