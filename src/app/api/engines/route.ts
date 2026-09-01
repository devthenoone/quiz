import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { listEngines, createEngine } from "@/lib/engines";

function revalidateEngines() {
  revalidatePath("/dashboard/engines");
  revalidatePath("/guides", "layout");
  revalidatePath("/blog", "layout");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  return NextResponse.json({ engines: await listEngines() });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Engine name is required." }, { status: 400 });
  }

  const id = await createEngine({
    name: body.name,
    cse_cx: String(body.cseCx ?? ""),
    pub_id: String(body.pubId ?? ""),
    style_id: String(body.styleId ?? ""),
    image_search: !!body.imageSearch,
    show_thumbnails: body.showThumbnails !== false,
    is_default: !!body.isDefault,
  });

  revalidateEngines();
  return NextResponse.json({ ok: true, id });
}
