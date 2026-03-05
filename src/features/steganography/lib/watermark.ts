/**
 * Watermarking — visible & invisible watermarks
 * Visible: Alpha blending of text overlay
 * Invisible: LSB-based watermark embedding in DCT-like domain
 */

/**
 * Apply a visible text watermark with alpha blending
 * P_out = α * P_watermark + (1 - α) * P_original
 */
export function applyVisibleWatermark(
  imageData: ImageData,
  text: string,
  options: {
    opacity?: number; // 0-1, default 0.3
    fontSize?: number; // default 48
    color?: string; // default "white"
    position?: "center" | "tiled" | "bottom-right";
  } = {}
): ImageData {
  const {
    opacity = 0.3,
    fontSize = 48,
    color = "white",
    position = "tiled",
  } = options;

  const { width, height } = imageData;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Draw original image
  ctx.putImageData(imageData, 0, 0);

  // Configure watermark text
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.fillStyle = color;
  ctx.strokeStyle = color === "white" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;

  if (position === "center") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
    ctx.strokeText(text, width / 2, height / 2);
  } else if (position === "bottom-right") {
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(text, width - 20, height - 20);
    ctx.strokeText(text, width - 20, height - 20);
  } else {
    // Tiled — rotate 45° and repeat
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const diagonal = Math.sqrt(width * width + height * height);
    const stepX = fontSize * text.length * 0.5 + 60;
    const stepY = fontSize * 2.5;

    for (let y = -diagonal; y < diagonal; y += stepY) {
      for (let x = -diagonal; x < diagonal; x += stepX) {
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Embed an invisible watermark using spread-spectrum LSB technique
 * Encodes a binary signature into the image's least significant bits
 * with a pseudo-random pattern for robustness
 */
export function embedInvisibleWatermark(
  imageData: ImageData,
  signature: string
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const marker = "<<WM>>" + signature + "<<WM>>";
  const bits = textToBits(marker);

  // Use a simple PRNG for spreading the watermark
  let seed = 12345;
  const prng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed;
  };

  // Generate embedding positions (skip alpha channel)
  const maxPositions = Math.floor((data.length / 4) * 3);
  if (bits.length > maxPositions) {
    throw new Error(`Watermark too long. Max ${Math.floor(maxPositions / 8)} chars.`);
  }

  // Create a shuffled index map
  const indices: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i % 4 !== 3) indices.push(i); // skip alpha
  }
  // Fisher-Yates shuffle with seeded PRNG
  for (let i = indices.length - 1; i > 0; i--) {
    const j = prng() % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Embed bits
  for (let b = 0; b < bits.length; b++) {
    const idx = indices[b];
    data[idx] = (data[idx] & 0xfe) | bits[b];
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Extract an invisible watermark
 */
export function extractInvisibleWatermark(imageData: ImageData): string {
  const data = imageData.data;

  // Reproduce the same PRNG sequence
  let seed = 12345;
  const prng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed;
  };

  const indices: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i % 4 !== 3) indices.push(i);
  }
  for (let i = indices.length - 1; i > 0; i--) {
    const j = prng() % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Extract bits and reconstruct text
  let binaryStr = "";
  const maxBits = Math.min(indices.length, 8 * 1000); // limit search to ~1000 chars
  for (let b = 0; b < maxBits; b++) {
    binaryStr += (data[indices[b]] & 1).toString();

    // Check for end marker every 8 bits
    if (binaryStr.length >= 8 && binaryStr.length % 8 === 0) {
      const text = bitsToText(binaryStr);
      const endIdx = text.indexOf("<<WM>>", 6);
      if (endIdx > 0) {
        return text.substring(6, endIdx); // Strip <<WM>> markers
      }
    }
  }

  return "[No watermark found]";
}

function textToBits(text: string): number[] {
  const bits: number[] = [];
  for (const char of text) {
    const code = char.charCodeAt(0);
    for (let i = 7; i >= 0; i--) {
      bits.push((code >> i) & 1);
    }
  }
  return bits;
}

function bitsToText(binary: string): string {
  let text = "";
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substring(i, i + 8);
    if (byte.length < 8) break;
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
}

export type WatermarkPosition = "center" | "tiled" | "bottom-right";

export const WATERMARK_POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "tiled", label: "Tiled (Diagonal)" },
  { value: "bottom-right", label: "Bottom Right" },
];
