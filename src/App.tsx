import { useState, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon, ResetIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SermonCardSkeleton from "@/components/SermonCardSkeleton";

type Sermon = {
  date: string;
  title?: string;
  series?: string;
  part?: number;
  preacher: string;
  link: string;
  length: number;
  image?: string;
  format: string;
};

const PLACEHOLDER_IMAGE =
  "https://nbbc.imgix.net/base/home-jumbotron.jpg?auto=compress&fm=webp";

function App() {
  /******* BEGIN STATES *******/

  /******* SERMONS *******/
  const [sermons, setSermons] = useState<Sermon[]>([]);

  /******* FILTER STATES *******/
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

  /******* UTILITIES *******/
  const ITEMS_PER_PAGE = 20;
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadStartTime] = useState(() => Date.now());
  const [filterNotice, setFilterNotice] = useState<string | null>(null);
  const [filterNoticeVisible, setFilterNoticeVisible] = useState(false);
  // Check if any filters are active
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

  /******* END STATES *******/
  /******* BEGIN HELPER FUNCTIONS *******/

  function getQueryParam(name: string) {
    return new URLSearchParams(window.location.search).get(name);
  }

  useEffect(() => {
    fetch("/.netlify/functions/sermons", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched sermons:", data);
        setSermons(data);
      })
      .catch((err) => console.error("Failed to fetch sermons:", err))
      .finally(() => {
        const MIN_LOADING_TIME = 2000; // Time in ms to show skeleton loaders. On fast connections, this prevents jarring quick flashes.
        const elapsed = Date.now() - loadStartTime;
        const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

        setTimeout(() => {
          setInitialLoading(false);
        }, remaining);
      });
  }, []);

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
  }, [
    search,
    seriesFilter,
    maxLength,
    dateFrom,
    dateTo,
    formatFilter,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    seriesFilter,
    maxLength,
    dateFrom,
    dateTo,
    formatFilter,
    sortBy,
    sortOrder,
  ]);

  // Send iframe height to parent page for dynamic resizing
  useEffect(() => {
    const sendHeight = () => {
      if (window.parent !== window) {
        const container = document.getElementById('app-container');
        if (container) {
          // Measure the container height plus the padding from parent div (p-8 = 2rem = 32px on each side = 64px total)
          const height = container.offsetHeight + 64;
          window.parent.postMessage({
            type: 'resizeIframe',
            height: height
          }, '*');
        }
      }
    };

    // Send initial height
    sendHeight();

    // Send height on window resize
    window.addEventListener('resize', sendHeight);

    // Use ResizeObserver to detect content changes
    const container = document.getElementById('app-container');
    const resizeObserver = new ResizeObserver(sendHeight);
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('resize', sendHeight);
      resizeObserver.disconnect();
    };
  }, [sermons.length, filtersOpen, filterNoticeVisible, currentPage, search, seriesFilter, maxLength, dateFrom, dateTo, formatFilter, sortBy]);

  const uniqueSeries = Array.from(
    new Set(sermons.map((s) => s.series).filter(Boolean))
  ) as string[];

  // Filtering
  const filteredSermons = sermons.filter((s) => {
    const sermonDate = parseLocalDate(s.date);

    const from = dateFrom
      ? new Date(
          dateFrom.getFullYear(),
          dateFrom.getMonth(),
          dateFrom.getDate()
        )
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
    const fromMatch = !from || sermonDate >= from;
    const toMatch = !to || sermonDate <= to;
    const formatMatch =
      formatFilter === "all" || s.format?.toLowerCase() === formatFilter;

    return (
      keywordMatch &&
      seriesMatch &&
      lengthMatch &&
      fromMatch &&
      toMatch &&
      formatMatch
    );
  });

  // Sorting
  const sortedSermons = [...filteredSermons].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedSermons.length / ITEMS_PER_PAGE);

  const paginatedSermons = sortedSermons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function parseLocalDate(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function getRelativeTime(dateString: string) {
    const sermonDate = parseLocalDate(dateString);
    const now = new Date();

    const diffMs = now.getTime() - sermonDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffWeeks < 5)
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;

    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  }

  function isRecent(dateString: string, days = 3) {
    const sermonDate = parseLocalDate(dateString);
    const now = new Date();
    const diffMs = now.getTime() - sermonDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= days;
  }

  function applySeriesFilter(series: string) {
    // If the series is already active, do nothing
    if (seriesFilter === series) return;

    window.scrollTo(0, 0);

    // Request parent to scroll if in iframe
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'scrollToTop' }, '*');
    }

    setSeriesFilter(series);
    setFilterNotice(`Filtered by series: ${series}`);
    setFilterNoticeVisible(true);

    // Hide visibility first (triggers fade-out), then clear content
    setTimeout(() => {
      setFilterNoticeVisible(false);
    }, 4000);

    setTimeout(() => {
      setFilterNotice(null);
    }, 4700); // After fade-out completes (4000 + 500 opacity + 200 delay)
  }

  /******* END HELPER FUNCTIONS *******/

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-[1200px]" id="app-container">
        <img
          src="/images/nbbc-badge-color.svg"
          alt="NBBC Badge"
          className="mx-auto md:ml-0 md:mr-auto mb-8 w-38"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar (filters) */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="flex flex-col gap-2">
              <div className="relative w-full mb-4">
                <Input
                  className="w-full pr-10"
                  placeholder="Search by title or series..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute right-3 inset-y-0 my-auto text-gray-400 pointer-events-none" />
              </div>

              {/* Mobile toggle */}
              <Button
                variant="outline"
                className={
                  filtersOpen
                    ? "rounded-none rounded-tl-md rounded-tr-md lg:hidden"
                    : "rounded-md lg:hidden"
                }
                onClick={() => setFiltersOpen((o) => !o)}
              >
                {filtersOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
            <div
              className={`flex flex-col gap-4 ${
                filtersOpen ? "block" : "hidden"
              } lg:block`}
            >
              {/* Filters */}
              <div className="flex flex-col gap-4 rounded-br-lg rounded-bl-lg bg-white p-4 shadow-md lg:rounded-lg">
                <div className="flex flex-col gap-4 md:flex-col md:items-start md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <p className="w-full text-sm font-medium text-gray-500">
                      Filter by
                    </p>

                    <Select
                      value={seriesFilter}
                      onValueChange={setSeriesFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Series" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Series</SelectItem>
                        {uniqueSeries.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            {dateFrom
                              ? dateFrom.toISOString().slice(0, 10)
                              : "From Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={(d) => setDateFrom(d || undefined)}
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            {dateTo
                              ? dateTo.toISOString().slice(0, 10)
                              : "To Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={(d) => setDateTo(d || undefined)}
                          />
                        </PopoverContent>
                      </Popover>

                      <Input
                        type="number"
                        min="0"
                        className="w-32"
                        placeholder="Max runtime"
                        value={maxLength}
                        onChange={(e) =>
                          setMaxLength(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />

                      <Select
                        value={formatFilter}
                        onValueChange={setFormatFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Formats" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Formats</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Active filter pills */}
                  <div className="empty:hidden flex flex-wrap gap-2">
                    {search && (
                      <Badge
                        onClick={() => setSearch("")}
                        className="cursor-pointer"
                      >
                        Keyword: {search} ×
                      </Badge>
                    )}
                    {seriesFilter !== "all" && (
                      <Badge
                        onClick={() => setSeriesFilter("all")}
                        className="cursor-pointer"
                      >
                        Series: {seriesFilter} ×
                      </Badge>
                    )}
                    {maxLength !== "" && (
                      <Badge
                        onClick={() => setMaxLength("")}
                        className="cursor-pointer"
                      >
                        Max Length: {maxLength} ×
                      </Badge>
                    )}
                    {dateFrom && (
                      <Badge
                        onClick={() => setDateFrom(undefined)}
                        className="cursor-pointer"
                      >
                        From: {dateFrom.toISOString().slice(0, 10)} ×
                      </Badge>
                    )}
                    {dateTo && (
                      <Badge
                        onClick={() => setDateTo(undefined)}
                        className="cursor-pointer"
                      >
                        To: {dateTo.toISOString().slice(0, 10)} ×
                      </Badge>
                    )}
                    {formatFilter !== "all" && (
                      <Badge
                        onClick={() => setFormatFilter("all")}
                        className="cursor-pointer"
                      >
                        Format: {formatFilter} ×
                      </Badge>
                    )}

                    {sortBy !== "none" && (
                      <Badge
                        onClick={() => {
                          setSortBy("none");
                          setSortOrder("desc");
                        }}
                        className="cursor-pointer"
                      >
                        Sort: {sortBy} ({sortOrder}) ×
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="w-full text-sm font-medium text-gray-500">
                      Sort by
                    </p>
                    <div className="flex gap-2">
                      <Select
                        value={sortBy}
                        onValueChange={(v) => setSortBy(v as any)}
                      >
                        <SelectTrigger className="w-full md:w-40">
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="length">Length</SelectItem>
                        </SelectContent>
                      </Select>

                      {sortBy !== "none" && (
                        <Button
                          className="h-auto"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                          }
                        >
                          {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`grid transition-all duration-500 ease-out delay-200 ${
                hasActiveFilters ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <Button
                  className="relative min-h-[40px] w-full"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSeriesFilter("all");
                    setMaxLength("");
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    setFormatFilter("all");
                    setSortBy("none");
                    setSortOrder("desc");
                  }}
                >
                  Reset Filters
                  <ResetIcon className="absolute right-3 inset-y-0 my-auto text-orange-400 pointer-events-none" />
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content (grid) */}
          <main>
            <div
              className={`grid transition-all duration-500 ease-out delay-200 ${
                filterNoticeVisible ? "grid-rows-[1fr] mb-4" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`min-h-[40px] rounded-md bg-green-200 border-solid border-green-400 border-b-2 px-4 py-2 text-sm text-primary shadow-sm transition-opacity duration-500 ${
                    filterNoticeVisible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {filterNotice}
                </div>
              </div>
            </div>

            {/* Sermon grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {initialLoading
                ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <SermonCardSkeleton key={i} />
                  ))
                : paginatedSermons.map((sermon, idx) => {
                    const showNew = isRecent(sermon.date);
                    const imageUrl =
                      sermon.image?.trim() && sermon.image.trim() !== ""
                        ? sermon.image
                        : PLACEHOLDER_IMAGE;

                    return (
                      <Card
                        key={idx}
                        onClick={() => window.open(sermon.link, "_blank")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            window.open(sermon.link, "_blank");
                          }
                        }}
                        className="fade-in group cursor-pointer overflow-hidden transition-all duration-150 hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary flex flex-col py-0 gap-0"
                      >
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={sermon.title || "Sermon"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />

                          {/* Runtime overlay (YouTube-style) */}
                          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                            {sermon.length} min
                          </div>
                        </div>

                        {/* New badge for recent sermons */}
                        {showNew && (
                          <Badge className="absolute top-2 left-2 bg-green-600 text-white hover:bg-green-600">
                            New
                          </Badge>
                        )}

                        <CardContent className="p-4 flex flex-col flex-1">
                          <div className="flex-1">
                            <h2 className="my-1 text-md font-semibold line-clamp-2">
                              {sermon.title ||
                                //`${sermon.series ?? "Series"} – Part ${sermon.part ?? ""}`}
                                `${sermon.series ?? "Series"}`}
                            </h2>

                            <div className="mb-2 flex items-center gap-2 min-w-0">
                              {sermon.series && (
                                <Badge
                                  role="button"
                                  tabIndex={0}
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applySeriesFilter(sermon.series!);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.stopPropagation();
                                      applySeriesFilter(sermon.series!);
                                    }
                                  }}
                                >
                                  <p className="text-[10px] truncate max-w-full">
                                    {sermon.series}
                                  </p>
                                </Badge>
                              )}

                              {sermon.part && (
                                <Badge
                                  variant="secondary"
                                  className="flex-shrink-0 whitespace-nowrap"
                                >
                                  <p className="text-[10px] flex-shrink-0 whitespace-nowrap">
                                    Part {sermon.part}
                                  </p>
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="empty:hidden text-sm text-muted-foreground mt-3">
                            {sermon.preacher}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sermon.format} • {getRelativeTime(sermon.date)}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
            </div>
            {/* Pagination */}
            {!initialLoading && totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

/*
Improvements:

- ✅ Move filter and sort into a sidebar component, only stacking vertically on mobile.
- ✅ Force 16:9 aspect ratio for sermon images to avoid overflow.
- ✅ Add pagination for large sermon lists.
- ✅ Add lazy loading for sermon cards.
- ✅ iframe CSP override (now its allowed to be embedded)
- ✅ Include relative date in sermon cards. (3 weeks ago, 2 days ago, etc...)
- ✅ Add "New" badge for sermons added in the last 14 days.
- Clean up app.tsx, split into smaller components.
- ✅ Update favicon to NBBC logo.
- ✅ Rotate private key for Netlify function.
- ✅ During alpha stage, disable caching on fetch to always get latest sermons.
- ✅ Include file format (Video or Audio) in cards.
- ✅ Include file format (Video or Audio) in filters.
- In full release, implement a chaching strategy to avoid rate limits.
- ✅ Incorporate filtering into URL query params for sharing and enabling the next enhancment:
- ✅ Allow clicking on card badges to set filters (i.e. click on "Series" badge to filter by that series).
- Improve keyword search. Currently only supports "starts with" logic.
*/
