import { notFound } from "next/navigation";
import { BlogArticleContent } from "@/components/pages/BlogContent";
import { getBlogPost } from "@/lib/blog";
import { workspaceMetadata } from "@/lib/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return workspaceMetadata(post.title, post.description);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return <BlogArticleContent post={post} memberView />;
}
