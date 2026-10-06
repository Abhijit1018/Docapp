"use client";

import { useEffect } from "react";

/**
 * The site's motion engine, mounted once.
 * - Anything with class "rise" animates in when it scrolls into view, and
 *   siblings follow one another in a stagger.
 * - Anything with data-parallax drifts against the scroll.
 * - The header gains a shadow once the page has scrolled.
 */
export function Motion() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "1";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>(".rise").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const siblings = Array.from(el.parentElement?.children ?? []).filter((c) => c.classList.contains("rise"));
        el.style.setProperty("--d", String(siblings.indexOf(el) % 6));
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let queued = false;
    const frame = () => {
      queued = false;
      document.documentElement.toggleAttribute("data-scrolled", scrollY > 24);
      if (still) return;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const box = (el.parentElement ?? el).getBoundingClientRect();
        if (box.bottom < -200 || box.top > innerHeight + 200) return;
        const offset = (box.top + box.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${(-offset * Number(el.dataset.parallax)).toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(frame);
      }
    };
    frame();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      mo.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
