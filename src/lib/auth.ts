import { getServerSession } from "next-auth/next";
import { authConfig } from "./auth-config";

export async function auth() {
  try {
    // For NextAuth v4, pass the config object with all required options
    const session = await getServerSession({
      pages: authConfig.pages,
      callbacks: authConfig.callbacks,
      session: authConfig.session,
      providers: authConfig.providers,
    } as any);
    return session;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function getSession() {
  return auth();
}
