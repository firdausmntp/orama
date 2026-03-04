"use client";

import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import { Upload, Shuffle, ImageIcon } from "lucide-react";
import { useTranslation } from "@/shared/i18n/LanguageContext";

/** Pre-bundled example images per module (served from /examples/) */
export interface ExampleImage {
  src: string;
  label: string;
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
  showSamples?: boolean;
  /** Local example images for the current module */
  examples?: ExampleImage[];
}

/** Large pool of curated picsum image IDs with labels */
const SAMPLE_POOL = [
  { id: "10", label: "Forest" },
  { id: "15", label: "Hilltop" },
  { id: "20", label: "Notebook" },
  { id: "24", label: "Silhouette" },
  { id: "29", label: "Mountain" },
  { id: "37", label: "Cactus" },
  { id: "42", label: "Graffiti" },
  { id: "48", label: "Harbor" },
  { id: "54", label: "Tiles" },
  { id: "57", label: "Purple" },
  { id: "65", label: "Leaves" },
  { id: "76", label: "Bear" },
  { id: "84", label: "Puppy" },
  { id: "96", label: "Café" },
  { id: "100", label: "Wolf" },
  { id: "119", label: "Sunset" },
  { id: "129", label: "Dam" },
  { id: "137", label: "Kitten" },
  { id: "152", label: "Mac" },
  { id: "160", label: "Forest" },
  { id: "164", label: "Desk" },
  { id: "175", label: "Pier" },
  { id: "177", label: "Laptop" },
  { id: "180", label: "Tomato" },
  { id: "200", label: "Skyline" },
  { id: "225", label: "Mug" },
  { id: "237", label: "Pug" },
  { id: "250", label: "Goat" },
  { id: "256", label: "Orca" },
  { id: "270", label: "Sheep" },
  { id: "292", label: "Concert" },
  { id: "301", label: "Alley" },
  { id: "326", label: "Squirrel" },
  { id: "342", label: "Old Man" },
  { id: "366", label: "Mountain" },
  { id: "399", label: "Castle" },
  { id: "429", label: "Snow" },
  { id: "433", label: "Flower" },
  { id: "447", label: "Cyclist" },
  { id: "453", label: "Butterfly" },
  { id: "493", label: "Road" },
  { id: "550", label: "Boat" },
  { id: "582", label: "Church" },
  { id: "659", label: "Barn" },
  { id: "667", label: "Duck" },
  { id: "718", label: "Rooftop" },
  { id: "766", label: "Bridge" },
  { id: "823", label: "Moss" },
  { id: "870", label: "Beach" },
  { id: "984", label: "Rapids" },
  { id: "1001", label: "Canoe" },
  { id: "1015", label: "River" },
  { id: "1025", label: "Pug 2" },
  { id: "1041", label: "Parrot" },
  { id: "1050", label: "Aerial" },
  { id: "1059", label: "Neon" },
  { id: "1069", label: "Hills" },
  { id: "1074", label: "Coast" },
  { id: "1080", label: "Moose" },
  { id: "1084", label: "Autumn" },
];

