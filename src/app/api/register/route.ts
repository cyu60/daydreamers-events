import { NextRequest, NextResponse } from "next/server";
import { registerForEvent } from "@/lib/notion";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, email } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json(
        { success: false, message: "Name, email, and event ID are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Please enter your full name." },
        { status: 400 }
      );
    }

    const result = await registerForEvent(eventId, name, email);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
