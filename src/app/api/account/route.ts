import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { one, run, type UserRow } from "@/lib/db";

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const row = await one<UserRow>("SELECT * FROM users WHERE id = ?", [user.id]);
  if (!row) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const email = String(body.email ?? row.email).trim().toLowerCase();
  const username = String(body.username ?? row.username).trim();
  const name = String(body.name ?? row.name).trim();
  const gender = String(body.gender ?? row.gender).trim();
  const useGravatar = !!body.useGravatar;
  const avatarUrl = useGravatar ? "" : String(body.avatarUrl ?? row.avatar_url).trim();

  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Full name is required." }, { status: 400 });

  let passwordHash = row.password;
  if (body.newPassword) {
    if (String(body.newPassword).length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }
    if (!body.currentPassword || !(await verifyPassword(body.currentPassword, row.password))) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }
    passwordHash = await hashPassword(body.newPassword);
  }

  await run(
    `UPDATE users
        SET email = ?, username = ?, name = ?, gender = ?, avatar_url = ?, use_gravatar = ?, password = ?
      WHERE id = ?`,
    [email, username, name, gender, avatarUrl, useGravatar ? 1 : 0, passwordHash, user.id]
  );

  return NextResponse.json({ ok: true });
}
