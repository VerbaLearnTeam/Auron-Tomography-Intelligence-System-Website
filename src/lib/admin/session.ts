import { cookies } from "next/headers";

const ADMIN_COOKIE = "auron_admin";
const ADMIN_COOKIE_VALUE = "1";

export async function isAdminFromCookies() {
  const cookieStore = await cookies();
  const c = cookieStore.get(ADMIN_COOKIE)?.value;
  return c === ADMIN_COOKIE_VALUE;
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
