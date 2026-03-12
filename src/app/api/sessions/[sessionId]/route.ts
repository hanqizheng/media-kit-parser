import { NextRequest, NextResponse } from "next/server";

// GET /api/sessions/:sessionId — get session details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  return NextResponse.json({ sessionId, message: "not implemented" }, { status: 501 });
}

// DELETE /api/sessions/:sessionId — delete session
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  return NextResponse.json({ sessionId, message: "not implemented" }, { status: 501 });
}
