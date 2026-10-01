"use client";

import { useEffect, useRef, useState } from "react";

// Animated counter: counts 0 → end when scrolled into view (ease-out, rAF).
// Renders the final value immediately for reduced-motion or without IO.
// Remounts on end change so late-arriving data (e.g. fetch after first paint)
// restarts the animation instead of sticking at the initial value.
export default function CountUp(props: {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  return <CountUpInner key={props.end} {...props} />;
}

function CountUpInner({
  end,
  suffix = "",
  duration = 1200,
  className = "",
}: {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // Async callback (not sync in the effect body) to satisfy the
      // no-sync-setState rule; paints the final value on the next frame.
      const frame = requestAnimationFrame(() => setValue(end));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || started.current)
          return;
        started.current = true;
        observer.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - t0) / duration);
          setValue(Math.round(end * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);
  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
