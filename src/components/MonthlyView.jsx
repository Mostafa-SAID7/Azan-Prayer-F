import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { cn } from "../lib/utils";
import { useLang } from "../contexts/LanguageContext";
import { API_BASE } from "../data/constants";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";

const PRAYER_COLS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

export default function MonthlyView({ open, onClose, city, isGeo, geoCoords, calcMethod }) {
  const { t, lang, isRtl } = useLang();

  // Track which month/year is being displayed (moment object)
  const [display,  setDisplay]  = useState(() => moment());
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const nowMoment    = moment();
  const isThisMonth  = display.isSame(nowMoment, "month");
  const todayDay     = nowMoment.date();

  // ── Fetch data whenever the displayed month changes ────────────
  const fetchMonth = useCallback(() => {
    if (!open) return;
    setLoading(true);
    setData(null);
    setError(null);

    const year  = display.year();
    const month = display.month() + 1;

    const url = isGeo && geoCoords
      ? `${API_BASE}/calendar/${year}/${month}?latitude=${geoCoords.lat}&longitude=${geoCoords.lng}&method=${calcMethod}`
      : `${API_BASE}/calendarByCity/${year}/${month}?city=${encodeURIComponent(city.apiCity)}&country=${city.apiCountry}&method=${calcMethod}`;

    axios.get(url)
      .then((res) => setData(res.data.data))
      .catch(() => setError(t.quranError))
      .finally(() => setLoading(false));
  }, [open, display, city, isGeo, geoCoords, calcMethod]); // eslint-disable-line

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  // Reset to current month when dialog closes
  useEffect(() => {
    if (!open) setDisplay(moment());
  }, [open]);

  const prevMonth = () => setDisplay((d) => d.clone().subtract(1, "month"));
  const nextMonth = () => setDisplay((d) => d.clone().add(1, "month"));
  const goToToday = () => setDisplay(moment());

  // Month name shown in the header
  const displayMonthName = display.locale(lang === "ar" ? "ar-DZ" : "en").format("MMMM YYYY");

  // Hijri month from first day's data (if available)
  const hijriMonth = data?.[0]?.date?.hijri;
  const hijriLabel = hijriMonth
    ? `${hijriMonth.month.ar} ${hijriMonth.year} هـ`
    : null;

  const colHeaders = [t.col.day, t.col.fajr, t.col.sunrise, t.col.dhuhr, t.col.asr, t.col.maghrib, t.col.isha];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b bg-gradient-to-br from-primary/[0.07] to-transparent">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="font-lemonada text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary shrink-0" />
                {t.monthlyTitle}
              </DialogTitle>
              <DialogDescription className="font-lemonada mt-0.5 text-xs">
                {isGeo ? t.geoCity : (lang === "ar" ? city?.displayAr : city?.displayEn)}
                {hijriLabel && <span className="ms-2 text-muted-foreground">{hijriLabel}</span>}
              </DialogDescription>
            </div>

            {/* Back-to-today button */}
            {!isThisMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="shrink-0 text-xs font-lemonada gap-1.5 h-7"
              >
                <CalendarClock className="h-3 w-3" />
                {t.backToToday}
              </Button>
            )}
          </div>

          {/* Month navigator */}
          <div className="flex items-center justify-between mt-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={isRtl ? nextMonth : prevMonth}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              aria-label={t.prevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <p className="font-lemonada font-bold text-base text-foreground leading-tight">
                {displayMonthName}
              </p>
              {hijriLabel && (
                <p className="text-[11px] text-muted-foreground font-lemonada mt-0.5" dir="rtl">
                  {hijriLabel}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={isRtl ? prevMonth : nextMonth}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              aria-label={t.nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Loading ──────────────────────────────────────── */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-16 gap-3">
            <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm text-muted-foreground font-lemonada">{t.loadingMonthly}</span>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────── */}
        {error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
            <p className="text-sm text-destructive font-lemonada">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchMonth}>{t.retry}</Button>
          </div>
        )}

        {/* ── Table ────────────────────────────────────────── */}
        {data && !loading && (
          <ScrollArea className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm font-lemonada">
                <thead>
                  <tr className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                    {colHeaders.map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "px-2.5 py-2.5 font-semibold whitespace-nowrap",
                          i === 0 ? "text-start" : "text-center",
                          i === 2 && "hidden sm:table-cell",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((dayData, i) => {
                    const dayNum    = i + 1;
                    const isToday   = isThisMonth && dayNum === todayDay;
                    const isFriday  = new Date(dayData.date?.gregorian?.date).getDay() === 5;
                    const { timings, date } = dayData;
                    const hijriDay  = date?.hijri?.day;

                    return (
                      <tr
                        key={dayNum}
                        id={isToday ? "today-row" : undefined}
                        className={cn(
                          "border-b transition-colors",
                          isToday
                            ? "bg-primary/12 dark:bg-primary/14"
                            : isFriday
                            ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                            : dayNum % 2 === 0
                            ? "bg-muted/20 hover:bg-muted/40"
                            : "hover:bg-muted/30",
                        )}
                      >
                        {/* Day cell */}
                        <td className="px-2.5 py-2 text-start whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={cn(
                              "tabular-nums font-semibold text-sm",
                              isToday ? "text-primary" : isFriday ? "text-amber-600 dark:text-amber-400" : "",
                            )}>
                              {dayNum}
                            </span>
                            {hijriDay && (
                              <span className="text-muted-foreground text-[10px]">({hijriDay})</span>
                            )}
                            {isToday && (
                              <span className="text-[9px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold leading-none">
                                {t.today}
                              </span>
                            )}
                            {isFriday && !isToday && (
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                                {lang === "ar" ? "جمعة" : "Fri"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Prayer time cells */}
                        {PRAYER_COLS.map((col, j) => (
                          <td
                            key={col}
                            className={cn(
                              "px-2.5 py-2 text-center tabular-nums",
                              j === 1 && "hidden sm:table-cell",
                              isToday && "font-semibold text-primary",
                            )}
                            style={{ direction: "ltr" }}
                          >
                            {timings[col]?.slice(0, 5) ?? "--:--"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
