import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/pieces", label: "Pieces" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/commissions", label: "Commissions" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper-dim/40">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-8">
            <span className="font-display text-lg">{siteConfig.name} — Admin</span>
            <nav className="hidden gap-5 sm:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring text-sm text-ink-soft hover:text-clay"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="focus-ring text-sm text-ink-soft hover:text-clay">
              View storefront
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="focus-ring text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-clay"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-t border-line px-5 py-2 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring shrink-0 text-sm text-ink-soft hover:text-clay"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
