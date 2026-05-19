import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const roleRedirects: Record<string, string> = {
    ADMIN: "/dashboard",
    HOD: "/dashboard",
    TEACHER: "/dashboard",
    STUDENT: "/dashboard",
  };

  const role = (session.user as any)?.role;
  const redirectPath = roleRedirects[role] || "/dashboard";
  redirect(redirectPath);
}
