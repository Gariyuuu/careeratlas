import { auth } from "@/lib/auth";

/**
 * Fails closed: an unset or empty ADMIN_EMAILS must deny everyone, never
 * mean "no allowlist configured, allow all."
 */
export async function isAdminSession(): Promise<boolean> {
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length === 0) return false;

  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return false;

  return allowlist.includes(email);
}
