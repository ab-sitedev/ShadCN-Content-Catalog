import { Input } from "../ui/input"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
    return (
        <div className="relative w-full mb-4">
            <Input
                className="w-full pr-10"
                placeholder="Search by title or series..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute right-3 inset-y-0 my-auto text-gray-400 pointer-events-none" />
        </div>
    )
}