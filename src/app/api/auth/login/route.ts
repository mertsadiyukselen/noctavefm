import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/password";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/session";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const password = body.password ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 });
  }
  try {
    const token = await signAdminToken();
    const jar = await cookies();
    jar.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (ADMIN_JWT_SECRET)" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