/** Fisher-Yates shuffle pick — returns n random samples */
function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  label,
  sublabel,
  showSamples = true,
  examples,
}: FileUploadProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [sampleSeed, setSampleSeed] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pick 6 random samples; re-rolls when sampleSeed changes
  const samples = useMemo(() => {
    if (!isMounted) return SAMPLE_POOL.slice(0, 6);
    return pickRandom(SAMPLE_POOL, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleSeed, isMounted]);

  const handleFile = useCallback(
    (file: File) => {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setUrlError(null);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const fetchImageAsFile = useCallback(
    async (url: string, filename: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type || "image/jpeg" });
    },
    []
  );

  const loadFromUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      setLoading("url");
      setUrlError(null);
      const file = await fetchImageAsFile(url, "loaded-image.jpg");
      handleFile(file);
    } catch {
      setUrlError(t.fileUpload.urlError);
    } finally {
      setLoading(null);
    }
  }, [urlInput, fetchImageAsFile, handleFile, t]);

  const loadSample = useCallback(
    async (id: string) => {
      try {
        setLoading(id);
        setUrlError(null);
        const file = await fetchImageAsFile(
          `https://picsum.photos/id/${id}/800/600`,
          `sample-${id}.jpg`
        );
        handleFile(file);
      } catch {
        setUrlError(t.fileUpload.urlError);
      } finally {
        setLoading(null);
      }
    },
    [fetchImageAsFile, handleFile, t]
  );

  const loadExample = useCallback(
    async (src: string, label: string) => {
      try {
        setLoading(`ex-${src}`);
        setUrlError(null);
        const file = await fetchImageAsFile(src, `example-${label.toLowerCase().replace(/\s+/g, "-")}.jpg`);
        handleFile(file);
      } catch {
        setUrlError(t.fileUpload.urlError);
      } finally {
        setLoading(null);
      }
    },
    [fetchImageAsFile, handleFile, t]
  );

  return (
    <div className="space-y-3">
      {/* ─── Main Drop Zone ─── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer neo-border text-center
          transition-all duration-150
          ${
            isDragging
              ? "bg-orange-neon/10 shadow-[6px_6px_0px_#FF5F15] border-orange-neon"
              : "bg-bone hover:bg-bone-muted neo-shadow"
          }
          ${preview ? "p-2" : "p-8"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto neo-border"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
              }}
              className="absolute top-2 right-2 neo-btn bg-crimson text-bone px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="py-8">
            <Upload className="w-12 h-12 mx-auto mb-4 text-charcoal-light" />
            <p className="font-bold text-charcoal text-lg">
              {label || t.fileUpload.dropLabel}
            </p>
            <p className="text-charcoal-light text-sm mt-1 font-mono">
              {sublabel || t.fileUpload.dropSublabel}
            </p>
            <div className="mt-4 inline-block neo-btn neo-btn-primary text-sm">
              {t.fileUpload.browseFiles}
            </div>
          </div>
        )}
      </div>

      {/* ─── Example Images for This Module ─── */}
      {examples && examples.length > 0 && !preview && (
        <div className="neo-card-teal p-4">
          <p className="text-xs font-black uppercase text-mint mb-3 tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            {t.fileUpload.exampleLabel}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {examples.map((ex) => (
              <button
                key={ex.src}
                onClick={(e) => {
                  e.stopPropagation();
                  loadExample(ex.src, ex.label);
                }}
                disabled={loading !== null}
                className={`
                  neo-border overflow-hidden transition-all duration-150
                  bg-bone hover:shadow-[4px_4px_0px_#2DD4A8] hover:border-mint
                  disabled:cursor-wait group
                  ${loading === `ex-${ex.src}` ? "animate-pulse" : ""}
                  ${loading && loading !== `ex-${ex.src}` ? "opacity-50" : ""}
                `}
              >
                <img
                  src={ex.src}
                  alt={ex.label}
                  className="w-full h-24 object-cover"
                  loading="lazy"
                />
                <div className="bg-teal-deep text-mint text-xs font-bold p-2 uppercase text-center truncate group-hover:bg-teal-dark transition-colors">
                  {ex.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── URL Input + Sample Images ─── */}
      {showSamples && !preview && (
        <div className="neo-card p-4 space-y-4">
          {/* URL Input */}
          <div>
            <p className="text-xs font-black uppercase text-charcoal-light mb-2 tracking-wider">
              {t.fileUpload.urlLabel}
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadFromUrl();
                }}
                placeholder={t.fileUpload.urlPlaceholder}
                onClick={(e) => e.stopPropagation()}
                className="neo-input flex-1 text-sm py-2"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadFromUrl();
                }}
                disabled={loading === "url" || !urlInput.trim()}
                className="neo-btn neo-btn-secondary text-xs px-4 py-2 disabled:opacity-50"
              >
                {loading === "url" ? "..." : t.fileUpload.urlLoad}
              </button>
            </div>
            {urlError && (
              <p className="text-xs text-crimson font-mono mt-1">{urlError}</p>
            )}
          </div>

          {/* Sample Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase text-charcoal-light tracking-wider">
                {t.fileUpload.sampleLabel}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSampleSeed((s) => s + 1);
                }}
                className="text-xs font-bold neo-btn bg-charcoal-light text-bone px-2 py-1 hover:bg-orange-neon transition-colors"
                title="Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSample(sample.id);
                  }}
                  disabled={loading !== null}
                  className={`
                    neo-border overflow-hidden transition-all duration-150
                    hover:shadow-[4px_4px_0px_#FF5F15] hover:border-orange-neon
                    disabled:cursor-wait
                    ${loading === sample.id ? "animate-pulse" : ""}
                    ${loading && loading !== sample.id ? "opacity-50" : ""}
                  `}
                >
                  <img
                    src={`https://picsum.photos/id/${sample.id}/150/100`}
                    alt={sample.label}
                    className="w-full h-16 object-cover"
                    loading="lazy"
                  />
                  <div className="bg-charcoal text-bone text-[10px] font-bold p-1 uppercase text-center truncate">
                    {sample.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
