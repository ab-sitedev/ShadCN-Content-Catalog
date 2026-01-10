import { Button } from "@/components/ui/button";
import { ResetIcon } from "@radix-ui/react-icons";

interface ResetFiltersProps {
    hasActiveFilters: boolean;
    onReset: () => void;
}

export default function ResetFilters({ hasActiveFilters, onReset }: ResetFiltersProps) {
    return (
        <div
            className={`grid transition-all duration-500 ease-out delay-200 ${hasActiveFilters ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
                }`}
        >
            <div className="overflow-hidden">
                <Button
                    className="relative min-h-[40px] w-full"
                    variant="outline"
                    onClick={onReset}
                >
                    Reset Filters
                    <ResetIcon className="absolute right-3 inset-y-0 my-auto text-orange-400 pointer-events-none" />
                </Button>
            </div>
        </div>
    )
}