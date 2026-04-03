import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const LUMA_API_URL = "https://api.lu.ma/public/v1/calendar/list-events";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function extractSlugFromUrl(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

interface LumaEntry {
  api_id: string;
  event: {
    name: string;
    description: string;
    description_md: string;
    start_at: string;
    end_at: string;
    cover_url: string | null;
    url: string;
    geo_address_json: { full_address?: string } | null;
    visibility: string;
  };
  tags: string[];
}

async function fetchAllLumaEvents(apiKey: string): Promise<LumaEntry[]> {
  const allEntries: LumaEntry[] = [];
  let cursor: string | null = null;

  do {
    const url = new URL(LUMA_API_URL);
    if (cursor) url.searchParams.set("pagination_cursor", cursor);

    const res = await fetch(url.toString(), {
      headers: { "x-luma-api-key": apiKey },
    });

    if (!res.ok) {
      throw new Error(`Luma API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    allEntries.push(...data.entries);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return allEntries;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const syncSecret = process.env.SYNC_SECRET || process.env.LUMA_API_KEY;
    if (authHeader !== `Bearer ${syncSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.LUMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "LUMA_API_KEY not configured" }, { status: 500 });
    }

    const lumaEntries = await fetchAllLumaEvents(apiKey);
    const supabase = getSupabaseAdmin();

    const validEntries = lumaEntries.filter(
      (entry) => entry.event.name.toLowerCase() !== "test"
    );

    // Fetch existing slugs to determine insert vs update
    const { data: existing } = await supabase
      .from("events")
      .select("event_id, slug");
    const slugToId = new Map((existing || []).map((e) => [e.slug, e.event_id]));

    let upserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const entry of validEntries) {
      const e = entry.event;
      const slug = extractSlugFromUrl(e.url);
      const location = e.geo_address_json?.full_address || null;
      const existingId = slugToId.get(slug);

      const fields = {
        event_name: e.name,
        event_date: e.start_at,
        event_description: e.description_md || e.description || "",
        event_blurb: (e.description || "").substring(0, 500),
        cover_image_url: e.cover_url,
        location: location,
        event_type: `{{daydreamers-event}}`,
        visibility: "public",
      };

      let error;
      if (existingId) {
        ({ error } = await supabase
          .from("events")
          .update(fields)
          .eq("slug", slug));
      } else {
        ({ error } = await supabase.from("events").insert({
          event_id: randomUUID(),
          slug,
          rules: "[]",
          ...fields,
        }));
      }

      if (error) {
        errors.push(`${e.name}: ${error.message}`);
        skipped++;
      } else {
        upserted++;
      }
    }

    return NextResponse.json({
      success: true,
      total_luma: lumaEntries.length,
      synced: upserted,
      failed: skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Luma sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const syncSecret = process.env.SYNC_SECRET || process.env.LUMA_API_KEY;

  if (key !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fakeRequest = new Request(request.url, {
    method: "POST",
    headers: { authorization: `Bearer ${syncSecret}` },
  });

  return POST(fakeRequest);
}
