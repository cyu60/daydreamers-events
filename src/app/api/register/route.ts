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
  const { name, email, eventId, eventTitle, eventSlug } = await request.json();

  if (!name || !email || !eventId) {
    return NextResponse.json(
      { error: "Name, email, and eventId are required" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Find or create user by email
  let userId: string;

  const { data: existingUsers } = await supabase
    .from("user_profiles")
    .select("uid")
    .eq("email", email.trim().toLowerCase())
    .limit(1);

  if (existingUsers && existingUsers.length > 0) {
    userId = existingUsers[0].uid;
  } else {
    // Create a new Supabase Auth user (no email confirmation needed)
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        email_confirm: true,
        user_metadata: { display_name: name.trim() },
      });

    if (createError || !newUser?.user) {
      console.error("Failed to create user:", createError);
      return NextResponse.json(
        { error: "Failed to create registration" },
        { status: 500 }
      );
    }

    userId = newUser.user.id;

    // Create user_profiles entry
    await supabase.from("user_profiles").upsert({
      uid: userId,
      email: email.trim().toLowerCase(),
      display_name: name.trim(),
    });
  }

  // Check if already registered
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

  // Check capacity
  const { count } = await supabase
    .from("user_event_roles")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("role", "participant");

  const { data: eventData } = await supabase
    .from("events")
    .select("participant_capacity")
    .eq("event_id", eventId)
    .single();

  if (
    eventData?.participant_capacity &&
    count !== null &&
    count >= eventData.participant_capacity
  ) {
    return NextResponse.json(
      { error: "This event is full" },
      { status: 409 }
    );
  }

  // Register as participant
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
      { error: "Failed to register" },
      { status: 500 }
    );
  }

  // Send confirmation email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const mmEventUrl = `https://mentormates.ai/events/${eventSlug || eventId}/overview`;

    try {
      await resend.emails.send({
        from: NOTIFICATIONS_EMAIL_FROM,
        to: email.trim(),
        subject: `You're in! ${eventTitle || "DayDreamers Event"}`,
        html: getConfirmationEmailHtml({
          name: name.trim(),
          eventTitle: eventTitle || "DayDreamers Event",
          mmEventUrl,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the registration if email fails
    }
  }

  return NextResponse.json({ success: true });
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
