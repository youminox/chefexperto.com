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

export function getRecentPosts(limit: number = 12): Post[] {
  return posts.slice(0, limit);
}

export function getFeaturedPosts(limit: number = 6): Post[] {
  // Return most recent posts with featured images
  return posts.filter(p => p.featuredImageUrl).slice(0, limit);
}

export function getRelatedPosts(post: Post, limit: number = 4): Post[] {
  return posts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, limit);
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
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export const SITE_NAME = 'Chef Experto';
export const SITE_URL = 'https://chefexperto.com';
export const SITE_DESCRIPTION = 'Tu guía experta en cocina: recetas, reseñas de sartenes, tips culinarios y las mejores técnicas gastronómicas.';
export const ADSENSE_ID = 'ca-pub-1070738569472471';
export const GA_ID = 'G-HXFSX6XPNB';
