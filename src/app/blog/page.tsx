import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Blog | CodeShield.sh",
  description:
    "Security insights for AI-generated code. Learn about OWASP vulnerabilities, post-quantum cryptography, and how to secure code from Copilot, Cursor, and ChatGPT.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav variant="marketing" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
          Blog
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Security research, post-quantum cryptography guides, and practical
          advice for teams shipping AI-generated code.
        </p>
      </header>

      {/* Post grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border bg-bg-card p-6 transition-colors hover:border-border-light hover:bg-bg-card-hover"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2 py-1 rounded-md bg-green/10 text-green/80 border border-green/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-green transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                {post.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-text-dim font-mono">
                <span>{post.date}</span>
                <span>|</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
