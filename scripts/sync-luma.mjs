#!/usr/bin/env node
/**
 * Sync Luma events → Supabase events table
 * Usage: node scripts/sync-luma.mjs
 */

import { config } from "dotenv";
import { randomUUID } from "crypto";
config({ path: ".env.local" });

const LUMA_API_KEY = process.env.LUMA_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!LUMA_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars. Ensure .env.local has LUMA_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function fetchLumaEvents() {
  const allEntries = [];
  let cursor = null;

  do {
    const url = new URL("https://public-api.luma.com/v1/event/add-guests");
    if (cursor) url.searchParams.set("pagination_cursor", cursor);

    const res = await fetch(url.toString(), {
      headers: { "x-luma-api-key": LUMA_API_KEY },
    });

    if (!res.ok) throw new Error(`Luma API: ${res.status} ${await res.text()}`);

    const data = await res.json();
    allEntries.push(...data.entries);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return allEntries;
}

function extractSlug(url) {
  return url.split("/").pop();
}

async function upsertEvent(eventData, isUpdate) {
  if (isUpdate) {
    // Update existing event by slug
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/events?slug=eq.${eventData.slug}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          event_name: eventData.event_name,
          event_date: eventData.event_date,
          event_description: eventData.event_description,
          event_blurb: eventData.event_blurb,
          cover_image_url: eventData.cover_image_url,
          location: eventData.location,
          event_type: eventData.event_type,
          visibility: eventData.visibility,
          luma_event_id: eventData.luma_event_id,
        }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Update failed: ${text}`);
    }
  } else {
    // Insert new event
    const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Insert failed: ${text}`);
    }
  }
}

async function main() {
  console.log("Fetching Luma events...");
  const entries = await fetchLumaEvents();
  console.log(`Found ${entries.length} events on Luma`);

  // Filter out test events (keep all visibility since some are unlisted dinners)
  const valid = entries.filter(
    (e) => e.event.name.toLowerCase() !== "test"
  );
  console.log(`${valid.length} valid events after filtering\n`);

  // First, fetch existing events to preserve their UUIDs on update
  const existingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/events?select=event_id,slug`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const existing = await existingRes.json();
  const slugToUuid = new Map(existing.map((e) => [e.slug, e.event_id]));

  let success = 0;
  let failed = 0;

  for (const entry of valid) {
    const e = entry.event;
    const slug = extractSlug(e.url);
    const location = e.geo_address_json?.full_address || null;

    // Determine event category tag
    const lower = e.name.toLowerCase();
    let eventType = "daydreamers-event";

    // Use existing UUID if this slug was synced before, otherwise generate new
    const eventId = slugToUuid.get(slug) || randomUUID();

    const eventData = {
      event_id: eventId,
      event_name: e.name,
      slug: slug,
      event_date: e.start_at,
      event_description: e.description_md || e.description || "",
      event_blurb: (e.description || "").substring(0, 500),
      cover_image_url: e.cover_url,
      location: location,
      event_type: `{{${eventType}}}`,
      visibility: "public",
      rules: "[]",
      luma_event_id: entry.api_id,
    };

    const isUpdate = slugToUuid.has(slug);
    try {
      await upsertEvent(eventData, isUpdate);
      console.log(`  ${isUpdate ? "↻" : "✓"} ${e.name} (${slug})`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${e.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} synced, ${failed} failed`);
}

main().catch(console.error);
