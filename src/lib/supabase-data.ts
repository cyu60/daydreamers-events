import { createClient } from "@supabase/supabase-js";
import type { Event, Instructor } from "./types";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getEventsFromSupabase(): Promise<Event[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .ilike("event_type", "daydreamers-event")
    .order("event_date", { ascending: true });

  if (error || !events) {
    console.error("Failed to fetch daydreamers events:", error);
    return [];
  }

  return events.map((event) => {
    const totalCapacity = event.participant_capacity ?? 0;
    const currentAttendees = event.current_attendees ?? 0;

    return {
      id: event.event_id,
      slug: event.slug || event.event_id,
      title: event.event_name,
      description: event.event_blurb || event.event_description || "",
      fullDescription: event.event_description || event.event_blurb || "",
      instructorIds: event.owner_id ? [event.owner_id] : [],
      date: event.event_date,
      duration: "",
      capacity: totalCapacity,
      spotsRemaining: Math.max(0, totalCapacity - currentAttendees),
      coverImage: event.cover_image_url,
      tags: event.event_type ? [event.event_type] : [],
      status: totalCapacity > 0 && currentAttendees >= totalCapacity
        ? ("Full" as const)
        : ("Published" as const),
    };
  });
}

export async function getEventBySlugFromSupabase(
  slug: string
): Promise<Event | null> {
  const events = await getEventsFromSupabase();
  return events.find((e) => e.slug === slug) ?? null;
}
