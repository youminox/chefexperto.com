'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  {
    label: 'Recetas',
    href: '#',
    children: [
      { label: '🇪🇸 España', href: '/espana/' },
      { label: '🇲🇽 México', href: '/mexico/' },
      { label: '🇨🇴 Colombia', href: '/colombia/' },
      { label: '🇺🇸 USA', href: '/usa/' },
      { label: '🇬🇹 Guatemala', href: '/guatemala/' },
      { label: '🇨🇱 Chile', href: '/chile/' },
      { label: '🇵🇷 Puerto Rico', href: '/puerto-rico/' },
    ],
  },
  {
    label: 'Temas',
    href: '#',
    children: [
      { label: 'Curiosidades', href: '/curiosidades/' },
      { label: 'Reseñas', href: '/resenas/' },
      { label: 'Técnicas de Cocina', href: '/tecnicas/' },
      { label: 'Repostería', href: '/reposteria/' },
      { label: 'Utensilios', href: '/utensilios/' },
      { label: 'Mejores Chef', href: '/mejores-chef/' },
    ],
  },
  { label: 'Cocina Saludable', href: '/saludable/' },
  { label: 'Cocina Rápida', href: '/rapida/' },
];

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-red-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tight hover:opacity-90 transition-opacity">
            Chef Experto <span className="text-yellow-300">🍳</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.children ? (
                  <button className="flex items-center gap-1 text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all">
                    {item.label}
                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link href={item.href} className="text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all block">
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in duration-150">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menú"
          >
            {isMobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-red-900 border-t border-red-700">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between text-white py-2.5 px-3 rounded-lg hover:bg-white/10 text-sm font-medium"
                    >
                      {item.label}
                      <svg className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === item.label && (
                      <div className="ml-4 space-y-1 mt-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block text-red-100 hover:text-white py-2 px-3 rounded-lg text-sm hover:bg-white/10"
                            onClick={() => setIsMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block text-white py-2.5 px-3 rounded-lg hover:bg-white/10 text-sm font-medium"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
