"use client";

import { useEffect } from "react";

const tabColors = ["#f4b8c5", "#98d4bb", "#c7b8ea", "#a8d8ea", "#ffe6a7", "#f7f7f7"];

export default function NotebookDecorator() {
  useEffect(() => {
    const selectors = ["main > section", "main > article.blog-article"];
    const blocks = document.querySelectorAll<HTMLElement>(selectors.join(", "));

    blocks.forEach((block, index) => {
      block.classList.add("notebook-section");
      const heading = block.querySelector<HTMLElement>(
        "h1, h2, h3, h4, .section-title",
      );
      const rawLabel = heading?.textContent?.trim();
      const label = rawLabel && rawLabel.length > 0 ? rawLabel : `Section ${index + 1}`;
      block.dataset.notebookTab = label;
      block.style.setProperty("--notebook-index", String(index));
      block.style.setProperty("--tab-color", tabColors[index % tabColors.length]);
    });
  }, []);

  return null;
}
