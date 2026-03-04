"use client";

import Link from "next/link";
import { useTranslation } from "@/shared/i18n/LanguageContext";

interface ModuleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  accentColor?: "orange" | "teal" | "mint" | "lavender" | "crimson";
}

const ACCENT_MAP = {
  orange: "bg-orange-neon",
  teal: "bg-teal-dark",
  mint: "bg-mint",
  lavender: "bg-lavender",
  crimson: "bg-crimson",
};

const TAG_COLORS = {
  orange: "bg-orange-neon/20 text-orange-burnt",
  teal: "bg-teal-dark/20 text-teal-dark",
  mint: "bg-mint/20 text-teal-deep",
  lavender: "bg-lavender/20 text-charcoal",
  crimson: "bg-crimson/20 text-crimson",
};

export function ModuleCard({
  href,
  icon,
  title,
  description,
  tags,
  accentColor = "orange",
}: ModuleCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={href} className="block group">
      <div className="neo-card neo-hover h-full flex flex-col">
        {/* Accent Bar */}
        <div
          className={`h-3 ${ACCENT_MAP[accentColor]} border-b-3 border-charcoal`}
        />

        <div className="p-6 flex flex-col flex-1">
          {/* Icon */}
          <div className="mb-4 group-hover:scale-110 transition-transform origin-left w-fit p-3 bg-bone neo-border inline-block text-charcoal">
            {icon}
          </div>

          {/* Title */}
          <h3 className="font-black text-xl text-charcoal uppercase tracking-tight mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-charcoal-light text-sm leading-relaxed flex-1 mb-4">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-xs font-bold uppercase neo-border ${TAG_COLORS[accentColor]}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="neo-btn neo-btn-primary text-sm text-center justify-center group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_#1A1A1A] transition-all">
            {t.modules.launchModule}
          </div>
        </div>
      </div>
    </Link>
  );
}
