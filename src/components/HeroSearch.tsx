'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface SearchItem {
  t: string; // title
  s: string; // slug
  c: string; // category slug
  n: string; // category name
}

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search index on first keystroke
  const loadIndex = useCallback(async () => {
    if (searchIndex || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/search-index.json');
      const data: SearchItem[] = await res.json();
      setSearchIndex(data);
      return data;
    } catch {
      console.error('Failed to load search index');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [searchIndex, isLoading]);

  // Search function
  const doSearch = useCallback((q: string, index: SearchItem[]) => {
    if (!q || q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const terms = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/);
    const matches = index.filter(item => {
      const title = item.t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return terms.every(term => title.includes(term));
    }).slice(0, 8);

    setResults(matches);
    setIsOpen(matches.length > 0);
  }, []);

  // Handle input change
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    let index = searchIndex;
    if (!index) {
      index = await loadIndex() || null;
    }
    if (index) {
      doSearch(val, index);
    }
  };

  // Handle form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      window.open(`https://www.google.com/search?q=site:chefexperto.com+${encodeURIComponent(query)}`, '_blank');
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResults = results.length;

  return (
    <div ref={containerRef} className="hero-search mb-12 relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="¿Qué quieres cocinar hoy? Ej. Lomo saltado"
            value={query}
            onChange={handleChange}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            autoComplete="off"
            style={{ paddingLeft: '48px' }}
          />
          <button type="submit" className="hero-search-btn">
            Buscar
          </button>
        </div>
      </form>

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          <div className="px-5 py-3 text-sm text-gray-500 border-b border-gray-100">
            Se encontraron <span className="font-semibold text-gray-700">{totalResults}</span> recetas
          </div>
          {results.map((item, i) => (
            <Link
              key={`${item.c}-${item.s}-${i}`}
              href={`/${item.c}/${item.s}/`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors border-b border-gray-50 last:border-b-0"
            >
              <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap min-w-[70px]">
                {item.n}
              </span>
              <span className="text-sm text-gray-800 font-medium truncate">
                {item.t}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 px-5 py-4 text-sm text-gray-500 text-center">
          Cargando búsqueda...
        </div>
      )}
    </div>
  );
}
