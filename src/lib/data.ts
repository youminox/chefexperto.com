import postsData from '../../data/posts.json';
import categoriesData from '../../data/categories.json';
import type { Post, Category } from './types';

const posts: Post[] = postsData as Post[];
const categories: Category[] = categoriesData as Category[];

export function getAllPosts(): Post[] {
  return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug);
}

export function getPostsByCategorySlug(categorySlug: string): Post[] {
  return posts.filter(p => p.category === categorySlug || p.categories.some(c => c.slug === categorySlug));
}

const FEATURED_SLUGS = [
  'sustitutos-de-la-clavo-de-olor-para-recetas-saludables',
  'descubre-la-mejor-sarten-antiadherente-sin-teflon-para-tu-cocina',
  'como-reemplazar-la-jengibre-si-no-la-tienes-en-casa',
  'receta-de-aguardiente-antioqueno',
  'receta-de-tembleque-de-coco',
  'receta-de-chupe-de-guatitas',
];

export function getFeaturedPosts(limit: number = 6): Post[] {
  const featured: Post[] = [];
  for (const slug of FEATURED_SLUGS) {
    const found = posts.find(p => p.slug === slug && p.featuredImageUrl);
    if (found) featured.push(found);
    if (featured.length >= limit) return featured;
  }
  for (const p of posts) {
    if (p.featuredImageUrl && !featured.some(f => f.id === p.id)) {
      featured.push(p);
      if (featured.length >= limit) break;
    }
  }
  return featured;
}

export function getRecentPosts(limit: number = 12): Post[] {
  const featuredIds = new Set(FEATURED_SLUGS);
  const catCounts = new Map<string, number>();
  const selected: Post[] = [];

  for (const p of posts) {
    if (featuredIds.has(p.slug)) continue;
    const count = catCounts.get(p.category) || 0;
    if (count >= 2) continue;
    selected.push(p);
    catCounts.set(p.category, count + 1);
    if (selected.length >= limit) break;
  }

  return selected.length > 0 ? selected : posts.slice(0, limit);
}

export function getRelatedPosts(post: Post, limit: number = 4): Post[] {
  const sameCategory = posts.filter(p => p.category === post.category);
  if (sameCategory.length <= 1) return [];

  const currentIndex = sameCategory.findIndex(p => p.id === post.id);
  const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  const related: Post[] = [];

  for (let i = 0; i < sameCategory.length - 1 && related.length < limit; i++) {
    const candidate = sameCategory[(startIndex + i) % sameCategory.length];
    if (candidate.id !== post.id) {
      related.push(candidate);
    }
  }

  return related;
}

export function getContextualRelatedPosts(post: Post, limit: number = 3): Post[] {
  const sameCategory = posts.filter(p => p.category === post.category);
  if (sameCategory.length <= 1) return [];

  const currentIndex = sameCategory.findIndex(p => p.id === post.id);
  // Offset by +4 so contextual in-article links differ from bottom Related Posts
  const startIndex = currentIndex >= 0 ? currentIndex + 5 : 4;
  const related: Post[] = [];

  for (let i = 0; i < sameCategory.length - 1 && related.length < limit; i++) {
    const candidate = sameCategory[(startIndex + i) % sameCategory.length];
    if (candidate.id !== post.id) {
      related.push(candidate);
    }
  }

  return related;
}

export function getAllCategories(): Category[] {
  return categories.sort((a, b) => b.count - a.count);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

export function getMainNavCategories(): Category[] {
  // Categories for the main navigation - top ones by count
  const countryCategories = ['espana', 'usa', 'colombia', 'guatemala', 'mexico', 'chile', 'puerto-rico'];
  const specialCategories = ['curiosidades', 'resenas'];
  
  return categories.filter(c => 
    countryCategories.includes(c.slug) || specialCategories.includes(c.slug)
  );
}

export function getAllPostSlugs(): { category: string; slug: string }[] {
  return posts.map(p => ({ category: p.category, slug: p.slug }));
}

export function getAllCategorySlugs(): string[] {
  return categories.map(c => c.slug);
}

export function getPostUrl(post: Post): string {
  return `/${post.category}/${post.slug}/`;
}

export function getCategoryUrl(category: Category | { slug: string } | string): string {
  const slug = typeof category === 'string' ? category : category.slug;
  return `/${slug}/`;
}

export function getImageUrl(url: string): string {
  if (!url) return '/images/placeholder.jpg';
  // Convert WordPress URL to local path
  if (url.includes('chefexperto.com/wp-content/uploads/')) {
    const filename = url.split('/').pop() || '';
    return `/images/${filename}`;
  }
  return url;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  const cleaned = content.replace(/<noscript>[\s\S]*?<\/noscript>/gi, ' ');
  const text = cleaned.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export const SITE_NAME = 'Chef Experto';
export const SITE_URL = 'https://chefexperto.com';
export const SITE_DESCRIPTION = 'Tu guía experta en cocina: recetas, reseñas de sartenes, tips culinarios y las mejores técnicas gastronómicas.';
export const ADSENSE_ID = 'ca-pub-1070738569472471';
export const GA_ID = 'G-HXFSX6XPNB';
