import { useState, useEffect } from "react";
import type { Content } from "@/types";

export function useContentData() {
  const [content, setContent] = useState<Content[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadStartTime] = useState(() => Date.now());

  useEffect(() => {
    fetch("/.netlify/functions/content", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched content:", data);
        setContent(data);
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
