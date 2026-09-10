import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminPage() {
  const isAuthed = await isAdminAuthenticated();

  if (isAuthed) {
    redirect("/admin/articles");
  } else {
    redirect("/admin/login");
  }
}
