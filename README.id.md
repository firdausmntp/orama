> **[English version](README.md)** | Versi Bahasa Indonesia

<div align="center">
  <img src="public/logo.png" alt="ORAMA.vision Logo" width="180" height="180" />

  <h1>ORAMA.vision</h1>

  <p><strong>Hub Pemrosesan Citra Digital Modular</strong> — 100% sisi klien, tanpa backend.</p>

  <p>Aplikasi web bertema neo-brutalis untuk mempelajari dan bereksperimen dengan teknik pemrosesan citra digital.<br/>Dibangun dengan Next.js 16, React 19, TypeScript 5, dan Tailwind CSS v4.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
  [![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
  [![License](https://img.shields.io/badge/License-Academic-green)]()

</div>

---

## Daftar Isi

1. [Ringkasan](#ringkasan)
2. [Fitur Utama](#fitur-utama)
3. [Modul](#modul)
   - [1. Steganografi + Watermarking](#1-steganografi--watermarking)
   - [2. Pertanian Cerdas AI](#2-pertanian-cerdas-ai)
   - [3. OCR Pengenalan Teks](#3-ocr-pengenalan-teks)
   - [4. Penasihat Peningkatan Kualitas](#4-penasihat-peningkatan-kualitas)
   - [5. Forensik Citra](#5-forensik-citra)
   - [6. Histogram & Ekualisasi](#6-histogram--ekualisasi)
   - [7. Konverter Ruang Warna](#7-konverter-ruang-warna)
   - [8. Deteksi Tepi](#8-deteksi-tepi)
   - [9. Filter Konvolusi](#9-filter-konvolusi)
   - [10. Operasi Morfologi](#10-operasi-morfologi)
   - [11. FFT & Domain Frekuensi](#11-fft--domain-frekuensi)
   - [12. Transformasi Geometri](#12-transformasi-geometri)
4. [Teknologi](#teknologi)
5. [Arsitektur](#arsitektur)
6. [Cakupan CPMK](#cakupan-cpmk)
7. [Memulai](#memulai)
8. [Deployment](#deployment)
9. [Referensi Akademik](#referensi-akademik)
10. [Pembuat](#pembuat)

---

## Ringkasan

ORAMA.vision adalah platform pemrosesan citra digital berbasis browser yang komprehensif, dirancang untuk penggunaan edukatif maupun praktis. Seluruh pemrosesan dilakukan di **sisi klien** menggunakan HTML5 Canvas API dan TypeScript murni — tidak ada citra yang pernah diunggah ke server mana pun.

Aplikasi ini mengimplementasikan algoritma pemrosesan citra klasik dari literatur ilmiah peer-reviewed, mencakup steganografi, visi komputer, peningkatan citra, analisis forensik, morfologi matematis, domain frekuensi, dan transformasi geometri. Setiap modul bersifat mandiri sepenuhnya dengan pustaka pemrosesan, React hooks, dan komponen UI-nya sendiri.

---

## Sorotan UI & UX

- **Dukungan Dwibahasa (i18n):** Pergantian waktu-nyata antara Bahasa Inggris (EN) dan Bahasa Indonesia (ID)
- **Desain Neo-Brutalism:** Tipografi tebal, bayangan keras (`neo-shadow`), palet warna cerah (Dark Teal, Neon Orange, Bone)
- **Arsitektur Responsif:** Fungsional di perangkat desktop maupun seluler dengan navigasi berbasis kategori yang dapat dilipat
- **Seret & Lepas Cerdas:** Muat gambar melalui pemilih perangkat, pengambilan URL, atau 60+ gambar sampel acak

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **100% Pemrosesan di Browser** | Semua algoritma berjalan pada Canvas `ImageData` — sepenuhnya dapat berfungsi offline |
| **12 Modul Interaktif** | Steganografi, visi komputer, peningkatan, forensik, domain frekuensi & transformasi geometri |
| **UI Dwibahasa** | Inggris & Indonesia dengan pergantian waktu-nyata |
| **Pustaka Gambar Sampel** | 60+ gambar terkurasi dengan pilihan acak & pemuatan URL |
| **Unduhan Cerdas** | Nama file keluaran mengikuti konvensi `{feature}_{timestamp}.png` |
| **Desain Neo-Brutalis** | Tema Dark Teal + Neon Orange dengan batas tebal & bayangan |
| **Tata Letak Responsif** | Mobile-first dengan navigasi dropdown berkategori |
| **Arsitektur Berbasis Fitur** | Setiap modul terisolasi di bawah `src/features/` |
| **AI Terintegrasi** | TensorFlow.js COCO-SSD untuk deteksi objek, Tesseract.js untuk OCR |
| **Hasil Dapat Diunduh** | Semua hasil pemrosesan dapat disimpan sebagai file PNG |

---

## Modul

### 1. Steganografi + Watermarking

**Rute:** `/steganography`

Mengimplementasikan steganografi Least Significant Bit (LSB) untuk menyembunyikan pesan teks dalam citra, watermark terlihat & tak terlihat, serta detektor steganalisis chi-square.

#### Penyandian LSB (Penyisipan)

Penyandi mengganti bit paling tidak signifikan dari setiap byte RGB dengan satu bit pesan rahasia. Kanal alpha tidak diubah.

```
new_byte = (original_byte & 0xFE) | message_bit
```

Kapasitas penyisipan maksimum:

$$
C = \frac{W \times H \times 3}{8} - |\text{delimiter}|
$$

di mana $W$ dan $H$ adalah dimensi citra dalam piksel dan setiap karakter membutuhkan 8 bit.

#### Dekoding LSB

Dekoder membaca LSB dari setiap byte RGB, menyusun kembali karakter 8-bit, dan berhenti pada delimiter (`[END]`). Jika delimiter hilang atau rusak, hasilnya akan mengandung noise.

#### Deteksi Steganalisis Chi-Square

Penyisipan LSB cenderung **menyeragamkan** frekuensi kemunculan pasangan nilai piksel $(2v,\ 2v+1)$. Statistik chi-square mengukur penyimpangan ini:

$$
\chi^2 = \sum_{v=0}^{127} \frac{(O_{2v} - E_v)^2 + (O_{2v+1} - E_v)^2}{E_v}, \quad E_v = \frac{O_{2v} + O_{2v+1}}{2}
$$

Nilai-p diperkirakan melalui pendekatan normal:

$$
Z = \sqrt{2\chi^2} - \sqrt{2k - 1}
$$

di mana $k$ adalah derajat kebebasan (pasangan valid di mana $E_v \ge 5$). **Nilai-p tinggi** (chi-square rendah) menunjukkan distribusi pasangan yang mencurigakan seragam — ciri khas penyisipan LSB. Implementasi menggunakan pendekatan polinomial *Abramowitz & Stegun* untuk CDF normal.

#### Watermark Terlihat (Alpha Blending)

Menerapkan watermark terlihat pada citra dengan pencampuran alfa:

$$
O(x,y) = \alpha \cdot W(x,y) + (1 - \alpha) \cdot I(x,y)
$$

Posisi penempatan: **center** (pusat), **tiled** (berulang), atau **bottom-right** (pojok kanan bawah).

#### Watermark Tak Terlihat (Spread-Spectrum LSB)

Penyisipan watermark tak terlihat menggunakan teknik spread-spectrum pada bit LSB dengan PRNG (Pseudo-Random Number Generator) untuk menentukan lokasi penyisipan. Watermark tersebar secara acak di seluruh piksel citra sehingga tidak dapat dideteksi secara visual.

#### Ekstraksi Watermark

Mengekstrak watermark yang telah disisipkan sebelumnya dari citra menggunakan kunci PRNG yang sama untuk merekonstruksi pesan asli.

---

### 2. Pertanian Cerdas AI

**Rute:** `/agriculture`

Menyediakan empat alat untuk analisis citra pertanian: deteksi objek AI, penghitungan objek melalui pelabelan komponen terhubung, deteksi lingkaran melalui Transformasi Hough, dan template matching.

#### Deteksi Objek TensorFlow.js COCO-SSD

Memanfaatkan model COCO-SSD (MobileNet v2) melalui TensorFlow.js untuk deteksi objek real-time di browser. Mampu mendeteksi **80 kelas objek** termasuk orang, hewan, kendaraan, peralatan, dan makanan. Menampilkan kotak pembatas dengan label kelas dan skor kepercayaan.

#### Penghitungan Objek (Pelabelan Komponen Terhubung)

1. **Konversi skala abu-abu:** $Y = 0.299R + 0.587G + 0.114B$
2. **Thresholding biner** dengan pemetaan ambang batas yang dapat dikonfigurasi pengguna
3. **CCL dua-jalur** dengan Union-Find (kompresi jalur) untuk resolusi ekuivalensi
4. **Penyaringan area** — komponen noise di bawah `minArea` dibuang
5. **Visualisasi kotak pembatas** dengan overlay warna per-objek

#### Deteksi Lingkaran/Koin (Transformasi Hough Circle)

Mendeteksi dan menghitung objek lingkaran (koin, buah) serta menampilkan radius yang terdeteksi.

1. **Deteksi tepi Sobel** menghasilkan peta tepi biner dari skala abu-abu
2. **Voting akumulator Hough** — untuk setiap piksel tepi, kandidat radius $r$, dan sudut $\theta$ yang disampling:

$$
a = x - r\cos\theta, \quad b = y - r\sin\theta
$$

3. **Deteksi puncak dengan NMS** melokalisasi pusat lingkaran dan mencegah penghitungan ganda

#### Template Matching (NCC — Normalized Cross-Correlation)

Menemukan lokasi objek template dalam citra sumber menggunakan Normalized Cross-Correlation:

$$
\text{NCC}(x,y) = \frac{\sum_{i,j} \left(I(x+i,y+j) - \bar{I}\right)\left(T(i,j) - \bar{T}\right)}{\sqrt{\sum_{i,j}\left(I(x+i,y+j) - \bar{I}\right)^2 \cdot \sum_{i,j}\left(T(i,j) - \bar{T}\right)^2}}
$$

di mana $I$ adalah citra sumber, $T$ adalah template, dan $\bar{I}$, $\bar{T}$ adalah rata-rata lokal masing-masing. Nilai NCC mendekati 1 menunjukkan kecocokan tinggi.

---

### 3. OCR Pengenalan Teks

**Rute:** `/document-scanner`

Menjalankan pengenalan karakter optik (Optical Character Recognition) langsung di browser menggunakan Tesseract.js.

#### Fitur OCR

| Fitur | Deskripsi |
|-------|-----------|
| **Pengenalan Teks** | Ekstraksi teks dari gambar menggunakan mesin Tesseract.js |
| **Multi-Bahasa** | Dukungan berbagai bahasa pengenalan |
| **Deteksi Level Kata** | Setiap kata diidentifikasi beserta posisi dan skor kepercayaan |
| **Skor Kepercayaan** | Tingkat akurasi pengenalan untuk setiap kata yang terdeteksi |

#### Alur Pemrosesan OCR

1. **Pemuatan model Tesseract.js** — model bahasa diunduh dan di-cache di browser
2. **Pra-pemrosesan citra** — konversi ke format optimal untuk pengenalan
3. **Pengenalan karakter** — deteksi dan klasifikasi karakter per-kata
4. **Pasca-pemrosesan** — penyusunan hasil dengan koordinat bounding box dan skor kepercayaan

---

### 4. Penasihat Peningkatan Kualitas

**Rute:** `/enhancement`

Analisis kualitas citra cerdas yang mengevaluasi berbagai metrik dan menyarankan peningkatan optimal dengan fitur auto-apply.

#### Metrik Kualitas Citra

| Metrik | Metode |
|--------|--------|
| **Kecerahan** | Luminansi rata-rata: $\bar{L} = \frac{1}{N}\sum_{i=1}^{N} L_i$ |
| **Kontras** | Deviasi standar luminansi: $\sigma_L = \sqrt{\frac{1}{N}\sum(L_i - \bar{L})^2}$ |
| **Saturasi** | Saturasi HSL rata-rata di seluruh piksel |
| **Ketajaman** | Varians Laplacian menggunakan kernel $[0,1,0;\ 1,-4,1;\ 0,1,0]$ |
| **Warna Dominan** | Bucket hue paling sering dalam ruang HSL |

#### Rumus Peningkatan

| Peningkatan | Rumus |
|-------------|-------|
| **Kecerahan** | $O = \text{clamp}(I + \Delta b,\ 0,\ 255)$ |
| **Kontras** | $F = \frac{259(C+255)}{255(259-C)}$;   $O = F \cdot (I - 128) + 128$ |
| **Saturasi** | $O = \text{gray} + (1 + s/100) \cdot (I - \text{gray})$ |
| **Penajaman** | Unsharp mask: $O = I - \alpha \cdot \nabla^2 I$ |

Mesin berbasis aturan mengevaluasi setiap metrik terhadap ambang batas yang dapat dikonfigurasi dan menghasilkan saran yang diprioritaskan dengan tingkat keparahan. Saran dapat diterapkan secara otomatis (auto-apply).

---

### 5. Forensik Citra

**Rute:** `/forensics`

Perangkat forensik mini untuk mendeteksi manipulasi citra melalui empat teknik analisis independen.

#### Error Level Analysis (ELA)

Mengompresi ulang citra pada kualitas JPEG yang dikurangi dan mengukur deviasi per-piksel:

$$
D(x,y) = \frac{|R_{\text{orig}} - R_{\text{re}}| + |G_{\text{orig}} - G_{\text{re}}| + |B_{\text{orig}} - B_{\text{re}}|}{3}
$$

Perbedaan diperkuat oleh faktor skala yang dapat dikonfigurasi dan dipetakan ke peta panas hijau-kuning-merah. Residu ELA yang tinggi dapat mengindikasikan penyambungan atau penyuntingan.

#### Peta Blur & Ketajaman

Membagi citra menjadi blok-blok dan menghitung varians Laplacian per-blok:

$$
\text{Var}(B) = \frac{1}{n}\sum L_i^2 - \left(\frac{1}{n}\sum L_i\right)^2
$$

Blok dengan varians rendah → **merah** (buram). Blok dengan varians tinggi → **biru** (tajam). Berguna untuk mendeteksi content-aware fill atau blur selektif.

#### Analisis Pola Noise

Mengekstrak residu frekuensi tinggi melalui pengurangan rata-rata 3×3:

$$
R(x,y) = I(x,y) - \frac{1}{9}\sum_{(i,j) \in 3\times3} I(i,j)
$$

Mengukur keseragaman noise di empat kuadran:

$$
U = \frac{\min(q_1, q_2, q_3, q_4)}{\max(q_1, q_2, q_3, q_4)}
$$

$U \approx 1$ → noise seragam (citra alami). $U$ rendah → profil noise berbeda, kemungkinan penyambungan.

#### Ekstraksi Metadata EXIF

Parser JPEG APP1/EXIF ringan yang mendukung: merek/model kamera, eksposur, ISO, panjang fokus, tanggal/waktu, pointer GPS, dan dimensi citra.

---

### 6. Histogram & Ekualisasi

**Rute:** `/histogram`

Memvisualisasikan histogram per-kanal (R, G, B, Luminansi) dan menerapkan ekualisasi histogram untuk meningkatkan kontras.

#### Komputasi Histogram

Membangun distribusi frekuensi 256-bin. Luminansi dihitung sebagai:

$$
L = 0.299R + 0.587G + 0.114B
$$

#### Ekualisasi Histogram

Pemetaan berbasis CDF pada kanal luminansi:

$$
h'(v) = \text{round}\!\left(\frac{CDF(v) - CDF_{\min}}{N - CDF_{\min}} \times 255\right)
$$

Hue warna dipertahankan melalui penskalaan kanal proporsional:

$$
O_c = I_c \times \frac{L_{\text{new}}}{L_{\text{old}}}
$$

Ini mencegah pergeseran warna sambil menyeragamkan distribusi kecerahan.

---

### 7. Konverter Ruang Warna

**Rute:** `/color-space`

Mengonversi citra antara berbagai representasi warna termasuk RGB, HSL, CMYK, dan mode khusus lainnya.

| Mode | Deskripsi |
|------|-----------|
| **Grayscale** | ITU-R BT.601: $Y = 0.299R + 0.587G + 0.114B$ |
| **Sepia** | Transformasi matriks RGB linear |
| **Biner** | Ambang batas: $O = (L > T)\ ?\ 255 : 0$ |
| **Invert** | Negatif: $O_c = 255 - I_c$ |
| **Red / Green / Blue** | Isolasi kanal RGB individual (kanal lain dinolkan) |
| **Hue Map** | Hue HSL → warna spektrum terlihat |
| **Saturation Map** | Saturasi HSL → skala abu-abu |
| **Brightness Map** | Lightness HSL → skala abu-abu |
| **CMYK Komposit** | Konversi RGB ke model warna CMYK |
| **Kanal C / M / Y / K** | Isolasi kanal Cyan, Magenta, Yellow, atau Key individual |

Matriks sepia:

$$
M_{sepia} = \begin{pmatrix}0.393 & 0.769 & 0.189\\0.349 & 0.686 & 0.168\\0.272 & 0.534 & 0.131\end{pmatrix}
$$

#### Konversi RGB ke HSL

$$
L = \frac{\max(R,G,B) + \min(R,G,B)}{2}
$$

$$
S = \begin{cases}\dfrac{d}{\max + \min} & L \le 0.5 \\[6pt] \dfrac{d}{2 - \max - \min} & L > 0.5\end{cases}
$$

$$
H = \begin{cases}60°\times\dfrac{G-B}{d} & \text{if max} = R \\[6pt] 60°\times\!\left(\dfrac{B-R}{d}+2\right) & \text{if max} = G \\[6pt] 60°\times\!\left(\dfrac{R-G}{d}+4\right) & \text{if max} = B\end{cases}
$$

#### Konversi RGB ke CMYK

$$
K = 1 - \max\!\left(\frac{R}{255},\, \frac{G}{255},\, \frac{B}{255}\right)
$$

$$
C = \frac{1 - R/255 - K}{1 - K}, \quad M = \frac{1 - G/255 - K}{1 - K}, \quad Y = \frac{1 - B/255 - K}{1 - K}
$$

---

### 8. Deteksi Tepi

**Rute:** `/edge-detection`

Mendeteksi tepi menggunakan enam operator/metode, termasuk empat operator gradien klasik, deteksi sudut Harris, dan deteksi tepi Canny.

#### Operator Sobel

$$
G_x = \begin{pmatrix}-1&0&1\\-2&0&2\\-1&0&1\end{pmatrix}, \quad G_y = \begin{pmatrix}-1&-2&-1\\0&0&0\\1&2&1\end{pmatrix}, \quad G = \sqrt{G_x^2 + G_y^2}
$$

#### Operator Prewitt

$$
G_x = \begin{pmatrix}-1&0&1\\-1&0&1\\-1&0&1\end{pmatrix}, \quad G_y = \begin{pmatrix}-1&-1&-1\\0&0&0\\1&1&1\end{pmatrix}, \quad G = \sqrt{G_x^2 + G_y^2}
$$

#### Operator Laplacian

$$
K = \begin{pmatrix}0&1&0\\1&-4&1\\0&1&0\end{pmatrix}, \quad G = |K * I|
$$

#### Operator Roberts Cross

$$
G_x = \begin{pmatrix}1&0\\0&-1\end{pmatrix}, \quad G_y = \begin{pmatrix}0&1\\-1&0\end{pmatrix}, \quad G = \sqrt{G_x^2 + G_y^2}
$$

#### Deteksi Sudut Harris

Mendeteksi titik sudut pada citra menggunakan matriks struktur $M$ dari gradien lokal:

$$
M = \sum_{(x,y) \in W} \begin{pmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{pmatrix}
$$

Respons sudut Harris:

$$
R = \det(M) - k \cdot \text{trace}(M)^2
$$

di mana $k$ biasanya bernilai 0.04–0.06. Piksel dengan $R$ tinggi merupakan sudut.

#### Deteksi Tepi Canny

Algoritma deteksi tepi multi-tahap yang menghasilkan tepi tipis dan akurat:

1. **Gaussian Blur** — menghaluskan noise dengan filter Gaussian
2. **Gradien Sobel** — menghitung magnitudo dan arah gradien
3. **Non-Maximum Suppression** — menipis tepi menjadi lebar 1 piksel dengan menekan non-maksimum sepanjang arah gradien
4. **Double Threshold** — mengklasifikasikan piksel menjadi kuat, lemah, atau non-tepi
5. **Hysteresis** — piksel lemah dipertahankan hanya jika terhubung ke piksel kuat

**Inversi** opsional mengubah polaritas keluaran (tepi putih di atas hitam atau tepi hitam di atas putih).

---

### 9. Filter Konvolusi

**Rute:** `/filters`

Menerapkan filter konvolusi spasial menggunakan kernel 3×3 arbitrer dengan iterasi yang dapat dikonfigurasi.

#### Rumus Konvolusi

$$
O(x,y) = \frac{1}{D}\sum_{i=-1}^{1}\sum_{j=-1}^{1} I(x+i,\, y+j) \cdot K(i,j)
$$

di mana $D = \max\!\left(1,\, \sum_{i,j} K_{i,j}\right)$ mencegah pergeseran kecerahan. Keluaran dibatasi ke $[0, 255]$.

#### Kernel Preset

| Preset | Kernel | Efek |
|--------|--------|------|
| **Identity** | $\text{diag}[0,1,0]$ center = 1 | Tidak ada perubahan |
| **Box Blur** | Semua satu, dibagi 9 | Perata-rataan seragam |
| **Gaussian Blur** | Pola berbobot $[1,2,1]$, dibagi 16 | Blur halus |
| **Sharpen** | Center = 5, tetangga kardinal = −1 | Penguatan frekuensi tinggi |
| **Unsharp Mask** | Semua −1, center = 9 | Penajaman kuat |
| **Emboss** | Gradien diagonal $[-2,-1,0;-1,1,1;0,1,2]$ | Efek relief 3D |
| **Edge Enhance** | $[-1,1,0]$ horizontal | Penguatan tepi horizontal |

#### Filter Median

Filter non-linear berbasis pengurutan yang efektif untuk menghilangkan noise salt-and-pepper:

$$
O(x,y) = \text{median}\!\left\{I(x+i,\, y+j) \mid (i,j) \in W\right\}
$$

Jumlah iterasi dapat dikonfigurasi untuk efek penghalusan yang lebih kuat.

#### Editor Kernel Kustom

Pengguna dapat mendefinisikan **kernel 3×3 kustom** dengan pratinjau langsung, dan menerapkan iterasi ganda untuk efek yang lebih kuat.

---

### 10. Operasi Morfologi

**Rute:** `/morphology`

Operasi morfologi biner dengan elemen penataan yang dapat dikonfigurasi. Citra masukan dibinerisasi secara otomatis sebelum diproses.

#### Operasi Morfologi Dasar & Turunan

| Operasi | Definisi | Tujuan |
|---------|----------|--------|
| **Erosi** | $\varepsilon_B(f)(x) = \min_{b \in B} f(x+b)$ | Menyusutkan area terang |
| **Dilasi** | $\delta_B(f)(x) = \max_{b \in B} f(x+b)$ | Memperluas area terang |
| **Opening** | $\gamma_B = \delta_B \circ \varepsilon_B$ | Menghapus objek terang kecil |
| **Closing** | $\varphi_B = \varepsilon_B \circ \delta_B$ | Mengisi lubang gelap kecil |
| **Gradien Morfologi** | $\nabla_B = \delta_B(f) - \varepsilon_B(f)$ | Mengekstrak tepi objek |
| **Top-Hat** | $\hat{T}_B = f - \gamma_B(f)$ | Mengisolasi detail halus terang |
| **Black-Hat** | $\hat{B}_B = \varphi_B(f) - f$ | Mengisolasi detail halus gelap |

#### Region Growing

Segmentasi berbasis region growing dengan seed di pusat citra, menggunakan 8-konektivitas:

$$
\text{tambahkan } p \text{ ke region jika } |I(p) - I(\text{seed})| \le T
$$

di mana $T$ adalah ambang kesamaan intensitas. Algoritma dimulai dari piksel seed dan secara iteratif menambahkan piksel tetangga yang memenuhi kriteria kesamaan.

#### Bentuk Elemen Penataan

| Bentuk | Definisi |
|--------|----------|
| **Persegi** | Semua piksel dalam jendela $k \times k$ |
| **Silang (+)** | Hanya baris tengah + kolom tengah |
| **Lingkaran** | Semua $(dx,dy)$ di mana $dx^2 + dy^2 \le r^2$ |

---

### 11. FFT & Domain Frekuensi

**Rute:** `/fft`

Mengimplementasikan analisis domain frekuensi 2 dimensi menggunakan Fast Fourier Transform dan filter frekuensi.

#### Discrete Fourier Transform (DFT)

Transformasi Fourier Diskrit mengonversi citra dari domain spasial ke domain frekuensi:

$$
X(k) = \sum_{n=0}^{N-1} x(n)\, e^{-j2\pi kn/N}
$$

Inverse DFT untuk rekonstruksi:

$$
x(n) = \frac{1}{N} \sum_{k=0}^{N-1} X(k)\, e^{j2\pi kn/N}
$$

#### Fast Fourier Transform (Cooley-Tukey Radix-2)

Implementasi menggunakan algoritma Cooley-Tukey radix-2 yang mendekomposisi DFT $N$-titik menjadi dua DFT $N/2$-titik secara rekursif, mengurangi kompleksitas dari $O(N^2)$ menjadi $O(N \log N)$:

$$
X(k) = E(k) + W_N^k \cdot O(k)
$$

di mana $E(k)$ dan $O(k)$ adalah DFT dari elemen genap dan ganjil, dan $W_N^k = e^{-j2\pi k/N}$ adalah faktor twiddle.

#### Visualisasi Spektrum Magnitudo

Spektrum magnitudo divisualisasikan dalam skala logaritmik dengan pemusatan DC (DC centering):

$$
M(u,v) = \log\!\left(1 + |F(u,v)|\right)
$$

Pemusatan DC memindahkan komponen frekuensi nol ke pusat gambar spektrum menggunakan pergeseran $(-1)^{x+y}$ sebelum transformasi.

#### Filter Frekuensi

| Filter | Deskripsi | Transfer Function $H(u,v)$ |
|--------|-----------|----------------------------|
| **Ideal Low-pass** | Meloloskan frekuensi rendah, memotong frekuensi tinggi | $H = 1$ jika $D(u,v) \le D_0$, selainnya $0$ |
| **Ideal High-pass** | Meloloskan frekuensi tinggi, memotong frekuensi rendah | $H = 0$ jika $D(u,v) \le D_0$, selainnya $1$ |
| **Band-pass** | Meloloskan rentang frekuensi tertentu | $H = 1$ jika $D_1 \le D(u,v) \le D_2$, selainnya $0$ |

di mana $D(u,v) = \sqrt{(u - M/2)^2 + (v - N/2)^2}$ adalah jarak dari pusat frekuensi dan $D_0$ adalah frekuensi cutoff.

---

### 12. Transformasi Geometri

**Rute:** `/transforms`

Menerapkan transformasi geometri pada citra termasuk pengubahan ukuran, rotasi, pencerminan, pemotongan, pergeseran, dan translasi.

#### Ubah Ukuran (Resize)

Mengubah dimensi citra dengan dua metode interpolasi:

**Nearest-Neighbor:**

$$
I'(x',y') = I\!\left(\left\lfloor \frac{x' \cdot W}{W'} \right\rfloor,\, \left\lfloor \frac{y' \cdot H}{H'} \right\rfloor\right)
$$

**Bilinear:**

$$
f(x,y) = f_{00}(1-f_x)(1-f_y) + f_{10}f_x(1-f_y) + f_{01}(1-f_x)f_y + f_{11}f_xf_y
$$

di mana $f_x$ dan $f_y$ adalah bagian fraksional dari koordinat yang dipetakan.

#### Rotasi

Memutar citra pada sudut arbitrer $\theta$ dengan opsi auto-expand canvas agar tidak ada bagian citra yang terpotong.

Matriks rotasi 2D:

$$
\begin{bmatrix}x'\\y'\end{bmatrix} = \begin{bmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{bmatrix} \begin{bmatrix}x\\y\end{bmatrix}
$$

Transformasi balik (inverse mapping) digunakan untuk menghindari lubang pada citra hasil:

$$
\begin{bmatrix}x\\y\end{bmatrix} = \begin{bmatrix}\cos\theta & \sin\theta \\ -\sin\theta & \cos\theta\end{bmatrix} \begin{bmatrix}x' - c_x'\\y' - c_y'\end{bmatrix} + \begin{bmatrix}c_x\\c_y\end{bmatrix}
$$

#### Pencerminan (Flip)

| Mode | Transformasi |
|------|-------------|
| **Horizontal** | $x' = W - 1 - x,\quad y' = y$ |
| **Vertikal** | $x' = x,\quad y' = H - 1 - y$ |
| **Keduanya** | $x' = W - 1 - x,\quad y' = H - 1 - y$ |

#### Pemotongan (Crop)

Mengekstrak sub-region citra berdasarkan koordinat $(x_1, y_1)$ hingga $(x_2, y_2)$ yang ditentukan pengguna.

#### Pergeseran (Shear)

Transformasi geser pada sumbu-x dan/atau sumbu-y:

$$
\begin{bmatrix}x'\\y'\end{bmatrix} = \begin{bmatrix}1 & s_x \\ s_y & 1\end{bmatrix} \begin{bmatrix}x\\y\end{bmatrix}
$$

di mana $s_x$ dan $s_y$ adalah faktor geser horizontal dan vertikal.

#### Translasi

Memindahkan seluruh citra sebesar offset $(t_x, t_y)$:

$$
x' = x + t_x, \quad y' = y + t_y
$$

---

## Teknologi

| Teknologi | Versi | Penggunaan |
|-----------|-------|------------|
| **Next.js** | 16.1.6 | App Router, Static Generation, React 19 |
| **TypeScript** | 5.x | Keamanan tipe ketat di seluruh modul |
| **Tailwind CSS** | v4 | Kelas utilitas neo-brutalis melalui `@theme inline` |
| **React** | 19.2.3 | Komponen UI, hooks, context |
| **Canvas API** | Native | Semua I/O citra dan pemrosesan tingkat piksel |
| **TensorFlow.js** | Latest | COCO-SSD untuk deteksi objek (MobileNet v2) |
| **Tesseract.js** | Latest | Pengenalan karakter optik (OCR) |
| **PostCSS** | — | Melalui plugin `@tailwindcss/postcss` |

> **Catatan:** Algoritma inti pemrosesan citra (deteksi tepi, morfologi, filter, FFT, dll.) diimplementasikan dari nol dalam TypeScript murni — tanpa pustaka pemrosesan citra eksternal (tanpa OpenCV, tanpa Sharp, tanpa Jimp). TensorFlow.js digunakan khusus untuk modul deteksi objek AI, dan Tesseract.js untuk OCR.

---

## Arsitektur

```
src/
├── app/                              # Halaman Next.js App Router
│   ├── page.tsx                      # Halaman utama (kartu modul)
│   ├── layout.tsx                    # Root <html> dengan LanguageProvider
│   ├── globals.css                   # Token tema + kelas utilitas neo-*
│   ├── providers.tsx                 # Provider konteks aplikasi
│   ├── steganography/page.tsx
│   ├── agriculture/page.tsx
│   ├── document-scanner/page.tsx
│   ├── enhancement/page.tsx
│   ├── forensics/page.tsx
│   ├── histogram/page.tsx
│   ├── color-space/page.tsx
│   ├── edge-detection/page.tsx
│   ├── filters/page.tsx
│   ├── morphology/page.tsx
│   ├── fft/page.tsx
│   └── transforms/page.tsx
│
├── features/                         # Modul fitur (domain-driven)
│   ├── steganography/
│   │   ├── lib/                     # Encode/decode LSB, deteksi chi-square, watermark
│   │   ├── hooks/
│   │   └── ui/
│   ├── agriculture/
│   │   ├── lib/counter.ts           # CCL, Transformasi Hough Circle
│   │   ├── lib/detector.ts          # TF.js + COCO-SSD deteksi AI
│   │   ├── lib/templateMatch.ts     # Template matching NCC
│   │   ├── hooks/useDetection.ts
│   │   ├── hooks/useAIDetection.ts
│   │   └── ui/
│   ├── document-scanner/
│   │   ├── lib/ocr.ts              # Tesseract.js OCR
│   │   ├── hooks/useOCR.ts
│   │   └── ui/OCRPanel.tsx
│   ├── enhancement/
│   │   ├── lib/advisor.ts           # Analisis metrik, mesin peningkatan
│   │   ├── hooks/useEnhancement.ts
│   │   └── ui/EnhancementPanel.tsx
│   ├── forensics/
│   │   ├── lib/forensics.ts         # ELA, peta blur, noise, EXIF
│   │   ├── hooks/useForensics.ts
│   │   └── ui/ForensicsPanel.tsx
│   ├── histogram/
│   │   ├── lib/                     # Hitung histogram, ekualisasi, gambar
│   │   ├── hooks/
│   │   └── ui/
│   ├── color-space/
│   │   ├── lib/colorSpace.ts        # RGB↔HSL, CMYK, mode konversi
│   │   ├── hooks/useColorSpace.ts
│   │   └── ui/ColorSpacePanel.tsx
│   ├── edge-detection/
│   │   ├── lib/edgeDetect.ts        # Sobel, Prewitt, Laplacian, Roberts, Harris, Canny
│   │   ├── hooks/useEdgeDetection.ts
│   │   └── ui/EdgeDetectionPanel.tsx
│   ├── filters/
│   │   ├── lib/filters.ts           # Konvolusi 2D, 7 kernel preset, filter median
│   │   ├── hooks/useFilters.ts
│   │   └── ui/FiltersPanel.tsx
│   ├── morphology/
│   │   ├── lib/                     # 7 operasi morfologi, 3 bentuk SE, region growing
│   │   ├── hooks/
│   │   └── ui/
│   ├── fft/
│   │   ├── lib/fft.ts              # FFT 2D Cooley-Tukey, filter frekuensi
│   │   ├── hooks/useFFT.ts
│   │   └── ui/FFTPanel.tsx
│   └── transforms/
│       ├── lib/                     # Resize, rotate, flip, crop, shear, translate
│       ├── hooks/
│       └── ui/
│
└── shared/
    ├── components/
    │   ├── Navbar.tsx               # Navigasi dropdown berkategori (12 modul)
    │   ├── Footer.tsx               # Kredit & hak cipta
    │   ├── FileUpload.tsx           # Seret & lepas + input URL + 60 sampel
    │   ├── PageHeader.tsx           # Hero judul halaman yang dapat digunakan ulang
    │   ├── ResultDisplay.tsx        # Indikator status + tombol unduh
    │   ├── ModuleCard.tsx           # Kartu modul di halaman utama
    │   └── TabSwitcher.tsx          # Komponen tab navigasi
    └── i18n/
        ├── LanguageContext.tsx       # React context + hook useTranslation
        └── locales/
            ├── en.ts                # Terjemahan Inggris (350+ kunci)
            └── id.ts                # Terjemahan Indonesia
```

### Prinsip Desain

| Prinsip | Deskripsi |
|---------|-----------|
| **Berbasis Fitur** | Setiap modul memiliki `lib/`, `hooks/`, dan `ui/` sendiri — tidak ada dependensi antar-modul |
| **Fungsi Murni** | Pustaka pemrosesan bersifat stateless: `ImageData` masuk, hasil keluar. Tanpa efek samping |
| **Hooks sebagai Pengendali** | React hooks menjembatani lapisan UI dan lib, mengelola state asinkron & I/O Canvas |
| **Lapisan UI Bersama** | `FileUpload`, `ResultDisplay`, `PageHeader`, `Navbar` memastikan konsistensi visual |

---

## Cakupan CPMK

Proyek ini dirancang untuk memenuhi Capaian Pembelajaran Mata Kuliah (CPMK) berikut:

### CPMK1 — Teori Pengolahan Citra

| Topik | Modul | Algoritma/Konsep |
|-------|-------|-----------------|
| Domain Frekuensi | FFT | Fast Fourier Transform 2D (Cooley-Tukey radix-2), filter frekuensi (low-pass, high-pass, band-pass) |
| Konvolusi | Filter Konvolusi | Konvolusi spasial 2D, 7 kernel preset, editor kernel kustom |
| Ekualisasi Histogram | Histogram | Pemetaan CDF, ekualisasi kontras, penskalaan proporsional |
| Ruang Warna | Konverter Warna | RGB, HSL (Hue, Saturasi, Lightness), CMYK, Grayscale, Sepia, Biner |
| Morfologi | Morfologi | Erosi, dilasi, opening, closing, gradien, top-hat, black-hat, region growing |
| Deteksi Tepi | Deteksi Tepi | Sobel, Prewitt, Laplacian, Roberts Cross, Harris corner, Canny |
| Filter Median | Filter Konvolusi | Filter non-linear berbasis pengurutan, iterasi konfigurabel |
| Template Matching | Pertanian AI | Normalized Cross-Correlation (NCC) |
| Transformasi Geometri | Transformasi | Rotasi, translasi, scaling, shear, flip, crop |
| Steganografi | Steganografi | Penyisipan/ekstraksi LSB, analisis chi-square, watermarking |

### CPMK2 — Implementasi

Semua algoritma diimplementasikan dalam **TypeScript murni** menggunakan HTML5 Canvas API. Tidak ada pustaka pemrosesan citra eksternal yang digunakan — setiap operasi piksel, konvolusi, FFT, dan transformasi ditulis dari awal.

### CPMK3 — Aplikasi

| Aspek | Implementasi |
|-------|-------------|
| **Modul Dunia Nyata** | 12 modul interaktif dengan kasus penggunaan praktis |
| **UI Neo-Brutalis** | Desain modern dengan tipografi tebal, bayangan keras, palet warna cerah |
| **Desain Responsif** | Fungsional di desktop dan perangkat seluler |
| **Internasionalisasi (i18n)** | Dukungan dwibahasa Inggris & Indonesia |
| **Integrasi AI** | TensorFlow.js COCO-SSD (80 kelas objek) untuk deteksi real-time |
| **OCR** | Tesseract.js untuk pengenalan karakter optik multi-bahasa |

---

## Memulai

```bash
# Klon repositori
git clone <repo-url>
cd orama

# Instal dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Build untuk produksi
npm run build
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Persyaratan Sistem

- **Node.js** 18+ (LTS direkomendasikan)
- **Browser:** Browser modern apa pun dengan dukungan Canvas API (Chrome, Firefox, Edge, Safari)
- Tidak memerlukan GPU — semua pemrosesan berbasis CPU

---

## Deployment

Deploy secara instan di [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

File `vercel.json` disertakan dengan konfigurasi optimal. Seluruh 12 rute dirender secara statis pada saat build.

---

## Referensi Akademik

Algoritma yang diimplementasikan dalam proyek ini didasarkan pada karya-karya fundamental berikut:

1. **Gonzalez, R.C. & Woods, R.E.** (2018). *Digital Image Processing*, 4th ed. Pearson. — Ekualisasi histogram, filter spasial, operasi morfologi, deteksi tepi, FFT, transformasi geometri.
2. **Otsu, N.** (1979). "A threshold selection method from gray-level histograms." *IEEE Trans. SMC*, 9(1), 62–66. — Thresholding Otsu.
3. **Westfeld, A. & Pfitzmann, A.** (2000). "Attacks on Steganographic Systems." *Information Hiding*, LNCS 1768, 61–76. — Steganalisis chi-square.
4. **Krawetz, N.** (2007). "A Picture's Worth… Digital Image Analysis and Forensics." *Black Hat Briefings*. — Error Level Analysis.
5. **Duda, R.O. & Hart, P.E.** (1972). "Use of the Hough transformation to detect lines and curves in pictures." *Commun. ACM*, 15(1), 11–15. — Transformasi Hough.
6. **Haralick, R.M., Sternberg, S.R. & Zhuang, X.** (1987). "Image Analysis Using Mathematical Morphology." *IEEE TPAMI*, 9(4), 532–550. — Morfologi matematis.
7. **Sobel, I.** (1968). "An Isotropic 3×3 Image Gradient Operator." *Stanford AI Project*. — Operator Sobel.
8. **Prewitt, J.M.S.** (1970). "Object Enhancement and Extraction." *Picture Processing and Psychopictorics*. — Operator Prewitt.
9. **Roberts, L.G.** (1963). "Machine Perception of Three-Dimensional Solids." *MIT Lincoln Lab*. — Operator Roberts Cross.
10. **Hartley, R. & Zisserman, A.** (2004). *Multiple View Geometry in Computer Vision*, 2nd ed. Cambridge. — Homografi proyektif.
11. **Cooley, J.W. & Tukey, J.W.** (1965). "An algorithm for the machine calculation of complex Fourier series." *Mathematics of Computation*, 19(90), 297–301. — Fast Fourier Transform.
12. **Canny, J.** (1986). "A Computational Approach to Edge Detection." *IEEE TPAMI*, 8(6), 679–698. — Deteksi tepi Canny.
13. **Harris, C. & Stephens, M.** (1988). "A Combined Corner and Edge Detector." *Alvey Vision Conference*, 147–151. — Detektor sudut Harris.

---

<div align="center">

**FIRDAUS SATRIO UTOMO**

Pemrosesan Citra Digital — © 2026

</div>
