import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import pagesData from '../../../data/pages.json';
import { SITE_NAME, SITE_URL } from '@/lib/data';

const page = pagesData.find((p: any) => p.slug === 'privacy-policy');

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Chef Experto. Conoce cómo protegemos tus datos personales.',
  alternates: { canonical: `${SITE_URL}/privacy-policy/` },
};

export default function PrivacyPolicyPage() {
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Política de Privacidad' },
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>
            {page ? (
              <div className="article-content" dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <div className="article-content">
                <p>Esta es la política de privacidad de {SITE_NAME}.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
