import { NextRequest, NextResponse } from "next/server";

// GET /api/sessions/:sessionId/messages — fetch message history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  return NextResponse.json({ sessionId, messages: [] }, { status: 501 });
}
