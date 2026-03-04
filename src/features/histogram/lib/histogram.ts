/**
 * Histogram computation & equalization — pure Canvas API
 */

export interface HistogramData {
  red: number[];
  green: number[];
  blue: number[];
  luminance: number[];
}

/** Compute per-channel + luminance histograms */
export function computeHistogram(imageData: ImageData): HistogramData {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const l = new Array(256).fill(0);
  const d = imageData.data;

  for (let i = 0; i < d.length; i += 4) {
    r[d[i]]++;
    g[d[i + 1]]++;
    b[d[i + 2]]++;
    const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    l[lum]++;
  }

  return { red: r, green: g, blue: b, luminance: l };
}

/** Histogram equalization on luminance channel (preserves colour) */
export function equalizeHistogram(imageData: ImageData): ImageData {
  const { width, height } = imageData;
  const d = imageData.data;
  const total = width * height;
  const out = new ImageData(width, height);
  const od = out.data;

  // Build luminance CDF
  const hist = new Array(256).fill(0);
  for (let i = 0; i < d.length; i += 4) {
    const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    hist[lum]++;
  }

  const cdf = new Array(256);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];

  const cdfMin = cdf.find((v) => v > 0) ?? 0;

  const map = new Array(256);
  for (let i = 0; i < 256; i++) {
    map[i] = Math.round(((cdf[i] - cdfMin) / (total - cdfMin)) * 255);
  }

  // Apply equalized luminance while keeping hue
  for (let i = 0; i < d.length; i += 4) {
    const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    const newLum = map[lum];
    const ratio = lum > 0 ? newLum / lum : 1;

    od[i] = Math.min(255, Math.round(d[i] * ratio));
    od[i + 1] = Math.min(255, Math.round(d[i + 1] * ratio));
    od[i + 2] = Math.min(255, Math.round(d[i + 2] * ratio));
    od[i + 3] = d[i + 3];
  }

  return out;
}

/** Draw histogram to a canvas and return it */
export function drawHistogramCanvas(
  data: HistogramData,
  channel: "red" | "green" | "blue" | "luminance" | "all"
): HTMLCanvasElement {
  const W = 512;
  const H = 200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(0, 0, W, H);

  const channels: { arr: number[]; color: string }[] =
    channel === "all"
      ? [
          { arr: data.red, color: "rgba(239,68,68,0.5)" },
          { arr: data.green, color: "rgba(34,197,94,0.5)" },
          { arr: data.blue, color: "rgba(59,130,246,0.5)" },
        ]
      : channel === "luminance"
        ? [{ arr: data.luminance, color: "rgba(245,245,220,0.7)" }]
        : [
            {
              arr: data[channel],
              color:
                channel === "red"
                  ? "rgba(239,68,68,0.7)"
                  : channel === "green"
                    ? "rgba(34,197,94,0.7)"
                    : "rgba(59,130,246,0.7)",
            },
          ];

  const allMax = Math.max(
    ...channels.flatMap((c) => c.arr.filter((_, i) => i > 3 && i < 252))
  );

  for (const { arr, color } of channels) {
    ctx.fillStyle = color;
    const barW = W / 256;
    for (let i = 0; i < 256; i++) {
      const h = (arr[i] / allMax) * H;
      ctx.fillRect(i * barW, H - h, barW, h);
    }
  }

  return canvas;
}
