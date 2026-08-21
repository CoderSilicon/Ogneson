"use client";

import { useState, useRef, useEffect } from "react";

export function ExpandableText({
  text,
  className = "",
  clampLines = 2,
}: {
  text: string;
  className?: string;
  clampLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setNeedsExpand(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  return (
    <div className={`relative ${className}`}>
      {expanded ? (
        <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-light leading-relaxed drop-shadow-md">
          {text}
        </p>
      ) : (
        <p
          ref={textRef}
          className="text-xs sm:text-sm md:text-base text-zinc-300 font-light leading-relaxed drop-shadow-md"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: clampLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {text}
        </p>
      )}

      {needsExpand && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-1 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? "− Less" : "+ More"}
        </button>
      )}
    </div>
  );
}
