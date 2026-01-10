import { Input } from "@/components/ui/input";

interface LengthFilterProps {
    maxLength: number | "";
    onChange: (value: number | "") => void;
}

export default function LengthFilter({ maxLength, onChange }: LengthFilterProps) {
    return (
        <Input
            type="number"
            min="0"
            className="w-32"
            placeholder="Max runtime"
            value={maxLength}
            onChange={(e) =>
                onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                )
            }
        />
    )
}