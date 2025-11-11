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
  title: 'Innov8 Production - Creative Wedding & Event Photography in Tunisia',
  description: 'Innov8 Production is a creative wedding and event photography studio based in Moknine, Sousse, Tunisia, led by Aymen Ben Ammar. We specialize in capturing timeless moments with passion and precision.',
  keywords: 'innov8 production, wedding photography Tunisia, event photography Sousse, Aymen Ben Ammar, Moknine photographer, engagement photography, lifestyle photography, boutique photography, portrait photography Tunisia',
  authors: [{ name: 'Aymen Ben Ammar' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  manifest: '/client-manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D4AF37' },
    { media: '(prefers-color-scheme: dark)', color: '#D4AF37' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Innov8 Production',
    startupImage: [
      {
        url: '/apple-touch-icon.svg',
        media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/app-icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    title: 'Innov8 Production - Creative Wedding & Event Photography',
    description: 'Creative wedding and event photography studio in Moknine, Sousse, Tunisia. Specializing in weddings, engagements, events, lifestyle, boutiques, and portraits.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Innov8 Production',
    images: [
      {
        url: '/logo.svg',
        width: 400,
        height: 120,
        alt: 'Innov8 Production Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Innov8 Production - Creative Wedding & Event Photography',
    description: 'Creative wedding and event photography studio in Moknine, Sousse, Tunisia',
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
      className={`dark ${inter.variable} ${poppins.variable} ${playfair.variable} ${lato.variable}`} 
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Force dark mode always
                document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;600;700;800&family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Lora:wght@400;500;600;700&family=Merriweather:wght@300;400;700;900&family=Raleway:wght@300;400;500;600;700;800;900&family=Nunito:wght@300;400;600;700;800;900&family=Quicksand:wght@300;400;500;600;700&family=Josefin+Sans:wght@300;400;600;700&family=Bebas+Neue&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700;900&family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Pacifico&family=Righteous&family=Archivo+Black&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <LayoutThemeProvider>
            <AdminProviders>
              <DynamicStyles />
              {children}
            </AdminProviders>
          </LayoutThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
