import { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { STORAGE, TRACKABLE_PRAYERS } from "../data/constants";

export function usePrayerTracker() {
  const todayKey = () => STORAGE.TRACKER(moment().format("YYYY-MM-DD"));

  const [done, setDone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(todayKey())) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(todayKey(), JSON.stringify(done));
  }, [done, todayKey]);

  const toggle = useCallback((key) => {
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reset = useCallback(() => setDone({}), []);

  const count   = TRACKABLE_PRAYERS.filter((p) => done[p]).length;
  const total   = TRACKABLE_PRAYERS.length;
  const percent = Math.round((count / total) * 100);

  return { done, toggle, reset, count, total, percent };
}
