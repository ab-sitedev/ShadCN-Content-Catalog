import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SortControlsProps {
    sortBy: "date" | "length" | "none";
    sortOrder: "asc" | "desc";
    onSortByChange: (value: "date" | "length" | "none") => void;
    onSortOrderChange: (order: "asc" | "desc") => void;
}

export default function SortControls({ sortBy, sortOrder, onSortByChange, onSortOrderChange }: SortControlsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <p className="w-full text-sm font-medium text-gray-500">
                Sort by
            </p>
            <div className="flex gap-2">
                <Select value={sortBy} onValueChange={onSortByChange}>
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
                            onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
                        }
                    >
                        {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                    </Button>
                )}
            </div>
        </div>
    )
}