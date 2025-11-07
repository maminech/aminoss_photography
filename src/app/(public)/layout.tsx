import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeWrapper from '@/components/ThemeWrapper';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeWrapper>
      <Navbar />
      <main className="min-h-screen pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
    </ThemeWrapper>
  );
}
