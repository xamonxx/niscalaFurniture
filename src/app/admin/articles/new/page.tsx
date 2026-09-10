import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata = {
  title: "Tulis Artikel Baru — Admin Niscala",
};

export default async function NewArticlePage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-4xl py-2">
      <ArticleEditor />
    </div>
  );
}
