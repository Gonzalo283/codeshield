export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  keyword: string;
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [];

// Posts are registered by importing their modules
export function registerPost(post: BlogPost) {
  if (!blogPosts.find((p) => p.slug === post.slug)) {
    blogPosts.push(post);
  }
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
