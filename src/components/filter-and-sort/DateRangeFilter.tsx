import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangeFilterProps {
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    onDateFromChange: (date: Date | undefined) => void;
    onDateToChange: (date: Date | undefined) => void;
}

export default function DateRangeFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateRangeFilterProps) {
    return (
        <div className="flex gap-2">
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
                        onSelect={(d) => onDateFromChange(d || undefined)}
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
                        onSelect={(d) => onDateToChange(d || undefined)}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}