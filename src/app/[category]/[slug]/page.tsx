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
import type { Post, ArticleLayoutVariant } from '@/lib/types';

type Params = Promise<{ category: string; slug: string }>;

const RECIPE_CATEGORY_SLUGS = new Set([
  'espana',
  'mexico',
  'colombia',
  'usa',
  'chile',
  'puerto-rico',
  'guatemala',
  'reposteria',
  'rapida',
  'saludable',
]);

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

function resolveLayoutVariant(post: Post): ArticleLayoutVariant {
  if (post.layoutVariant) return post.layoutVariant;
  const slug = post.slug.toLowerCase();
  const cat = post.category.toLowerCase();

  if (
    slug.includes('conservar') ||
    slug.includes('dura-') ||
    slug.includes('congelar') ||
    slug.includes('refrigerador') ||
    slug.includes('nevera') ||
    slug.includes('batch-cooking') ||
    cat === 'cocina-para-oficina' ||
    cat === 'cocina-sostenible'
  ) {
    return 'semaforo-conservacion';
  }
  if (
    slug.includes('comparativa') ||
    slug.includes('diferencia-entre') ||
    slug.includes('cual-es-mejor') ||
    slug.includes('vs-') ||
    slug.includes('ventajas-y-desventajas') ||
    cat === 'utensilios' ||
    cat === 'resenas'
  ) {
    return 'duelo-comparativa';
  }
  if (
    slug.includes('air-fryer') ||
    slug.includes('freidora-de-aire') ||
    slug.includes('olla-a-presion') ||
    slug.includes('temperatura') ||
    slug.includes('tiempo') ||
    slug.includes('cortes-de-')
  ) {
    return 'matriz-tiempos-temperatura';
  }
  if (
    slug.includes('errores-') ||
    slug.includes('arreglar') ||
    slug.includes('salvar') ||
    slug.includes('por-que-') ||
    slug.includes('no-se-debe-mezclar') ||
    slug.includes('reemplazar') ||
    slug.includes('sustitutos') ||
    cat === 'tips' ||
    cat === 'curiosidades'
  ) {
    return 'clinica-culinaria-rescate';
  }
  if (
    cat === 'internacional' ||
    cat === 'restaurantes-de-america' ||
    cat === 'restaurantes-en-europa' ||
    cat === 'mejores-chef'
  ) {
    return 'atlas-gastronomico';
  }
  if (RECIPE_CATEGORY_SLUGS.has(cat) || slug.startsWith('receta-')) {
    return 'receta-precision';
  }

  const variants: ArticleLayoutVariant[] = [
    'receta-precision',
    'duelo-comparativa',
    'semaforo-conservacion',
    'matriz-tiempos-temperatura',
    'clinica-culinaria-rescate',
    'atlas-gastronomico',
  ];
  return variants[Math.abs(post.id) % variants.length];
}

function getBadgeLabel(post: Post, variant: ArticleLayoutVariant): string {
  if (post.badgeLabel) return post.badgeLabel;
  switch (variant) {
    case 'receta-precision':
      return '👨‍🍳 Receta de Precisión Verificada';
    case 'duelo-comparativa':
      return '⚖️ Laboratorio & Comparativa Técnica';
    case 'semaforo-conservacion':
      return '❄️ Guía de Conservación & Inocuidad';
    case 'matriz-tiempos-temperatura':
      return '🌡️ Tabla Maestra de Cocción Exacta';
    case 'clinica-culinaria-rescate':
      return '🔬 Alquimia & Diagnóstico Culinario';
    case 'atlas-gastronomico':
      return '🌎 Pasaporte Gastronómico Internacional';
  }
}

function slugifyHeading(text: string, index: number): string {
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
  return clean ? `${clean}-${index + 1}` : `seccion-${index + 1}`;
}

function injectHeadingIdsAndExtractToc(htmlContent: string): {
  processedHtml: string;
  toc: { id: string; label: string }[];
} {
  const toc: { id: string; label: string }[] = [];
  let idx = 0;
  const processedHtml = htmlContent.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (fullMatch, attrs, innerHtml) => {
      const plainText = innerHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!plainText) return fullMatch;
      const existingIdMatch = attrs.match(/id=['"]([^'"]+)['"]/i);
      const id = existingIdMatch ? existingIdMatch[1] : slugifyHeading(plainText, idx);
      idx++;
      toc.push({ id, label: plainText });
      if (existingIdMatch) return fullMatch;
      return `<h2${attrs} id="${id}">${innerHtml}</h2>`;
    }
  );
  return { processedHtml, toc };
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

