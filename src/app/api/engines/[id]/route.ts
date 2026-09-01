import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getEngine, updateEngine, deleteEngine, setDefaultEngine, listEngines } from "@/lib/engines";

function revalidateEngines() {
  revalidatePath("/dashboard/engines");
  revalidatePath("/guides", "layout");
  revalidatePath("/blog", "layout");
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const engine = await getEngine(Number(id));
  if (!engine) return NextResponse.json({ error: "Engine not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Engine name is required." }, { status: 400 });
  }

  await updateEngine(engine.id, {
    name: body.name,
    cse_cx: String(body.cseCx ?? ""),
    pub_id: String(body.pubId ?? ""),
    style_id: String(body.styleId ?? ""),
    image_search: !!body.imageSearch,
    show_thumbnails: body.showThumbnails !== false,
    is_default: !!body.isDefault,
  });

  revalidateEngines();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const engine = await getEngine(Number(id));
  if (!engine) return NextResponse.json({ error: "Engine not found." }, { status: 404 });

  const all = await listEngines();
  if (all.length <= 1) {
    return NextResponse.json({ error: "Cannot delete the only search engine." }, { status: 400 });
  }

  await deleteEngine(engine.id);
  revalidateEngines();
  return NextResponse.json({ ok: true });
}

// Set this engine as the default one.
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const engine = await getEngine(Number(id));
  if (!engine) return NextResponse.json({ error: "Engine not found." }, { status: 404 });

  await setDefaultEngine(engine.id);
  revalidateEngines();
  return NextResponse.json({ ok: true });
}
