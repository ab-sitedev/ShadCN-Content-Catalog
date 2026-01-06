import { Card, CardContent } from "@/components/ui/card"

export default function SermonCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col py-0 gap-0">
      {/* Image skeleton (16:9) */}
      <div className="relative w-full aspect-video">
        <div className="absolute inset-0 animate-shimmer rounded-none" />
      </div>

      <CardContent className="p-4 flex flex-col gap-3">
        {/* Title */}
        <div className="h-4 w-3/4 rounded animate-shimmer" />

        {/* Series + part */}
        <div className="flex gap-2">
          <div className="h-4 w-24 rounded animate-shimmer" />
          <div className="h-4 w-16 rounded animate-shimmer" />
        </div>

        {/* Preacher */}
        <div className="mt-2 h-3 w-1/2 rounded animate-shimmer" />
      </CardContent>
    </Card>
  )
}