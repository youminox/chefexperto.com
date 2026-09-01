import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              Chef Experto 🍳
            </Link>
            <p className="text-sm mb-4">
              Tu guía experta en cocina: recetas de todo el mundo, reseñas de utensilios, tips culinarios y las mejores técnicas gastronómicas.
            </p>
          </div>

          {/* Quick Links: Recetas por País */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Recetas por País</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/espana/" className="hover:text-red-400 transition-colors">🇪🇸 España</Link></li>
              <li><Link href="/mexico/" className="hover:text-red-400 transition-colors">🇲🇽 México</Link></li>
              <li><Link href="/colombia/" className="hover:text-red-400 transition-colors">🇨🇴 Colombia</Link></li>
              <li><Link href="/usa/" className="hover:text-red-400 transition-colors">🇺🇸 USA</Link></li>
              <li><Link href="/chile/" className="hover:text-red-400 transition-colors">🇨🇱 Chile</Link></li>
              <li><Link href="/guatemala/" className="hover:text-red-400 transition-colors">🇬🇹 Guatemala</Link></li>
              <li><Link href="/puerto-rico/" className="hover:text-red-400 transition-colors">🇵🇷 Puerto Rico</Link></li>
            </ul>
          </div>

          {/* Quick Links: Temas de Cocina */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Temas de Cocina</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/curiosidades/" className="hover:text-red-400 transition-colors">Curiosidades</Link></li>
              <li><Link href="/resenas/" className="hover:text-red-400 transition-colors">Reseñas</Link></li>
              <li><Link href="/tecnicas/" className="hover:text-red-400 transition-colors">Técnicas de Cocina</Link></li>
              <li><Link href="/saludable/" className="hover:text-red-400 transition-colors">Cocina Saludable</Link></li>
              <li><Link href="/reposteria/" className="hover:text-red-400 transition-colors">Repostería</Link></li>
              <li><Link href="/utensilios/" className="hover:text-red-400 transition-colors">Utensilios</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy/" className="hover:text-red-400 transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/aviso-legal/" className="hover:text-red-400 transition-colors">Aviso Legal</Link></li>
              <li><Link href="/politica-de-cookies/" className="hover:text-red-400 transition-colors">Política de Cookies</Link></li>
              <li><Link href="/hola-hablamos/" className="hover:text-red-400 transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-500">
          <p>&copy; 2024-{currentYear} Chef Experto. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
