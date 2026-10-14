import Link from "@/components/AppLink";
import {
  BLOG_POSTS,
  blogReadMinutes,
  blogDate,
  type BlogPost,
} from "@/lib/blog";
import { safeJsonLd, SITE } from "@/lib/seo";
import styles from "./PublicPages.module.css";
function ReadingArt() {
  return (
    <div className={styles.readingArt} aria-hidden="true">
      <div>
        <span>READ THE ROLE</span>
        <strong>
          A little clarity.
          <br />
          Before your next step.
        </strong>
        <ul>
          <li>
            Official source <b>✓</b>
          </li>
          <li>
            Location & requirements <b>✓</b>
          </li>
          <li>
            The work itself <b>✓</b>
          </li>
        </ul>
      </div>
      <span className={styles.readingStar}>✳</span>
    </div>
  );
}
export function BlogIndexContent() {
  const post = BLOG_POSTS[0];
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <p>THE REERHUB JOURNAL</p>
        <h1>
          A little clarity.<span>For your next chapter.</span>
        </h1>
        <p>
          Practical notes on reading opportunities, understanding matching and
          taking a thoughtful next step in your tech-job search.
        </p>
      </header>
      <div className={styles.blogContent}>
        <section aria-labelledby="featured-post">
          <p className={styles.blogEyebrow}>START HERE</p>
          <Link href={`/blog/${post.slug}`} className={styles.featuredPost}>
            <ReadingArt />
            <div>
              <p className={styles.blogEyebrow}>{post.category}</p>
              <h2 id="featured-post">{post.title}</h2>
              <p>{post.description}</p>
              <div className={styles.postMeta}>
                <time dateTime={post.published}>
                  {blogDate(post.published)}
                </time>
                <span>· {blogReadMinutes(post)} min read</span>
              </div>
              <span className={styles.readPost}>Read the guide ↗</span>
            </div>
          </Link>
        </section>
        {BLOG_POSTS.length > 1 && (
          <section
            className={styles.recentGuides}
            aria-labelledby="recent-guides"
          >
            <h2 id="recent-guides">More useful reading.</h2>
            <div>
              {BLOG_POSTS.slice(1).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={styles.miniPost}
                >
                  <p className={styles.blogEyebrow}>{post.category}</p>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <div className={styles.postMeta}>
                    <time dateTime={post.published}>
                      {blogDate(post.published)}
                    </time>
                    <span>· {blogReadMinutes(post)} min read</span>
                  </div>
                  <span className={styles.readPost}>Read the guide ↗</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className={styles.closing}>
          <p>Want to see the product behind the guidance?</p>
          <Link href="/how-it-works" className="btn-secondary">
            See how ReerHub works ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
export function BlogArticleContent({
  post,
  memberView = false,
}: {
  post: BlogPost;
  memberView?: boolean;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${SITE}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    datePublished: post.published,
    dateModified: post.published,
    image: `${SITE}/share-image`,
    author: {
      "@type": "Organization",
      name: "REERHUB TECHNOLOGIES",
      url: `${SITE}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "REERHUB TECHNOLOGIES",
      url: SITE,
    },
    articleBody: [
      post.intro,
      ...post.sections.flatMap((section) => [
        section.title,
        ...section.paragraphs,
      ]),
    ].join("\n\n"),
  };
  return (
    <article className={styles.page}>
      {!memberView && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      )}
      <header className={styles.hero}>
        <p>{post.category}</p>
        <h1>{post.title}</h1>
        <p className={styles.postMeta}>
          <Link href="/about">REERHUB TECHNOLOGIES</Link> ·{" "}
          <time dateTime={post.published}>{blogDate(post.published)}</time> ·{" "}
          {blogReadMinutes(post)} min read
        </p>
      </header>
      <div className={styles.legalLayout}>
        <nav aria-label="In this guide">
          <p>IN THIS GUIDE</p>
          {post.sections.map((section) => (
            <Link href={`#${section.id}`} key={section.id}>
              {section.title.replace(/^\d\. /, "")}
            </Link>
          ))}
        </nav>
        <div className={styles.legalBody}>
          <p className="mb-8">{post.intro}</p>
          {post.sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p className="mb-4" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <section>
            <h2>Keep reading</h2>
            <p>
              <Link href="/matching-methodology">
                How ReerHub verifies and ranks openings
              </Link>{" "}
              · <Link href="/faq">Frequently asked questions</Link>
            </p>
            <ul className="mt-4 space-y-3">
              {BLOG_POSTS.filter((other) => other.slug !== post.slug).map(
                (other) => (
                  <li key={other.slug}>
                    <Link href={`/blog/${other.slug}`}>{other.title}</Link>
                  </li>
                ),
              )}
            </ul>
            {post.slug === "how-to-read-a-tech-job-listing" && (
              <p className="mt-4">
                For external safety guidance:{" "}
                <a
                  href="https://consumer.ftc.gov/articles/job-scams"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FTC guide to job scams (opens in a new tab)
                </a>
                .
              </p>
            )}
          </section>
          <aside className={styles.authorBio}>
            <p className={styles.blogEyebrow}>ABOUT THE AUTHOR</p>
            <h2>REERHUB TECHNOLOGIES</h2>
            <p>
              We build ReerHub, an India-first service for discovering technical
              roles from official company sources. Our guides explain the
              product and practical ways to review openings; they do not promise
              hiring outcomes.
            </p>
            <Link href="/about">Read about ReerHub ↗</Link>
          </aside>
          <div className={styles.closing}>
            <p>Your next step starts with an opening you understand.</p>
            <Link href="/jobs" className="btn-primary">
              Explore current roles ↗
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
