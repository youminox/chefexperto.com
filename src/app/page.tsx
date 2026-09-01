import Link from 'next/link';
import { getFeaturedPosts, getRecentPosts, getAllCategories, getPostUrl, getCategoryUrl, getImageUrl, formatDate, SITE_NAME } from '@/lib/data';
import type { Post, Category } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Chef Experto 🍳
        </h1>
        <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto mb-8">
          Tu guía experta en cocina: recetas de todo el mundo, reseñas de utensilios, 
          tips culinarios y las mejores técnicas gastronómicas.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/espana/" className="bg-white text-red-800 px-6 py-2 rounded-full font-semibold hover:bg-red-100 transition-colors">
            🇪🇸 España
          </Link>
          <Link href="/mexico/" className="bg-white text-red-800 px-6 py-2 rounded-full font-semibold hover:bg-red-100 transition-colors">
            🇲🇽 México
          </Link>
          <Link href="/colombia/" className="bg-white text-red-800 px-6 py-2 rounded-full font-semibold hover:bg-red-100 transition-colors">
            🇨🇴 Colombia
          </Link>
          <Link href="/usa/" className="bg-white text-red-800 px-6 py-2 rounded-full font-semibold hover:bg-red-100 transition-colors">
            🇺🇸 USA
          </Link>
          <Link href="/curiosidades/" className="bg-white text-red-800 px-6 py-2 rounded-full font-semibold hover:bg-red-100 transition-colors">
            💡 Curiosidades
          </Link>
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: Post }) {
  const imageUrl = getImageUrl(post.featuredImageUrl);
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
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-2">
          <Link
            href={`/${post.category}/`}
            className="text-xs font-semibold uppercase tracking-wider text-red-700 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
          >
            {post.categoryName}
          </Link>
        </div>
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

function CategoriesGrid({ categories }: { categories: Category[] }) {
  const topCategories = categories.slice(0, 12);
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Explora por Categoría
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topCategories.map(cat => (
            <Link
              key={cat.slug}
              href={getCategoryUrl(cat)}
              className="bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl p-4 text-center transition-all duration-200 group"
            >
              <span className="block text-sm font-semibold text-gray-800 group-hover:text-red-700 mb-1">
                {cat.name}
              </span>
              <span className="text-xs text-gray-500">
                {cat.count} artículos
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const featuredPosts = getFeaturedPosts(6);
  const recentPosts = getRecentPosts(12);
  const categories = getAllCategories();
  
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        
        {/* Featured Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Artículos Destacados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <CategoriesGrid categories={categories} />

        {/* Recent Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Últimos Artículos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
