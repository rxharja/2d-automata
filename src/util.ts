export const compose = <A, B, C>(bc: (b: B) => C, ab: (a: A) => B, a: A) =>
  bc(ab(a));

export const range = (s: number, e: number) =>
  Array.from({ length: e - s }, (_, i) => s + i);

function byte2Hex(n: number) {
  const nybHexString = "0123456789ABCDEF";
  return (
    String(nybHexString.slice((n >> 4) & 0x0f, ((n >> 4) & 0x0f) + 1)) +
    nybHexString.slice(n & 0x0f, (n & 0x0f) + 1)
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
  const [c, w, l] = [center ?? 128, width ?? 127, len ?? 50];

  return range(0, l).map((i) => {
    const red = Math.sin(frequency1 * i + phase1) * w + c;
    const grn = Math.sin(frequency2 * i + phase2) * w + c;
    const blu = Math.sin(frequency3 * i + phase3) * w + c;
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
