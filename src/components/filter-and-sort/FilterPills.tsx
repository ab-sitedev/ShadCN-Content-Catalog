import { Badge } from "@/components/ui/badge";

interface FilterPillsProps {
    search: string;
    seriesFilter: string;
    maxLength: number | "";
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    formatFilter: string;
    sortBy: "date" | "length" | "none";
    sortOrder: "asc" | "desc";
    // Callbacks
    onSearchClear: () => void;
    onSeriesClear: () => void;
    onLengthClear: () => void;
    onDateFromClear: () => void;
    onDateToClear: () => void;
    onFormatClear: () => void;
    onSortClear: () => void;
}

export default function FilterPills({ search, seriesFilter, maxLength, dateFrom, dateTo, formatFilter, sortBy, sortOrder, onSearchClear, onSeriesClear, onLengthClear, onDateFromClear, onDateToClear, onFormatClear, onSortClear }: FilterPillsProps) {
    return (
        <div className="empty:hidden flex flex-wrap gap-2">
            {search && (
                <Badge onClick={onSearchClear} className="cursor-pointer">
                    Keyword: {search} ×
                </Badge>
            )}
            {seriesFilter !== "all" && (
                <Badge onClick={onSeriesClear} className="cursor-pointer">
                    Series: {seriesFilter} ×
                </Badge>
            )}
            {maxLength !== "" && (
                <Badge onClick={onLengthClear} className="cursor-pointer">
                    Max Length: {maxLength} ×
                </Badge>
            )}
            {dateFrom && (
                <Badge onClick={onDateFromClear} className="cursor-pointer">
                    From: {dateFrom.toISOString().slice(0, 10)} ×
                </Badge>
            )}
            {dateTo && (
                <Badge onClick={onDateToClear} className="cursor-pointer">
                    To: {dateTo.toISOString().slice(0, 10)} ×
                </Badge>
            )}
            {formatFilter !== "all" && (
                <Badge onClick={onFormatClear} className="cursor-pointer">
                    Format: {formatFilter} ×
                </Badge>
            )}
            {sortBy !== "none" && (
                <Badge onClick={onSortClear} className="cursor-pointer">
                    Sort: {sortBy} ({sortOrder}) ×
                </Badge>
            )}
        </div>
    )
}