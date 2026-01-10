import type { Content } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SeriesFilterProps {
    series: string;
    content: Content[];
    onChange: (value: string) => void;
}

export default function SeriesFilter({ series, content, onChange }: SeriesFilterProps) {
    const uniqueSeries = Array.from(
        new Set(content.map((s) => s.series).filter(Boolean))
    ) as string[];
    return (
        <Select
            value={series}
            onValueChange={onChange}
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
    )
}