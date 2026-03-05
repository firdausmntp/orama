/**
 * AI Object Detector — TensorFlow.js + COCO-SSD
 * Real object detection with 80-class pre-trained model
 * Runs fully in-browser, no server needed
 */

import type * as CocoSsd from "@tensorflow-models/coco-ssd";

export interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface DetectionResult {
  detections: Detection[];
  processedImageData: ImageData;
  inferenceTime: number;
}

let modelPromise: Promise<CocoSsd.ObjectDetection> | null = null;
let modelRef: CocoSsd.ObjectDetection | null = null;

/**
 * Load or return cached COCO-SSD model
 * Uses dynamic import to avoid SSR issues with TensorFlow.js
 */
export async function loadModel(): Promise<CocoSsd.ObjectDetection> {
  if (modelRef) return modelRef;

  if (!modelPromise) {
    modelPromise = (async () => {
      // Dynamic imports to avoid SSR bundling issues
      await import("@tensorflow/tfjs");
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      // Load from local model stored on Vercel CDN (faster, no external dependency)
      const model = await cocoSsd.load({
        modelUrl: "/models/coco-ssd/model.json",
      });
      modelRef = model;
      return model;
    })();
  }

  return modelPromise;
}

/**
 * Check if model is already loaded
 */
export function isModelLoaded(): boolean {
  return modelRef !== null;
}

/**
 * Detect objects in an image using COCO-SSD
 */
export async function detectObjects(
  imageData: ImageData,
  confidenceThreshold: number = 0.5,
  maxDetections: number = 50
): Promise<DetectionResult> {
  const model = await loadModel();

  // Create a temporary canvas to feed the model
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);

  // Create an HTMLImageElement from canvas
  const img = new Image();
  img.width = imageData.width;
  img.height = imageData.height;

  // Run inference
  const startTime = performance.now();
  const predictions = await model.detect(canvas, maxDetections, confidenceThreshold);
  const inferenceTime = performance.now() - startTime;

  // Convert to our format
  const detections: Detection[] = predictions.map((pred) => ({
    class: pred.class,
    score: pred.score,
    bbox: pred.bbox as [number, number, number, number],
  }));

  // Create visualization
  const outputData = new Uint8ClampedArray(imageData.data);
  const outputImageData = new ImageData(outputData, imageData.width, imageData.height);

  // Draw detection boxes on a canvas for visualization
  ctx.putImageData(imageData, 0, 0);
  drawDetections(ctx, detections);

  const visualized = ctx.getImageData(0, 0, imageData.width, imageData.height);

  return {
    detections,
    processedImageData: visualized,
    inferenceTime,
  };
}

/**
 * Draw detection bounding boxes and labels on canvas
 */
function drawDetections(ctx: CanvasRenderingContext2D, detections: Detection[]) {
  const colors = generatePalette(detections.length);

  for (let i = 0; i < detections.length; i++) {
    const det = detections[i];
    const [x, y, w, h] = det.bbox;
    const color = colors[i % colors.length];
    const confidence = (det.score * 100).toFixed(1);
    const label = `${det.class} ${confidence}%`;

    // Draw bounding box (neo-brutalist style — thick border)
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);

    // Draw semi-transparent fill
    ctx.fillStyle = color + "30"; // 30 = ~18% opacity
    ctx.fillRect(x, y, w, h);

    // Draw label background
    ctx.font = "bold 14px monospace";
    const metrics = ctx.measureText(label);
    const labelH = 22;
    const labelW = metrics.width + 12;
    const labelY = y > labelH ? y - labelH : y;

    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(x, labelY, labelW, labelH);

    // Draw label text
    ctx.fillStyle = color;
    ctx.fillText(label, x + 6, labelY + 16);

    // Draw corner markers (neo-brutalist accent)
    const cornerLen = Math.min(20, w / 3, h / 3);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FF5F15"; // orange-neon accent

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + cornerLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLen, y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + h - cornerLen);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerLen, y + h);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - cornerLen);
    ctx.stroke();
  }
}

/**
 * Generate distinct colors for detection boxes
 */
function generatePalette(count: number): string[] {
  const base = [
    "#42F5B0", // mint
    "#FF5F15", // orange-neon
    "#B8A9E8", // lavender
    "#E63946", // crimson
    "#00D4AA", // teal-accent
    "#FFB800", // gold
    "#FF6B9D", // pink
    "#00B4D8", // sky
    "#9B5DE5", // purple
    "#F15BB5", // magenta
  ];

  const colors: string[] = [];
  for (let i = 0; i < Math.max(count, 1); i++) {
    colors.push(base[i % base.length]);
  }
  return colors;
}

/**
 * Get summary statistics from detections
 */
export function summarizeDetections(detections: Detection[]): {
  classCounts: Record<string, number>;
  totalCount: number;
  avgConfidence: number;
  uniqueClasses: string[];
} {
  const classCounts: Record<string, number> = {};
  let totalConfidence = 0;

  for (const det of detections) {
    classCounts[det.class] = (classCounts[det.class] || 0) + 1;
    totalConfidence += det.score;
  }

  return {
    classCounts,
    totalCount: detections.length,
    avgConfidence: detections.length > 0 ? totalConfidence / detections.length : 0,
    uniqueClasses: Object.keys(classCounts),
  };
}
