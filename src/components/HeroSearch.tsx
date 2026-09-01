'use client';

import { useState } from 'react';

export default function HeroSearch() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=site:chefexperto.com+${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <form onSubmit={handleSearch} className="hero-search mb-16">
      <input
        type="text"
        placeholder="¿Qué quieres cocinar hoy? Ej. Tortilla de patatas"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" aria-label="Buscar">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
