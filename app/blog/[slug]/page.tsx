import { notFound } from "next/navigation";
import { BlogArticleContent } from "@/components/pages/BlogContent";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
export const generateStaticParams = () =>
  BLOG_POSTS.map((post) => ({ slug: post.slug }));
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  const metadata = pageMetadata(
    post.title,
    post.description,
    `/blog/${post.slug}`,
  );
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article" as const,
      publishedTime: post.published,
      modifiedTime: post.published,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return <BlogArticleContent post={post} />;
}
