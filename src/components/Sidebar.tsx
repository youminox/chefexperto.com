import Link from 'next/link';
import Image from 'next/image';
import { getAllCategories, getRecentPosts, getCategoryUrl, getPostUrl, getImageUrl } from '@/lib/data';

export default async function Sidebar() {
  const categories = await getAllCategories();
  const recentPosts = await getRecentPosts(5); // Get 5 recent posts

  return (
    <aside className="w-full space-y-8">
      {/* Categorías Populares */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Categorías Populares
        </h3>
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link 
                href={getCategoryUrl(category.slug)}
                className="flex items-center justify-between group"
              >
                <span className="text-gray-700 group-hover:text-red-700 transition-colors">
                  {category.name}
                </span>
                {category.count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                    {category.count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Artículos Recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Artículos Recientes
        </h3>
        <div className="space-y-4">
          {recentPosts.map((post) => {
            const imageUrl = getImageUrl(post.featuredImageUrl);
            return (
              <Link href={getPostUrl(post)} key={post.slug} className="flex gap-4 group items-center">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-tight mb-1">
                    {post.title}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {post.date ? new Date(post.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Banner Ad Placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <span className="text-xs text-gray-400 uppercase tracking-widest block mb-2">Publicidad</span>
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
          <span className="text-gray-400 text-sm">Espacio para anuncio</span>
        </div>
      </div>
    </aside>
  );
}
