import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getArticleBySlug } from "@/lib/articles";
import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata = {
  title: "Edit Artikel — Admin Niscala",
};

type EditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditArticlePage(props: EditPageProps) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  const { slug } = await props.params;
  const article = await getArticleBySlug(slug, { allowInactive: true });

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl py-2">
      <ArticleEditor initialArticle={article} isEditing={true} />
    </div>
  );
}
