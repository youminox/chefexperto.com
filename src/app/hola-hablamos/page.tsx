import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import pagesData from '../../../data/pages.json';
import { SITE_NAME, SITE_URL } from '@/lib/data';

const page = pagesData.find((p: any) => p.slug === 'hola-hablamos');

export const metadata: Metadata = {
  title: '¡Hola! ¿Hablamos? — Contacto',
  description: 'Ponte en contacto con Chef Experto. Estamos aquí para ayudarte con tus dudas sobre cocina, recetas y utensilios.',
  alternates: { canonical: `${SITE_URL}/hola-hablamos/` },
};

export default function ContactPage() {
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: '¡Hola! ¿Hablamos?' },
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">¡Hola! ¿Hablamos?</h1>
            {page ? (
              <div className="article-content" dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <div className="article-content">
                <p>¿Tienes alguna pregunta sobre recetas, utensilios de cocina o nuestro contenido? ¡Nos encantaría escucharte!</p>
                <p>Puedes contactarnos a través de correo electrónico y te responderemos lo antes posible.</p>
                <p><strong>Email:</strong> contacto@chefexperto.com</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
