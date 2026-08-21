"use client";

import { Video } from "lucide-react";

export function YouTubePlayer({
  videoId,
  title,
}: {
  videoId: string;
  title?: string;
}) {
  if (!videoId) return null;

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-md">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5 text-[12px] font-bold text-foreground uppercase tracking-wider">
        <Video className="size-4 text-[var(--accent-blue)]" />
        <span>Video Lecture: {title ?? "Course Video"}</span>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title ?? "Mathematics Video Lecture"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </div>
  );
}
