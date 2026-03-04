"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import {
  Wrench,
  Lock,
  Sprout,
  Scan,
  Sparkles,
  Search,
  Zap,
  BarChart2,
  Palette,
  SquareDashed,
  SlidersHorizontal,
  Shapes,
  Menu,
  X,
  Globe,
  ChevronDown
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

interface NavGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useTranslation();

  const NAV_GROUPS: NavGroup[] = [
    {
      key: "tools",
      label: t.nav.groupTools,
      icon: <Wrench className="w-4 h-4" />,
      items: [
        { href: "/steganography", label: t.nav.stegano, icon: <Lock className="w-5 h-5" />, desc: t.nav.steganoDesc },
        { href: "/agriculture", label: t.nav.agriAi, icon: <Sprout className="w-5 h-5" />, desc: t.nav.agriAiDesc },
        { href: "/document-scanner", label: t.nav.docScan, icon: <Scan className="w-5 h-5" />, desc: t.nav.docScanDesc },
        { href: "/enhancement", label: t.nav.enhance, icon: <Sparkles className="w-5 h-5" />, desc: t.nav.enhanceDesc },
        { href: "/forensics", label: t.nav.forensics, icon: <Search className="w-5 h-5" />, desc: t.nav.forensicsDesc },
      ],
    },
    {
      key: "processing",
      label: t.nav.groupProcessing,
      icon: <Zap className="w-4 h-4" />,
      items: [
        { href: "/histogram", label: t.nav.histogram, icon: <BarChart2 className="w-5 h-5" />, desc: t.nav.histogramDesc },
        { href: "/color-space", label: t.nav.colorSpace, icon: <Palette className="w-5 h-5" />, desc: t.nav.colorSpaceDesc },
        { href: "/edge-detection", label: t.nav.edgeDetect, icon: <SquareDashed className="w-5 h-5" />, desc: t.nav.edgeDetectDesc },
        { href: "/filters", label: t.nav.filters, icon: <SlidersHorizontal className="w-5 h-5" />, desc: t.nav.filtersDesc },
        { href: "/morphology", label: t.nav.morphology, icon: <Shapes className="w-5 h-5" />, desc: t.nav.morphologyDesc },
      ],
    },
  ];

  /* which group owns the currently-active page? */
  const activeGroupKey =
    NAV_GROUPS.find((g) => g.items.some((i) => i.href === pathname))?.key ??
    null;

  /* close everything on route change */
  useEffect(() => {
    setMobileOpen(false);
    setActiveGroup(null);
  }, [pathname]);

  /* close on click-outside */
  useEffect(() => {
    if (!activeGroup && !mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeGroup, mobileOpen]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggleLocale = () => setLocale(locale === "en" ? "id" : "en");

  const toggleDropdown = (key: string) =>
    setActiveGroup((prev) => (prev === key ? null : key));

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 bg-teal-dark neo-border border-t-0 border-x-0"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={() => {
              setActiveGroup(null);
              setMobileOpen(false);
            }}
          >
            <div className="relative flex items-center justify-center w-10 h-10 bg-orange-neon neo-border group-hover:scale-105 transition-transform overflow-hidden">
              <span className="text-xl font-black text-charcoal z-10 font-mono tracking-tighter">O</span>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzExMTExMSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtZGFzaGFycmF5PSI0IDQiLz48L3N2Zz4=')] opacity-30 animate-[spin_10s_linear_infinite]" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-bone rounded-full" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-orange-neon tracking-wider uppercase">
                ORAMA
              </span>
              <span className="text-[10px] font-bold text-bone/70 tracking-[0.2em] ml-0.5">
                .vision
              </span>
            </div>
          </Link>

          {/* ═══ Desktop — Category Dropdown Triggers ═══ */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_GROUPS.map((group) => {
              const isOpen = activeGroup === group.key;
              const hasActive = group.key === activeGroupKey;
              return (
                <button
                  key={group.key}
                  onClick={() => toggleDropdown(group.key)}
                  className={`
                    px-4 py-2 text-sm font-black uppercase tracking-wider
                    transition-all duration-150 neo-border flex items-center gap-1.5
                    ${
                      isOpen
                        ? "bg-orange-neon text-bone shadow-[3px_3px_0px_#1A1A1A]"
                        : hasActive
                          ? "bg-teal-mid text-bone"
                          : "bg-teal-deep text-bone-muted border-transparent hover:border-charcoal hover:bg-teal-mid hover:text-bone"
                    }
                  `}
                >
                  <span className="flex items-center justify-center">{group.icon}</span>
                  {group.label}
                  <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
              );
            })}

            {/* Language Switcher — desktop */}
            <button
              onClick={toggleLocale}
              title={t.lang.switchTo}
              className="ml-2 px-3 py-2 text-sm font-black uppercase tracking-wider neo-border bg-charcoal text-bone flex items-center gap-1.5 hover:bg-orange-neon transition-all duration-150"
            >
              <Globe className="w-4 h-4" />
              {t.lang.label}
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLocale}
              title={t.lang.switchTo}
              className="neo-btn bg-charcoal text-bone px-2 py-2 text-sm font-black flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              {t.lang.label}
            </button>
            <button
              ref={mobileBtnRef}
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={t.nav.toggleMenu}
              className="neo-btn bg-orange-neon text-bone px-3 py-2 text-sm"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Desktop Dropdown Panel ═══ */}
      <div
        className={`
          hidden md:grid overflow-hidden
          transition-[grid-template-rows] duration-200 ease-in-out
          ${activeGroup ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
        `}
      >
        <div className="overflow-hidden">
          <div className="bg-teal-deep border-t-[3px] border-charcoal">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="grid grid-cols-5 gap-3">
                {NAV_GROUPS.find((g) => g.key === activeGroup)?.items.map(
                  (item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          neo-border p-3 transition-all duration-150 block
                          ${
                            isActive
                              ? "bg-orange-neon text-bone shadow-[4px_4px_0px_#1A1A1A]"
                              : "bg-teal-dark text-bone hover:bg-orange-neon hover:shadow-[4px_4px_0px_#1A1A1A]"
                          }
                        `}
                      >
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="font-black text-sm uppercase tracking-tight">
                          {item.label}
                        </div>
                        <div className="text-[11px] mt-1 opacity-70 font-mono leading-tight">
                          {item.desc}
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Menu ═══ */}
      <div
        ref={mobileMenuRef}
        className={`
          md:hidden overflow-hidden
          transition-[max-height,opacity] duration-300 ease-in-out
          bg-teal-deep border-t-[3px] border-charcoal
          ${mobileOpen ? "max-h-200 opacity-100" : "max-h-0 opacity-0 border-t-0"}
        `}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.key}>
            {/* Group header */}
            <div className="px-6 py-2 bg-charcoal/40 text-bone-muted text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <span>{group.icon}</span>
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider
                    border-b-2 border-charcoal/20
                    transition-colors duration-150
                    ${
                      isActive
                        ? "bg-orange-neon text-bone"
                        : "text-bone-muted hover:bg-orange-neon hover:text-bone"
                    }
                  `}
                >
                  <span className="flex items-center justify-center opacity-80">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
