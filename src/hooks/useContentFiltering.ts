import { useMemo, useEffect } from "react";
import type { Content } from "@/types";
import { ITEMS_PER_PAGE } from "@/constants";
import { parseLocalDate } from "@/utils/dateUtils";

interface FilteringLogicProps {
  content: Content[];
  search: string;
  seriesFilter: string;
  maxLength: number | "";
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  formatFilter: string;
  sortBy: "date" | "length" | "none";
  sortOrder: "asc" | "desc";
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function useContentFiltering({
  content,
  search,
  seriesFilter,
  maxLength,
  dateFrom,
  dateTo,
  formatFilter,
  sortBy,
  sortOrder,
  currentPage,
  setCurrentPage,
}: FilteringLogicProps) {
  // Reset to first page when filters/sorts change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, seriesFilter, maxLength, dateFrom, dateTo, formatFilter, sortBy, sortOrder, setCurrentPage]);

  const hasActiveFilters = useMemo(() => {
    return (
      search !== "" ||
      seriesFilter !== "all" ||
      maxLength !== "" ||
      dateFrom !== undefined ||
      dateTo !== undefined ||
      formatFilter !== "all" ||
      sortBy !== "none"
    );
  }, [search, seriesFilter, maxLength, dateFrom, dateTo, formatFilter, sortBy]);

  // Filtering
  const filteredContent = useMemo(() => {
    return content.filter((s) => {
      const contentDate = parseLocalDate(s.date);

      const from = dateFrom
        ? new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())
        : null;

      const to = dateTo
        ? new Date(
            dateTo.getFullYear(),
            dateTo.getMonth(),
            dateTo.getDate(),
            23,
            59,
            59,
            999
          )
        : null;

      const keywordMatch =
        (s.title?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (s.series?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const seriesMatch = seriesFilter === "all" || s.series === seriesFilter;
      const lengthMatch = maxLength === "" || s.length <= Number(maxLength);
      const fromMatch = !from || contentDate >= from;
      const toMatch = !to || contentDate <= to;
      const formatMatch = formatFilter === "all" || s.format?.toLowerCase() === formatFilter;

      return keywordMatch && seriesMatch && lengthMatch && fromMatch && toMatch && formatMatch;
    });
  }, [content, search, seriesFilter, maxLength, dateFrom, dateTo, formatFilter]);

  // Sorting
  const sortedContent = useMemo(() => {
    return [...filteredContent].sort((a, b) => {
      if (sortBy === "none") return 0;

      if (sortBy === "date") {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }

      if (sortBy === "length") {
        return sortOrder === "asc" ? a.length - b.length : b.length - a.length;
      }

      return 0;
    });
  }, [filteredContent, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedContent.length / ITEMS_PER_PAGE);

  const paginatedContent = useMemo(() => {
    return sortedContent.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedContent, currentPage]);

  return {
    hasActiveFilters,
    paginatedContent,
    totalPages,
  };
}
