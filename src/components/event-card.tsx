import Link from "next/link";
import type { Event, Instructor } from "@/lib/types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventCard({
  event,
  instructors,
  isPast = false,
}: {
  event: Event;
  instructors: Instructor[];
  isPast?: boolean;
}) {
  const isFull = event.status === "Full" || event.spotsRemaining === 0;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col h-full bg-card border border-border rounded-[14px] overflow-hidden transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_4px_18px_rgba(38,82,230,0.09)]"
    >
      {/* Cover image */}
      <div className="relative h-44 bg-gradient-to-br from-cobalt-soft to-paper overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 256 256"
              fill="none"
              className="w-16 h-16 opacity-20"
            >
              <path
                d="M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z"
                stroke="#2652e6"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {isPast ? (
          <div className="absolute top-3 right-3 bg-dust text-white text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full">
            Past
          </div>
        ) : isFull ? (
          <div className="absolute top-3 right-3 bg-ink text-white text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full">
            Full
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="bg-cobalt-soft text-cobalt text-[0.7rem] font-semibold tracking-wide px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-[family-name:var(--font-display)] text-xl text-ink leading-snug line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-dust leading-relaxed line-clamp-2">
          {event.description}
        </p>

        {/* Instructors */}
        {instructors.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex -space-x-2">
              {instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="w-7 h-7 rounded-full bg-cobalt-soft border-2 border-card flex items-center justify-center"
                >
                  {inst.photo ? (
                    <img
                      src={inst.photo}
                      alt={inst.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-cobalt">
                      {inst.name.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-dust">
              {instructors.map((i) => i.name).join(", ")}
            </span>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border">
          <div className="flex items-center gap-3 text-xs text-dust">
            <span>{formatDate(event.date)}</span>
            {event.duration && (
              <>
                <span className="text-border-strong">·</span>
                <span>{event.duration}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isFull && event.spotsRemaining <= 5 && event.capacity > 0 && (
              <span className="text-xs text-gold font-medium">
                {event.spotsRemaining} left
              </span>
            )}
            <span className="text-sm font-semibold text-cobalt">
              Free
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
