import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { getImageUrl, getPostUrl, getCategoryUrl } from '@/lib/data';

interface ArticleCardProps {
  post: Post;
}

export default function ArticleCard({ post }: ArticleCardProps) {
  const imageUrl = getImageUrl(post.featuredImageUrl);
  const postUrl = getPostUrl(post);
  const categoryUrl = getCategoryUrl(post.category);

  // Format date safely
  let formattedDate = '';
  try {
    if (post.date) {
      formattedDate = new Date(post.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (e) {
    formattedDate = post.date || '';
  }

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
      <Link href={postUrl} className="relative aspect-[16/9] w-full overflow-hidden block">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transform hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <Link 
            href={categoryUrl}
            className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-red-200 transition-colors"
          >
            {post.categoryName || post.category}
          </Link>
        </div>
        
        <Link href={postUrl} className="group block mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>
        
        {formattedDate && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">
              {formattedDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
