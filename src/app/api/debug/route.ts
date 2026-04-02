import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    hasUrl: !!url,
    urlPrefix: url?.substring(0, 30),
    hasKey: !!key,
    keyPrefix: key?.substring(0, 30),
  });
}
