/**
 * LSB Steganography - Encode/Decode text in images
 * Uses Least Significant Bit manipulation on Canvas pixel data
 */

const DELIMITER = "<<END>>";

export function encodeMessage(
  imageData: ImageData,
  message: string
): ImageData {
  const fullMessage = message + DELIMITER;
  const binaryMessage = textToBinary(fullMessage);

  if (binaryMessage.length > imageData.data.length * 3) {
    throw new Error(
      `Message too long! Max capacity: ${Math.floor((imageData.data.length * 3) / 8)} characters`
    );
  }

  const newData = new Uint8ClampedArray(imageData.data);
  let bitIndex = 0;

  for (let i = 0; i < newData.length && bitIndex < binaryMessage.length; i++) {
    // Skip alpha channel (every 4th byte)
    if (i % 4 === 3) continue;

    // Replace LSB
    newData[i] = (newData[i] & 0xfe) | parseInt(binaryMessage[bitIndex], 2);
    bitIndex++;
  }

  return new ImageData(newData, imageData.width, imageData.height);
}

export function decodeMessage(imageData: ImageData): string {
  let binaryString = "";
  const data = imageData.data;

  for (let i = 0; i < data.length; i++) {
    if (i % 4 === 3) continue; // Skip alpha
    binaryString += (data[i] & 1).toString();
  }

  // Convert binary to text
  let message = "";
  for (let i = 0; i < binaryString.length; i += 8) {
    const byte = binaryString.substring(i, i + 8);
    if (byte.length < 8) break;
    const char = String.fromCharCode(parseInt(byte, 2));
    message += char;

    // Check for delimiter
    if (message.endsWith(DELIMITER)) {
      return message.slice(0, -DELIMITER.length);
    }
  }

  return "[No hidden message found]";
}

export function getCapacity(imageData: ImageData): number {
  // 3 color channels per pixel, 1 bit per channel, 8 bits per character
  const totalBits = (imageData.data.length / 4) * 3;
  const capacityChars = Math.floor(totalBits / 8) - DELIMITER.length;
  return capacityChars;
}

function textToBinary(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

/**
 * Chi-Square Steganalysis Detection
 *
 * Proper chi-square attack on LSB steganography:
 * LSB embedding tends to EQUALIZE the counts of pixel-value pairs
 * (e.g., 2v and 2v+1 converge toward the same count).
 *
 * A LOW chi-square ⇒ pairs are suspiciously balanced ⇒ likely stego
 * A HIGH chi-square ⇒ natural unbalanced distribution ⇒ unlikely stego
 *
 * We compute p-value from chi-square: high p-value (close to 1) means
 * the distribution is "too uniform" — hallmark of LSB embedding.
 */
export function detectSteganography(imageData: ImageData): {
  probability: number;
  isLikelySteganographic: boolean;
  analysis: string;
} {
  const data = imageData.data;

  // Build frequency table of each byte value (ignoring alpha channel)
  const freq = new Float64Array(256);
  let totalSamples = 0;
  for (let i = 0; i < data.length; i++) {
    if (i % 4 === 3) continue; // skip alpha
    freq[data[i]]++;
    totalSamples++;
  }

  // Chi-square statistic on PoV pairs (0,1), (2,3), (4,5), …, (254,255)
  let chiSquare = 0;
  let degreesOfFreedom = 0;

  for (let v = 0; v < 256; v += 2) {
    const observed0 = freq[v];
    const observed1 = freq[v + 1];
    const expected = (observed0 + observed1) / 2;
    if (expected >= 5) {
      // Only count pairs with enough samples for statistical validity
      chiSquare +=
        ((observed0 - expected) ** 2) / expected +
        ((observed1 - expected) ** 2) / expected;
      degreesOfFreedom++;
    }
  }

  if (degreesOfFreedom === 0) {
    return {
      probability: 0,
      isLikelySteganographic: false,
      analysis:
        "Not enough pixel data to perform chi-square analysis. Image may be too small or uniform.",
    };
  }

  // Approximate p-value using the regularized incomplete gamma function
  // For large df, use normal approximation: Z = sqrt(2*chi) - sqrt(2*df - 1)
  // p-value ≈ Φ(Z)  where Φ is the standard normal CDF
  const z = Math.sqrt(2 * chiSquare) - Math.sqrt(2 * degreesOfFreedom - 1);

  // Standard normal CDF approximation (Abramowitz & Stegun 26.2.17)
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422804014327; // 1/sqrt(2*pi)
  const pNorm =
    d *
    Math.exp(-0.5 * z * z) *
    (t *
      (0.319381530 +
        t *
          (-0.356563782 +
            t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  // If z > 0, CDF = 1 - pNorm; if z < 0, CDF = pNorm
  const cdf = z >= 0 ? 1 - pNorm : pNorm;

  // cdf close to 1 → chi-square is large → natural image (NOT stego)
  // cdf close to 0 → chi-square is tiny → suspiciously uniform → likely stego
  // Probability of steganography = 1 - cdf (i.e. p-value)
  const probability = Math.max(0, Math.min(1, 1 - cdf));

  let analysis: string;
  if (probability > 0.7) {
    analysis =
      "High probability of steganographic content. LSB pair distribution is suspiciously uniform, consistent with data embedding.";
  } else if (probability > 0.3) {
    analysis =
      "Moderate indicators of possible steganography. Some LSB pair distributions are more balanced than expected, but this could also be caused by image compression or processing artifacts.";
  } else {
    analysis =
      "No significant steganographic indicators found. Pixel value pair distribution appears naturally unbalanced, as expected for an unmodified image.";
  }

  return {
    probability,
    isLikelySteganographic: probability > 0.5,
    analysis,
  };
}