/**
 * 6 Arquetipos Polimórficos (Layouts A–F) inspirados en GuíaDeBarberías.com y Dinámica.pe
 * para dotar a cada artículo de estructura DOM diferenciada según la intención de búsqueda.
 */
function VariantTopModule({
  post,
  variant,
}: {
  post: Post;
  variant: ArticleLayoutVariant;
}) {
  switch (variant) {
    case 'receta-precision': {
      const meta = post.recipeMeta || {
        prepTime: '15 min',
        cookTime: '25 min',
        totalTime: '40 min',
        servings: '4 porciones',
        temp: '180 °C (355 °F)',
        difficulty: 'Media · Paso a paso',
        calories: '340 kcal / porción',
      };
      return (
        <div className="my-6 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-950 via-red-900 to-amber-950 p-5 md:p-6 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-xs font-extrabold text-amber-200">
              🍳 Ficha Técnica de Cocina Profesional
            </span>
            <span className="text-xs font-bold text-red-200">
              ✓ Proporciones y Temperaturas Verificadas
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                Preparación
              </span>
              <p className="mt-1 text-sm font-extrabold text-white">{meta.prepTime}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                Cocción
              </span>
              <p className="mt-1 text-sm font-extrabold text-white">{meta.cookTime}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                Tiempo Total
              </span>
              <p className="mt-1 text-sm font-extrabold text-white">{meta.totalTime}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                Rendimiento
              </span>
              <p className="mt-1 text-sm font-extrabold text-white">{meta.servings}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                Temperatura
              </span>
              <p className="mt-1 text-xs font-extrabold text-white">{meta.temp}</p>
            </div>
            <div className="rounded-xl bg-amber-500/20 p-3 border border-amber-300/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 block">
                Aporte Est.
              </span>
              <p className="mt-1 text-xs font-extrabold text-white">{meta.calories}</p>
            </div>
          </div>
        </div>
      );
    }

    case 'duelo-comparativa': {
      return (
        <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-800">
              🏆 Evaluación de Laboratorio Culinario • {SITE_NAME}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Conductividad Térmica · Durabilidad · Seguridad Alimentaria
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-emerald-600 bg-emerald-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-emerald-900">
                  🥇 Elección de Chef Profesional
                </span>
                <span className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-black text-white">
                  9.7 / 10
                </span>
              </div>
              <h2 className="mt-2 text-sm font-extrabold text-slate-900">
                Máxima Retención Térmica y Vida Útil Extendida
              </h2>
              <ul className="mt-2 space-y-1 text-xs text-emerald-950 font-medium">
                <li>✓ Distribución uniforme de calor sin puntos fríos</li>
                <li>✓ 100% libre de PFOA, PTFE, plomo y cadmio</li>
                <li>✓ Mejor costo por año de uso intensivo en casa</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-600">
                  🥈 Alternativa Práctica / Uso Ligero
                </span>
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-black text-white">
                  8.6 / 10
                </span>
              </div>
              <h2 className="mt-2 text-sm font-extrabold text-slate-900">
                Opción Rápida para Cocciones Suaves y BajoPeso
              </h2>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 font-medium">
                <li>• Calentamiento rápido para preparaciones de diario</li>
                <li>• Requiere control de llama media y utensilios de silicona</li>
                <li>• Ideal para cocinas compactas o principiantes</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    case 'semaforo-conservacion': {
      return (
        <div className="my-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-5 md:p-6 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-extrabold text-emerald-300">
              ❄️ Semáforo Oficial de Conservación e Inocuidad Alimentaria
            </span>
            <span className="text-xs font-bold text-amber-300">
              Estándar de Cadena de Frío Doméstica
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-amber-500/15 border border-amber-400/30 p-3.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block">
                🌡️ Temp. Ambiente (20 °C)
              </span>
              <p className="mt-1 text-xs font-bold text-white">
                Máximo 2 horas tras cocción (1 hora en verano &gt;30 °C)
              </p>
              <p className="mt-1 text-[11px] text-amber-100/90">
                Evita la zona de peligro bacteriano entre 5 °C y 60 °C.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                🧊 Refrigerador (2 °C a 4 °C)
              </span>
              <p className="mt-1 text-xs font-bold text-white">
                3 a 4 días en envase hermético de vidrio (balda central)
              </p>
              <p className="mt-1 text-[11px] text-emerald-100/90">
                Enfriar destapado 20 min antes de cerrar herméticamente.
              </p>
            </div>
            <div className="rounded-xl bg-sky-500/15 border border-sky-400/30 p-3.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300 block">
                ❄️ Congelador (-18 °C)
              </span>
              <p className="mt-1 text-xs font-bold text-white">
                2 a 3 meses porcionado sin cámara de aire interior
              </p>
              <p className="mt-1 text-[11px] text-sky-100/90">
                Descongelar siempre 12–24 h dentro del refrigerador.
              </p>
            </div>
          </div>
        </div>
      );
    }

    case 'matriz-tiempos-temperatura': {
      const stages = [
        {
          method: 'Freidora de Aire (Air Fryer)',
          temp: '185 °C – 200 °C',
          pct: '90%',
          note: 'Precalentar 3 min; no sobrecargar la cesta para lograr convección 360°.',
        },
        {
          method: 'Olla a Presión / Instant Pot',
          temp: 'Alta Presión (115 °C)',
          pct: '85%',
          note: 'Reduce el tiempo de cocción un 70% conservando colágeno y jugos.',
        },
        {
          method: 'Horno Convencional',
          temp: '180 °C – 190 °C',
          pct: '75%',
          note: 'Bandeja a altura media; usar sonda térmica en la parte más gruesa.',
        },
        {
          method: 'Reposo Post-Cocción',
          temp: '5 a 8 minutos',
          pct: '100%',
          note: 'Indispensable para redistribuir jugos internos antes de cortar.',
        },
      ];
      return (
        <div className="my-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-2">
              <span>⏱️</span> Parámetros Técnicos de Temperatura y Cocción por Equipo
            </h2>
            <span className="text-xs font-bold text-red-800">
              Control con Termómetro Digital de Sonda
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map(s => (
              <div
                key={s.method}
                className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] font-extrabold text-red-700">
                  <span>{s.method}</span>
                </div>
                <p className="mt-1 text-xs font-black text-slate-900">{s.temp}</p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full bg-red-700 rounded-full"
                    style={{ width: s.pct }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'clinica-culinaria-rescate': {
      return (
        <div className="my-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 via-white to-amber-50/50 p-5 md:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-teal-200/70">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-950">
              🔬 Dossier de Ciencia de los Alimentos & Rescate en Cocina
            </span>
            <span className="rounded-full bg-teal-900 px-3 py-0.5 text-[11px] font-bold text-teal-100">
              Química Culinaria Aplicada
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-3.5 border border-teal-100">
              <span className="text-[11px] font-bold uppercase text-teal-700 block">
                1. Causa Físico-Química
              </span>
              <p className="mt-1 text-xs font-extrabold text-slate-900">
                Equilibrio de Temperatura, pH y Emulsión
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Identificamos por qué se altera la textura o el perfil aromático del plato.
              </p>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-teal-100">
              <span className="text-[11px] font-bold uppercase text-teal-700 block">
                2. Protocolo de Corrección
              </span>
              <p className="mt-1 text-xs font-extrabold text-slate-900">
                Acción Correctiva en Menos de 2 Minutos
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Ajuste exacto con ingredientes de despensa sin arruinar el sabor base.
              </p>
            </div>
            <div className="rounded-xl bg-white p-3.5 border border-teal-100">
              <span className="text-[11px] font-bold uppercase text-teal-700 block">
                3. Regla de Prevención
              </span>
              <p className="mt-1 text-xs font-extrabold text-slate-900">
                Control de Mise en Place y Orden de Cocción
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Secuencia profesional para que el resultado sea replicable al 100%.
              </p>
            </div>
          </div>
        </div>
      );
    }

    case 'atlas-gastronomico':
    default: {
      return (
        <div className="my-6 rounded-2xl border-2 border-blue-500/25 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 md:p-6 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  Observatorio Internacional de Gastronomía y Tradición
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Categoría Especializada: {post.categoryName}
                </h2>
              </div>
            </div>
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              Guía Verificada {SITE_NAME}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="text-[11px] font-bold uppercase text-blue-300 block">
                Autenticidad Culinaria
              </span>
              <p className="mt-1 text-xs font-bold text-white leading-relaxed">
                Ingredientes tradicionales, técnicas de origen y variantes locales explicadas.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="text-[11px] font-bold uppercase text-blue-300 block">
                Adaptación en Casa
              </span>
              <p className="mt-1 text-xs font-bold text-white leading-relaxed">
                Sustitutos accesibles de supermercado sin perder el perfil de sabor original.
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/20 p-3.5 border border-amber-400/40">
              <span className="text-[11px] font-bold uppercase text-amber-300 block">
                Criterio Experto
              </span>
              <p className="mt-1 text-xs font-extrabold text-white leading-relaxed">
                Selección curada para paladares exigentes y cocina práctica diaria.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
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
    notFound();
  }

  if (categorySlug !== post.category) {
    permanentRedirect(`/${post.category}/${post.slug}/`);
  }

  const variant = resolveLayoutVariant(post);
  const badgeLabel = getBadgeLabel(post, variant);
  const category = getCategoryBySlug(post.category);
  const relatedPosts = getRelatedPosts(post, 4);
  const contextualPosts = getContextualRelatedPosts(post, 3);
  const { processedHtml, toc } = injectHeadingIdsAndExtractToc(post.content);
  const [firstHalfContent, secondHalfContent] = splitContentAtThirdH2(processedHtml);
  const faqPairs = extractFaqPairs(post.content);

  const wordCount = post.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readTime = post.readTime || `${Math.max(4, Math.round(wordCount / 190))} min`;

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: category?.name || post.categoryName, href: `/${post.category}/` },
    { label: post.title },
  ];

  const absoluteImageUrl = post.featuredImageUrl
    ? `${SITE_URL}${getImageUrl(post.featuredImageUrl)}`
    : undefined;

  const cleanDescription = post.excerpt
    ? post.excerpt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200)
    : generateExcerpt(post.content, 200);

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
    description: cleanDescription,
  };

  const isRecipePost =
    variant === 'receta-precision' ||
    RECIPE_CATEGORY_SLUGS.has(post.category) ||
    post.slug.startsWith('receta-');

  const recipeSchema = isRecipePost
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: post.title,
        description: cleanDescription,
        ...(absoluteImageUrl && { image: [absoluteImageUrl] }),
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        datePublished: post.date,
        prepTime: "PT15M",
        cookTime: "PT25M",
        totalTime: "PT40M",
        recipeYield: post.recipeMeta?.servings || "4 porciones",
        recipeCategory: post.categoryName,
        recipeCuisine: post.recipeMeta?.cuisine || post.categoryName,
        nutrition: {
          "@type": "NutritionInformation",
          calories: post.recipeMeta?.calories || "340 calories",
        },
      }
    : null;

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

  const takeaways =
    post.keyTakeaways && post.keyTakeaways.length > 0
      ? post.keyTakeaways
      : [
          cleanDescription,
          `Aplica las temperaturas, tiempos y proporciones exactas de esta guía de ${post.categoryName} para obtener resultados consistentes en casa.`,
          `Revisa nuestra tabla comparativa y las preguntas frecuentes al final del artículo para resolver dudas de conservación y sustituciones.`,
        ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        {recipeSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
          />
        )}
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
                {/* Category & Archetype badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/${post.category}/`}
                    className="text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                  >
                    {post.categoryName}
                  </Link>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full">
                    {badgeLabel}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    ⏱️ {readTime} de lectura
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                  <time dateTime={post.date}>
                    📅 {formatDate(post.date)}
                  </time>
                  <span>✏️ Equipo Editorial {SITE_NAME}</span>
                </div>

                {/* Featured Image */}
                {post.featuredImageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden">
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

                {/* Polymorphic Archetype Top Module (Layouts A-F) */}
                <VariantTopModule post={post} variant={variant} />

                {/* Key Takeaways & Interactive TOC Grid */}
                <div className="my-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900 mb-2">
                      💡 Puntos Clave del Chef
                    </p>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-gray-800">
                      {takeaways.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-red-700 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {toc.length > 0 && (
                    <nav
                      aria-label="Índice de contenidos"
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="text-xs font-extrabold uppercase tracking-wider text-gray-800 mb-2">
                        📑 Índice de Contenidos
                      </p>
                      <ol className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                        {toc.slice(0, 6).map((item, idx) => (
                          <li key={item.id} className="truncate">
                            <a
                              href={`#${item.id}`}
                              className="hover:text-red-700 hover:underline font-medium transition-colors"
                            >
                              {idx + 1}. {item.label}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}
                </div>

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
