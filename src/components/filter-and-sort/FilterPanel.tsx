import type { Content } from '@/types';
import { Button } from "@/components/ui/button";
import SearchInput from "./SearchInput";
import SeriesFilter from "./SeriesFilter";
import DateRangeFilter from "./DateRangeFilter";
import LengthFilter from "./LengthFilter";
import FormatFilter from "./FormatFilter";
import SortControls from "./SortControls";
import FilterPills from "./FilterPills";
import ResetFilters from "./ResetFilters";

interface FilterPanelProps {
    // Filter states
    search: string;
    seriesFilter: string;
    maxLength: number | "";
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    formatFilter: string;
    sortBy: "date" | "length" | "none";
    sortOrder: "asc" | "desc";

    // UI state
    filtersOpen: boolean;
    hasActiveFilters: boolean;
    content: Content[];

    // Setters
    onSearchChange: (value: string) => void;
    onSeriesFilterChange: (value: string) => void;
    onMaxLengthChange: (value: number | "") => void;
    onDateFromChange: (date: Date | undefined) => void;
    onDateToChange: (date: Date | undefined) => void;
    onFormatFilterChange: (value: string) => void;
    onSortByChange: (value: "date" | "length" | "none") => void;
    onSortOrderChange: (order: "asc" | "desc") => void;
    onFiltersOpenChange: (open: boolean) => void;
    onReset: () => void;
}

export default function FilterPanel({
    search,
    seriesFilter,
    maxLength,
    dateFrom,
    dateTo,
    formatFilter,
    sortBy,
    sortOrder,
    filtersOpen,
    hasActiveFilters,
    content,
    onSearchChange,
    onSeriesFilterChange,
    onMaxLengthChange,
    onDateFromChange,
    onDateToChange,
    onFormatFilterChange,
    onSortByChange,
    onSortOrderChange,
    onFiltersOpenChange,
    onReset
}: FilterPanelProps) {
    return (
        <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="flex flex-col gap-2">
                <SearchInput value={search} onChange={onSearchChange} />

                <Button
                    variant="outline"
                    className={filtersOpen ? "rounded-none rounded-tl-md rounded-tr-md lg:hidden" : "rounded-md lg:hidden"}
                    onClick={() => onFiltersOpenChange(!filtersOpen)}
                >
                    {filtersOpen ? "Hide Filters" : "Show Filters"}
                </Button>
            </div>

            <div className={`flex flex-col gap-4 ${filtersOpen ? "block" : "hidden"} lg:block`}>
                <div className="flex flex-col gap-4 rounded-br-lg rounded-bl-lg bg-white p-4 shadow-md lg:rounded-lg">
                    <div className="flex flex-wrap gap-2">
                        <p className="w-full text-sm font-medium text-gray-500">Filter by</p>
                        <SeriesFilter
                            series={seriesFilter}
                            content={content}
                            onChange={onSeriesFilterChange}
                        />
                        <DateRangeFilter
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onDateFromChange={onDateFromChange}
                            onDateToChange={onDateToChange}
                        />
                        <LengthFilter
                            maxLength={maxLength}
                            onChange={onMaxLengthChange}
                        />
                        <FormatFilter
                            format={formatFilter}
                            onChange={onFormatFilterChange}
                        />
                    </div>
                    <FilterPills
                        search={search}
                        seriesFilter={seriesFilter}
                        maxLength={maxLength}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        formatFilter={formatFilter}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSearchClear={() => onSearchChange("")}
                        onSeriesClear={() => onSeriesFilterChange("all")}
                        onLengthClear={() => onMaxLengthChange("")}
                        onDateFromClear={() => onDateFromChange(undefined)}
                        onDateToClear={() => onDateToChange(undefined)}
                        onFormatClear={() => onFormatFilterChange("all")}
                        onSortClear={() => {
                            onSortByChange("none");
                            onSortOrderChange("asc");
                        }}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        <SortControls
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortByChange={onSortByChange}
                            onSortOrderChange={onSortOrderChange}
                        />
                    </div>
                </div>
            </div>

            <ResetFilters hasActiveFilters={hasActiveFilters} onReset={onReset} />
        </aside>
    )
}