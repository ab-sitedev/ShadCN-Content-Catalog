import type { Content } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE } from "@/constants";
import { getRelativeTime, isRecent } from "@/utils/dateUtils";

interface ContentCardProps {
    content: Content;
    onSeriesClick: (series: string) => void;
}

export default function ContentCard({ content, onSeriesClick }: ContentCardProps) {
    const showNew = isRecent(content.date);
    const imageUrl =
                    content.thumbnail?.trim() && content.thumbnail.trim() !== ""
                      ? content.thumbnail
                      : PLACEHOLDER_IMAGE;
    return (
        <Card
            onClick={() => window.open(content.url, "_blank")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    window.open(content.url, "_blank");
                }
            }}
            className="fade-in group cursor-pointer overflow-hidden transition-all duration-150 hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary flex flex-col py-0 gap-0"
        >
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={content.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                />

                {/* Runtime overlay */}
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                    {content.length} min
                </div>
            </div>
            {/* New badge for recent content */}
            {showNew && (
                <Badge className="absolute top-2 left-2 bg-green-600 text-white hover:bg-green-600">
                    New
                </Badge>
            )}
            <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <h2 className="my-1 text-md font-semibold line-clamp-2">
                        {content.title ||
                            `${content.series ?? "Series"}`}
                    </h2>

                    <div className="mb-2 flex items-center gap-2 min-w-0">
                        {content.series && (
                            <Badge
                                role="button"
                                tabIndex={0}
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSeriesClick(content.series!);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.stopPropagation();
                                        onSeriesClick(content.series!);
                                    }
                                }}
                            >
                                <p className="text-[10px] truncate max-w-full">
                                    {content.series}
                                </p>
                            </Badge>
                        )}

                        {content.part && (
                            <Badge
                                variant="secondary"
                                className="flex-shrink-0 whitespace-nowrap"
                            >
                                <p className="text-[10px] flex-shrink-0 whitespace-nowrap">
                                    Part {content.part}
                                </p>
                            </Badge>
                        )}
                    </div>
                </div>
                <p className="empty:hidden text-sm text-muted-foreground mt-3">
                    {content.speaker}
                </p>
                <p className="text-xs text-muted-foreground">
                    {content.format} • {getRelativeTime(content.date)}
                </p>
            </CardContent>
        </Card>
    )
}