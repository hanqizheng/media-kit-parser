import { NextResponse } from "next/server";

// GET /api/sessions — list sessions
export async function GET() {
  return NextResponse.json({ sessions: [] });
}

// POST /api/sessions — create session
export async function POST() {
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
