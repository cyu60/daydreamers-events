import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getEvents,
  getEventBySlugWithRegistrations,
  getInstructorsByIds,
} from "@/lib/notion";
import { InstructorCard } from "@/components/instructor-card";
import { EventCard } from "@/components/event-card";

export const revalidate = 30;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlugWithRegistrations(slug);
  if (!event) notFound();

  const instructors = await getInstructorsByIds(event.instructorIds);

  const allEvents = await getEvents();
  const related = allEvents
    .filter(
      (e) =>
        e.id !== event.id &&
        e.tags.some((t) => event.tags.includes(t))
    )
    .slice(0, 2);

  const isFull =
    event.status === "Full" || event.spotsRemaining === 0;

  const iMap = new Map(instructors.map((i) => [i.id, i]));

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8 fade-up">
        <Link
          href="/"
          className="text-sm text-dust hover:text-cobalt transition-colors duration-150"
        >
          &larr; All Events
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover */}
          <div className="relative h-64 sm:h-80 bg-gradient-to-br from-cobalt-soft to-paper rounded-[28px] overflow-hidden fade-up">
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
                  className="w-24 h-24 opacity-15"
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
            {isFull && (
              <div className="absolute top-4 right-4 bg-ink text-white text-sm font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full">
                Full
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 fade-up fade-up-d1">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="bg-cobalt-soft text-cobalt text-xs font-semibold tracking-wide px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] text-ink leading-tight fade-up fade-up-d1">
            {event.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-dust fade-up fade-up-d2">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(event.date)}
            </span>
            {event.duration && (
              <>
                <span className="text-border-strong">·</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event.duration}
                </span>
              </>
            )}
            {event.capacity > 0 && (
              <>
                <span className="text-border-strong">·</span>
                <span>
                  {event.spotsRemaining} of {event.capacity} spots left
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-lg max-w-none fade-up fade-up-d2">
            {event.fullDescription.split("\n").map((p, i) => (
              <p key={i} className="text-ink-soft leading-relaxed mb-4">
                {p}
              </p>
            ))}
          </div>

          {/* Instructors */}
          {instructors.length > 0 && (
            <section className="fade-up fade-up-d3">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-ink mb-4">
                {instructors.length === 1 ? "Your Host" : "Your Hosts"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {instructors.map((inst) => (
                  <InstructorCard key={inst.id} instructor={inst} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-8 bg-card border border-border rounded-[14px] p-6 space-y-5 fade-up fade-up-d2">
            <div className="text-center">
              <div className="font-[family-name:var(--font-display)] text-2xl text-ink mb-1">
                Free
              </div>
              <p className="text-sm text-dust">open to all</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dust">Date</span>
                <span className="text-ink font-medium">
                  {event.date
                    ? new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "TBA"}
                </span>
              </div>
              {event.duration && (
                <div className="flex justify-between">
                  <span className="text-dust">Duration</span>
                  <span className="text-ink font-medium">{event.duration}</span>
                </div>
              )}
              {event.capacity > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-dust">Capacity</span>
                    <span className="text-ink font-medium">
                      {event.capacity} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dust">Spots left</span>
                    <span
                      className={`font-medium ${
                        event.spotsRemaining <= 5 ? "text-gold" : "text-ink"
                      }`}
                    >
                      {event.spotsRemaining}
                    </span>
                  </div>
                </>
              )}
            </div>

            {isFull ? (
              <div className="w-full py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-ink/10 text-dust cursor-not-allowed">
                Event Full
              </div>
            ) : (
              <a
                href={`https://mentormates.ai/events/${event.id}/overview`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-cobalt text-white hover:bg-cobalt-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
              >
                Register on MentorMates
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* Related events */}
      {related.length > 0 && (
        <section className="mt-14 sm:mt-20">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                instructors={e.instructorIds
                  .map((id) => iMap.get(id))
                  .filter(Boolean) as any}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile bottom bar spacer */}
      <div className="h-24 lg:hidden" />

      {/* Mobile fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-display)] text-lg text-ink">
            Free
          </div>
          <p className="text-xs text-dust truncate">open to all</p>
        </div>
        <div className="flex-shrink-0">
          {isFull ? (
            <div className="px-6 py-3 rounded-full text-sm font-semibold tracking-wide bg-ink/10 text-dust cursor-not-allowed">
              Event Full
            </div>
          ) : (
            <a
              href={`https://mentormates.ai/events/${event.id}/overview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-full text-sm font-semibold tracking-wide bg-cobalt text-white hover:bg-cobalt-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              Register on MentorMates
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
