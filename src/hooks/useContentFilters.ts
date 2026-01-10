import { useState } from "react";
import { parseLocalDate } from "@/utils/dateUtils";
import { getQueryParam } from "@/utils/urlUtils";

export function useContentFilters() {
  const [search, setSearch] = useState(() => getQueryParam("q") ?? "");
  const [seriesFilter, setSeriesFilter] = useState(
    () => getQueryParam("series") ?? "all"
  );
  const [maxLength, setMaxLength] = useState<number | "">(() => {
    const v = getQueryParam("maxLength");
    return v ? Number(v) : "";
  });
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
    const v = getQueryParam("from");
    return v ? parseLocalDate(v) : undefined;
  });
  const [dateTo, setDateTo] = useState<Date | undefined>(() => {
    const v = getQueryParam("to");
    return v ? parseLocalDate(v) : undefined;
  });
  const [formatFilter, setFormatFilter] = useState(() => {
    return getQueryParam("format") ?? "all";
  });
  const [sortBy, setSortBy] = useState<"date" | "length" | "none">(
    () => (getQueryParam("sort") as any) ?? "none"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    () => (getQueryParam("order") as any) ?? "desc"
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const v = getQueryParam("page");
    return v ? Number(v) : 1;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterNotice, setFilterNotice] = useState<string | null>(null);
  const [filterNoticeVisible, setFilterNoticeVisible] = useState(false);

  const handleResetFilters = () => {
    setSearch("");
    setSeriesFilter("all");
    setMaxLength("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setFormatFilter("all");
    setSortBy("none");
    setSortOrder("desc");
  };

  return {
    search,
    setSearch,
    seriesFilter,
    setSeriesFilter,
    maxLength,
    setMaxLength,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    formatFilter,
    setFormatFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    filtersOpen,
    setFiltersOpen,
    filterNotice,
    setFilterNotice,
    filterNoticeVisible,
    setFilterNoticeVisible,
    handleResetFilters,
  };
}
