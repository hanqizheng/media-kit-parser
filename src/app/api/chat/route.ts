import { NextResponse } from "next/server";

// POST /api/chat — send message, trigger agent loop
export async function POST() {
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
