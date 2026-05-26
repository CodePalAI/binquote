"use client";

import { useEffect, useRef } from "react";
import type { PricingRules } from "@/lib/types";
import { QuoteWidget } from "@/components/QuoteWidget";

export function EmbedFrame({ rules }: { rules: PricingRules }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const send = () => {
      const h = ref.current?.getBoundingClientRect().height ?? 0;
      window.parent?.postMessage(
        { type: "binquote:resize", height: Math.ceil(h) },
        "*"
      );
    };
    send();
    const ro = new ResizeObserver(send);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="p-3 md:p-6">
      <QuoteWidget rules={rules} />
    </div>
  );
}
