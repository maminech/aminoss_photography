import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download App | Innov8 Production',
  description: 'Download the Innov8 Production mobile app for Android. Browse galleries, book sessions, and get instant notifications.',
  keywords: 'Innov8 Production app, download, android, mobile app, photography app',
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
