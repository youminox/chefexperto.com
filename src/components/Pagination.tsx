import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const generatePageLink = (page: number) => {
    return page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center space-x-2 my-10" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={generatePageLink(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-700 transition-colors"
        >
          Anterior
        </Link>
      ) : (
        <button
          disabled
          className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed"
        >
          Anterior
        </button>
      )}

      {/* Page Numbers */}
      <div className="hidden sm:flex space-x-1">
        {pages.map((page) => {
          // Logic to show limited page numbers can be added here
          // For now, showing all or a subset if not too many
          const isCurrentPage = page === currentPage;
          
          return (
            <Link
              key={page}
              href={generatePageLink(page)}
              className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                isCurrentPage 
                  ? 'bg-red-700 text-white border-red-700' 
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-red-700'
              }`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          );
        })}
      </div>
      
      {/* Mobile Current Page Indicator */}
      <span className="sm:hidden text-sm text-gray-700 font-medium px-4">
        Página {currentPage} de {totalPages}
      </span>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={generatePageLink(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-700 transition-colors"
        >
          Siguiente
        </Link>
      ) : (
        <button
          disabled
          className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed"
        >
          Siguiente
        </button>
      )}
    </nav>
  );
}
