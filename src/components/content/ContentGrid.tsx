import type { Content } from "@/types";
import { ITEMS_PER_PAGE } from "@/constants";
import ContentCardSkeleton from "@/components/content/ContentCardSkeleton";
import ContentCard from "./ContentCard";

interface ContentGridProps {
  content: Content[];
  initialLoading: boolean;
  onSeriesClick: (series: string) => void;
}

export default function ContentGrid({ content, initialLoading, onSeriesClick }: ContentGridProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {initialLoading
        ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))
        : content.map((content, idx) => (
            <ContentCard
              key={idx}
              content={content}
              onSeriesClick={onSeriesClick}
            />
          ))}
    </div>
  );
}