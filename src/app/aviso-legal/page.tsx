import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import pagesData from '../../../data/pages.json';
import { SITE_NAME, SITE_URL } from '@/lib/data';

const page = pagesData.find((p: any) => p.slug === 'aviso-legal');

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal de Chef Experto. Términos y condiciones de uso del sitio web.',
  alternates: { canonical: `${SITE_URL}/aviso-legal/` },
};

export default function AvisoLegalPage() {
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Aviso Legal' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="container mx-auto px-4 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Aviso Legal</h1>
            {page ? (
              <div className="article-content" dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <div className="article-content">
                <p>Este es el aviso legal de {SITE_NAME}.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
