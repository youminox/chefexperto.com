import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Sidebar from '@/components/Sidebar';
import { getAllCategories, getCategoryBySlug, getPostsByCategorySlug, getPostUrl, getImageUrl, formatDate, SITE_NAME, SITE_URL } from '@/lib/data';
import type { Post } from '@/lib/types';

const FEATURED_CARDS_COUNT = 48;

type Params = Promise<{ category: string }>;

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map(cat => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};

  const title = `${category.name} — Artículos, Recetas y Guías`;
  const description = `Explora ${category.count} artículos y recetas verificadas sobre ${category.name} en Chef Experto. Técnicas, tiempos exactos y consejos paso a paso.`;

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
            <Image
              src={getImageUrl(post.featuredImageUrl)}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
  const featuredPosts = allPosts.slice(0, FEATURED_CARDS_COUNT);
  const directoryPosts = allPosts.slice(FEATURED_CARDS_COUNT);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: category.name },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-gradient-to-b from-[#c0392b] via-[#a93226] to-[#922b21] text-white py-12">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="text-3xl md:text-4xl font-bold mt-4">{category.name}: Artículos, Recetas y Guías</h1>
            <p className="text-gray-200 mt-2">{allPosts.length} artículos especializados en {category.name.toLowerCase()}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {featuredPosts.map(post => (
                  <CategoryPostCard key={post.id} post={post} />
                ))}
              </div>

              {allPosts.length === 0 && (
                <p className="text-gray-500 text-center py-12">No hay artículos en esta categoría.</p>
              )}

              {/* Directorio Completo Indexable para garantizar 100% de cobertura a 2 clics del Home */}
              {directoryPosts.length > 0 && (
                <section className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                  <div className="border-b border-gray-100 pb-4 mb-5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 block">
                      📚 Catálogo Completo de la Categoría
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                      Más Guías y Recetas en {category.name} ({directoryPosts.length})
                    </h2>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    {directoryPosts.map(post => (
                      <li key={post.id} className="border-b border-gray-50 pb-2">
                        <Link
                          href={getPostUrl(post)}
                          className="text-gray-700 hover:text-red-700 font-medium transition-colors flex items-start gap-2"
                        >
                          <span className="text-red-600 font-bold">→</span>
                          <span className="line-clamp-1">{post.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
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
