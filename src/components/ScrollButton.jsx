import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "../lib/utils";

export default function Scroll_btn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-5 end-5 z-50 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg",
        "flex items-center justify-center transition-all duration-300",
        "hover:bg-primary/90 hover:shadow-xl hover:scale-110 active:scale-95",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
