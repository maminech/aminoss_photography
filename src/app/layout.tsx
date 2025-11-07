import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display, Lato } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminProviders from '@/components/AdminProviders';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LayoutThemeProvider } from '@/contexts/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import DynamicStyles from '@/components/DynamicStyles';
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aminoss Photography - Professional Photographer in Sousse, Tunisia',
  description: 'Aminoss Photography offers professional photography and videography services in Sousse, Tunisia. Specializing in weddings, portraits, fashion, and travel photography.',
  keywords: 'photography, Tunisia, Sousse photographer, wedding photographer, portrait photographer, fashion photography, travel photography, videography, Sousse photographer',
  authors: [{ name: 'Aminoss' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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
    <html 
      lang="en" 
      className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${lato.variable}`} 
      suppressHydrationWarning
    >
      <body className="bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <LayoutThemeProvider>
            <AdminProviders>
              <DynamicStyles />
              <ThemeWrapper>
                <Navbar />
                <main className="min-h-screen pt-16 md:pt-20">
                  {children}
                </main>
                <Footer />
              </ThemeWrapper>
            </AdminProviders>
          </LayoutThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
