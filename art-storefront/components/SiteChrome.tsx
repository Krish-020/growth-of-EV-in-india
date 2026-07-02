"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * The admin dashboard has its own header/nav (app/admin/(dashboard)/layout.tsx)
 * and shouldn't be wrapped in the storefront's shopping chrome. Next.js only
 * supports one root <html>/<body>, so this switches at render time instead
 * of splitting into separate root layouts.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
