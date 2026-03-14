import { NextRequest, NextResponse } from "next/server";

// POST /api/sessions/:sessionId/abort — abort running agent loop
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  return NextResponse.json({ sessionId, message: "not implemented" }, { status: 501 });
}
