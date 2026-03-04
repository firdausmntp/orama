/**
 * Enhancement Advisor - Histogram analysis & intelligent suggestions
 */

export interface ImageMetrics {
  brightness: number;       // 0-255 average
  contrast: number;         // 0-100 standard deviation-based
  saturation: number;       // 0-100 average saturation
  sharpness: number;        // 0-100 laplacian variance-based
  histogram: {
    red: number[];
    green: number[];
    blue: number[];
    luminance: number[];
  };
  colorDominant: [number, number, number];
}

export interface Enhancement {
  id: string;
  label: string;
  description: string;
  severity: "info" | "warning" | "critical";
  action: string;
  value: number;
}

/**
 * Analyze image metrics
 */
export function analyzeImage(imageData: ImageData): ImageMetrics {
  const { data, width, height } = imageData;
  const pixelCount = width * height;

  const histR = new Array(256).fill(0);
  const histG = new Array(256).fill(0);
  const histB = new Array(256).fill(0);
  const histL = new Array(256).fill(0);

  let sumBrightness = 0;
  let sumSaturation = 0;
  let rSum = 0, gSum = 0, bSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];

    histR[r]++;
    histG[g]++;
    histB[b]++;

    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    histL[lum]++;
    sumBrightness += lum;

    // Saturation (HSL)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2 / 255;
    const s = max === min ? 0 : (max - min) / (l > 0.5 ? 510 - max - min : max + min);
    sumSaturation += s;

    rSum += r; gSum += g; bSum += b;
  }

  const brightness = sumBrightness / pixelCount;

  // Contrast (std deviation of luminance)
  let varianceSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    varianceSum += (lum - brightness) ** 2;
  }
  const contrast = Math.sqrt(varianceSum / pixelCount);

  // Sharpness (Laplacian variance)
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  let laplacianVar = 0;
  let laplacianMean = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap = gray[idx - width] + gray[idx + width] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx];
      laplacianMean += Math.abs(lap);
      count++;
    }
  }
  laplacianMean /= count;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap = gray[idx - width] + gray[idx + width] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx];
      laplacianVar += (Math.abs(lap) - laplacianMean) ** 2;
    }
  }
  const sharpness = Math.min(100, Math.sqrt(laplacianVar / count));

  return {
    brightness,
    contrast: Math.min(100, (contrast / 128) * 100),
    saturation: (sumSaturation / pixelCount) * 100,
    sharpness,
    histogram: {
      red: histR,
      green: histG,
      blue: histB,
      luminance: histL,
    },
    colorDominant: [
      Math.round(rSum / pixelCount),
      Math.round(gSum / pixelCount),
      Math.round(bSum / pixelCount),
    ],
  };
}

/**
 * Generate enhancement suggestions based on metrics
 */
export function generateSuggestions(metrics: ImageMetrics): Enhancement[] {
  const suggestions: Enhancement[] = [];

  // Brightness analysis
  if (metrics.brightness < 80) {
    suggestions.push({
      id: "brightness-low",
      label: "Increase Brightness",
      description: `Image is underexposed (avg: ${metrics.brightness.toFixed(0)}/255). Increasing brightness will reveal shadow details.`,
      severity: metrics.brightness < 50 ? "critical" : "warning",
      action: "brightness",
      value: Math.round((128 - metrics.brightness) * 0.6),
    });
  } else if (metrics.brightness > 200) {
    suggestions.push({
      id: "brightness-high",
      label: "Decrease Brightness",
      description: `Image is overexposed (avg: ${metrics.brightness.toFixed(0)}/255). Reducing brightness will recover highlight details.`,
      severity: metrics.brightness > 230 ? "critical" : "warning",
      action: "brightness",
      value: -Math.round((metrics.brightness - 128) * 0.5),
    });
  }

  // Contrast analysis
  if (metrics.contrast < 25) {
    suggestions.push({
      id: "contrast-low",
      label: "Boost Contrast",
      description: `Low contrast detected (${metrics.contrast.toFixed(1)}%). Image appears flat/washed out. Histogram stretching recommended.`,
      severity: metrics.contrast < 15 ? "critical" : "warning",
      action: "contrast",
      value: Math.round((50 - metrics.contrast) * 2),
    });
  }

  // Saturation analysis
  if (metrics.saturation < 15) {
    suggestions.push({
      id: "saturation-low",
      label: "Increase Saturation",
      description: `Colors are very muted (${metrics.saturation.toFixed(1)}%). Boosting saturation will make colors more vibrant.`,
      severity: "info",
      action: "saturation",
      value: 30,
    });
  } else if (metrics.saturation > 80) {
    suggestions.push({
      id: "saturation-high",
      label: "Reduce Saturation",
      description: `Colors appear oversaturated (${metrics.saturation.toFixed(1)}%). Reducing will create more natural tones.`,
      severity: "warning",
      action: "saturation",
      value: -20,
    });
  }

  // Sharpness analysis
  if (metrics.sharpness < 20) {
    suggestions.push({
      id: "sharpness-low",
      label: "Apply Sharpening",
      description: `Image appears soft/blurry (sharpness: ${metrics.sharpness.toFixed(1)}%). Unsharp mask can improve detail visibility.`,
      severity: metrics.sharpness < 10 ? "critical" : "warning",
      action: "sharpen",
      value: 50,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "good",
      label: "Image Quality OK",
      description: "No major issues detected. Image has balanced brightness, contrast, saturation, and sharpness.",
      severity: "info",
      action: "none",
      value: 0,
    });
  }

  return suggestions;
}

/**
 * Apply enhancement to image data
 */
export function applyEnhancement(
  imageData: ImageData,
  action: string,
  value: number
): ImageData {
  const output = new Uint8ClampedArray(imageData.data);
  const { width, height } = imageData;

  switch (action) {
    case "brightness": {
      for (let i = 0; i < output.length; i += 4) {
        output[i] = clamp(output[i] + value);
        output[i + 1] = clamp(output[i + 1] + value);
        output[i + 2] = clamp(output[i + 2] + value);
      }
      break;
    }
    case "contrast": {
      const factor = (259 * (value + 255)) / (255 * (259 - value));
      for (let i = 0; i < output.length; i += 4) {
        output[i] = clamp(factor * (output[i] - 128) + 128);
        output[i + 1] = clamp(factor * (output[i + 1] - 128) + 128);
        output[i + 2] = clamp(factor * (output[i + 2] - 128) + 128);
      }
      break;
    }
    case "saturation": {
      for (let i = 0; i < output.length; i += 4) {
        const gray = 0.299 * output[i] + 0.587 * output[i + 1] + 0.114 * output[i + 2];
        const factor = 1 + value / 100;
        output[i] = clamp(gray + factor * (output[i] - gray));
        output[i + 1] = clamp(gray + factor * (output[i + 1] - gray));
        output[i + 2] = clamp(gray + factor * (output[i + 2] - gray));
      }
      break;
    }
    case "sharpen": {
      const gray = new Float32Array(width * height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        gray[i / 4] = 0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2];
      }
      const amount = value / 100;
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const lap = gray[idx - width] + gray[idx + width] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx];
          const pi = idx * 4;
          output[pi] = clamp(imageData.data[pi] - amount * lap);
          output[pi + 1] = clamp(imageData.data[pi + 1] - amount * lap);
          output[pi + 2] = clamp(imageData.data[pi + 2] - amount * lap);
        }
      }
      break;
    }
  }

  return new ImageData(output, width, height);
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}
