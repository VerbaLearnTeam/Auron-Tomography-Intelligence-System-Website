import { cookies } from "next/headers";

const ADMIN_COOKIE = "auron_admin";
const ADMIN_COOKIE_VALUE = "1";

export function isAdminFromCookies() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  return c === ADMIN_COOKIE_VALUE;
}

export function setAdminCookie() {
  cookies().set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearAdminCookie() {
  cookies().set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
