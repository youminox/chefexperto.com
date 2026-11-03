import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, permanentRedirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Sidebar from '@/components/Sidebar';
import ArticleEnhancer from '@/components/ArticleEnhancer';
import {
  getAllPosts,
  getPostBySlug,
  getCategoryBySlug,
  getRelatedPosts,
  getContextualRelatedPosts,
  getPostUrl,
  getImageUrl,
  formatDate,
  generateExcerpt,
  SITE_NAME,
  SITE_URL,
} from '@/lib/data';
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
    ? post.excerpt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 160)
    : generateExcerpt(post.content);

  const absoluteImageUrl = post.featuredImageUrl
    ? `${SITE_URL}${getImageUrl(post.featuredImageUrl)}`
    : undefined;

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
      ...(absoluteImageUrl && {
        images: [{ url: absoluteImageUrl, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      ...(absoluteImageUrl && { images: [absoluteImageUrl] }),
    },
    alternates: {
      canonical: `${SITE_URL}/${post.category}/${post.slug}/`,
    },
  };
}

function extractFaqPairs(htmlContent: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const regex = /<h3[^>]*>\s*(¿[^<]+\?)\s*<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(htmlContent)) !== null && faqs.length < 6) {
    const question = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const answer = match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (question.length > 10 && answer.length > 20) {
      faqs.push({ question, answer });
    }
  }
  return faqs;
}

function splitContentAtThirdH2(htmlContent: string): [string, string | null] {
  const h2Matches = [...htmlContent.matchAll(/<h2[^>]*>/gi)];
  if (h2Matches.length < 3) {
    return [htmlContent, null];
  }
  const splitIndex = h2Matches[2].index;
  if (splitIndex === undefined || splitIndex <= 0) {
    return [htmlContent, null];
  }
  return [htmlContent.slice(0, splitIndex), htmlContent.slice(splitIndex)];
}

function RelatedPostCard({ post }: { post: Post }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <Link href={getPostUrl(post)} className="block">
        <div className="aspect-video relative overflow-hidden bg-gray-200">
          {post.featuredImageUrl ? (
            <Image
              src={getImageUrl(post.featuredImageUrl)}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
    if (categorySlug === 'blog') {
      permanentRedirect('/blog/los-mejores-platos-de-comida-del-mundo-sabores-que-debes-probar/');
    }
    const validCat = getCategoryBySlug(categorySlug);
    if (validCat) {
      permanentRedirect(`/${categorySlug}/`);
    }
    notFound();
  }

  if (categorySlug !== post.category) {
    permanentRedirect(`/${post.category}/${post.slug}/`);
  }

  const category = getCategoryBySlug(post.category);
  const relatedPosts = getRelatedPosts(post, 4);
  const contextualPosts = getContextualRelatedPosts(post, 3);
  const [firstHalfContent, secondHalfContent] = splitContentAtThirdH2(post.content);
  const faqPairs = extractFaqPairs(post.content);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: category?.name || post.categoryName, href: `/${post.category}/` },
    { label: post.title },
  ];

  const absoluteImageUrl = post.featuredImageUrl
    ? `${SITE_URL}${getImageUrl(post.featuredImageUrl)}`
    : undefined;

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
    ...(absoluteImageUrl && {
      image: {
        "@type": "ImageObject",
        url: absoluteImageUrl,
      },
    }),
    description: post.excerpt
      ? post.excerpt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200)
      : generateExcerpt(post.content, 200),
  };

  const faqSchema =
    faqPairs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqPairs.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}

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
                    <Image
                      src={getImageUrl(post.featuredImageUrl)}
                      alt={post.title}
                      width={1200}
                      height={675}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                      preload={true}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                {/* Content (Part 1) */}
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: firstHalfContent }}
                />

                {/* Contextual Internal Links Box */}
                {secondHalfContent && contextualPosts.length > 0 && (
                  <aside className="my-8 p-5 bg-red-50/70 border-l-4 border-red-700 rounded-r-xl">
                    <p className="text-sm font-bold uppercase tracking-wider text-red-800 mb-3">
                      📖 También te puede interesar en {category?.name || post.categoryName}
                    </p>
                    <ul className="space-y-2">
                      {contextualPosts.map(cp => (
                        <li key={cp.id} className="text-sm">
                          <Link
                            href={getPostUrl(cp)}
                            className="font-medium text-gray-900 hover:text-red-700 underline decoration-red-300 hover:decoration-red-700 transition-colors"
                          >
                            → {cp.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}

                {/* Content (Part 2) */}
                {secondHalfContent && (
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: secondHalfContent }}
                  />
                )}

                <ArticleEnhancer />
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
