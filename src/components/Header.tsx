'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRecipesDropdownOpen, setIsRecipesDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleRecipesDropdown = () => {
    setIsRecipesDropdownOpen(!isRecipesDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-red-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Chef Experto 🍳
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/curiosidades" className="hover:text-red-200 transition-colors">
              Curiosidades
            </Link>
            <Link href="/resenas" className="hover:text-red-200 transition-colors">
              Reseñas
            </Link>
            
            {/* Recipes Dropdown */}
            <div className="relative group">
              <button 
                className="flex items-center hover:text-red-200 transition-colors"
                onMouseEnter={() => setIsRecipesDropdownOpen(true)}
                onMouseLeave={() => setIsRecipesDropdownOpen(false)}
                onClick={toggleRecipesDropdown}
                aria-expanded={isRecipesDropdownOpen}
              >
                Recetas
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              <div 
                className={`absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 ${isRecipesDropdownOpen ? 'block' : 'hidden group-hover:block'}`}
                onMouseEnter={() => setIsRecipesDropdownOpen(true)}
                onMouseLeave={() => setIsRecipesDropdownOpen(false)}
              >
                <Link href="/recetas/espana" className="block px-4 py-2 text-sm hover:bg-gray-100">España</Link>
                <Link href="/recetas/usa" className="block px-4 py-2 text-sm hover:bg-gray-100">USA</Link>
                <Link href="/recetas/colombia" className="block px-4 py-2 text-sm hover:bg-gray-100">Colombia</Link>
                <Link href="/recetas/guatemala" className="block px-4 py-2 text-sm hover:bg-gray-100">Guatemala</Link>
                <Link href="/recetas/mexico" className="block px-4 py-2 text-sm hover:bg-gray-100">México</Link>
                <Link href="/recetas/chile" className="block px-4 py-2 text-sm hover:bg-gray-100">Chile</Link>
                <Link href="/recetas/puerto-rico" className="block px-4 py-2 text-sm hover:bg-gray-100">Puerto Rico</Link>
              </div>
            </div>

            <Link href="/nosotros" className="hover:text-red-200 transition-colors">
              Nosotros
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-white hover:text-red-200 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-red-900 border-t border-red-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/curiosidades" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-800" onClick={() => setIsMobileMenuOpen(false)}>
              Curiosidades
            </Link>
            <Link href="/resenas" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-800" onClick={() => setIsMobileMenuOpen(false)}>
              Reseñas
            </Link>
            <div className="px-3 py-2 rounded-md text-base font-medium">
              <span className="mb-2 block">Recetas:</span>
              <div className="pl-4 flex flex-col space-y-2">
                <Link href="/recetas/espana" className="hover:text-red-200" onClick={() => setIsMobileMenuOpen(false)}>España</Link>
                <Link href="/recetas/usa" className="hover:text-red-200" onClick={() => setIsMobileMenuOpen(false)}>USA</Link>
                <Link href="/recetas/colombia" className="hover:text-red-200" onClick={() => setIsMobileMenuOpen(false)}>Colombia</Link>
                <Link href="/recetas/guatemala" className="hover:text-red-200" onClick={() => setIsMobileMenuOpen(false)}>Guatemala</Link>
                <Link href="/recetas/mexico" className="hover:text-red-200" onClick={() => setIsMobileMenuOpen(false)}>México</Link>
                <Link href="/recetas/chile" className="hover:text-red-200" onClick={() => setIsMobileMenuOpen(false)}>Chile</Link>
                <Link href="/recetas/puerto-rico" className="hover:text-red-200" onClick={() => setIsMobileMenuOpen(false)}>Puerto Rico</Link>
              </div>
            </div>
            <Link href="/nosotros" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-800" onClick={() => setIsMobileMenuOpen(false)}>
              Nosotros
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
