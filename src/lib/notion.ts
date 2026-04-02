import { createClient } from "@supabase/supabase-js";
import type { Event, Instructor } from "./types";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ─── Events (from Supabase events table) ───────────────────────────

export async function getEvents(): Promise<Event[]> {
  const supabase = getSupabase();
  if (!supabase) return getMockEvents();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .ilike("event_type", "daydreamers-event")
    .order("event_date", { ascending: true });

  if (error || !events || events.length === 0) {
    console.error("Failed to fetch daydreamers events:", error);
    return getMockEvents();
  }

  return events.map((event) => mapToEvent(event));
}

export async function getEventBySlug(
  slug: string
): Promise<Event | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const mocks = getMockEvents();
    return mocks.find((e) => e.slug === slug) ?? null;
  }

  // Try slug first, then event_id
  let { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .ilike("event_type", "daydreamers-event")
    .maybeSingle();

  if (!event) {
    ({ data: event } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", slug)
      .ilike("event_type", "daydreamers-event")
      .maybeSingle());
  }

  if (!event) return null;

  return mapToEvent(event);
}

function mapToEvent(event: any, registrationCount?: number): Event {
  const totalCapacity = event.participant_capacity ?? 0;
  // Prefer live registration count when available, fall back to stored value
  const currentAttendees = registrationCount ?? event.current_attendees ?? 0;

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
    spotsRemaining:
      totalCapacity > 0 ? Math.max(0, totalCapacity - currentAttendees) : 999,
    coverImage: event.cover_image_url,
    tags: event.event_type
      ? [event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1).toLowerCase()]
      : [],
    status:
      totalCapacity > 0 && currentAttendees >= totalCapacity
        ? ("Full" as const)
        : ("Published" as const),
  };
}

/** Get a single event by slug (registrations are tracked on MentorMates) */
export async function getEventBySlugWithRegistrations(
  slug: string
): Promise<Event | null> {
  return getEventBySlug(slug);
}

// ─── Instructors (mock for now — no people table in Supabase yet) ─────

export async function getInstructors(): Promise<Instructor[]> {
  return getMockInstructors();
}

export async function getInstructorBySlug(
  slug: string
): Promise<Instructor | null> {
  const instructors = await getInstructors();
  return instructors.find((i) => i.slug === slug) ?? null;
}

export async function getInstructorsByIds(
  ids: string[]
): Promise<Instructor[]> {
  const all = await getInstructors();
  return all.filter((i) => ids.includes(i.id));
}

// ─── Mock data (fallback when Supabase has no events) ────────────

function getMockEvents(): Event[] {
  return [
    {
      id: "1",
      slug: "intro-to-ai-agents",
      title: "Intro to AI Agents",
      description:
        "Learn to build your first AI agent from scratch. No prior AI experience needed — just bring your laptop and curiosity.",
      fullDescription:
        "In this hands-on session, you'll go from zero to a working AI agent in under 2 hours. We'll cover the fundamentals of LLMs, prompt engineering, tool use, and agent loops. By the end, you'll have built and deployed your own agent that can browse the web, answer questions, and take actions on your behalf.\n\nPerfect for developers, founders, and anyone curious about what AI agents can actually do.",
      instructorIds: ["1"],
      date: "2026-04-12T10:00:00",
      duration: "2 hours",
      capacity: 30,
      spotsRemaining: 12,
      coverImage: null,
      tags: ["AI", "Beginner"],
      status: "Published",
    },
    {
      id: "2",
      slug: "no-code-ai-automation",
      title: "No-Code AI Automation",
      description:
        "Automate your workflows with AI — no coding required. Build real automations with Make, Zapier, and GPT.",
      fullDescription:
        "Stop doing repetitive tasks manually. In this session, you'll learn how to connect AI models to your existing tools and create powerful automations without writing a single line of code.\n\nWe'll build 3 real automations together: an AI email responder, a content pipeline, and a lead qualification system. You'll leave with templates you can customize for your own business.",
      instructorIds: ["2"],
      date: "2026-04-19T14:00:00",
      duration: "3 hours",
      capacity: 25,
      spotsRemaining: 8,
      coverImage: null,
      tags: ["AI", "No-Code", "Automation"],
      status: "Published",
    },
    {
      id: "3",
      slug: "design-with-ai",
      title: "Design with AI",
      description:
        "Use AI tools to supercharge your design process — from ideation to polished assets in record time.",
      fullDescription:
        "AI is transforming how designers work. In this session, you'll learn to use Midjourney, DALL-E, Figma AI, and other tools to accelerate every stage of the design process.\n\nWe'll cover: AI-assisted moodboarding, rapid prototyping with generated assets, and how to maintain brand consistency when using AI. Bring a project you're working on — you'll apply everything in real time.",
      instructorIds: ["1", "2"],
      date: "2026-04-26T10:00:00",
      duration: "2.5 hours",
      capacity: 20,
      spotsRemaining: 0,
      coverImage: null,
      tags: ["Design", "AI", "Creative"],
      status: "Full",
    },
    {
      id: "4",
      slug: "build-ship-saas",
      title: "Build & Ship a SaaS in a Weekend",
      description:
        "From idea to deployed product in one intensive session. Learn the modern stack for shipping fast.",
      fullDescription:
        "The best way to learn is to build. In this intensive session, you'll go from a blank repo to a live, deployed SaaS product with authentication, payments, and a database.\n\nStack: Next.js, Supabase, Stripe, Vercel. We'll move fast, pair program, and help each other debug. By the end of the day, you'll have a real product live on the internet.",
      instructorIds: ["3"],
      date: "2026-05-03T09:00:00",
      duration: "6 hours",
      capacity: 15,
      spotsRemaining: 15,
      coverImage: null,
      tags: ["Engineering", "SaaS", "Full-Stack"],
      status: "Published",
    },
  ];
}

function getMockInstructors(): Instructor[] {
  return [
    {
      id: "1",
      slug: "alex-chen",
      name: "Alex Chen",
      role: "AI Events Lead",
      bio: "Alex is a machine learning engineer turned educator. Previously at Google Brain, now focused on making AI accessible to everyone. Has taught 500+ students across 20 events.",
      photo: null,
      linkedin: "https://linkedin.com/in/example",
    },
    {
      id: "2",
      slug: "maya-patel",
      name: "Maya Patel",
      role: "Automation & No-Code Specialist",
      bio: "Maya helps businesses automate everything. Former ops lead at a YC startup, she's built automations that saved her team 40+ hours per week. Believes everyone should be able to harness AI, regardless of technical background.",
      photo: null,
      linkedin: "https://linkedin.com/in/example",
    },
    {
      id: "3",
      slug: "jordan-kim",
      name: "Jordan Kim",
      role: "Full-Stack Engineer & Mentor",
      bio: "Jordan has shipped 12 products in 3 years. He believes in learning by doing and has mentored dozens of first-time founders through their first launches. Currently building developer tools at a stealth startup.",
      photo: null,
      linkedin: "https://linkedin.com/in/example",
    },
  ];
}
