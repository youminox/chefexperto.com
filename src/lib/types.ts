export type ArticleLayoutVariant =
  | 'receta-precision'
  | 'duelo-comparativa'
  | 'semaforo-conservacion'
  | 'matriz-tiempos-temperatura'
  | 'clinica-culinaria-rescate'
  | 'atlas-gastronomico';

export interface RecipeMeta {
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  temp: string;
  difficulty: string;
  calories: string;
  cuisine?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  categoryName: string;
  categories: { slug: string; name: string }[];
  date: string;
  modified: string;
  content: string;
  excerpt: string;
  featuredImageId: number | null;
  featuredImageUrl: string;
  type: 'post' | 'page';
  status: string;
  layoutVariant?: ArticleLayoutVariant;
  badgeLabel?: string;
  readTime?: string;
  keyTakeaways?: string[];
  recipeMeta?: RecipeMeta;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  parent: string;
  description: string;
  count: number;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
}
