import { describe, it, expect, beforeAll } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local for real DB credentials
beforeAll(() => {
  config({ path: resolve(__dirname, "../../../.env.local") });
});

describe("Supabase data extraction", () => {
  it("connects to Supabase and fetches daydreamers events", async () => {
    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: events, error } = await supabase
      .from("events")
      .select("event_id, event_name, event_type, slug")
      .ilike("event_type", "daydreamers-event");

    expect(error).toBeNull();
    expect(events).toBeDefined();
    expect(Array.isArray(events)).toBe(true);

    // Every event should have a name
    for (const event of events!) {
      expect(event.event_name).toBeTruthy();
    }

    console.log(
      `Found ${events!.length} daydreamers event(s):`,
      events!.map((e) => e.event_name)
    );
  });

  it("maps events to Event type correctly", async () => {
    const { getEventsFromSupabase } = await import("../supabase-data");

    const events = await getEventsFromSupabase();

    for (const event of events) {
      // Required fields
      expect(event.id).toBeTruthy();
      expect(event.title).toBeTruthy();
      expect(event.slug).toBeTruthy();
      expect(["Published", "Full"]).toContain(event.status);

      console.log(
        `Event: "${event.title}" (${event.slug}) - ${event.spotsRemaining} spots left`
      );
    }
  });

  it("getEventBySlug returns correct event", async () => {
    const { getEventsFromSupabase, getEventBySlugFromSupabase } =
      await import("../supabase-data");

    const events = await getEventsFromSupabase();

    if (events.length > 0) {
      const first = events[0];
      const found = await getEventBySlugFromSupabase(first.slug);

      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
      expect(found!.title).toBe(first.title);
    }
  });
});
