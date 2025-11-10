import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download App | Aminoss Photography',
  description: 'Download the Aminoss Photography mobile app for Android. Browse galleries, book sessions, and get instant notifications.',
  keywords: 'aminoss photography app, download, android, mobile app, photography app',
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
