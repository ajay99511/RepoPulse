import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readGistConfig, writeGistConfig } from "@/lib/gist";
import type { GistConfig } from "@/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const gistId = searchParams.get("gistId");

  if (!gistId) {
    return NextResponse.json({ error: "gistId is required" }, { status: 400 });
  }

  try {
    const config = await readGistConfig(session.accessToken, gistId);
    return NextResponse.json(config);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read Gist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { gistId: string | null; config: GistConfig };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const newGistId = await writeGistConfig(
      session.accessToken,
      body.gistId,
      body.config
    );
    return NextResponse.json({ gistId: newGistId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to write Gist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
