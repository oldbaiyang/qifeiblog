"use client";

// CodeCopyButton — mounts a copy button on every <pre> inside the article.
// We render the buttons via DOM manipulation instead of React portals to
// keep the rendered post HTML simple and stable.
import { useEffect } from "react";

export function CodeCopyButton() {
  useEffect(() => {
    const pres = document.querySelectorAll<HTMLPreElement>(
      "article pre[data-language]",
    );
    const cleanups: Array<() => void> = [];
    pres.forEach((pre) => {
      if (pre.querySelector(".copy-code-btn")) return;
      pre.style.position = pre.style.position || "relative";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "copy-code-btn absolute top-2 right-2 rounded-md border border-border bg-background/80 px-2 py-1 text-xs text-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100";
      btn.textContent = "复制";
      btn.setAttribute("aria-label", "复制代码");
      btn.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.innerText ?? pre.innerText;
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "已复制";
          setTimeout(() => (btn.textContent = "复制"), 1500);
        } catch {
          btn.textContent = "失败";
        }
      });
      pre.appendChild(btn);
      // Always show the button on touch / when pre is hovered.
      pre.classList.add("group");
      cleanups.push(() => {
        btn.remove();
        pre.classList.remove("group");
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
}
