export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Client pages don't need Navbar/Footer wrapper (they have their own layout)
  return <>{children}</>;
}
