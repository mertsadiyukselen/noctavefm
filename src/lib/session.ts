import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "noctave_admin";

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_JWT_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(s);
}

export async function signAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const ok = await verifyAdminToken(token);
  return ok ? { admin: true as const } : null;
}

export { COOKIE as ADMIN_COOKIE_NAME };
