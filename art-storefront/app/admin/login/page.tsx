import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">
        {siteConfig.name} — Admin
      </p>
      <h1 className="mt-2 font-display text-3xl">Sign in</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
