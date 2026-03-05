"use client";

import { ModuleCard } from "@/shared/components/ModuleCard";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import {
  Lock,
  Sprout,
  FileText,
  Sparkles,
  SearchCode,
  BarChart2,
  Palette,
  SquareDashed,
  SlidersHorizontal,
  Shapes,
  AudioWaveform,
  Move3D,
} from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();

  const MODULES = [
    {
      href: "/steganography",
      icon: <Lock className="w-7 h-7" />,
      title: t.modules.steganoTitle,
      description: t.modules.steganoDesc,
      tags: ["LSB", "Encode", "Decode", "Watermark"],
      accentColor: "orange" as const,
    },
    {
      href: "/agriculture",
      icon: <Sprout className="w-7 h-7" />,
      title: t.modules.agriTitle,
      description: t.modules.agriDesc,
      tags: ["TF.js", "COCO-SSD", "CCL", "Hough"],
      accentColor: "mint" as const,
    },
    {
      href: "/document-scanner",
      icon: <FileText className="w-7 h-7" />,
      title: t.modules.docScanTitle,
      description: t.modules.docScanDesc,
      tags: ["Tesseract.js", "OCR", "Multi-lang"],
      accentColor: "teal" as const,
    },
    {
      href: "/enhancement",
      icon: <Sparkles className="w-7 h-7" />,
      title: t.modules.enhanceTitle,
      description: t.modules.enhanceDesc,
      tags: ["Metrics", "Advisor", "Auto-Enhance"],
      accentColor: "lavender" as const,
    },
    {
      href: "/forensics",
      icon: <SearchCode className="w-7 h-7" />,
      title: t.modules.forensicsTitle,
      description: t.modules.forensicsDesc,
      tags: ["ELA", "Blur Map", "Noise", "EXIF"],
      accentColor: "crimson" as const,
    },
    {
      href: "/histogram",
      icon: <BarChart2 className="w-7 h-7" />,
      title: t.modules.histogramTitle,
      description: t.modules.histogramDesc,
      tags: ["Histogram", "Equalization", "RGB", "Luminance"],
      accentColor: "orange" as const,
    },
    {
      href: "/color-space",
      icon: <Palette className="w-7 h-7" />,
      title: t.modules.colorSpaceTitle,
      description: t.modules.colorSpaceDesc,
      tags: ["Grayscale", "CMYK", "HSL", "Binary"],
      accentColor: "mint" as const,
    },
    {
      href: "/edge-detection",
      icon: <SquareDashed className="w-7 h-7" />,
      title: t.modules.edgeDetectTitle,
      description: t.modules.edgeDetectDesc,
      tags: ["Sobel", "Canny", "Harris", "Laplacian"],
      accentColor: "teal" as const,
    },
    {
      href: "/filters",
      icon: <SlidersHorizontal className="w-7 h-7" />,
      title: t.modules.filtersTitle,
      description: t.modules.filtersDesc,
      tags: ["Blur", "Sharpen", "Median", "Custom"],
      accentColor: "lavender" as const,
    },
    {
      href: "/morphology",
      icon: <Shapes className="w-7 h-7" />,
      title: t.modules.morphologyTitle,
      description: t.modules.morphologyDesc,
      tags: ["Erode", "Dilate", "Open", "Region Grow"],
      accentColor: "crimson" as const,
    },
    {
      href: "/fft",
      icon: <AudioWaveform className="w-7 h-7" />,
      title: t.modules.fftTitle,
      description: t.modules.fftDesc,
      tags: ["FFT", "Low-pass", "High-pass", "Spectrum"],
      accentColor: "lavender" as const,
    },
    {
      href: "/transforms",
      icon: <Move3D className="w-7 h-7" />,
      title: t.modules.transformsTitle,
      description: t.modules.transformsDesc,
      tags: ["Resize", "Rotate", "Flip", "Crop"],
      accentColor: "orange" as const,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-teal-dark neo-border border-t-0 border-x-0">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-block neo-btn bg-orange-neon text-bone text-xs mb-6 cursor-default">
              {t.home.badge}
            </div>
            <h1 className="font-black text-5xl md:text-7xl text-bone leading-[0.9] tracking-tighter">
              ORAMA
              <span className="text-orange-neon">.</span>
              <br />
              VISION
            </h1>
            <p className="text-bone-muted text-lg md:text-xl mt-6 max-w-xl leading-relaxed">
              {t.home.heroDesc.split("<accent>").map((part, i) => {
                if (i === 0) return part;
                const [accent, rest] = part.split("</accent>");
                return (
                  <span key={i}>
                    <span className="text-mint font-bold">{accent}</span>
                    {rest}
                  </span>
                );
              })}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <span className="px-3 py-1 neo-border bg-teal-deep text-mint text-xs font-mono font-bold">
                {t.home.tagBrowser}
              </span>
              <span className="px-3 py-1 neo-border bg-teal-deep text-orange-light text-xs font-mono font-bold">
                {t.home.tagTFjs}
              </span>
              <span className="px-3 py-1 neo-border bg-teal-deep text-lavender text-xs font-mono font-bold">
                {t.home.tagZero}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="bg-orange-neon neo-border border-x-0 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-2">
          {Array(4)
            .fill(t.home.marquee)
            .map((text, i) => (
              <span
                key={i}
                className="text-bone font-black text-sm tracking-widest mx-4"
              >
                {text}
              </span>
            ))}
        </div>
      </div>

      {/* Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="font-black text-3xl text-charcoal uppercase tracking-tight">
            {t.home.modulesHeading}
          </h2>
          <div className="w-20 h-1.5 bg-orange-neon mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <ModuleCard key={mod.href} {...mod} />
          ))}
        </div>
      </section>

      {/* Tech Stack Bar */}
      <section className="bg-charcoal neo-border border-x-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t.home.techNextjs, desc: t.home.techNextjsDesc, color: "text-bone" },
              { label: t.home.techTailwind, desc: t.home.techTailwindDesc, color: "text-orange-neon" },
              { label: t.home.techTFjs, desc: t.home.techTFjsDesc, color: "text-mint" },
              { label: t.home.techCanvas, desc: t.home.techCanvasDesc, color: "text-lavender" },
            ].map((tech) => (
              <div key={tech.label} className="text-center">
                <p className={`font-black text-lg ${tech.color}`}>
                  {tech.label}
                </p>
                <p className="text-bone-muted text-xs font-mono">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
