import type { TranslationKeys } from "./en";

const id: TranslationKeys = {
  /* ── Navbar ─────────────────────────────────────── */
  nav: {
    stegano: "Stegano",
    agriAi: "Agri AI",
    docScan: "OCR",
    enhance: "Enhance",
    forensics: "Forensik",
    histogram: "Histogram",
    colorSpace: "Warna",
    edgeDetect: "Tepi",
    filters: "Filter",
    morphology: "Morfo",
    fft: "FFT",
    transforms: "Transformasi",
    toggleMenu: "Buka/tutup menu navigasi",
    groupTools: "Alat",
    groupProcessing: "Pemrosesan",
    steganoDesc: "Sembunyikan pesan di gambar",
    agriAiDesc: "Deteksi tanaman & penghitungan",
    docScanDesc: "Pengenalan teks OCR",
    enhanceDesc: "Peningkatan gambar otomatis",
    forensicsDesc: "Deteksi manipulasi gambar",
    histogramDesc: "Analisis distribusi warna",
    colorSpaceDesc: "Konversi mode warna",
    edgeDetectDesc: "Sobel, Prewitt & lainnya",
    filtersDesc: "Blur, sharpen, emboss",
    morphologyDesc: "Erosi, dilasi & lainnya",
    fftDesc: "Spektrum FFT & filter frekuensi",
    transformsDesc: "Ubah ukuran, putar, balik, potong",
  },

  /* ── Landing / Home ─────────────────────────────── */
  home: {
    badge: "Pengolahan Citra Digital — 2026",
    heroDesc:
      "Hub pemrosesan citra modular menggunakan <accent>AI sisi-klien</accent> — tanpa server. Dua belas alat canggih dalam satu antarmuka brutalis.",
    tagBrowser: "▸ 100% Diproses di Browser",
    tagTFjs: "▸ TensorFlow.js AI",
    tagZero: "▸ Tanpa Biaya Backend",
    marquee:
      "STEGANOGRAFI ◆ PERTANIAN AI ◆ OCR PENGENALAN TEKS ◆ PENINGKATAN ◆ FORENSIK ◆ HISTOGRAM ◆ RUANG WARNA ◆ DETEKSI TEPI ◆ FILTER ◆ MORFOLOGI ◆ SPEKTRUM FFT ◆ TRANSFORMASI ◆ ",
    modulesHeading: "Modul",

    /* tech stack */
    techNextjs: "Next.js",
    techNextjsDesc: "App Router",
    techTailwind: "Tailwind CSS",
    techTailwindDesc: "Neobrutalism",
    techTFjs: "TensorFlow.js",
    techTFjsDesc: "AI di Browser",
    techCanvas: "Canvas API",
    techCanvasDesc: "Pemrosesan Piksel",
  },

  /* ── Module cards ───────────────────────────────── */
  modules: {
    steganoTitle: "Steganografi + Deteksi",
    steganoDesc:
      "Sembunyikan pesan rahasia di dalam gambar menggunakan encoding LSB. Dekode data tersembunyi, deteksi manipulasi steganografi, dan terapkan watermark terlihat/tak terlihat.",
    agriTitle: "Pertanian Cerdas AI",
    agriDesc:
      "Deteksi objek berbasis AI dengan TensorFlow.js COCO-SSD, pelabelan komponen terhubung, dan deteksi lingkaran Hough — semua di browser.",
    docScanTitle: "OCR Pengenalan Teks",
    docScanDesc:
      "Ekstrak teks dari gambar menggunakan mesin OCR Tesseract.js dengan dukungan multi-bahasa, deteksi level kata, dan skor kepercayaan.",
    enhanceTitle: "Penasihat Peningkatan",
    enhanceDesc:
      "Analisis gambar cerdas yang mengevaluasi kecerahan, kontras, dan saturasi — lalu menyarankan dan menerapkan peningkatan optimal.",
    forensicsTitle: "Forensik Gambar",
    forensicsDesc:
      "Toolkit forensik mini: Error Level Analysis (ELA), deteksi blur via Variance of Laplacian, analisis pola noise, dan ekstraksi EXIF.",
    histogramTitle: "Histogram & Ekualisasi",
    histogramDesc:
      "Visualisasikan histogram RGB dan luminansi dari gambar. Terapkan ekualisasi histogram untuk meningkatkan kontras dan distribusi tonal.",
    colorSpaceTitle: "Konverter Ruang Warna",
    colorSpaceDesc:
      "Konversi gambar antar representasi warna — grayscale, sepia, biner, inversi, CMYK, kanal individual, dan peta komponen HSL.",
    edgeDetectTitle: "Deteksi Tepi",
    edgeDetectDesc:
      "Deteksi tepi menggunakan operator klasik: Sobel, Prewitt, Laplacian, Roberts Cross, Harris Corner, dan detektor multi-tahap Canny.",
    filtersTitle: "Filter Konvolusi",
    filtersDesc:
      "Terapkan kernel konvolusi — blur, sharpen, emboss, edge enhance, filter median — atau definisikan kernel kustom 3×3 dengan pratinjau langsung.",
    morphologyTitle: "Operasi Morfologi",
    morphologyDesc:
      "Operasi morfologi biner: erosi, dilasi, opening, closing, gradient, top-hat, black-hat, dan region growing dengan elemen struktural yang dapat disesuaikan.",
    fftTitle: "FFT & Domain Frekuensi",
    fftDesc:
      "Hitung Fast Fourier Transform 2-D, visualisasi spektrum magnitudo, dan terapkan filter domain frekuensi: ideal low-pass, high-pass, dan band-pass.",
    transformsTitle: "Transformasi Geometri",
    transformsDesc:
      "Terapkan transformasi geometri — ubah ukuran, putar, balik, potong, geser, dan translasi — dengan interpolasi nearest-neighbor atau bilinear.",
    launchModule: "Buka Modul →",
  },

  /* ── Footer ─────────────────────────────────────── */
  footer: {
    credit: "ORAMA vision oleh FIRDAUS SATRIO UTOMO",
    copyright: "Pengolahan Citra Digital © 2026",
  },

  /* ── Shared Components ──────────────────────────── */
  fileUpload: {
    dropLabel: "Letakkan gambar di sini",
    dropSublabel: "atau klik untuk menelusuri file",
    browseFiles: "Telusuri File",
    urlLabel: "Atau muat dari URL",
    urlPlaceholder: "https://example.com/gambar.jpg",
    urlLoad: "Muat",
    urlError: "Gagal memuat gambar. Periksa URL atau coba yang lain.",
    sampleLabel: "Atau coba gambar sampel",
    exampleLabel: "Gunakan gambar contoh",
  },
  resultDisplay: {
    waiting: "MENUNGGU",
    processing: "MEMPROSES",
    complete: "SELESAI",
    error: "KESALAHAN",
    save: "Simpan",
  },

  /* ── Steganography ──────────────────────────────── */
  steg: {
    pageTitle: "Steganografi",
    pageSubtitle: "Sembunyikan & deteksi pesan rahasia di gambar menggunakan encoding LSB",
    tabEncode: "Enkode",
    tabDecode: "Dekode",
    tabDetect: "Deteksi",
    /* Encode panel */
    uploadCarrier: "Unggah gambar pembawa",
    uploadCarrierHint: "PNG disarankan untuk encoding lossless",
    capacity: "KAPASITAS",
    characters: "karakter",
    placeholder: "Masukkan pesan rahasia Anda...",
    encoding: "Mengenkode...",
    encodeBtn: "Enkode",
    encodedOutput: "Output Terenkode",
    encodedPlaceholder: "Gambar terenkode akan muncul di sini",
    /* Decode panel */
    uploadStego: "Unggah gambar steganografi",
    uploadStegoHint: "Gambar yang mungkin berisi pesan tersembunyi",
    decodedMessage: "Pesan Terdekode",
    extractedMsg: "PESAN DIEKSTRAKSI:",
    decodedPlaceholder: "Pesan tersembunyi akan muncul di sini",
    /* Detect panel */
    uploadAnalyze: "Unggah gambar untuk dianalisis",
    uploadAnalyzeHint: "Deteksi apakah gambar berisi data steganografi tersembunyi",
    detectionResult: "Hasil Deteksi",
    stegoProb: "Probabilitas Stego",
    analysis: "ANALISIS:",
    analysisPlaceholder: "Hasil analisis akan muncul di sini",
    /* Watermark panel */
    tabWatermark: "Watermark",
    wmVisible: "Terlihat",
    wmInvisible: "Tak Terlihat",
    wmExtract: "Ekstrak",
    wmUpload: "Unggah gambar untuk watermark",
    wmUploadHint: "PNG disarankan untuk encoding watermark lossless",
    wmTextPlaceholder: "Masukkan teks watermark...",
    wmSigPlaceholder: "Masukkan tanda tangan rahasia...",
    wmOpacity: "Opasitas",
    wmPosition: "Posisi",
    wmApplying: "Menerapkan watermark...",
    wmApply: "Terapkan Watermark",
    wmResult: "Hasil Watermark",
    wmExtracted: "WATERMARK DIEKSTRAKSI:",
    wmPlaceholder: "Hasil watermark akan muncul di sini",
  },

  /* ── Agriculture ────────────────────────────────── */
  agri: {
    pageTitle: "Pertanian Cerdas AI",
    pageSubtitle:
      "Penghitungan objek, deteksi koin & pengukuran — semua di browser",
    tabCount: "Penghitung Objek",
    tabCoin: "Deteksi Koin",
    tabAI: "Deteksi AI",
    aiModelConfig: "Konfigurasi Model AI",
    modelLoaded: "SIAP",
    modelNotLoaded: "BELUM DIMUAT",
    preloadModel: "Muat Model",
    confidenceThreshold: "Kepercayaan",
    aiModelDesc: "Model COCO-SSD mendeteksi 80 kelas objek (orang, mobil, anjing, kucing, dll.) menggunakan backbone MobileNet v2. Model mengunduh ~5MB pada penggunaan pertama.",
    uploadAI: "Unggah gambar untuk deteksi AI",
    uploadAIHint: "Mendeteksi orang, hewan, kendaraan, furnitur & lainnya",
    detectAIBtn: "Deteksi Objek",
    loadingModel: "Memuat model...",
    aiDetectionResult: "Hasil Deteksi AI",
    classesFound: "Kelas",
    inferenceTime: "Inferensi",
    detectedClasses: "Kelas Terdeteksi",
    allDetections: "Semua Deteksi",
    aiPlaceholder: "Hasil deteksi AI akan muncul di sini",
    /* Counting */
    parameters: "Parameter",
    threshold: "Ambang Batas",
    minArea: "Area Minimum",
    uploadCount: "Unggah gambar untuk menghitung objek",
    uploadCountHint: "Terbaik dengan gambar kontras tinggi",
    counting: "Menghitung...",
    countBtn: "Hitung Objek",
    countResult: "Hasil Penghitungan",
    objectsFound: "Objek Ditemukan",
    countPlaceholder: "Hasil akan muncul di sini",
    /* Coin */
    circleParams: "Parameter Deteksi Lingkaran",
    minRadius: "Radius Minimum",
    maxRadius: "Radius Maksimum",
    uploadCoin: "Unggah gambar koin",
    uploadCoinHint: "Tampilan atas yang jelas paling baik",
    detecting: "Mendeteksi...",
    detectBtn: "Deteksi Koin",
    coinDetection: "Deteksi Koin",
    coinsDetected: "Koin Terdeteksi",
    coinPlaceholder: "Hasil deteksi koin di sini",
  },

  /* ── Document Scanner / OCR ──────────────────────── */
  docScan: {
    pageTitle: "OCR — Pengenalan Teks",
    pageSubtitle:
      "Ekstrak teks dari gambar menggunakan pengenalan karakter optik Tesseract.js",
    uploadDoc: "Unggah gambar dokumen",
    uploadDocHint: "Terbaik dengan teks yang jelas dan kontras tinggi",
    selectLang: "Bahasa Pengenalan",
    recognizing: "Mengenali teks…",
    recognizeBtn: "Kenali Teks",
    extractedText: "Teks Terekstrak",
    confidence: "Kepercayaan",
    wordCount: "Kata",
    copyText: "Salin Teks",
    downloadTxt: "Unduh .txt",
    ocrPlaceholder: "Hasil OCR akan muncul di sini",
    progress: "Waktu",
  },

  /* ── Enhancement Advisor ────────────────────────── */
  enhance: {
    pageTitle: "Penasihat Peningkatan",
    pageSubtitle: "Analisis gambar cerdas dengan saran peningkatan otomatis",
    uploadAnalysis: "Unggah gambar untuk analisis",
    uploadAnalysisHint: "Kami akan menganalisis kualitas & menyarankan peningkatan",
    imageMetrics: "Metrik Gambar",
    brightness: "Kecerahan",
    contrast: "Kontras",
    saturation: "Saturasi",
    sharpness: "Ketajaman",
    dominant: "Dominan",
    luminanceHistogram: "Histogram Luminansi",
    suggestions: "Saran",
    applyAll: "Terapkan Semua",
    applied: "✓ Diterapkan",
    applyAction: "Terapkan",
    enhancedPreview: "Pratinjau Ditingkatkan",
    previewPlaceholder: "Terapkan saran untuk melihat pratinjau",
  },

  /* ── Forensics ──────────────────────────────────── */
  forensics: {
    pageTitle: "Penganalisis Noise & Blur",
    pageSubtitle: "Forensik Gambar Mini — ELA · Peta Blur · Pola Noise · EXIF",
    uploadForensic: "Unggah gambar untuk analisis forensik",
    uploadForensicHint:
      "JPEG disarankan untuk ELA — PNG / WebP juga didukung",
    running: "Menjalankan rangkaian forensik …",
    tryAgain: "Coba Lagi",
    originalImage: "Gambar Asli",
    uploadDifferent: "← Unggah gambar lain",
    /* ELA */
    elaTitle: "Error Level Analysis (ELA)",
    elaDesc:
      "Mengompresi ulang gambar sebagai JPEG dan menyoroti area yang berbeda secara signifikan — area terang mungkin menunjukkan pengeditan atau penyambungan.",
    elaQuality: "Kualitas",
    elaAmplification: "Amplifikasi",
    rerunEla: "Jalankan Ulang ELA",
    maxDelta: "Max Δ",
    avgDelta: "Avg Δ",
    suspicious: "Mencurigakan",
    elaHigh: "⚠ Residu ELA tinggi terdeteksi — kemungkinan manipulasi",
    elaMod: "Residu moderat — periksa area terang",
    elaLow: "✓ Residu rendah — gambar tampak konsisten",
    /* Blur */
    blurTitle: "Peta Blur & Ketajaman",
    blurDesc:
      "Menampilkan varians Laplacian per-blok. <red>Merah</red> = blur, <blue>Biru</blue> = tajam. Berguna untuk mendeteksi area yang diblur secara selektif.",
    blockSize: "Ukuran Blok",
    rerunBlur: "Jalankan Ulang Peta Blur",
    variance: "Varians",
    blurry: "Blur",
    verdictBlurry: "Gambar blur",
    verdictSharp: "Gambar tajam",
    verdict: "Kesimpulan",
    /* Noise */
    noiseTitle: "Analisis Pola Noise",
    noiseDesc:
      "Mengekstraksi residu frekuensi tinggi dan mengukur seberapa seragam distribusi noise-nya. Area yang disambung sering memiliki profil noise yang berbeda.",
    noiseLevel: "Level Noise",
    uniformity: "Keseragaman",
    /* EXIF */
    metaTitle: "Metadata File & EXIF",
    field: "Bidang",
    value: "Nilai",
  },

  /* ── Language switcher ──────────────────────────── */

  /* ── Histogram ──────────────────────────────────── */
  histogram: {
    pageTitle: "Histogram & Ekualisasi",
    pageSubtitle: "Visualisasikan distribusi warna dan ekualisasi kontras gambar",
    uploadLabel: "Unggah gambar untuk analisis histogram",
    uploadHint: "Mendukung PNG, JPEG, WebP",
    resultTitle: "Analisis Histogram",
    computing: "Menghitung histogram…",
    channelLabel: "Kanal",
    channelAll: "Semua",
    channelRed: "Merah",
    channelGreen: "Hijau",
    channelBlue: "Biru",
    channelLum: "Luminansi",
    originalHist: "Histogram Asli",
    equalizedHist: "Histogram Terekualisasi",
    originalImage: "Gambar asli",
    equalizedImage: "Gambar terekualisasi",
  },

  /* ── Color Space ────────────────────────────────── */
  colorSpace: {
    pageTitle: "Konverter Ruang Warna",
    pageSubtitle: "Konversi gambar antar representasi warna yang berbeda",
    uploadLabel: "Unggah gambar untuk dikonversi",
    uploadHint: "PNG, JPEG, atau WebP",
    resultTitle: "Konversi Warna",
    converting: "Mengonversi ruang warna…",
    modeLabel: "Mode Warna",
    threshold: "Ambang Batas",
    originalTitle: "Asli",
    outputTitle: "Terkonversi",
  },

  /* ── Edge Detection ─────────────────────────────── */
  edgeDetect: {
    pageTitle: "Deteksi Tepi",
    pageSubtitle: "Deteksi tepi menggunakan operator Sobel, Prewitt, Laplacian & Roberts",
    uploadLabel: "Unggah gambar untuk deteksi tepi",
    uploadHint: "Terbaik dengan bentuk dan kontur yang jelas",
    resultTitle: "Deteksi Tepi",
    detecting: "Mendeteksi tepi…",
    methodLabel: "Metode Deteksi",
    invertLabel: "Inversi",
    originalTitle: "Asli",
    outputTitle: "Tepi",
  },

  /* ── Convolution Filters ────────────────────────── */
  filters: {
    pageTitle: "Filter Konvolusi",
    pageSubtitle: "Terapkan blur, sharpen, emboss dan kernel konvolusi kustom 3×3",
    uploadLabel: "Unggah gambar untuk difilter",
    uploadHint: "PNG atau JPEG — gambar besar mungkin lebih lambat",
    resultTitle: "Hasil Filter",
    applying: "Menerapkan filter…",
    presetLabel: "Preset Filter",
    iterations: "Iterasi",
    kernelPreview: "Matriks Kernel",
    originalTitle: "Asli",
    outputTitle: "Terfilter",
  },

  /* ── Morphological Operations ───────────────────── */
  morphology: {
    pageTitle: "Operasi Morfologi",
    pageSubtitle: "Erosi, dilasi, opening, closing & lainnya pada gambar biner",
    uploadLabel: "Unggah gambar untuk morfologi",
    uploadHint: "Gambar akan dibinerisasi sebelum diproses",
    resultTitle: "Hasil Morfologi",
    processing: "Memproses morfologi…",
    opLabel: "Operasi",
    shapeLabel: "Elemen Struktural",
    kernelSize: "Ukuran Kernel",
    threshold: "Ambang Binarisasi",
    originalTitle: "Asli",
    binaryTitle: "Input Biner",
    outputTitle: "Hasil",
  },

  /* ── FFT & Domain Frekuensi ──────────────────────── */
  fft: {
    pageTitle: "FFT & Domain Frekuensi",
    pageSubtitle: "Hitung FFT 2-D, visualisasi spektrum & terapkan filter domain frekuensi",
    uploadLabel: "Unggah gambar untuk analisis FFT",
    uploadHint: "PNG atau JPEG — gambar akan di-padding ke pangkat 2",
    filterType: "Jenis Filter",
    cutoff: "Cutoff",
    bandwidth: "Lebar Pita",
    spectrum: "Spektrum Magnitudo FFT",
    filterMask: "Mask Filter",
    filteredResult: "Hasil Filter",
    applyFilter: "Terapkan Filter",
    analyzing: "Menghitung FFT…",
    placeholder: "Gambar Asli",
    lowpass: "Low-pass",
    highpass: "High-pass",
    bandpass: "Band-pass",
  },

  /* ── Transforms ─────────────────────────────────── */
  transforms: {
    pageTitle: "Transformasi Geometri",
    pageSubtitle: "Ubah ukuran, putar, balik, potong, geser & translasi gambar",
    uploadLabel: "Unggah gambar untuk transformasi",
    uploadHint: "PNG atau JPEG — terapkan transformasi geometri",
    transformType: "Jenis Transformasi",
    interpolation: "Interpolasi",
    angle: "Sudut",
    scaleX: "Skala X",
    scaleY: "Skala Y",
    flipDir: "Arah Cermin",
    horizontal: "Horizontal",
    vertical: "Vertikal",
    both: "Keduanya",
    crop: "Potong",
    shear: "Geser",
    translate: "Translasi",
    apply: "Terapkan Transformasi",
    processing: "Menerapkan transformasi…",
    placeholder: "Gambar Asli",
    nearest: "Nearest",
    bilinear: "Bilinear",
    resize: "Ubah Ukuran",
    rotate: "Putar",
    flip: "Balik",
    shearLabel: "Geser",
    translateLabel: "Translasi",
    cropX: "X",
    cropY: "Y",
    cropW: "Lebar",
    cropH: "Tinggi",
  },

  lang: {
    label: "ID",
    switchTo: "Ganti ke Bahasa Inggris",
  },
} as const;

export default id;
