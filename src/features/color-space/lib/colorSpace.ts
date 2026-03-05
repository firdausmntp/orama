/**
 * Color Space Conversions — pure Canvas API
 */

export type ColorMode =
  | "grayscale"
  | "sepia"
  | "binary"
  | "inverted"
  | "redChannel"
  | "greenChannel"
  | "blueChannel"
  | "hueMap"
  | "saturationMap"
  | "brightnessMap"
  | "cmyk"
  | "cyanChannel"
  | "magentaChannel"
  | "yellowChannel"
  | "keyChannel";

export interface ConvertOptions {
  mode: ColorMode;
  threshold?: number; // for binary, 0-255, default 128
}

export function convertColorSpace(
  imageData: ImageData,
  options: ConvertOptions
): ImageData {
  const { width, height } = imageData;
  const d = imageData.data;
  const out = new ImageData(width, height);
  const od = out.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2],
      a = d[i + 3];
    let nr = r,
      ng = g,
      nb = b;

    switch (options.mode) {
      case "grayscale": {
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        nr = ng = nb = gray;
        break;
      }
      case "sepia": {
        nr = Math.min(255, Math.round(r * 0.393 + g * 0.769 + b * 0.189));
        ng = Math.min(255, Math.round(r * 0.349 + g * 0.686 + b * 0.168));
        nb = Math.min(255, Math.round(r * 0.272 + g * 0.534 + b * 0.131));
        break;
      }
      case "binary": {
        const thresh = options.threshold ?? 128;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const val = gray >= thresh ? 255 : 0;
        nr = ng = nb = val;
        break;
      }
      case "inverted": {
        nr = 255 - r;
        ng = 255 - g;
        nb = 255 - b;
        break;
      }
      case "redChannel":
        ng = nb = 0;
        break;
      case "greenChannel":
        nr = nb = 0;
        break;
      case "blueChannel":
        nr = ng = 0;
        break;
      case "hueMap": {
        const [h] = rgbToHsl(r, g, b);
        nr = ng = nb = Math.round(h * 255);
        break;
      }
      case "saturationMap": {
        const [, s] = rgbToHsl(r, g, b);
        nr = ng = nb = Math.round(s * 255);
        break;
      }
      case "brightnessMap": {
        const [, , l] = rgbToHsl(r, g, b);
        nr = ng = nb = Math.round(l * 255);
        break;
      }
      case "cmyk": {
        const [c2, m2, y2, k2] = rgbToCmyk(r, g, b);
        // Visualize CMYK as combined: subtract from white
        nr = Math.round(255 * (1 - c2) * (1 - k2));
        ng = Math.round(255 * (1 - m2) * (1 - k2));
        nb = Math.round(255 * (1 - y2) * (1 - k2));
        break;
      }
      case "cyanChannel": {
        const [c2, , , k2] = rgbToCmyk(r, g, b);
        const val = Math.round(c2 * (1 - k2) * 255);
        nr = 0; ng = val; nb = val; // cyan = green + blue
        break;
      }
      case "magentaChannel": {
        const [, m2, , k2] = rgbToCmyk(r, g, b);
        const val = Math.round(m2 * (1 - k2) * 255);
        nr = val; ng = 0; nb = val; // magenta = red + blue
        break;
      }
      case "yellowChannel": {
        const [, , y2, k2] = rgbToCmyk(r, g, b);
        const val = Math.round(y2 * (1 - k2) * 255);
        nr = val; ng = val; nb = 0; // yellow = red + green
        break;
      }
      case "keyChannel": {
        const [, , , k2] = rgbToCmyk(r, g, b);
        nr = ng = nb = Math.round((1 - k2) * 255); // invert K for display
        break;
      }
    }

    od[i] = nr;
    od[i + 1] = ng;
    od[i + 2] = nb;
    od[i + 3] = a;
  }

  return out;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h, s, l];
}

/** RGB → CMYK conversion: C = (1 - R/255 - K) / (1 - K), etc. */
function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 1) return [0, 0, 0, 1]; // pure black
  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);
  return [c, m, y, k];
}

export const COLOR_MODES: { value: ColorMode; label: string }[] = [
  { value: "grayscale", label: "Grayscale" },
  { value: "sepia", label: "Sepia" },
  { value: "binary", label: "Binary (B&W)" },
  { value: "inverted", label: "Inverted / Negative" },
  { value: "redChannel", label: "Red Channel" },
  { value: "greenChannel", label: "Green Channel" },
  { value: "blueChannel", label: "Blue Channel" },
  { value: "hueMap", label: "Hue Map" },
  { value: "saturationMap", label: "Saturation Map" },
  { value: "brightnessMap", label: "Brightness Map" },
  { value: "cmyk", label: "CMYK (Composite)" },
  { value: "cyanChannel", label: "Cyan Channel (C)" },
  { value: "magentaChannel", label: "Magenta Channel (M)" },
  { value: "yellowChannel", label: "Yellow Channel (Y)" },
  { value: "keyChannel", label: "Key/Black Channel (K)" },
];
