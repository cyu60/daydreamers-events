import Link from "next/link";
import type { Instructor } from "@/lib/types";

export function InstructorCard({ instructor }: { instructor: Instructor }) {
  return (
    <Link
      href={`/instructors/${instructor.slug}`}
      className="flex items-center gap-4 p-4 bg-card border border-border rounded-[14px] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_4px_18px_rgba(38,82,230,0.09)]"
    >
      <div className="w-14 h-14 rounded-full bg-cobalt-soft flex-shrink-0 flex items-center justify-center overflow-hidden">
        {instructor.photo ? (
          <img
            src={instructor.photo}
            alt={instructor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg font-semibold text-cobalt">
            {instructor.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-ink text-sm">{instructor.name}</h4>
        <p className="text-xs text-dust mt-0.5">{instructor.role}</p>
      </div>
    </Link>
  );
}
