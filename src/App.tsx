/******* EXTERNAL *******/
import { useState } from "react";

/******* INTERNAL *******/
import FilterPanel from "@/components/filter-and-sort/FilterPanel";
import FilterNotice from "@/components/content/FilterNotice";
import ContentGrid from "@/components/content/ContentGrid";
import Pagination from "@/components/ui/Pagination";

/******* HOOKS *******/
import {
  useContentData,
  useContentFilters,
  useContentFiltering,
  useUrlSync,
  useIframeMessaging,
} from "@/hooks";

function App() {
  // Fetch content data
  const { content, initialLoading } = useContentData();

  // Manage all filter and pagination state
  const {
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
  } = useContentFilters();

  // Calculate filtered/sorted content and pagination
  const { hasActiveFilters, paginatedContent, totalPages } = useContentFiltering({
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
  });

  // Sync filter state to URL parameters
  useUrlSync({
    search,
    seriesFilter,
    maxLength,
    dateFrom,
    dateTo,
    formatFilter,
    sortBy,
    sortOrder,
    currentPage,
  });

  // Send iframe height to parent
  useIframeMessaging({
    dependencies: [
      content.length,
      filtersOpen,
      filterNoticeVisible,
      currentPage,
      search,
      seriesFilter,
      maxLength,
      dateFrom,
      dateTo,
      formatFilter,
      sortBy,
    ],
  });

  function applySeriesFilter(series: string) {
    if (seriesFilter === series) return;

    window.scrollTo(0, 0);

    if (window.parent !== window) {
      window.parent.postMessage({ type: "scrollToTop" }, "*");
    }

    setSeriesFilter(series);
    setFilterNotice(`Filtered by series: ${series}`);
    setFilterNoticeVisible(true);

    setTimeout(() => {
      setFilterNoticeVisible(false);
    }, 4000);

    setTimeout(() => {
      setFilterNotice(null);
    }, 4700);
  }

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
          <FilterPanel
            search={search}
            seriesFilter={seriesFilter}
            maxLength={maxLength}
            dateFrom={dateFrom}
            dateTo={dateTo}
            formatFilter={formatFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            filtersOpen={filtersOpen}
            hasActiveFilters={hasActiveFilters}
            content={content}
            onSearchChange={setSearch}
            onSeriesFilterChange={setSeriesFilter}
            onMaxLengthChange={setMaxLength}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onFormatFilterChange={setFormatFilter}
            onSortByChange={setSortBy as any}
            onSortOrderChange={setSortOrder}
            onFiltersOpenChange={setFiltersOpen}
            onReset={handleResetFilters}
          />

          {/* Main content (grid) */}
          <main>
            <FilterNotice
              message={filterNotice}
              isVisible={filterNoticeVisible}
            />
            {/* Content grid */}
            <ContentGrid
              content={paginatedContent}
              initialLoading={initialLoading}
              onSeriesClick={applySeriesFilter}
            />
            {/* Pagination */}
            {!initialLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;