import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import { useLang } from "../contexts/LanguageContext";
import { QURAN_API, STORAGE, QURAN_FONT_SIZES } from "../data/constants";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Search, ChevronLeft, ChevronRight, BookOpen,
  Languages, Type, Bookmark, ArrowRight,
} from "lucide-react";

/* ── Helpers ─────────────────────────────────────────────────────── */
function loadLastRead() {
  try { return JSON.parse(localStorage.getItem(STORAGE.QURAN_LAST)) || null; } catch { return null; }
}
function saveLastRead(obj) {
  localStorage.setItem(STORAGE.QURAN_LAST, JSON.stringify(obj));
}

/* ── Sub-component: SurahList ─────────────────────────────────────── */
function SurahList({ surahs, loading, error, t, lang, onSelect, lastRead, onRetry }) {
  const [search,    setSearch]    = useState("");
  const [revFilter, setRevFilter] = useState("all");

  const filtered = surahs.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || s.name.includes(search)
      || s.englishName.toLowerCase().includes(q)
      || String(s.number).includes(q);
    const matchRev = revFilter === "all" || s.revelationType === revFilter;
    return matchSearch && matchRev;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-lemonada">{t.quranLoading}</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-sm text-destructive font-lemonada">{t.quranError}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>{t.retry}</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Last read banner ──────────────────────────────── */}
      {lastRead && (
        <button
          onClick={() => onSelect(lastRead.surah)}
          className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.05] px-4 py-2.5 hover:bg-primary/[0.09] transition-colors"
          style={{ animation: "fadeInUp 0.35s ease both" }}
        >
          <Bookmark className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 text-start min-w-0">
            <p className="text-[11px] text-muted-foreground font-lemonada">{t.quranLastRead}</p>
            <p className="text-sm font-bold text-primary font-lemonada truncate">
              {lang === "ar"
                ? surahs.find((s) => s.number === lastRead.surah)?.name
                : surahs.find((s) => s.number === lastRead.surah)?.englishName}
              {" — "}{t.quranVerse} {lastRead.ayah}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary/60 shrink-0" />
        </button>
      )}

      {/* ── Search + filter ───────────────────────────────── */}
      <div className="px-4 pt-3 pb-2 space-y-2.5">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.quranSearchPlaceholder}
            className="ps-8 h-9 text-sm"
          />
        </div>

        {/* Revelation filter chips */}
        <div className="flex gap-2">
          {[
            { key: "all",     label: t.quranAllSurahs },
            { key: "Meccan",  label: t.quranMeccan    },
            { key: "Medinan", label: t.quranMedinan   },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRevFilter(key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-lemonada border transition-all duration-200",
                revFilter === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {label}
              <span className={cn(
                "ms-1.5 text-[9px] rounded-full px-1 font-bold",
                revFilter === key ? "bg-white/20" : "bg-muted",
              )}>
                {key === "all" ? surahs.length : surahs.filter((s) => s.revelationType === key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Surah grid ───────────────────────────────────── */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground font-lemonada py-10">{t.quranNoResults}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            {filtered.map((s, i) => (
              <button
                key={s.number}
                onClick={() => onSelect(s.number)}
                className="flex items-center gap-3 p-3.5 bg-card hover:bg-accent transition-colors text-start"
                style={{ animation: `fadeInUp 0.3s ease ${Math.min(i * 0.018, 0.4)}s both` }}
              >
                {/* Number badge */}
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-primary font-lemonada tabular-nums" style={{ direction: "ltr" }}>
                    {s.number}
                  </span>
                </div>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground font-lemonada leading-tight" dir="rtl">
                    {s.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-lemonada truncate mt-0.5">
                    {s.englishName} · {s.englishNameTranslation}
                  </p>
                </div>

                {/* Meta badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn(
                    "text-[9px] font-bold rounded-full px-2 py-0.5 font-lemonada",
                    s.revelationType === "Meccan"
                      ? "bg-amber-500/12 text-amber-600 dark:text-amber-400"
                      : "bg-blue-500/12 text-blue-600 dark:text-blue-400",
                  )}>
                    {s.revelationType === "Meccan" ? t.quranMeccaTag : t.quranMedinaTag}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-lemonada">
                    {s.numberOfAyahs} {t.quranAyahs}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

/* ── Sub-component: SurahView ─────────────────────────────────────── */
function SurahView({ surahNum, surahs, t, onNavigate, showTranslation, fontSize, onAyahVisible }) {
  const [arAyahs, setArAyahs] = useState([]);
  const [enAyahs, setEnAyahs] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error,   setError]    = useState(null);
  const containerRef = useRef(null);

  const surah = surahs.find((s) => s.number === surahNum);
  const hasBismillah = surahNum !== 9 && surahNum !== 1;  // surah 1 starts with bismillah as 1st ayah
  const isFirst = surahNum === 1;
  const isLast  = surahNum === 114;

  const fontCls = QURAN_FONT_SIZES[fontSize] ?? QURAN_FONT_SIZES.md;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setArAyahs([]);
    setEnAyahs([]);
    if (containerRef.current) containerRef.current.scrollTop = 0;

    axios.get(`${QURAN_API}/surah/${surahNum}/editions/quran-uthmani,en.sahih`)
      .then((res) => {
        setArAyahs(res.data.data[0]?.ayahs ?? []);
        setEnAyahs(res.data.data[1]?.ayahs ?? []);
      })
      .catch(() => setError(t.quranError))
      .finally(() => setLoading(false));
  }, [surahNum]); // eslint-disable-line

  // Track first visible ayah for last-read bookmark
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !arAyahs.length) return;
    const onScroll = () => {
      const ayahEls = el.querySelectorAll("[data-ayah]");
      for (const a of ayahEls) {
        const rect = a.getBoundingClientRect();
        if (rect.top >= 0) {
          onAyahVisible(surahNum, Number(a.dataset.ayah));
          break;
        }
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [arAyahs, surahNum, onAyahVisible]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-lemonada">{t.quranLoadingSurah}</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3">
      <p className="text-sm text-destructive font-lemonada">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Surah header ──────────────────────────────────── */}
      <div className="border-b bg-gradient-to-br from-primary/[0.08] to-transparent px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Prev surah */}
          <button
            onClick={() => !isFirst && onNavigate(surahNum - 1)}
            disabled={isFirst}
            className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors"
            aria-label={t.quranPrevSurah}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Names */}
          <div className="text-center flex-1 min-w-0">
            <p className="font-bold text-lg text-primary font-lemonada leading-tight" dir="rtl">
              {surah?.name}
            </p>
            <p className="text-xs text-muted-foreground font-lemonada">
              {surah?.englishName} · {surah?.numberOfAyahs} {t.quranAyahs}
              {" · "}
              <span className={cn(
                "font-bold",
                surah?.revelationType === "Meccan"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-blue-600 dark:text-blue-400",
              )}>
                {surah?.revelationType === "Meccan" ? t.quranMeccaTag : t.quranMedinaTag}
              </span>
            </p>
          </div>

          {/* Next surah */}
          <button
            onClick={() => !isLast && onNavigate(surahNum + 1)}
            disabled={isLast}
            className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors"
            aria-label={t.quranNextSurah}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Ayahs ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" ref={containerRef}>
        {/* Bismillah */}
        {hasBismillah && (
          <div
            className="text-center py-5 border-b"
            style={{ animation: "fadeInUp 0.35s ease both" }}
          >
            <p className="font-lemonada text-primary text-2xl leading-loose" dir="rtl">
              {t.quranBismillah}
            </p>
          </div>
        )}

        {/* Ayah cards */}
        {arAyahs.map((ayah, i) => {
          const enAyah = enAyahs[i];
          return (
            <div
              key={ayah.numberInSurah}
              data-ayah={ayah.numberInSurah}
              className="px-4 py-4 border-b hover:bg-muted/20 transition-colors"
              style={{ animation: `fadeInUp 0.3s ease ${Math.min(i * 0.012, 0.5)}s both` }}
            >
              {/* Arabic text + ayah number */}
              <div className="flex items-start gap-3" dir="rtl">
                {/* Ayah number */}
                <div className="w-8 h-8 rounded-full border-2 border-primary/25 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[10px] font-bold text-primary tabular-nums" style={{ direction: "ltr" }}>
                    {ayah.numberInSurah}
                  </span>
                </div>
                {/* Arabic text */}
                <p
                  className={cn("flex-1 leading-[2.2] text-foreground font-lemonada", fontCls.arabic)}
                  dir="rtl"
                  lang="ar"
                >
                  {ayah.text}
                </p>
              </div>

              {/* English translation */}
              {showTranslation && enAyah && (
                <p
                  className={cn(
                    "mt-2.5 pt-2.5 border-t border-dashed border-border/60",
                    "text-muted-foreground leading-relaxed font-lemonada",
                    fontCls.latin,
                  )}
                  dir="ltr"
                >
                  {enAyah.text}
                </p>
              )}
            </div>
          );
        })}

        {/* Bottom navigation */}
        <div className="flex justify-between p-4 gap-3">
          <button
            onClick={() => !isFirst && onNavigate(surahNum - 1)}
            disabled={isFirst}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-lemonada transition-all",
              !isFirst
                ? "border-primary/30 text-primary hover:bg-primary/8"
                : "border-border text-muted-foreground opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            {t.quranPrevSurah}
          </button>
          <button
            onClick={() => !isLast && onNavigate(surahNum + 1)}
            disabled={isLast}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-lemonada transition-all",
              !isLast
                ? "border-primary/30 text-primary hover:bg-primary/8"
                : "border-border text-muted-foreground opacity-30 cursor-not-allowed",
            )}
          >
            {t.quranNextSurah}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main: QuranReader ─────────────────────────────────────────────── */
export default function QuranReader() {
  const { t, lang } = useLang();

  const [surahs,       setSurahs]       = useState([]);
  const [listLoading,  setListLoading]  = useState(true);
  const [listError,    setListError]    = useState(null);
  const [selectedSurah,setSelectedSurah]= useState(null);
  const [showTransl,   setShowTransl]   = useState(
    () => localStorage.getItem(STORAGE.QURAN_TRANSL) === "1"
  );
  const [fontSize,     setFontSize]     = useState(
    () => localStorage.getItem(STORAGE.QURAN_FONT) || "md"
  );
  const [lastRead,     setLastRead]     = useState(loadLastRead);

  // ── Fetch surah list once ────────────────────────────────────────
  const fetchSurahs = useCallback(() => {
    setListLoading(true);
    setListError(null);
    axios.get(`${QURAN_API}/surah`)
      .then((res) => setSurahs(res.data.data))
      .catch(() => setListError(t.quranError))
      .finally(() => setListLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => { fetchSurahs(); }, [fetchSurahs]);

  // ── Persist settings ─────────────────────────────────────────────
  const toggleTranslation = () => {
    const next = !showTransl;
    setShowTransl(next);
    localStorage.setItem(STORAGE.QURAN_TRANSL, next ? "1" : "0");
  };

  const cycleFont = () => {
    const order = ["sm", "md", "lg"];
    const next  = order[(order.indexOf(fontSize) + 1) % order.length];
    setFontSize(next);
    localStorage.setItem(STORAGE.QURAN_FONT, next);
  };

  // ── Track last read position ──────────────────────────────────────
  const handleAyahVisible = useCallback((surahNum, ayahNum) => {
    const obj = { surah: surahNum, ayah: ayahNum };
    setLastRead(obj);
    saveLastRead(obj);
  }, []);

  const fontMeta = QURAN_FONT_SIZES[fontSize] ?? QURAN_FONT_SIZES.md;

  return (
    <div
      className="mt-4 rounded-2xl border bg-card overflow-hidden"
      style={{ minHeight: "75vh", display: "flex", flexDirection: "column" }}
    >
      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-gradient-to-br from-primary/[0.07] to-transparent">
        {/* Left: back button / title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedSurah ? (
            <button
              onClick={() => setSelectedSurah(null)}
              className="flex items-center gap-1.5 text-sm font-lemonada text-primary hover:text-primary/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.quranBackToList}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary shrink-0" />
              <span className="font-lemonada font-bold text-base text-foreground">{t.quranTitle}</span>
            </div>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1">
          {/* Font size */}
          {selectedSurah && (
            <button
              onClick={cycleFont}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-lemonada text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              title={t.quranFontSize}
            >
              <Type className="h-3.5 w-3.5" />
              <span className="font-bold">{fontMeta.label}</span>
            </button>
          )}

          {/* Translation toggle */}
          {selectedSurah && (
            <button
              onClick={toggleTranslation}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-lemonada transition-all",
                showTransl
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {showTransl ? t.quranHideTransl : t.quranShowTransl}
              </span>
              <span className="sm:hidden">EN</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      {selectedSurah ? (
        <SurahView
          surahNum={selectedSurah}
          surahs={surahs}
          t={t}
          lang={lang}
          onBack={() => setSelectedSurah(null)}
          onNavigate={setSelectedSurah}
          showTranslation={showTransl}
          fontSize={fontSize}
          onAyahVisible={handleAyahVisible}
        />
      ) : (
        <SurahList
          surahs={surahs}
          loading={listLoading}
          error={listError}
          t={t}
          lang={lang}
          onSelect={setSelectedSurah}
          lastRead={lastRead}
          onRetry={fetchSurahs}
        />
      )}
    </div>
  );
}
