/**
 * FFT & Frequency Domain processing — pure TypeScript, no external libs.
 * Implements Cooley-Tukey radix-2 FFT with zero-padding for non-power-of-2.
 */

export type FrequencyFilter = "lowpass" | "highpass" | "bandpass";

export interface FFTResult {
  magnitudeSpectrum: ImageData;
  re: Float64Array[];
  im: Float64Array[];
  width: number;
  height: number;
}

export interface FilteredResult {
  filtered: ImageData;
  filterMask: ImageData;
}

/* ── helpers ──────────────────────────────────────── */

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function bitReverse(x: number, bits: number): number {
  let r = 0;
  for (let i = 0; i < bits; i++) {
    r = (r << 1) | (x & 1);
    x >>= 1;
  }
  return r;
}

/* ── 1-D FFT (Cooley-Tukey radix-2 in-place) ─────── */

/**
 * In-place Cooley-Tukey radix-2 FFT.
 * `re` and `im` must have length that is a power of 2.
 */
export function fft1D(re: Float64Array, im: Float64Array): void {
  const N = re.length;
  const bits = Math.round(Math.log2(N));

  // bit-reversal permutation
  for (let i = 0; i < N; i++) {
    const j = bitReverse(i, bits);
    if (j > i) {
      let tmp = re[i]; re[i] = re[j]; re[j] = tmp;
      tmp = im[i]; im[i] = im[j]; im[j] = tmp;
    }
  }

  // butterfly stages
  for (let size = 2; size <= N; size *= 2) {
    const half = size / 2;
    const angle = -2 * Math.PI / size;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let start = 0; start < N; start += size) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < half; k++) {
        const even = start + k;
        const odd = start + k + half;
        const tRe = curRe * re[odd] - curIm * im[odd];
        const tIm = curRe * im[odd] + curIm * re[odd];
        re[odd] = re[even] - tRe;
        im[odd] = im[even] - tIm;
        re[even] += tRe;
        im[even] += tIm;
        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }
}

/**
 * In-place inverse FFT.
 */
export function ifft1D(re: Float64Array, im: Float64Array): void {
  const N = re.length;
  // conjugate
  for (let i = 0; i < N; i++) im[i] = -im[i];
  // forward FFT
  fft1D(re, im);
  // conjugate & scale
  for (let i = 0; i < N; i++) {
    re[i] /= N;
    im[i] = -im[i] / N;
  }
}

/* ── 2-D FFT ──────────────────────────────────────── */

export function fft2D(imageData: ImageData): FFTResult {
  const { data, width: origW, height: origH } = imageData;

  const W = nextPow2(origW);
  const H = nextPow2(origH);

  // allocate row-major 2-D arrays
  const re: Float64Array[] = Array.from({ length: H }, () => new Float64Array(W));
  const im: Float64Array[] = Array.from({ length: H }, () => new Float64Array(W));

  // fill from grayscale
  for (let y = 0; y < origH; y++) {
    for (let x = 0; x < origW; x++) {
      const i = (y * origW + x) * 4;
      re[y][x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    // rest is zero-padded automatically
  }

  // FFT on rows
  for (let y = 0; y < H; y++) {
    fft1D(re[y], im[y]);
  }

  // FFT on columns
  const colRe = new Float64Array(H);
  const colIm = new Float64Array(H);
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) { colRe[y] = re[y][x]; colIm[y] = im[y][x]; }
    fft1D(colRe, colIm);
    for (let y = 0; y < H; y++) { re[y][x] = colRe[y]; im[y][x] = colIm[y]; }
  }

  // Build magnitude spectrum (log-scaled, DC-centered)
  const mag = new Float64Array(W * H);
  let maxMag = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // shift DC to center
      const sy = (y + H / 2) % H;
      const sx = (x + W / 2) % W;
      const m = Math.log(1 + Math.sqrt(re[sy][sx] ** 2 + im[sy][sx] ** 2));
      mag[y * W + x] = m;
      if (m > maxMag) maxMag = m;
    }
  }

  // normalize to 0-255
  const spectrumData = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const v = maxMag > 0 ? Math.round((mag[i] / maxMag) * 255) : 0;
    spectrumData[i * 4] = v;
    spectrumData[i * 4 + 1] = v;
    spectrumData[i * 4 + 2] = v;
    spectrumData[i * 4 + 3] = 255;
  }

  const magnitudeSpectrum = new ImageData(spectrumData, W, H);

  return { magnitudeSpectrum, re, im, width: W, height: H };
}

/* ── Frequency-domain filtering ───────────────────── */

export function applyFrequencyFilter(
  reIn: Float64Array[],
  imIn: Float64Array[],
  width: number,
  height: number,
  filterType: FrequencyFilter,
  cutoff: number,
  bandWidth = 20,
): FilteredResult {
  // deep-copy so we don't mutate the original
  const re = reIn.map((row) => new Float64Array(row));
  const im = imIn.map((row) => new Float64Array(row));

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy);
  const cutoffRadius = (cutoff / 100) * maxRadius;
  const bwRadius = (bandWidth / 100) * maxRadius;

  // Create filter mask image
  const maskPixels = new Uint8ClampedArray(width * height * 4);

  // Apply filter (ideal / sharp-cutoff)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // work in shifted coordinates
      const sy = (y + height / 2) % height;
      const sx = (x + width / 2) % width;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      let pass: boolean;
      switch (filterType) {
        case "lowpass":
          pass = dist <= cutoffRadius;
          break;
        case "highpass":
          pass = dist > cutoffRadius;
          break;
        case "bandpass":
          pass = dist >= cutoffRadius && dist <= cutoffRadius + bwRadius;
          break;
      }

      if (!pass) {
        re[sy][sx] = 0;
        im[sy][sx] = 0;
      }

      // mask visualization (shifted coords → image coords)
      const mv = pass ? 255 : 0;
      const mi = (y * width + x) * 4;
      maskPixels[mi] = mv;
      maskPixels[mi + 1] = mv;
      maskPixels[mi + 2] = mv;
      maskPixels[mi + 3] = 255;
    }
  }

  const filterMask = new ImageData(maskPixels, width, height);

  // Inverse FFT — columns first, then rows
  const colRe = new Float64Array(height);
  const colIm = new Float64Array(height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) { colRe[y] = re[y][x]; colIm[y] = im[y][x]; }
    ifft1D(colRe, colIm);
    for (let y = 0; y < height; y++) { re[y][x] = colRe[y]; im[y][x] = colIm[y]; }
  }
  for (let y = 0; y < height; y++) {
    ifft1D(re[y], im[y]);
  }

  // Build spatial-domain output
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = Math.max(0, Math.min(255, Math.round(re[y][x])));
      const idx = (y * width + x) * 4;
      pixels[idx] = v;
      pixels[idx + 1] = v;
      pixels[idx + 2] = v;
      pixels[idx + 3] = 255;
    }
  }

  const filtered = new ImageData(pixels, width, height);

  return { filtered, filterMask };
}
