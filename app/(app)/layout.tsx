// Layout app — pages du logiciel avec navigation et footer
// Toutes les pages métier passent par ce layout
import { Footer, SiteHeader } from "@/components/layout";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
