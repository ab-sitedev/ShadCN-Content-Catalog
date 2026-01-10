import { useEffect } from "react";

interface UrlSyncProps {
  search: string;
  seriesFilter: string;
  maxLength: number | "";
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  formatFilter: string;
  sortBy: "date" | "length" | "none";
  sortOrder: "asc" | "desc";
  currentPage: number;
}

export function useUrlSync({
  search,
  seriesFilter,
  maxLength,
  dateFrom,
  dateTo,
  formatFilter,
  sortBy,
  sortOrder,
  currentPage,
}: UrlSyncProps) {
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("q", search);
    if (seriesFilter !== "all") params.set("series", seriesFilter);
    if (maxLength !== "") params.set("maxLength", String(maxLength));
    if (dateFrom) params.set("from", dateFrom.toISOString().slice(0, 10));
    if (dateTo) params.set("to", dateTo.toISOString().slice(0, 10));
    if (formatFilter !== "all") params.set("format", formatFilter);
    if (sortBy !== "none") params.set("sort", sortBy);
    if (sortBy !== "none") params.set("order", sortOrder);
    if (currentPage !== 1) params.set("page", String(currentPage));

    const newUrl =
      params.toString().length > 0
        ? `?${params.toString()}`
        : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  }, [search, seriesFilter, maxLength, dateFrom, dateTo, formatFilter, sortBy, sortOrder, currentPage]);
}
