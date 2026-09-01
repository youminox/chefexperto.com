import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSearch from '@/components/HeroSearch';
import { getFeaturedPosts, getRecentPosts, getAllCategories, getPostUrl, getImageUrl, formatDate, SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/data';
import type { Post, Category } from '@/lib/types';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Recetas de Cocina, Tips Culinarios y Reseñas de Utensilios`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
};

/* ─── Category groupings ─── */
const COUNTRY_CATEGORIES = [
  { slug: 'espana', emoji: '🇪🇸', label: 'España' },
  { slug: 'mexico', emoji: '🇲🇽', label: 'México' },
  { slug: 'colombia', emoji: '🇨🇴', label: 'Colombia' },
  { slug: 'usa', emoji: '🇺🇸', label: 'USA' },
  { slug: 'guatemala', emoji: '🇬🇹', label: 'Guatemala' },
  { slug: 'chile', emoji: '🇨🇱', label: 'Chile' },
  { slug: 'puerto-rico', emoji: '🇵🇷', label: 'Puerto Rico' },
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
  return (
    <section className="hero-banner py-20 md:py-24 lg:py-28">
      <div className="bubbles">
        <span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
          Recetas de Cocina, Tips y Reseñas
        </h1>
        <p className="text-base md:text-lg text-red-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Descubre las mejores recetas del mundo, técnicas culinarias paso a paso
          y reseñas de utensilios para tu cocina
        </p>

        <HeroSearch />

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {COUNTRY_CATEGORIES.map(c => (
            <Link
              key={c.slug}
              href={`/${c.slug}/`}
              className="bg-white/15 backdrop-blur-sm text-white border border-white/25 px-5 py-2 rounded-full font-medium hover:bg-white hover:text-red-800 transition-all duration-300 text-sm"
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>

        <div className="flex justify-center gap-12 md:gap-20 mt-12">
          <div className="text-center">
            <span className="block text-2xl md:text-3xl font-extrabold text-red-200">4,300+</span>
            <span className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">Recetas</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl md:text-3xl font-extrabold text-red-200">32</span>
            <span className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">Categorías</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl md:text-3xl font-extrabold text-red-200">100%</span>
            <span className="text-xs md:text-sm text-white/70 uppercase tracking-wider font-medium">Experto</span>
          </div>
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
              width={640}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl bg-gradient-to-br from-gray-50 to-gray-200">
              🍳
            </div>
          )}
          <span className="absolute top-3 left-3 bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {post.categoryName}
          </span>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors leading-snug">
          <Link href={getPostUrl(post)}>{post.title}</Link>
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{excerpt}</p>
        <div className="flex items-center text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
      </div>
    </article>
  );
}

/* ─── Categories Section (Grouped) ─── */
function CategoriesSection({ categories }: { categories: Category[] }) {
  const catMap = new Map(categories.map(c => [c.slug, c]));
  const countryCats = COUNTRY_CATEGORIES.map(c => catMap.get(c.slug)).filter((c): c is Category => !!c);
  const topicCats = TOPIC_CATEGORIES.map(slug => catMap.get(slug)).filter((c): c is Category => !!c);
  const audienceCats = AUDIENCE_CATEGORIES.map(slug => catMap.get(slug)).filter((c): c is Category => !!c);
  const otherCats = categories.filter(c =>
    !COUNTRY_CATEGORIES.some(cc => cc.slug === c.slug) &&
    !TOPIC_CATEGORIES.includes(c.slug) &&
    !AUDIENCE_CATEGORIES.includes(c.slug)
  );

  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
          Categorías de Recetas y Cocina
        </h2>

        <div className="mb-10">
          <h3 className="category-group-title text-xl font-bold text-gray-800 mb-5 pb-2">🌎 Recetas por País</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {countryCats.map(cat => {
              const emoji = COUNTRY_CATEGORIES.find(c => c.slug === cat.slug)?.emoji || '🍽️';
              return (
                <Link key={cat.slug} href={`/${cat.slug}/`} className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl p-4 text-center transition-all duration-200 group shadow-sm hover:shadow-md">
                  <span className="text-2xl block mb-2">{emoji}</span>
                  <span className="block text-sm font-semibold text-gray-800 group-hover:text-red-700">{cat.name}</span>
                  <span className="text-xs text-gray-400 mt-1 block">{cat.count} recetas</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mb-10">
          <h3 className="category-group-title text-xl font-bold text-gray-800 mb-5 pb-2">👨‍🍳 Temas de Cocina</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topicCats.map(cat => (
              <Link key={cat.slug} href={`/${cat.slug}/`} className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl px-4 py-3 text-center transition-all duration-200 group shadow-sm hover:shadow-md">
                <span className="block text-sm font-semibold text-gray-800 group-hover:text-red-700">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.count} artículos</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="category-group-title text-xl font-bold text-gray-800 mb-5 pb-2">🎯 Cocina Especializada</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {audienceCats.map(cat => (
              <Link key={cat.slug} href={`/${cat.slug}/`} className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl px-4 py-3 text-center transition-all duration-200 group shadow-sm hover:shadow-md">
                <span className="block text-sm font-semibold text-gray-800 group-hover:text-red-700">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.count} artículos</span>
              </Link>
            ))}
          </div>
        </div>

        {otherCats.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap justify-center gap-2">
              {otherCats.map(cat => (
                <Link key={cat.slug} href={`/${cat.slug}/`} className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
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

/* ─── Main Page (Server Component) ─── */
export default function HomePage() {
  const featuredPosts = getFeaturedPosts(6);
  const recentPosts = getRecentPosts(12);
  const categories = getAllCategories();

  return (
    <>
      <Header />
      <main>
        <HeroBanner />

        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Recetas y Artículos Destacados
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

        <CategoriesSection categories={categories} />

        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Últimas Recetas y Guías de Cocina
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
