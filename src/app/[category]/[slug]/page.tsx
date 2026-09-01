import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Sidebar from '@/components/Sidebar';
import { getAllPosts, getPostBySlug, getCategoryBySlug, getRelatedPosts, getPostUrl, getImageUrl, formatDate, generateExcerpt, SITE_NAME, SITE_URL } from '@/lib/data';
import type { Post } from '@/lib/types';

type Params = Promise<{ category: string; slug: string }>;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const description = post.excerpt
    ? post.excerpt.replace(/<[^>]*>/g, '').substring(0, 160)
    : generateExcerpt(post.content);

  return {
    title: post.title,
    description,
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${post.category}/${post.slug}/`,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      ...(post.featuredImageUrl && {
        images: [{ url: post.featuredImageUrl, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      ...(post.featuredImageUrl && { images: [post.featuredImageUrl] }),
    },
    alternates: {
      canonical: `${SITE_URL}/${post.category}/${post.slug}/`,
    },
  };
}

function RelatedPostCard({ post }: { post: Post }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <Link href={getPostUrl(post)} className="block">
        <div className="aspect-video relative overflow-hidden bg-gray-200">
          {post.featuredImageUrl ? (
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🍳</div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
          <Link href={getPostUrl(post)}>{post.title}</Link>
        </h3>
      </div>
    </article>
  );
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { category: categorySlug, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const category = getCategoryBySlug(post.category);
  const relatedPosts = getRelatedPosts(post, 4);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: category?.name || post.categoryName, href: `/${post.category}/` },
    { label: post.title },
  ];

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.modified || post.date,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${post.category}/${post.slug}/`,
    },
    ...(post.featuredImageUrl && {
      image: {
        "@type": "ImageObject",
        url: post.featuredImageUrl,
      },
    }),
    description: post.excerpt
      ? post.excerpt.replace(/<[^>]*>/g, '').substring(0, 200)
      : generateExcerpt(post.content, 200),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <article className="flex-1 min-w-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                {/* Category badge */}
                <div className="mb-4">
                  <Link
                    href={`/${post.category}/`}
                    className="text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                  >
                    {post.categoryName}
                  </Link>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                  <time dateTime={post.date}>
                    📅 {formatDate(post.date)}
                  </time>
                  <span>✏️ {SITE_NAME}</span>
                </div>

                {/* Featured Image */}
                {post.featuredImageUrl && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <img
                      src={post.featuredImageUrl}
                      alt={post.title}
                      className="w-full h-auto rounded-lg"
                      loading="eager"
                    />
                  </div>
                )}

                {/* Content */}
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Artículos Relacionados
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {relatedPosts.map(rp => (
                      <RelatedPostCard key={rp.id} post={rp} />
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <Sidebar />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
