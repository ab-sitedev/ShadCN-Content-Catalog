import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Sermon = {
  date: string
  title: string
  series?: string
  part?: number
  link: string
  length: number
  image: string
}

function App() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [search, setSearch] = useState("")
  const [seriesFilter, setSeriesFilter] = useState<string>("all")
  const [maxLength, setMaxLength] = useState<number | "">("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [sortBy, setSortBy] = useState<"date" | "length" | "none">("none")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetch("/.netlify/functions/sermons")
      .then((res) => res.json())
      .then((data) => setSermons(data))
      .catch((err) => console.error("Failed to fetch sermons:", err))
  }, [])

  const PLACEHOLDER_IMAGE ="https://placehold.co/600x400"

  const uniqueSeries = Array.from(
    new Set(sermons.map((s) => s.series).filter(Boolean))
  ) as string[]

  // Apply filters
  const filteredSermons = sermons.filter((s) => {
    const sermonDate = new Date(s.date)

    const keywordMatch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.series?.toLowerCase().includes(search.toLowerCase()) ?? false)

    const seriesMatch = seriesFilter === "all" || s.series === seriesFilter

    const lengthMatch = maxLength === "" || s.length <= Number(maxLength)

    const fromMatch = !dateFrom || sermonDate >= dateFrom
    const toMatch = !dateTo || sermonDate <= dateTo

    return keywordMatch && seriesMatch && lengthMatch && fromMatch && toMatch
  })

  // Apply sorting
  const sortedSermons = [...filteredSermons].sort((a, b) => {
    if (sortBy === "none") return 0

    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    }

    if (sortBy === "length") {
      return sortOrder === "asc" ? a.length - b.length : b.length - a.length
    }

    return 0
  })

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Sermon Catalog
      </h1>

      {/* Filter Panel */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center bg-white p-4 rounded-lg shadow-md">
        {/* Keyword search */}
        <Input
          placeholder="Search by title or series..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Series Select */}
        <Select value={seriesFilter} onValueChange={(val) => setSeriesFilter(val)}>
          <SelectTrigger className="w-48">
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

        {/* Max length */}
        <Input
          type="number"
          placeholder="Max length (min)"
          className="w-32"
          value={maxLength}
          onChange={(e) =>
            setMaxLength(e.target.value === "" ? "" : Number(e.target.value))
          }
        />

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {dateFrom ? dateFrom.toISOString().slice(0, 10) : "From Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(date) => setDateFrom(date || undefined)}
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {dateTo ? dateTo.toISOString().slice(0, 10) : "To Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(date) => setDateTo(date || undefined)}
            />
          </PopoverContent>
        </Popover>

        {/* Sort controls */}
        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
            <SelectTrigger className="w-40">
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
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
            >
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </Button>
          )}
        </div>

        {/* Clear Filters */}
        <Button
          variant="secondary"
          onClick={() => {
            setSearch("")
            setSeriesFilter("all")
            setMaxLength("")
            setDateFrom(undefined)
            setDateTo(undefined)
            setSortBy("none")
            setSortOrder("desc")
          }}
        >
          Clear Filters
        </Button>
      </div>
      {/* Active Filters */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {/* Search pill */}
        {search && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearch("")}>
            🔍 {search} ×
          </Badge>
        )}

        {/* Series pill */}
        {seriesFilter !== "all" && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setSeriesFilter("all")}>
            Series: {seriesFilter} ×
          </Badge>
        )}

        {/* Max length pill */}
        {maxLength !== "" && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setMaxLength("")}>
            Max Length: {maxLength} min ×
          </Badge>
        )}

        {/* Date From pill */}
        {dateFrom && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setDateFrom(undefined)}>
            From: {dateFrom.toISOString().slice(0, 10)} ×
          </Badge>
        )}

        {/* Date To pill */}
        {dateTo && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setDateTo(undefined)}>
            To: {dateTo.toISOString().slice(0, 10)} ×
          </Badge>
        )}

        {/* Sort pill */}
        {sortBy !== "none" && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => { setSortBy("none"); setSortOrder("desc") }}>
            Sort: {sortBy} ({sortOrder}) ×
          </Badge>
        )}
      </div>

      {/* Sermon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedSermons.map((sermon, idx) => (
          <Card key={idx} className="overflow-hidden">
            <img
              src={sermon.image || PLACEHOLDER_IMAGE}
              alt={sermon.title || "Sermon"}
              className="h-40 w-full object-cover"
            />
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-1">
                {sermon.title || `Series ${sermon.series} - Part ${sermon.part}`}
              </h2>
              {sermon.series && (
                <Badge className="mb-1">{sermon.series}</Badge>
              )}
              {sermon.part && (
                <Badge variant="secondary" className="ml-1">
                  Part {sermon.part}
                </Badge>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {sermon.date} • {sermon.length} min
              </p>
              <Button
                className="mt-3 w-full"
                onClick={() => window.open(sermon.link, "_blank")}
              >
                Listen
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default App