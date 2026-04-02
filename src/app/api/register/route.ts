import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const NOTIFICATIONS_EMAIL_FROM =
  "DayDreamers Academy <notifications@hello.mentormates.ai>";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { name, email, eventId, eventTitle, eventSlug } =
      await request.json();

    if (!name || !email || !eventId) {
      return NextResponse.json(
        { error: "Name, email, and eventId are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Step 1: Find or create user
    const userId = await findOrCreateUser(supabase, trimmedEmail, trimmedName);
    if (!userId) {
      return NextResponse.json(
        { error: "Failed to create registration" },
        { status: 500 }
      );
    }

    // Step 2: Check if already registered
    const { data: existingRole } = await supabase
      .from("user_event_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingRole) {
      return NextResponse.json(
        { error: "You're already registered for this event!" },
        { status: 409 }
      );
    }

    // Step 3: Check capacity (only for real events in DB)
    const { data: eventData } = await supabase
      .from("events")
      .select("participant_capacity")
      .eq("event_id", eventId)
      .maybeSingle();

    if (eventData?.participant_capacity) {
      const { count } = await supabase
        .from("user_event_roles")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("role", "participant");

      if (count !== null && count >= eventData.participant_capacity) {
        return NextResponse.json(
          { error: "This event is full" },
          { status: 409 }
        );
      }
    }

    // Step 4: Register as participant
    const { error: roleError } = await supabase
      .from("user_event_roles")
      .insert({
        user_id: userId,
        event_id: eventId,
        role: "participant",
      });

    if (roleError) {
      console.error("Failed to create role:", roleError);
      return NextResponse.json(
        { error: "Failed to register. This event may not be available yet." },
        { status: 500 }
      );
    }

    // Step 5: Send confirmation email (non-blocking)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const mmEventUrl = `https://mentormates.ai/events/${eventSlug || eventId}/overview`;

      try {
        await resend.emails.send({
          from: NOTIFICATIONS_EMAIL_FROM,
          to: trimmedEmail,
          subject: `You're in! ${eventTitle || "DayDreamers Event"}`,
          html: getConfirmationEmailHtml({
            name: trimmedName,
            eventTitle: eventTitle || "DayDreamers Event",
            mmEventUrl,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findOrCreateUser(
  supabase: any,
  email: string,
  displayName: string
): Promise<string | null> {
  // Check user_profiles first
  const { data: existingProfiles } = await supabase
    .from("user_profiles")
    .select("uid")
    .eq("email", email)
    .limit(1);

  if (existingProfiles && existingProfiles.length > 0) {
    return existingProfiles[0].uid;
  }

  // Try to create a new auth user
  const { data: newUser, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });

  if (newUser?.user) {
    await supabase.from("user_profiles").upsert({
      uid: newUser.user.id,
      email,
      display_name: displayName,
    });
    return newUser.user.id;
  }

  // User might exist in auth but not profiles (e.g. deleted profile)
  if (createError?.message?.includes("already been registered")) {
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = users?.find((u: { email?: string }) => u.email === email);
    if (existing) {
      await supabase.from("user_profiles").upsert({
        uid: existing.id,
        email,
        display_name: displayName,
      });
      return existing.id;
    }
  }

  console.error("Failed to find or create user:", createError);
  return null;
}

function getConfirmationEmailHtml({
  name,
  eventTitle,
  mmEventUrl,
}: {
  name: string;
  eventTitle: string;
  mmEventUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4efe8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fbf7f1;border-radius:16px;overflow:hidden;border:1px solid rgba(16,17,26,0.08);">
    <div style="background:#2652e6;padding:32px 32px 28px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">You're in!</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#10111a;font-size:16px;line-height:1.6;">
        Hey ${name},
      </p>
      <p style="margin:0 0 16px;color:#23263a;font-size:15px;line-height:1.6;">
        You're registered for <strong>${eventTitle}</strong>. We're excited to have you!
      </p>
      <div style="background:#dfe7ff;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;color:#10111a;font-size:14px;font-weight:600;">
          Next step: Submit your project on MentorMates
        </p>
        <p style="margin:0 0 16px;color:#70675f;font-size:13px;line-height:1.5;">
          After the event, head to MentorMates to submit your project and get feedback from mentors and judges.
        </p>
        <a href="${mmEventUrl}" style="display:inline-block;background:#2652e6;color:#fff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:999px;text-decoration:none;">
          View Event on MentorMates
        </a>
      </div>
      <p style="margin:24px 0 0;color:#70675f;font-size:13px;line-height:1.5;">
        See you there!<br>
        &mdash; The DayDreamers Academy Team
      </p>
    </div>
  </div>
</body>
</html>`;
}
