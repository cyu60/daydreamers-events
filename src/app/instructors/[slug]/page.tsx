import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getInstructors,
  getInstructorBySlug,
  getEvents,
} from "@/lib/notion";
import { EventCard } from "@/components/event-card";

export const revalidate = 60;

export async function generateStaticParams() {
  const instructors = await getInstructors();
  return instructors.map((i) => ({ slug: i.slug }));
}

export default async function InstructorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const instructor = await getInstructorBySlug(slug);
  if (!instructor) notFound();

  const allEvents = await getEvents();
  const allInstructors = await getInstructors();
  const instructorMap = new Map(allInstructors.map((i) => [i.id, i]));

  const theirEvents = allEvents.filter((e) =>
    e.instructorIds.includes(instructor.id)
  );

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 fade-up">
        <Link
          href="/"
          className="text-sm text-dust hover:text-cobalt transition-colors duration-150"
        >
          &larr; All Events
        </Link>
      </nav>

      {/* Profile */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-12 fade-up">
        <div className="w-24 h-24 rounded-full bg-cobalt-soft flex-shrink-0 flex items-center justify-center overflow-hidden">
          {instructor.photo ? (
            <img
              src={instructor.photo}
              alt={instructor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-cobalt">
              {instructor.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3vw,2.5rem)] text-ink leading-tight">
            {instructor.name}
          </h1>
          <p className="text-cobalt font-medium mt-1">{instructor.role}</p>
          <p className="text-dust leading-relaxed mt-4">{instructor.bio}</p>
          {instructor.linkedin && (
            <a
              href={instructor.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-cobalt hover:text-cobalt-hover transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Their events */}
      {theirEvents.length > 0 && (
        <section className="fade-up fade-up-d1">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-ink mb-6">
            Events by {instructor.name.split(" ")[0]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theirEvents.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                instructors={e.instructorIds
                  .map((id) => instructorMap.get(id))
                  .filter(Boolean) as any}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
