const en = {
  /* ── Navbar ─────────────────────────────────────── */
  nav: {
    stegano: "Stegano",
    agriAi: "Agri AI",
    docScan: "DocScan",
    enhance: "Enhance",
    forensics: "Forensics",
    histogram: "Histogram",
    colorSpace: "Colors",
    edgeDetect: "Edges",
    filters: "Filters",
    morphology: "Morph",
    toggleMenu: "Toggle navigation menu",
    groupTools: "Tools",
    groupProcessing: "Processing",
    steganoDesc: "Hide messages in images",
    agriAiDesc: "Plant detection & counting",
    docScanDesc: "Scan & correct documents",
    enhanceDesc: "Auto image enhancement",
    forensicsDesc: "Detect image manipulation",
    histogramDesc: "Color distribution analysis",
    colorSpaceDesc: "Convert color modes",
    edgeDetectDesc: "Sobel, Prewitt & more",
    filtersDesc: "Blur, sharpen, emboss",
    morphologyDesc: "Erosion, dilation & more",
  },

  /* ── Landing / Home ─────────────────────────────── */
  home: {
    badge: "Digital Image Processing — 2026",
    heroDesc:
      "Modular image processing hub running <accent>client-side AI</accent> — no server needed. Ten powerful tools in one brutalist interface.",
    tagBrowser: "▸ 100% Browser Processing",
    tagTFjs: "▸ TensorFlow.js AI",
    tagZero: "▸ Zero Backend Cost",
    marquee:
      "STEGANOGRAPHY ◆ AGRICULTURE AI ◆ DOCUMENT SCANNER ◆ ENHANCEMENT ◆ FORENSICS ◆ HISTOGRAM ◆ COLOR SPACE ◆ EDGE DETECTION ◆ FILTERS ◆ MORPHOLOGY ◆ ",
    modulesHeading: "Modules",

    /* tech stack */
    techNextjs: "Next.js",
    techNextjsDesc: "App Router",
    techTailwind: "Tailwind CSS",
    techTailwindDesc: "Neobrutalism",
    techTFjs: "TensorFlow.js",
    techTFjsDesc: "Browser AI",
    techCanvas: "Canvas API",
    techCanvasDesc: "Pixel Processing",
  },

  /* ── Module cards ───────────────────────────────── */
  modules: {
    steganoTitle: "Steganography + Detection",
    steganoDesc:
      "Hide secret messages inside images using LSB encoding. Decode hidden data and detect steganographic manipulation with chi-square analysis.",
    agriTitle: "Smart Agriculture AI",
    agriDesc:
      "AI-powered object detection with TensorFlow.js COCO-SSD, connected component labeling, and Hough circle detection — all in-browser.",
    docScanTitle: "Smart Document Scanner",
    docScanDesc:
      "Auto-detect document edges with Canny edge detection, apply perspective correction via DLT homography, and produce clean scanned output.",
    enhanceTitle: "Enhancement Advisor",
    enhanceDesc:
      "Intelligent image analysis that evaluates brightness, contrast, and saturation — then suggests and applies optimal enhancements.",
    forensicsTitle: "Image Forensics",
    forensicsDesc:
      "Mini forensics toolkit: Error Level Analysis (ELA), blur detection via Variance of Laplacian, noise pattern analysis, and EXIF extraction.",
    histogramTitle: "Histogram & Equalization",
    histogramDesc:
      "Visualize RGB and luminance histograms of any image. Apply histogram equalization to improve contrast and tonal distribution.",
    colorSpaceTitle: "Color Space Converter",
    colorSpaceDesc:
      "Convert images between color representations — grayscale, sepia, binary, inverted, individual channels, and HSL component maps.",
    edgeDetectTitle: "Edge Detection",
    edgeDetectDesc:
      "Detect edges using classic operators: Sobel, Prewitt, Laplacian, and Roberts Cross. Compare methods and toggle inversion.",
    filtersTitle: "Convolution Filters",
    filtersDesc:
      "Apply convolution kernels — blur, sharpen, emboss, edge enhance — or define your own custom 3×3 kernel with live preview.",
    morphologyTitle: "Morphological Ops",
    morphologyDesc:
      "Binary morphology operations: erosion, dilation, opening, closing, gradient, top-hat, and black-hat with adjustable structuring elements.",
    launchModule: "Launch Module →",
  },

  /* ── Footer ─────────────────────────────────────── */
  footer: {
    credit: "ORAMA vision by FIRDAUS SATRIO UTOMO",
    copyright: "Digital Image Processing © 2026",
  },

  /* ── Shared Components ──────────────────────────── */
  fileUpload: {
    dropLabel: "Drop your image here",
    dropSublabel: "or click to browse files",
    browseFiles: "Browse Files",
    urlLabel: "Or load from URL",
    urlPlaceholder: "https://example.com/image.jpg",
    urlLoad: "Load",
    urlError: "Failed to load image. Check the URL or try another.",
    sampleLabel: "Or try a sample image",
    exampleLabel: "Use an example image",
  },
  resultDisplay: {
    waiting: "WAITING",
    processing: "PROCESSING",
    complete: "COMPLETE",
    error: "ERROR",
    save: "Save",
  },

  /* ── Steganography ──────────────────────────────── */
  steg: {
    pageTitle: "Steganography",
    pageSubtitle: "Hide & detect secret messages in images using LSB encoding",
    tabEncode: "Encode",
    tabDecode: "Decode",
    tabDetect: "Detect",
    /* Encode panel */
    uploadCarrier: "Upload carrier image",
    uploadCarrierHint: "PNG recommended for lossless encoding",
    capacity: "CAPACITY",
    characters: "characters",
    placeholder: "Enter your secret message...",
    encoding: "Encoding...",
    encodeBtn: "Encode",
    encodedOutput: "Encoded Output",
    encodedPlaceholder: "Encoded image will appear here",
    /* Decode panel */
    uploadStego: "Upload steganographic image",
    uploadStegoHint: "Image that may contain a hidden message",
    decodedMessage: "Decoded Message",
    extractedMsg: "EXTRACTED MESSAGE:",
    decodedPlaceholder: "Hidden message will appear here",
    /* Detect panel */
    uploadAnalyze: "Upload image to analyze",
    uploadAnalyzeHint: "Detect if image contains hidden steganographic data",
    detectionResult: "Detection Result",
    stegoProb: "Stego Probability",
    analysis: "ANALYSIS:",
    analysisPlaceholder: "Analysis results will appear here",
  },

  /* ── Agriculture ────────────────────────────────── */
  agri: {
    pageTitle: "Smart Agriculture AI",
    pageSubtitle:
      "Object counting, coin detection & measurement — all in-browser",
    tabCount: "Object Counter",
    tabCoin: "Coin Detection",
    tabAI: "AI Detection",
    aiModelConfig: "AI Model Configuration",
    modelLoaded: "READY",
    modelNotLoaded: "NOT LOADED",
    preloadModel: "Pre-load",
    confidenceThreshold: "Confidence",
    aiModelDesc: "COCO-SSD model detects 80 object classes (person, car, dog, cat, etc.) using MobileNet v2 backbone. Model downloads ~5MB on first use.",
    uploadAI: "Upload image for AI detection",
    uploadAIHint: "Detects people, animals, vehicles, furniture & more",
    detectAIBtn: "Detect Objects",
    loadingModel: "Loading model...",
    aiDetectionResult: "AI Detection Result",
    classesFound: "Classes",
    inferenceTime: "Inference",
    detectedClasses: "Detected Classes",
    allDetections: "All Detections",
    aiPlaceholder: "AI detection results will appear here",
    /* Counting */
    parameters: "Parameters",
    threshold: "Threshold",
    minArea: "Min Area",
    uploadCount: "Upload image to count objects",
    uploadCountHint: "Best with high-contrast images",
    counting: "Counting...",
    countBtn: "Count Objects",
    countResult: "Counting Result",
    objectsFound: "Objects Found",
    countPlaceholder: "Results will appear here",
    /* Coin */
    circleParams: "Circle Detection Parameters",
    minRadius: "Min Radius",
    maxRadius: "Max Radius",
    uploadCoin: "Upload coin image",
    uploadCoinHint: "Clear top-down view works best",
    detecting: "Detecting...",
    detectBtn: "Detect Coins",
    coinDetection: "Coin Detection",
    coinsDetected: "Coins Detected",
    coinPlaceholder: "Coin detection results here",
  },

  /* ── Document Scanner ───────────────────────────── */
  docScan: {
    pageTitle: "Document Scanner",
    pageSubtitle:
      "Auto edge detection, perspective correction & document enhancement",
    uploadDoc: "Upload a document photo",
    uploadDocHint: "Works best with clear document edges visible",
    edgeDetection: "Edge Detection",
    detectedCorners: "DETECTED CORNERS:",
    edgePlaceholder: "Edge detection output",
    scannedDoc: "Scanned Document",
    enhanced: "✓ Enhanced",
    enhanceBtn: "Enhance (B&W)",
    scanPlaceholder: "Corrected document here",
  },

  /* ── Enhancement Advisor ────────────────────────── */
  enhance: {
    pageTitle: "Enhancement Advisor",
    pageSubtitle: "Intelligent image analysis with auto-enhancement suggestions",
    uploadAnalysis: "Upload image for analysis",
    uploadAnalysisHint: "We'll analyze quality & suggest enhancements",
    imageMetrics: "Image Metrics",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    sharpness: "Sharpness",
    dominant: "Dominant",
    luminanceHistogram: "Luminance Histogram",
    suggestions: "Suggestions",
    applyAll: "Apply All",
    applied: "✓ Applied",
    applyAction: "Apply",
    enhancedPreview: "Enhanced Preview",
    previewPlaceholder: "Apply suggestions to see preview",
  },

  /* ── Forensics ──────────────────────────────────── */
  forensics: {
    pageTitle: "Noise & Blur Analyzer",
    pageSubtitle: "Image Forensics Mini — ELA · Blur Map · Noise Pattern · EXIF",
    uploadForensic: "Upload image for forensic analysis",
    uploadForensicHint:
      "JPEG recommended for ELA — PNG / WebP also supported",
    running: "Running forensic suite …",
    tryAgain: "Try Again",
    originalImage: "Original Image",
    uploadDifferent: "← Upload a different image",
    /* ELA */
    elaTitle: "Error Level Analysis (ELA)",
    elaDesc:
      "Re-compresses the image as JPEG and highlights regions that differ significantly — bright areas may indicate edits or splicing.",
    elaQuality: "Quality",
    elaAmplification: "Amplification",
    rerunEla: "Re-run ELA",
    maxDelta: "Max Δ",
    avgDelta: "Avg Δ",
    suspicious: "Suspicious",
    elaHigh: "⚠ High ELA residuals detected — possible manipulation",
    elaMod: "Moderate residuals — inspect bright regions",
    elaLow: "✓ Low residuals — image appears consistent",
    /* Blur */
    blurTitle: "Blur & Sharpness Map",
    blurDesc:
      "Displays per-block Laplacian variance. <red>Red</red> = blurry, <blue>Blue</blue> = sharp. Useful to spot selectively blurred regions.",
    blockSize: "Block Size",
    rerunBlur: "Re-run Blur Map",
    variance: "Variance",
    blurry: "Blurry",
    verdictBlurry: "Image is blurry",
    verdictSharp: "Image is sharp",
    verdict: "Verdict",
    /* Noise */
    noiseTitle: "Noise Pattern Analysis",
    noiseDesc:
      "Extracts the high-frequency residual and measures how uniformly the noise is distributed. Spliced regions often have different noise profiles.",
    noiseLevel: "Noise Level",
    uniformity: "Uniformity",
    /* EXIF */
    metaTitle: "File Metadata & EXIF",
    field: "Field",
    value: "Value",
  },

  /* ── Language switcher ──────────────────────────── */

  /* ── Histogram ──────────────────────────────────── */
  histogram: {
    pageTitle: "Histogram & Equalization",
    pageSubtitle: "Visualize color distributions and equalize image contrast",
    uploadLabel: "Upload image for histogram analysis",
    uploadHint: "Supports PNG, JPEG, WebP",
    resultTitle: "Histogram Analysis",
    computing: "Computing histogram…",
    channelLabel: "Channel",
    channelAll: "All",
    channelRed: "Red",
    channelGreen: "Green",
    channelBlue: "Blue",
    channelLum: "Luminance",
    originalHist: "Original Histogram",
    equalizedHist: "Equalized Histogram",
    originalImage: "Original image",
    equalizedImage: "Equalized image",
  },

  /* ── Color Space ────────────────────────────────── */
  colorSpace: {
    pageTitle: "Color Space Converter",
    pageSubtitle: "Convert images between different color representations",
    uploadLabel: "Upload image to convert",
    uploadHint: "PNG, JPEG, or WebP",
    resultTitle: "Color Conversion",
    converting: "Converting color space…",
    modeLabel: "Color Mode",
    threshold: "Threshold",
    originalTitle: "Original",
    outputTitle: "Converted",
  },

  /* ── Edge Detection ─────────────────────────────── */
  edgeDetect: {
    pageTitle: "Edge Detection",
    pageSubtitle: "Detect edges using Sobel, Prewitt, Laplacian & Roberts operators",
    uploadLabel: "Upload image for edge detection",
    uploadHint: "Works best with clear shapes and contours",
    resultTitle: "Edge Detection",
    detecting: "Detecting edges…",
    methodLabel: "Detection Method",
    invertLabel: "Invert",
    originalTitle: "Original",
    outputTitle: "Edges",
  },

  /* ── Convolution Filters ────────────────────────── */
  filters: {
    pageTitle: "Convolution Filters",
    pageSubtitle: "Apply blur, sharpen, emboss and custom 3×3 convolution kernels",
    uploadLabel: "Upload image to filter",
    uploadHint: "PNG or JPEG — large images may be slower",
    resultTitle: "Filter Result",
    applying: "Applying filter…",
    presetLabel: "Filter Preset",
    iterations: "Iterations",
    kernelPreview: "Kernel Matrix",
    originalTitle: "Original",
    outputTitle: "Filtered",
  },

  /* ── Morphological Operations ───────────────────── */
  morphology: {
    pageTitle: "Morphological Operations",
    pageSubtitle: "Erosion, dilation, opening, closing & more on binary images",
    uploadLabel: "Upload image for morphology",
    uploadHint: "Image will be binarized before processing",
    resultTitle: "Morphology Result",
    processing: "Processing morphology…",
    opLabel: "Operation",
    shapeLabel: "Structuring Element",
    kernelSize: "Kernel Size",
    threshold: "Binarization Threshold",
    originalTitle: "Original",
    binaryTitle: "Binary Input",
    outputTitle: "Result",
  },

  lang: {
    label: "EN",
    switchTo: "Switch to Indonesian",
  },
} as const;

/* Recursively widen literal strings to `string` so other locales can differ */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type TranslationKeys = DeepStringify<typeof en>;
export default en;
