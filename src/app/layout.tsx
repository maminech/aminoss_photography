import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminProviders from '@/components/AdminProviders';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aminoss Photography - Professional Photographer in Sousse, Tunisia',
  description: 'Aminoss Photography offers professional photography and videography services in Sousse, Tunisia. Specializing in weddings, portraits, fashion, and travel photography.',
  keywords: 'photography, Tunisia, Sousse photographer, wedding photographer, portrait photographer, fashion photography, travel photography, videography, Sousse photographer',
  authors: [{ name: 'Aminoss' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Aminoss Photography',
    description: 'Professional photography and videography services in Tunisia',
    type: 'website',
    locale: 'en_US',
    siteName: 'Aminoss Photography',
    images: [
      {
        url: '/logo.svg',
        width: 400,
        height: 120,
        alt: 'Aminoss Photography Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aminoss Photography',
    description: 'Professional photography and videography services in Tunisia',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${poppins.variable}`}>
      <body className="bg-dark-900 text-gray-100">
        <AdminProviders>
          <Navbar />
          <main className="min-h-screen pt-16 md:pt-20">
            {children}
          </main>
          <Footer />
        </AdminProviders>
      </body>
    </html>
  );
}
