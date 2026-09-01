'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFeaturedPosts, getRecentPosts, getAllCategories, getPostUrl, getImageUrl, formatDate, SITE_NAME } from '@/lib/data';
import type { Post, Category } from '@/lib/types';

/* ─── Category groupings ─── */
const COUNTRY_CATEGORIES = [
  { slug: 'espana', emoji: '🇪🇸' },
  { slug: 'mexico', emoji: '🇲🇽' },
  { slug: 'colombia', emoji: '🇨🇴' },
  { slug: 'usa', emoji: '🇺🇸' },
  { slug: 'guatemala', emoji: '🇬🇹' },
  { slug: 'chile', emoji: '🇨🇱' },
  { slug: 'puerto-rico', emoji: '🇵🇷' },
];

const TOPIC_CATEGORIES = [
  'curiosidades', 'resenas', 'internacional', 'tecnicas',
  'saludable', 'rapida', 'reposteria', 'ingredientes',
  'tendencias', 'utensilios', 'consejos', 'mejores-chef',
];

const AUDIENCE_CATEGORIES = [
  'cocina-para-ninos', 'cocina-para-personas-mayores', 'cocina-para-deportistas',
  'cocina-para-principiantes', 'cocina-para-oficina', 'cocina-para-acampar',
  'cocina-con-bajo-presupuesto', 'cocina-sostenible',
  'cocina-para-la-concentracion-y-el-estudio', 'tips',
];

/* ─── Hero Banner with Bubbles & Search ─── */
function HeroBanner() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=site:chefexperto.com+${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <section className="hero-banner py-20 md:py-28 lg:py-32">
      {/* Animated bubbles */}
      <div className="bubbles">
        <span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          Chef Experto
        </h1>
        <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Tu guía esencial de recetas y cocina: encuentra las mejores recetas, 
          tips culinarios y reseñas de todas partes del mundo
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hero-search mb-10">
          <input
            type="text"
            placeholder="Buscar recetas, ingredientes, tips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Buscar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Quick country pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {COUNTRY_CATEGORIES.map(c => (
            <Link
              key={c.slug}
              href={`/${c.slug}/`}
              className="bg-white/15 backdrop-blur-sm text-white border border-white/25 px-5 py-2 rounded-full font-medium hover:bg-white hover:text-red-800 transition-all duration-300 text-sm"
            >
              {c.emoji} {c.slug.charAt(0).toUpperCase() + c.slug.slice(1).replace('-', ' ')}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Post Card ─── */
function PostCard({ post }: { post: Post }) {
  const imageUrl = getImageUrl(post.featuredImageUrl);
  const excerpt = (post.excerpt || post.content.replace(/<[^>]*>/g, '')).replace(/<[^>]*>/g, '').substring(0, 120);

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <Link href={getPostUrl(post)} className="block">
        <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
          {post.featuredImageUrl ? (
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl bg-gradient-to-br from-gray-50 to-gray-200">
              🍳
            </div>
          )}
          {/* Category badge floating on image */}
          <span className="absolute top-3 left-3 bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {post.categoryName}
          </span>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors leading-snug">
          <Link href={getPostUrl(post)}>{post.title}</Link>
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
          {excerpt}
        </p>
        <div className="flex items-center text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
      </div>
    </article>
  );
}

/* ─── Categories Section (Grouped) ─── */
function CategoriesSection({ categories }: { categories: Category[] }) {
  const catMap = new Map(categories.map(c => [c.slug, c]));

  const countryCats = COUNTRY_CATEGORIES
    .map(c => catMap.get(c.slug))
    .filter((c): c is Category => !!c);

  const topicCats = TOPIC_CATEGORIES
    .map(slug => catMap.get(slug))
    .filter((c): c is Category => !!c);

  const audienceCats = AUDIENCE_CATEGORIES
    .map(slug => catMap.get(slug))
    .filter((c): c is Category => !!c);

  const otherCats = categories.filter(c =>
    !COUNTRY_CATEGORIES.some(cc => cc.slug === c.slug) &&
    !TOPIC_CATEGORIES.includes(c.slug) &&
    !AUDIENCE_CATEGORIES.includes(c.slug)
  );

  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
          Explora Nuestro Contenido
        </h2>

        {/* Recetas por País */}
        <div className="mb-10">
          <h3 className="category-group-title text-xl font-bold text-gray-800 mb-5 pb-2">
            🌎 Recetas por País
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {countryCats.map(cat => {
              const emoji = COUNTRY_CATEGORIES.find(c => c.slug === cat.slug)?.emoji || '🍽️';
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}/`}
                  className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl p-4 text-center transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <span className="text-2xl block mb-2">{emoji}</span>
                  <span className="block text-sm font-semibold text-gray-800 group-hover:text-red-700">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {cat.count} recetas
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Temas de Cocina */}
        <div className="mb-10">
          <h3 className="category-group-title text-xl font-bold text-gray-800 mb-5 pb-2">
            👨‍🍳 Temas de Cocina
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topicCats.map(cat => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}/`}
                className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl px-4 py-3 text-center transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <span className="block text-sm font-semibold text-gray-800 group-hover:text-red-700">
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400">
                  {cat.count} artículos
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Cocina para... */}
        <div className="mb-4">
          <h3 className="category-group-title text-xl font-bold text-gray-800 mb-5 pb-2">
            🎯 Cocina Especializada
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {audienceCats.map(cat => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}/`}
                className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl px-4 py-3 text-center transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <span className="block text-sm font-semibold text-gray-800 group-hover:text-red-700">
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400">
                  {cat.count} artículos
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Other categories */}
        {otherCats.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap justify-center gap-2">
              {otherCats.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}/`}
                  className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const featuredPosts = getFeaturedPosts(6);
  const recentPosts = getRecentPosts(12);
  const categories = getAllCategories();

  return (
    <>
      <Header />
      <main>
        <HeroBanner />

        {/* Featured Posts */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Artículos Destacados
              </h2>
              <span className="hidden md:block h-px bg-gray-200 flex-1 ml-6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories (Grouped) */}
        <CategoriesSection categories={categories} />

        {/* Recent Posts */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Últimos Artículos
              </h2>
              <span className="hidden md:block h-px bg-gray-200 flex-1 ml-6" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
