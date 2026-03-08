import { useState, useEffect } from "react";
import type { Content } from "@/types";

export function useContentData() {
  const [content, setContent] = useState<Content[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadStartTime] = useState(() => Date.now());

  useEffect(() => {
    fetch("/.netlify/functions/dynamoDB", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: Content[]) => {
        console.log("Fetched content:", data);

        // Sort by date descending (newest first)
        const sorted = data.sort((a, b) => {
          // Convert to timestamps for comparison
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // descending
        });

        setContent(sorted);
      })
      .catch((err) => console.error("Failed to fetch content:", err))
      .finally(() => {
        const MIN_LOADING_TIME = 2000;
        const elapsed = Date.now() - loadStartTime;
        const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

        setTimeout(() => {
          setInitialLoading(false);
        }, remaining);
      });
  }, []);

  return { content, initialLoading };
}