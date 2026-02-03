import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function safeInternalPath(path?: string | null) {
  if (!path) return "/walkthrough";
  if (!path.startsWith("/")) return "/walkthrough";
  if (path.startsWith("//")) return "/walkthrough";
  return path;
}

export default async function StartPage({
  searchParams
}: {
  searchParams: { email?: string; next?: string };
}) {
  const session = await auth();
  const nextPath = safeInternalPath(searchParams?.next);

  if (session?.user) {
    redirect(nextPath);
  }

  const email = searchParams?.email || "";
  const url = new URL("http://local");
  url.pathname = "/demo";
  url.searchParams.set("callbackUrl", nextPath);
  if (email) url.searchParams.set("email", email);

  redirect(url.pathname + url.search);
}
