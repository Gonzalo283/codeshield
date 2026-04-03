import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import { BlogPostJsonLd } from "@/components/json-ld";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found | CodeShield.ai" };
  }
  return {
    title: `${post.title} | CodeShield.ai`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://codeshield.ai/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <BlogPostJsonLd
        title={post.title}
        description={post.description}
        datePublished={post.date}
        slug={post.slug}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green/20 flex items-center justify-center border border-green/30">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00ff88"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-text-primary">
            CodeShield<span className="text-green">.ai</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
          >
            Pricing
          </Link>
          <Link
            href="/api/auth/signin"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 md:px-8 pt-10 pb-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-green transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-2.5 py-1 rounded-md bg-green/10 text-green/80 border border-green/20"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight mb-4">
          {post.title}
        </h1>

        {/* Author line */}
        <p className="text-sm text-text-secondary font-mono mb-10">
          CodeShield.ai Team &middot; {post.date} &middot; {post.readTime}
        </p>

        {/* Content */}
        <div
          className="
            prose prose-invert max-w-none
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-text-secondary [&_p]:leading-relaxed [&_p]:mb-5
            [&_a]:text-green [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-green-dim
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:text-text-secondary
            [&_li]:mb-2 [&_li]:leading-relaxed
            [&_strong]:text-text-primary [&_strong]:font-semibold
            [&_em]:italic
            [&_blockquote]:border-l-2 [&_blockquote]:border-green/40 [&_blockquote]:pl-5 [&_blockquote]:my-6 [&_blockquote]:text-text-secondary [&_blockquote]:italic
            [&_code]:font-mono [&_code]:text-sm [&_code]:bg-bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
            [&_.code-block]:bg-[#0d0d15] [&_.code-block]:border [&_.code-block]:border-border [&_.code-block]:rounded-lg [&_.code-block]:p-4 [&_.code-block]:overflow-x-auto [&_.code-block]:font-mono [&_.code-block]:text-[13px] [&_.code-block]:leading-relaxed [&_.code-block]:mb-5
            [&_.code-block_code]:bg-transparent [&_.code-block_code]:p-0 [&_.code-block_code]:text-text-primary
            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6
            [&_th]:text-left [&_th]:p-3 [&_th]:border-b-2 [&_th]:border-border [&_th]:text-text-secondary [&_th]:font-semibold
            [&_td]:p-3 [&_td]:border-b [&_td]:border-border
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Banner */}
        <div className="mt-16 rounded-xl border border-green/20 bg-green/5 p-8 text-center">
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Scan your repos for free
          </h3>
          <p className="text-text-secondary mb-6 max-w-lg mx-auto">
            Connect your GitHub repositories and get AI code vulnerability
            scanning plus post-quantum cryptographic analysis in under 60
            seconds.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green text-bg-primary font-semibold text-sm hover:brightness-110 transition"
          >
            Get Started Free
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>
    </div>
  );
}
