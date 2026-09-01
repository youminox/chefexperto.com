import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Sidebar from '@/components/Sidebar';
import { getAllCategories, getCategoryBySlug, getPostsByCategorySlug, getPostUrl, getImageUrl, formatDate, SITE_NAME, SITE_URL } from '@/lib/data';
import type { Post } from '@/lib/types';

const POSTS_PER_PAGE = 24;

type Params = Promise<{ category: string }>;

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map(cat => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};

  const title = `${category.name} — Artículos y Recetas`;
  const description = `Explora ${category.count} artículos sobre ${category.name} en Chef Experto. Recetas, tips y guías completas.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${category.slug}/`,
      type: 'website',
    },
    alternates: {
      canonical: `${SITE_URL}/${category.slug}/`,
    },
  };
}

function CategoryPostCard({ post }: { post: Post }) {
  const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

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
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors">
          <Link href={getPostUrl(post)}>
            {post.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {excerpt.replace(/<[^>]*>/g, '')}
        </p>
        <time className="text-xs text-gray-400" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
      </div>
    </article>
  );
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const allPosts = getPostsByCategorySlug(categorySlug);
  const posts = allPosts.slice(0, POSTS_PER_PAGE * 10); // Show many posts

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: category.name },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-gradient-to-r from-red-800 to-red-900 text-white py-10">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="text-3xl md:text-4xl font-bold mt-4">{category.name}</h1>
            <p className="text-red-100 mt-2">{category.count} artículos</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map(post => (
                  <CategoryPostCard key={post.id} post={post} />
                ))}
              </div>
              {posts.length === 0 && (
                <p className="text-gray-500 text-center py-12">No hay artículos en esta categoría.</p>
              )}
            </div>

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
