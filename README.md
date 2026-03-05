<div align="center">

  <h1>ORAMA.vision</h1>

  <p><strong>Modular Digital Image Processing Web Application</strong></p>

  <p>12 interactive modules — 100% client-side — zero backend — neo-brutalist UI</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.3-61dafb?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-Academic-green)]()

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Modules](#modules)
  - [1. Steganography + Watermarking](#1-steganography--watermarking)
  - [2. Smart Agriculture AI](#2-smart-agriculture-ai)
  - [3. OCR Text Recognition](#3-ocr-text-recognition)
  - [4. Enhancement Advisor](#4-enhancement-advisor)
  - [5. Image Forensics](#5-image-forensics)
  - [6. Histogram & Equalization](#6-histogram--equalization)
  - [7. Color Space Converter](#7-color-space-converter)
  - [8. Edge Detection](#8-edge-detection)
  - [9. Convolution Filters](#9-convolution-filters)
  - [10. Morphological Operations](#10-morphological-operations)
  - [11. FFT & Frequency Domain](#11-fft--frequency-domain)
  - [12. Geometric Transforms](#12-geometric-transforms)
- [Architecture](#architecture)
- [Features](#features)
- [CPMK Coverage](#cpmk-coverage)
- [Getting Started](#getting-started)
- [Author](#author)

---

## Overview

**ORAMA.vision** is a modular Digital Image Processing web application built with **Next.js 16**, **React 19**, **TypeScript 5**, and **Tailwind CSS v4**. All processing runs entirely **client-side** — no images are ever uploaded to any server, no backend is required.

The application features a **neo-brutalist** UI design and implements 12 fully interactive modules covering steganography, computer vision, image enhancement, forensic analysis, frequency-domain processing, geometric transforms, and more. Each module is self-contained with its own processing library, React hooks, and UI components.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | App Router, static generation |
| **React** | 19.2.3 | UI components, hooks, context |
| **TypeScript** | 5 | Strict type-safety across all modules |
| **Tailwind CSS** | v4 | Neo-brutalist utility classes |
| **TensorFlow.js + COCO-SSD** | — | Object detection (Agriculture AI module only) |
| **Tesseract.js** | — | Optical character recognition (OCR module only) |

> All other image processing algorithms are implemented in **pure TypeScript** with the Canvas API — no external image processing libraries.

---

## Modules

### 1. Steganography + Watermarking

**Route:** `/steganography`

- **LSB (Least Significant Bit) encoding/decoding** — hide and extract secret text messages within image pixels
- **Chi-square stego detection** with probability analysis
- **Visible watermark** — alpha blending with configurable positions (center, tiled, bottom-right)
- **Invisible watermark** — spread-spectrum LSB embedding with PRNG
- **Watermark extraction**

---

### 2. Smart Agriculture AI

**Route:** `/agriculture`

- **TensorFlow.js COCO-SSD** object detection (80 classes)
- **Connected Component Labeling (CCL)** object counting with Union-Find
- **Hough Circle Transform** coin/circular object detection
- **Template Matching** (NCC — Normalized Cross-Correlation)

---

### 3. OCR Text Recognition

**Route:** `/document-scanner`

- **Tesseract.js** optical character recognition
- Multi-language support (English, Indonesian, etc.)
- Word-level detection with confidence scoring
- Copy / download extracted text

---

### 4. Enhancement Advisor

**Route:** `/enhancement`

- Image quality metrics: brightness, contrast, saturation, sharpness
- Intelligent enhancement suggestions with severity levels
- Auto-apply all recommended enhancements
- Luminance histogram visualization

---

### 5. Image Forensics

**Route:** `/forensics`

- **Error Level Analysis (ELA)** — re-compression difference heatmap
- **Blur / Sharpness Map** — per-block Laplacian variance
- **Noise Pattern Analysis** — high-frequency residual uniformity across quadrants
- **EXIF metadata extraction** — camera info, exposure, GPS, dimensions

---

### 6. Histogram & Equalization

**Route:** `/histogram`

- RGB + Luminance histogram visualization (256-bin)
- Histogram equalization for contrast enhancement
- Per-channel analysis

---

### 7. Color Space Converter

**Route:** `/color-space`

- **Grayscale, Sepia, Binary, Inverted**
- **HSL components** — Hue, Saturation, Lightness maps
- **Individual RGB channels**
- **CMYK composite** + individual C / M / Y / K channels

---

### 8. Edge Detection

**Route:** `/edge-detection`

- **Sobel, Prewitt, Laplacian, Roberts Cross** operators
- **Harris Corner Detection:**

$$R = \det(M) - k \cdot \text{trace}(M)^2$$

- **Canny Edge Detection:** Gaussian blur → Sobel gradients → Non-maximum suppression → Double threshold → Hysteresis
- Inversion toggle

---

### 9. Convolution Filters

**Route:** `/filters`

- **Presets:** Blur, Sharpen, Emboss, Edge Enhance
- **Median Filter** — sorting-based, configurable iterations
- **Custom 3×3 kernel editor** with live preview
- Iterative application for stronger effects

---

### 10. Morphological Operations

**Route:** `/morphology`

- **Erosion, Dilation, Opening, Closing**
- **Morphological Gradient, Top-Hat, Black-Hat**
- **Region Growing** — seed at center, 8-connectivity, similarity threshold
- Configurable structuring elements: **Square, Cross, Circle**

---

### 11. FFT & Frequency Domain

**Route:** `/fft`

- **2-D Fast Fourier Transform** (Cooley-Tukey radix-2)
- Log-magnitude spectrum visualization with DC centering
- **Frequency filters:** Ideal Low-pass, High-pass, Band-pass
- Filter mask visualization + inverse FFT reconstruction

DFT formula:

$$X(k) = \sum_{n=0}^{N-1} x(n)\, e^{-j2\pi kn/N}$$

---

### 12. Geometric Transforms

**Route:** `/transforms`

- **Resize** with nearest-neighbor / bilinear interpolation
- **Rotate** — arbitrary angle, auto-expand canvas
- **Flip** — horizontal / vertical / both
- **Crop, Shear, Translate**

Rotation matrix:

$$\begin{bmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{bmatrix}$$

---

## Architecture

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Home page with 12 module cards
│   ├── steganography/         # Steganography + Watermark
│   ├── agriculture/           # Agriculture AI
│   ├── document-scanner/      # OCR
│   ├── enhancement/           # Enhancement Advisor
│   ├── forensics/             # Image Forensics
│   ├── histogram/             # Histogram & Equalization
│   ├── color-space/           # Color Space Converter
│   ├── edge-detection/        # Edge Detection
│   ├── filters/               # Convolution Filters
│   ├── morphology/            # Morphological Operations
│   ├── fft/                   # FFT & Frequency Domain
│   └── transforms/            # Geometric Transforms
├── features/                   # Feature modules (lib / hooks / ui)
│   ├── steganography/
│   ├── agriculture/
│   ├── document-scanner/
│   ├── enhancement/
│   ├── forensics/
│   ├── histogram/
│   ├── color-space/
│   ├── edge-detection/
│   ├── filters/
│   ├── morphology/
│   ├── fft/
│   └── transforms/
└── shared/
    ├── components/            # Shared UI (Navbar, FileUpload, etc.)
    └── i18n/                  # EN / ID translations
```

Each feature module follows a consistent structure:

| Layer | Purpose |
|---|---|
| `lib/` | Pure processing functions — `ImageData` in, results out |
| `hooks/` | React hooks bridging UI and lib, managing async state |
| `ui/` | Panel components with controls and result display |

---

## Features

- **i18n** — English + Indonesian (Bahasa) with runtime switching
- **URL and example image loading** — drag & drop, URL fetch, curated sample images
- **Neo-brutalist design** — bold typography, harsh shadows, Dark Teal + Neon Orange palette
- **Responsive** — desktop + mobile with categorized navigation
- **Downloadable results** — output filenames follow `{feature}_{timestamp}.png`

---

## CPMK Coverage

| CPMK | Scope | Coverage |
|---|---|---|
| **CPMK1** | Image Processing Theory | FFT, frequency filters, convolution, histogram equalization, color spaces (RGB, HSL, CMYK), morphology, edge detection (Sobel, Prewitt, Laplacian, Roberts, Harris, Canny), median filter, region growing, template matching |
| **CPMK2** | Implementation | All algorithms implemented in pure TypeScript with Canvas API — no external image processing libraries |
| **CPMK3** | Application | 12 real-world modules with neo-brutalist UI, responsive design, i18n, TensorFlow.js AI |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Author

**FIRDAUS SATRIO UTOMO** — Digital Image Processing 2026