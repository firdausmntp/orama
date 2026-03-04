> **[English version](README.md)** | Versi Bahasa Indonesia

<div align="center">
  <img src="public/logo.png" alt="ORAMA.vision Logo" width="180" height="180" />

  <h1>ORAMA.vision</h1>

  <p><strong>Hub Pemrosesan Citra Digital Modular</strong> — 100% sisi klien, tanpa backend.</p>

  <p>Aplikasi web bertema neobrutalism untuk mempelajari dan bereksperimen dengan teknik pemrosesan citra digital.<br/>Dibangun dengan Next.js 16, React 19, TypeScript, dan Tailwind CSS v4.</p>

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
   - [1. Steganografi & Deteksi](#1-steganografi--deteksi)
   - [2. Pertanian Cerdas AI](#2-pertanian-cerdas-ai)
   - [3. Pemindai Dokumen](#3-pemindai-dokumen)
   - [4. Penasihat Peningkatan Kualitas](#4-penasihat-peningkatan-kualitas)
   - [5. Forensik Citra](#5-forensik-citra)
   - [6. Histogram & Ekualisasi](#6-histogram--ekualisasi)
   - [7. Konverter Ruang Warna](#7-konverter-ruang-warna)
   - [8. Deteksi Tepi](#8-deteksi-tepi)
   - [9. Filter Konvolusi](#9-filter-konvolusi)
   - [10. Operasi Morfologi](#10-operasi-morfologi)
4. [Teknologi](#teknologi)
5. [Arsitektur](#arsitektur)
6. [Memulai](#memulai)
7. [Deployment](#deployment)
8. [Referensi Akademik](#referensi-akademik)
9. [Penulis](#penulis)

---

## Ringkasan

ORAMA.vision adalah platform pemrosesan citra digital berbasis browser yang komprehensif, dirancang untuk penggunaan edukatif maupun praktis. Seluruh pemrosesan dilakukan di **sisi klien** menggunakan HTML5 Canvas API dan TypeScript murni — tidak ada citra yang pernah diunggah ke server mana pun.

Aplikasi ini mengimplementasikan algoritma pemrosesan citra klasik dari literatur ilmiah peer-reviewed, mencakup steganografi, visi komputer, peningkatan citra, analisis forensik, dan morfologi matematis. Setiap modul bersifat mandiri sepenuhnya dengan pustaka pemrosesan, React hooks, dan komponen UI-nya sendiri.

---

## Sorotan UI & UX

- **Dukungan Dwibahasa (i18n):** Pergantian waktu-nyata antara Bahasa Inggris (EN) dan Bahasa Indonesia (ID)
- **Desain Neo-Brutalism:** Tipografi tebal, bayangan keras (`neo-shadow`), palet warna cerah (Dark Teal, Neon Orange, Bone)
- **Arsitektur Responsif:** Fungsional di perangkat seluler dengan navigasi berbasis kategori yang dapat dilipat
- **Seret & Lepas Cerdas:** Muat gambar melalui pemilih perangkat, pengambilan URL, atau 60+ gambar sampel acak

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **100% Pemrosesan di Browser** | Semua algoritma berjalan pada Canvas `ImageData` — sepenuhnya dapat berfungsi offline |
| **10 Modul Interaktif** | Steganografi, visi, peningkatan, forensik & matematika citra |
| **UI Dwibahasa** | Inggris & Indonesia dengan pergantian waktu-nyata |
| **Pustaka Gambar Sampel** | 60+ gambar terkurasi dengan pilihan acak & pemuatan URL |
| **Unduhan Cerdas** | Nama file keluaran mengikuti konvensi `{feature}_{timestamp}.png` |
| **Desain Neobrutalism** | Tema Dark Teal + Neon Orange dengan batas tebal & bayangan |
| **Tata Letak Responsif** | Mobile-first dengan navigasi dropdown berkategori |
| **Arsitektur Berbasis Fitur** | Setiap modul terisolasi di bawah `src/features/` |

---

## Modul

### 1. Steganografi & Deteksi

**Rute:** `/steganography`

Mengimplementasikan steganografi Least Significant Bit (LSB) untuk menyembunyikan pesan teks dalam citra, disertai detektor steganalisis chi-square.

#### Penyandian (Penyisipan LSB)

Penyandi mengganti bit paling tidak signifikan dari setiap byte RGB dengan satu bit pesan rahasia. Kanal alpha tidak diubah.

```
new_byte = (original_byte & 0xFE) | message_bit
```

Kapasitas penyisipan maksimum:

$$
C = \frac{W \times H \times 3}{8} - |\text{delimiter}|
$$

di mana $W$ dan $H$ adalah dimensi citra dalam piksel dan setiap karakter membutuhkan 8 bit.

#### Dekoding

Dekoder membaca LSB dari setiap byte RGB, menyusun kembali karakter 8-bit, dan berhenti pada delimiter (`[END]`). Jika delimiter hilang atau rusak, hasilnya akan mengandung noise.

#### Deteksi (Steganalisis Chi-Square)

Penyisipan LSB cenderung **menyeragamkan** frekuensi kemunculan pasangan nilai piksel $(2v,\ 2v+1)$. Statistik chi-square mengukur penyimpangan ini:

$$
\chi^2 = \sum_{v=0}^{127} \frac{(O_{2v} - E_v)^2 + (O_{2v+1} - E_v)^2}{E_v}, \quad E_v = \frac{O_{2v} + O_{2v+1}}{2}
$$

Nilai-p diperkirakan melalui pendekatan normal:

$$
Z = \sqrt{2\chi^2} - \sqrt{2k - 1}
$$

di mana $k$ adalah derajat kebebasan (pasangan valid di mana $E_v \ge 5$). **Nilai-p tinggi** (chi-square rendah) menunjukkan distribusi pasangan yang mencurigakan seragam — ciri khas penyisipan LSB. Implementasi menggunakan pendekatan polinomial *Abramowitz & Stegun* untuk CDF normal.

---

### 2. Pertanian Cerdas AI

**Rute:** `/agriculture`

Menyediakan dua alat untuk analisis citra pertanian: penghitungan objek melalui pelabelan komponen terhubung dan deteksi objek lingkaran melalui Transformasi Hough.

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

---

### 3. Pemindai Dokumen

**Rute:** `/document-scanner`

Mensimulasikan pemindai dokumen seluler dengan menemukan tepi kertas dan meratakannya.

#### Alur Pemrosesan

**Langkah 1 — Gaussian Blur** (kernel 3x3 untuk menghilangkan noise tekstur):

$$
K_{gauss} = \frac{1}{16}\begin{pmatrix}1&2&1\\2&4&2\\1&2&1\end{pmatrix}
$$

**Langkah 2 — Deteksi Tepi Sobel** — menghitung magnitudo gradien 2D:

$$
G = \sqrt{G_x^2 + G_y^2}
$$

**Langkah 3 — Thresholding Otsu** — memaksimalkan varians antar-kelas antara latar depan/latar belakang:

$$
\sigma_B^2 = w_B \cdot w_F \cdot (\mu_B - \mu_F)^2
$$

**Langkah 4 — Deteksi Sudut Berbasis Kuadran** — menemukan 4 titik tepi terluar per kuadran citra.

**Langkah 5 — Transformasi Perspektif (Warp)** — homografi proyektif 8-parameter diselesaikan melalui eliminasi Gauss:

$$
\begin{pmatrix}x'\\y'\end{pmatrix} = \frac{1}{h_7 x + h_8 y + 1}\begin{pmatrix}h_1 x + h_2 y + h_3\\h_4 x + h_5 y + h_6\end{pmatrix}
$$

**Langkah 6 — Interpolasi Bilinear** untuk pemetaan sub-piksel yang halus:

$$
f(x,y) = f_{00}(1-f_x)(1-f_y) + f_{10}f_x(1-f_y) + f_{01}(1-f_x)f_y + f_{11}f_xf_y
$$

**Langkah 7 — Adaptive Thresholding** (filter hitam-putih opsional) — piksel menjadi putih jika $I(x,y) > \mu_{\text{local}} - C$.

---

### 4. Penasihat Peningkatan Kualitas

**Rute:** `/enhancement`

Analisis kualitas citra cerdas yang mengevaluasi berbagai metrik dan menyarankan peningkatan optimal.

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

Mesin berbasis aturan mengevaluasi setiap metrik terhadap ambang batas yang dapat dikonfigurasi dan menghasilkan saran yang diprioritaskan dengan tingkat keparahan.

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

Blok dengan varians rendah -> **merah** (buram). Blok dengan varians tinggi -> **biru** (tajam). Berguna untuk mendeteksi content-aware fill atau blur selektif.

#### Analisis Pola Noise

Mengekstrak residu frekuensi tinggi melalui pengurangan rata-rata 3x3:

$$
R(x,y) = I(x,y) - \frac{1}{9}\sum_{(i,j) \in 3\times3} I(i,j)
$$

Mengukur keseragaman noise di empat kuadran:

$$
U = \frac{\min(q_1, q_2, q_3, q_4)}{\max(q_1, q_2, q_3, q_4)}
$$

$U \approx 1$ -> noise seragam (citra alami). $U$ rendah -> profil noise berbeda, kemungkinan penyambungan.

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

Mengonversi citra antara 10 representasi warna yang berbeda.

| Mode | Deskripsi |
|------|-----------|
| **Grayscale** | ITU-R BT.601: $Y = 0.299R + 0.587G + 0.114B$ |
| **Sepia** | Transformasi matriks RGB linear |
| **Biner** | Ambang batas: $O = (L > T)\ ?\ 255 : 0$ |
| **Invert** | Negatif: $O_c = 255 - I_c$ |
| **Red / Green / Blue** | Isolasi kanal (kanal lain dinolkan) |
| **Hue Map** | Hue HSL -> warna spektrum terlihat |
| **Saturation Map** | Saturasi HSL -> skala abu-abu |
| **Brightness Map** | Lightness HSL -> skala abu-abu |

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

---

### 8. Deteksi Tepi

**Rute:** `/edge-detection`

Mendeteksi tepi menggunakan empat operator klasik berbasis gradien. Semua metode mengonversi ke skala abu-abu, menerapkan kernel konvolusi, dan menghitung magnitudo gradien.

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

**Inversi** opsional mengubah polaritas keluaran (tepi putih di atas hitam atau tepi hitam di atas putih).

---

### 9. Filter Konvolusi

**Rute:** `/filters`

Menerapkan filter konvolusi spasial menggunakan kernel 3x3 arbitrer dengan iterasi yang dapat dikonfigurasi.

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
| **Sharpen** | Center = 5, tetangga kardinal = -1 | Penguatan frekuensi tinggi |
| **Unsharp Mask** | Semua -1, center = 9 | Penajaman kuat |
| **Emboss** | Gradien diagonal $[-2,-1,0;-1,1,1;0,1,2]$ | Efek relief 3D |
| **Edge Enhance** | $[-1,1,0]$ horizontal | Penguatan tepi horizontal |

Pengguna dapat mendefinisikan **kernel 3x3 kustom** dengan pratinjau langsung, dan menerapkan iterasi ganda untuk efek yang lebih kuat.

---

### 10. Operasi Morfologi

**Rute:** `/morphology`

Operasi morfologi biner dengan elemen penataan yang dapat dikonfigurasi. Citra masukan dibinerisasi secara otomatis sebelum diproses.

#### Operasi

| Operasi | Definisi | Tujuan |
|---------|----------|--------|
| **Erosi** | $\varepsilon_B(f)(x) = \min_{b \in B} f(x+b)$ | Menyusutkan area terang |
| **Dilasi** | $\delta_B(f)(x) = \max_{b \in B} f(x+b)$ | Memperluas area terang |
| **Opening** | $\gamma_B = \delta_B \circ \varepsilon_B$ | Menghapus objek terang kecil |
| **Closing** | $\varphi_B = \varepsilon_B \circ \delta_B$ | Mengisi lubang gelap kecil |
| **Gradien** | $\nabla_B = \delta_B(f) - \varepsilon_B(f)$ | Mengekstrak tepi objek |
| **Top Hat** | $\hat{T}_B = f - \gamma_B(f)$ | Mengisolasi detail halus terang |
| **Black Hat** | $\hat{B}_B = \varphi_B(f) - f$ | Mengisolasi detail halus gelap |

#### Bentuk Elemen Penataan

| Bentuk | Definisi |
|--------|----------|
| **Persegi** | Semua piksel dalam jendela $k \times k$ |
| **Silang (+)** | Hanya baris tengah + kolom tengah |
| **Lingkaran** | Semua $(dx,dy)$ di mana $dx^2 + dy^2 \le r^2$ |

---

## Teknologi

| Teknologi | Versi | Penggunaan |
|-----------|-------|------------|
| **Next.js** | 16.1.6 | App Router, Static Generation, React 19 |
| **TypeScript** | 5.x | Keamanan tipe ketat di seluruh modul |
| **Tailwind CSS** | v4 | Kelas utilitas neobrutalism melalui `@theme inline` |
| **React** | 19.2.3 | Komponen UI, hooks, context |
| **Canvas API** | Native | Semua I/O citra dan pemrosesan tingkat piksel |
| **PostCSS** | — | Melalui plugin `@tailwindcss/postcss` |

> **Tanpa pustaka pemrosesan citra eksternal.** Tidak ada OpenCV, tidak ada Sharp, tidak ada Jimp. Setiap algoritma diimplementasikan dari nol dalam TypeScript.

---

## Arsitektur

```
src/
├── app/                              # Halaman Next.js App Router
│   ├── page.tsx                      # Halaman utama (kartu modul)
│   ├── layout.tsx                    # Root <html> dengan LanguageProvider
│   ├── globals.css                   # Token tema + kelas utilitas neo-*
│   ├── steganography/page.tsx
│   ├── agriculture/page.tsx
│   ├── document-scanner/page.tsx
│   ├── enhancement/page.tsx
│   ├── forensics/page.tsx
│   ├── histogram/page.tsx
│   ├── color-space/page.tsx
│   ├── edge-detection/page.tsx
│   ├── filters/page.tsx
│   └── morphology/page.tsx
│
├── features/                         # Modul fitur (domain-driven)
│   ├── steganography/
│   │   ├── lib/lsb.ts               # Encode/decode LSB, deteksi chi-square
│   │   ├── hooks/useSteganography.ts
│   │   └── ui/SteganographyPanels.tsx
│   ├── agriculture/
│   │   ├── lib/counter.ts           # CCL, Transformasi Hough Circle
│   │   ├── hooks/useDetection.ts
│   │   └── ui/AgriculturePanels.tsx
│   ├── document-scanner/
│   │   ├── lib/scanner.ts           # Homografi, Otsu, adaptive threshold
│   │   ├── hooks/useScanner.ts
│   │   └── ui/ScannerPanel.tsx
│   ├── enhancement/
│   │   ├── lib/advisor.ts           # Analisis metrik, mesin peningkatan
│   │   ├── hooks/useEnhancement.ts
│   │   └── ui/EnhancementPanel.tsx
│   ├── forensics/
│   │   ├── lib/forensics.ts         # ELA, peta blur, noise, EXIF
│   │   ├── hooks/useForensics.ts
│   │   └── ui/ForensicsPanel.tsx
│   ├── histogram/
│   │   ├── lib/histogram.ts         # Hitung histogram, ekualisasi, gambar
│   │   ├── hooks/useHistogram.ts
│   │   └── ui/HistogramPanel.tsx
│   ├── color-space/
│   │   ├── lib/colorSpace.ts        # RGB↔HSL, 10 mode konversi
│   │   ├── hooks/useColorSpace.ts
│   │   └── ui/ColorSpacePanel.tsx
│   ├── edge-detection/
│   │   ├── lib/edgeDetect.ts        # Sobel, Prewitt, Laplacian, Roberts
│   │   ├── hooks/useEdgeDetection.ts
│   │   └── ui/EdgeDetectionPanel.tsx
│   ├── filters/
│   │   ├── lib/filters.ts           # Konvolusi 2D, 7 kernel preset
│   │   ├── hooks/useFilters.ts
│   │   └── ui/FiltersPanel.tsx
│   └── morphology/
│       ├── lib/morphology.ts        # 7 operasi morfologi, 3 bentuk SE
│       ├── hooks/useMorphology.ts
│       └── ui/MorphologyPanel.tsx
│
└── shared/
    ├── components/
    │   ├── Navbar.tsx               # Navigasi dropdown berkategori (10 modul)
    │   ├── Footer.tsx               # Kredit & hak cipta
    │   ├── FileUpload.tsx           # Seret & lepas + input URL + 60 sampel
    │   ├── PageHeader.tsx           # Hero judul halaman yang dapat digunakan ulang
    │   └── ResultDisplay.tsx        # Indikator status + tombol unduh
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

1. **Gonzalez, R.C. & Woods, R.E.** (2018). *Digital Image Processing*, 4th ed. Pearson. — Histogram equalization, spatial filtering, morphological operations, edge detection.
2. **Otsu, N.** (1979). "A threshold selection method from gray-level histograms." *IEEE Trans. SMC*, 9(1), 62–66. — Otsu's thresholding.
3. **Westfeld, A. & Pfitzmann, A.** (2000). "Attacks on Steganographic Systems." *Information Hiding*, LNCS 1768, 61–76. — Chi-square steganalysis.
4. **Krawetz, N.** (2007). "A Picture's Worth… Digital Image Analysis and Forensics." *Black Hat Briefings*. — Error Level Analysis.
5. **Duda, R.O. & Hart, P.E.** (1972). "Use of the Hough transformation to detect lines and curves in pictures." *Commun. ACM*, 15(1), 11–15. — Hough Transform.
6. **Haralick, R.M., Sternberg, S.R. & Zhuang, X.** (1987). "Image Analysis Using Mathematical Morphology." *IEEE TPAMI*, 9(4), 532–550. — Mathematical morphology.
7. **Sobel, I.** (1968). "An Isotropic 3x3 Image Gradient Operator." *Stanford AI Project*. — Sobel operator.
8. **Prewitt, J.M.S.** (1970). "Object Enhancement and Extraction." *Picture Processing and Psychopictorics*. — Prewitt operator.
9. **Roberts, L.G.** (1963). "Machine Perception of Three-Dimensional Solids." *MIT Lincoln Lab*. — Roberts Cross operator.
10. **Hartley, R. & Zisserman, A.** (2004). *Multiple View Geometry in Computer Vision*, 2nd ed. Cambridge. — Projective homography.

---

<div align="center">

**FIRDAUS SATRIO UTOMO**

*Pemrosesan Citra Digital — © 2026*

</div>
