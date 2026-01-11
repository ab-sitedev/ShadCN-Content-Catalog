import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormatFilterProps {
  format: string;
  onChange: (value: string) => void;
}

export default function FormatFilter({ format, onChange }: FormatFilterProps) {
  return (
    <Select
      value={format}
      onValueChange={onChange}
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
  )
}