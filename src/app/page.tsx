import { Suspense } from "react";
import { getEvents, getInstructors } from "@/lib/notion";
import { EventCard } from "@/components/event-card";
import { TagFilter } from "@/components/tag-filter";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const params = await searchParams;
  const [events, instructors] = await Promise.all([
    getEvents(),
    getInstructors(),
  ]);

  const allTags = [...new Set(events.flatMap((e) => e.tags))].sort();

  const now = new Date();

  // Sort: upcoming first (soonest first), then past (most recent first)
  const sorted = [...events].sort((a, b) => {
    const aDate = a.date ? new Date(a.date) : new Date(0);
    const bDate = b.date ? new Date(b.date) : new Date(0);
    const aUpcoming = aDate >= now;
    const bUpcoming = bDate >= now;

    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    if (aUpcoming && bUpcoming) return aDate.getTime() - bDate.getTime();
    return bDate.getTime() - aDate.getTime(); // past: most recent first
  });

  const filtered = params.tag
    ? sorted.filter((e) => e.tags.includes(params.tag!))
    : sorted;

  const instructorMap = new Map(instructors.map((i) => [i.id, i]));

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      {/* Hero */}
      <section className="text-center mb-10 sm:mb-16 fade-up">
        <div className="inline-flex items-center gap-2 bg-cobalt-soft text-cobalt text-xs font-bold tracking-[0.16em] uppercase px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cobalt" />
          Upcoming Events
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,5vw,3.8rem)] text-ink leading-tight mb-5">
          Learn by doing.
        </h1>
        <p className="text-lg text-dust max-w-xl mx-auto leading-relaxed">
          Hands-on events in AI, automation, design, and engineering.
          Small groups, expert instructors, real projects.
        </p>
      </section>

      {/* Filters */}
      <section className="mb-10 fade-up fade-up-d1">
        <Suspense>
          <TagFilter tags={allTags} />
        </Suspense>
      </section>

      {/* Event Grid */}
      {(() => {
        const upcoming = filtered.filter(
          (e) => !e.date || new Date(e.date) >= now
        );
        const past = filtered.filter(
          (e) => e.date && new Date(e.date) < now
        );

        return (
          <>
            {upcoming.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((event, i) => (
                  <div
                    key={event.id}
                    className={`fade-up h-full ${
                      i % 4 === 0
                        ? ""
                        : i % 4 === 1
                          ? "fade-up-d1"
                          : i % 4 === 2
                            ? "fade-up-d2"
                            : "fade-up-d3"
                    }`}
                  >
                    <EventCard
                      event={event}
                      instructors={event.instructorIds
                        .map((id) => instructorMap.get(id))
                        .filter(Boolean) as any}
                    />
                  </div>
                ))}
              </section>
            )}

            {past.length > 0 && (
              <>
                <div className="flex items-center gap-4 mt-16 mb-8">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-semibold text-dust tracking-wide uppercase">
                    Past Events
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                  {past.map((event, i) => (
                    <div
                      key={event.id}
                      className={`fade-up h-full ${
                        i % 4 === 0
                          ? ""
                          : i % 4 === 1
                            ? "fade-up-d1"
                            : i % 4 === 2
                              ? "fade-up-d2"
                              : "fade-up-d3"
                      }`}
                    >
                      <EventCard
                        event={event}
                        isPast
                        instructors={event.instructorIds
                          .map((id) => instructorMap.get(id))
                          .filter(Boolean) as any}
                      />
                    </div>
                  ))}
                </section>
              </>
            )}
          </>
        );
      })()}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-dust text-lg">
            No events found for this filter.
          </p>
        </div>
      )}
    </div>
  );
}
