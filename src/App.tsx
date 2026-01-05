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
  title?: string
  series?: string
  part?: number
  preacher: string
  link: string
  length: number
  image?: string
}

const PLACEHOLDER_IMAGE = "https://nbbc.imgix.net/base/home-jumbotron.jpg?auto=compress&fm=webp"

function App() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [search, setSearch] = useState("")
  const [seriesFilter, setSeriesFilter] = useState("all")
  const [maxLength, setMaxLength] = useState<number | "">("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [sortBy, setSortBy] = useState<"date" | "length" | "none">("none")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetch("/.netlify/functions/sermons")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched sermons:", data)
        setSermons(data)
      })
      .catch((err) => console.error("Failed to fetch sermons:", err))
  }, [])

  const uniqueSeries = Array.from(
    new Set(sermons.map((s) => s.series).filter(Boolean))
  ) as string[]

  // Filtering
  const filteredSermons = sermons.filter((s) => {
    const sermonDate = new Date(s.date)

    const keywordMatch =
      (s.title?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (s.series?.toLowerCase().includes(search.toLowerCase()) ?? false)

    const seriesMatch = seriesFilter === "all" || s.series === seriesFilter
    const lengthMatch = maxLength === "" || s.length <= Number(maxLength)
    const fromMatch = !dateFrom || sermonDate >= dateFrom
    const toMatch = !dateTo || sermonDate <= dateTo

    return keywordMatch && seriesMatch && lengthMatch && fromMatch && toMatch
  })

  // Sorting
  const sortedSermons = [...filteredSermons].sort((a, b) => {
    if (sortBy === "none") return 0

    if (sortBy === "date") {
      const aTime = new Date(a.date).getTime()
      const bTime = new Date(b.date).getTime()
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime
    }

    if (sortBy === "length") {
      return sortOrder === "asc"
        ? a.length - b.length
        : b.length - a.length
    }

    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="mb-6 text-center text-3xl font-bold">
          New Beginnings Baptist Church<br></br>Online Sermon Catalog
        </h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap justify-center gap-4 rounded-lg bg-white p-4 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-wrap gap-4">
              <p className="w-full text-sm font-medium text-gray-500">
                Filter by
              </p>
              <Input
                className="w-full md:w-64"
                placeholder="Search by title or series..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                <SelectTrigger className="w-full md:w-48">
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

              <Input
                type="number"
                className="w-32"
                placeholder="Max length"
                value={maxLength}
                onChange={(e) =>
                  setMaxLength(e.target.value === "" ? "" : Number(e.target.value))
                }
              />

              <div className="flex flex-wrap gap-4">
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
                      onSelect={(d) => setDateFrom(d || undefined)}
                    />
                  </PopoverContent>
                </Popover>

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
                      onSelect={(d) => setDateTo(d || undefined)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <p className="w-full text-sm font-medium text-gray-500">
                Sort by
              </p>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
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
          </div>
          <Button
            className="mr-auto"
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

        {/* Active filter pills */}
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {search && (
            <Badge onClick={() => setSearch("")} className="cursor-pointer">
              🔍 {search} ×
            </Badge>
          )}
          {seriesFilter !== "all" && (
            <Badge onClick={() => setSeriesFilter("all")} className="cursor-pointer">
              Series: {seriesFilter} ×
            </Badge>
          )}
          {maxLength !== "" && (
            <Badge onClick={() => setMaxLength("")} className="cursor-pointer">
              Max Length: {maxLength} ×
            </Badge>
          )}
          {dateFrom && (
            <Badge onClick={() => setDateFrom(undefined)} className="cursor-pointer">
              From: {dateFrom.toISOString().slice(0, 10)} ×
            </Badge>
          )}
          {dateTo && (
            <Badge onClick={() => setDateTo(undefined)} className="cursor-pointer">
              To: {dateTo.toISOString().slice(0, 10)} ×
            </Badge>
          )}
          {sortBy !== "none" && (
            <Badge
              onClick={() => {
                setSortBy("none")
                setSortOrder("desc")
              }}
              className="cursor-pointer"
            >
              Sort: {sortBy} ({sortOrder}) ×
            </Badge>
          )}
        </div>

        {/* Sermon grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {sortedSermons.map((sermon, idx) => {
            const imageUrl =
              sermon.image?.trim() && sermon.image.trim() !== ""
                ? sermon.image
                : PLACEHOLDER_IMAGE

            console.log(
              "IMAGE DEBUG →",
              sermon.title ?? "(untitled)",
              "| raw:",
              sermon.image,
              "| final:",
              imageUrl
            )

            return (
              <Card
                key={idx}
                className="group overflow-hidden transition-all duration-150 hover:scale-[1.01] hover:shadow-lg flex flex-col py-0 gap-0"
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={sermon.title || "Sermon"}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-102"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE
                    }}
                  />

                  {/* Runtime overlay (YouTube-style) */}
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                    {sermon.length} min
                  </div>
                </div>

                <CardContent className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h2 className="mb-1 text-md font-semibold line-clamp-2">
                      {sermon.title ||
                        `${sermon.series ?? "Series"} – Part ${sermon.part ?? ""}`}
                    </h2>

                    <div className="flex items-center gap-2 min-w-0">
          {sermon.series && (
            <Badge className="truncate max-w-full">
              {sermon.series}
            </Badge>
          )}
          {sermon.part && (
            <Badge variant="secondary" className="flex-shrink-0 whitespace-nowrap">
              Part {sermon.part}
            </Badge>
          )}
        </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{sermon.preacher}</p>
                  <Button
                    className="mt-0 w-full"
                    onClick={() => window.open(sermon.link, "_blank")}
                  >
                    Listen
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App