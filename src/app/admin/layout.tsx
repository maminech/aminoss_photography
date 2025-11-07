export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin pages don't need Navbar/Footer wrapper
  return <>{children}</>;
}
